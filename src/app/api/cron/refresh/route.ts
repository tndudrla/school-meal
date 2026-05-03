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
// 76교 × 평균 3초면 4분 안에 충분히 끝남. 안전 여유로 300 명시.
// (Stage 13-4: Hobby 60초에서 청크 분할/budget 가드/wall time 가드 다 제거.)
export const maxDuration = 300;

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
    if (school.scrape) {
      try {
        const photos = await fetchWeekPhotos(school.scrape, yesterdayYmd);
        result.photos = {
          count: Object.keys(photos).length,
          ymds: Object.keys(photos),
        };
      } catch (err) {
        result.photosError = err instanceof Error ? err.message : String(err);
      }
    }

    // 3. Supabase 미러 (키 있을 때만). 동일하게 어제 기준.
    if (mirrorOn && school.scrape) {
      result.mirror = await mirrorWeekForSchool(school, yesterdayYmd);
    }

    return result;
  };

  // 685교 시점 처방 (Stage 14-26, 2026-05-03):
  // 학교당 직접 outbound (학교 root, 캘린더, AJAX) + Supabase upload 가 동시
  // 685개로 폭주하면 학교 서버가 connection 거절 → 빈 weekMap → 미러 0건.
  // chunk 단위 sequential 로 학교 서버 부담 분산. chunk 안은 Promise.all.
  //
  // chunk 크기 25 — 첫 시도 50 은 batch 당 ~50초 × 14 batch = 700초 ≈ 504.
  // 25 면 batch ~25초 × 28 batch = 700초도 비슷해 보이지만 실제로는 batch
  // 안 wall = 가장 느린 학교 시간 (sharp/upload 동시 25 부담은 50보다 작아
  // 학교당 시간 자체가 줄어 batch wall ~10~15초). 28 batch × 12초 ≈ 250초.
  // 너무 길면 chunk 더 줄이거나, 학교당 timeout 줄이는 추가 처방 필요.
  const allSchools = listSchools();
  const CHUNK = 25;
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
