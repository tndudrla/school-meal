import { NextRequest, NextResponse } from 'next/server';
import { fetchWeekPhotos } from '@/lib/schoolScraper';
import { fetchMealFromNeis } from '@/lib/neis';
import { formatDate } from '@/lib/utils';
import { listSchools } from '@/lib/schools';
import {
  isMirrorEnabled,
  mirrorWeekForSchool,
  pruneOldPhotos,
} from '@/lib/photoMirror';

// Vercel Pro 플랜으로 업그레이드되어 maxDuration 한도가 800초까지 확장.
// 685교 시점 (2026-05-03, Stage 14-27): 300초로 504 timeout 재발 → 600 으로 상향.
// 800 한도 안 안전 마진 200초. 사진 미러 + NEIS 워밍 동시 처리 + 학교 서버
// 응답 변동성을 흡수해야 하는 wall time. 76교 시점 60초로도 충분했지만
// 685교 = 약 9배 outbound 부담이라 그 비례로 늘림.
export const maxDuration = 600;

/**
 * 주기적으로 NEIS 메뉴 + 학교 홈페이지 사진을 미리 불러와 캐시를 데움.
 * 등록된 모든 학교를 순회한다 (Stage 2). 한 학교 실패는 다른 학교를 막지 않음.
 *
 * Stage 3: SUPABASE_SERVICE_ROLE_KEY 가 설정되어 있으면 학교 사진을 Supabase Storage 에
 *   미러링하고, 슬라이딩 윈도우(오늘 + 과거 7일)로 cleanup. 키 없으면 미러 단계 스킵.
 *
 * 보호:
 *   - CRON_SECRET 환경변수가 설정되어 있으면, Authorization: Bearer <secret> 요구
 *   - Vercel Cron은 자동으로 이 헤더를 붙여줌
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const today = new Date();
  const ymd = formatDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowYmd = formatDate(tomorrow);

  // 사진 미러용 기준일은 "어제". 이유:
  // fetchWeekPhotos 가 일요일 시작 주를 받아오는데, 일요일 cron 이 today 로
  // 호출하면 "다음 주" 페이지를 받아 photos.count: 0 (영양교사 미업로드).
  // 어제 기준이면 일요일 cron 도 지난 주 페이지를 받아 이번 주 사진 미러.
  // 평일 cron 은 어제도 같은 주라 결과 동일. (Stage 13-1)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayYmd = formatDate(yesterday);

  const mirrorOn = isMirrorEnabled();
  const startedAt = Date.now();

  const processSchool = async (school: ReturnType<typeof listSchools>[number]) => {
    const result: Record<string, unknown> = { schoolId: school.id };

    // 1. NEIS 메뉴 오늘 + 내일 워밍
    try {
      const [todayMeal, tomorrowMeal] = await Promise.all([
        fetchMealFromNeis({
          atptCode: school.neis.atptCode,
          schoolCode: school.neis.schoolCode,
          ymd,
          apiKey: process.env.NEIS_API_KEY,
        }),
        fetchMealFromNeis({
          atptCode: school.neis.atptCode,
          schoolCode: school.neis.schoolCode,
          ymd: tomorrowYmd,
          apiKey: process.env.NEIS_API_KEY,
        }),
      ]);
      result.neis = { today: !!todayMeal, tomorrow: !!tomorrowMeal };
    } catch (err) {
      result.neisError = err instanceof Error ? err.message : String(err);
    }

    // 2. 학교 홈페이지 이번주 사진 캐싱 (스크래핑 가능한 학교만)
    // ymd 는 어제 기준 — 위 yesterdayYmd 주석 참고
    //
    // weekMap 재사용 (Stage 14-27, 2026-05-03):
    //   여기서 받은 weekMap 을 mirrorWeekForSchool 에 그대로 주입한다. 이전엔
    //   같은 학교에 대해 fetchWeekPhotos 를 2회 호출 (여기 + mirror 안) 해
    //   학교 서버 outbound 가 685교 × 2 = 1370 회였음 → 300s 504 주범 중 하나.
    //   주입으로 685 × 1 로 절감.
    let weekMap: Record<string, string> | undefined;
    if (school.scrape) {
      try {
        weekMap = await fetchWeekPhotos(school.scrape, yesterdayYmd);
        result.photos = {
          count: Object.keys(weekMap).length,
          ymds: Object.keys(weekMap),
        };
      } catch (err) {
        result.photosError = err instanceof Error ? err.message : String(err);
      }
    }

    // 3. Supabase 미러 (키 있을 때만). 동일하게 어제 기준.
    // weekMap 이 있으면 주입 — fetchWeekPhotos 재호출 없음. 없으면 (위에서 throw)
    // 학교 자체가 사진 단계 실패 → mirror 도 의미 없으므로 스킵 안 하고 미러 측 fetch
    // 시도해 별도 에러 분기 받도록 둠 (실제로는 같은 throw 가 또 잡힘).
    if (mirrorOn && school.scrape) {
      result.mirror = await mirrorWeekForSchool(school, yesterdayYmd, weekMap);
    }

    return result;
  };

  // 685교 시점 처방 (Stage 14-26, 2026-05-03):
  // 학교당 직접 outbound (학교 root, 캘린더, AJAX) + Supabase upload 가 동시
  // 685개로 폭주하면 학교 서버가 connection 거절 → 빈 weekMap → 미러 0건.
  // chunk 단위 sequential 로 학교 서버 부담 분산. chunk 안은 Promise.all.
  //
  // chunk 35 (Stage 14-27 갱신, 2026-05-03):
  //   이전 25 (Stage 14-26) → 첫 504 재발 (300초 한도). 두 가지 동시 처방:
  //     1) maxDuration 300 → 600 (위)
  //     2) fetchWeekPhotos 중복 제거 — cron→mirror 학교당 외부 호출 50% 절감
  //   외부 호출이 절반이라 chunk 안 wall 도 절반이라 35 까지 늘려도 batch wall
  //   ~12~15초 유지. 685 / 35 = 약 20 batch × 15초 = 300초 안에 들어옴 +
  //   maxDuration 600 마진. 추가 504 발생 시 chunk 를 다시 줄이거나, NEIS 워밍
  //   과 사진 미러 cron 을 분리 (refresh-neis / refresh-photos) 하는 것이 다음
  //   처방 후보.
  const allSchools = listSchools();
  const CHUNK = 35;
  const perSchool: Array<Awaited<ReturnType<typeof processSchool>>> = [];
  for (let i = 0; i < allSchools.length; i += CHUNK) {
    const batch = allSchools.slice(i, i + CHUNK);
    const results = await Promise.all(batch.map(processSchool));
    perSchool.push(...results);
  }

  // 4. 슬라이딩 윈도우 cleanup (전 학교 공통, 키 있을 때만)
  const prune = mirrorOn ? await pruneOldPhotos(ymd) : { enabled: false, pruned: 0 };

  // 통계 로그 (정상 운영 가시성용 — 진단 이상으로 영구 보존)
  type MirrorStats = {
    no_mirror_field: number;
    disabled: number;
    errored: number;
    uploaded_some: number;
    empty: number;
    total_photos_count: number;
  };
  const mirrorStats: MirrorStats = perSchool.reduce<MirrorStats>(
    (acc, r) => {
      const m = r.mirror as { enabled?: boolean; uploaded?: number; failed?: number; missing?: number; error?: string } | undefined;
      const photos = r.photos as { count?: number } | undefined;
      if (!m) acc.no_mirror_field += 1;
      else if (!m.enabled) acc.disabled += 1;
      else if (m.error) acc.errored += 1;
      else if ((m.uploaded ?? 0) > 0) acc.uploaded_some += 1;
      else acc.empty += 1;
      acc.total_photos_count += photos?.count ?? 0;
      return acc;
    },
    {
      no_mirror_field: 0,
      disabled: 0,
      errored: 0,
      uploaded_some: 0,
      empty: 0,
      total_photos_count: 0,
    }
  );
  console.log('[cron]', {
    schools_total: perSchool.length,
    mirrorEnabled: mirrorOn,
    mirror_buckets: {
      no_mirror_field: mirrorStats.no_mirror_field,
      disabled: mirrorStats.disabled,
      errored: mirrorStats.errored,
      uploaded_some: mirrorStats.uploaded_some,
      empty: mirrorStats.empty,
    },
    total_photos_count: mirrorStats.total_photos_count,
  });

  return NextResponse.json({
    triggeredAt: new Date().toISOString(),
    ymd,
    mirrorEnabled: mirrorOn,
    elapsedMs: Date.now() - startedAt,
    schools: perSchool,
    prune,
  });
}
