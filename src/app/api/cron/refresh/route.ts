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

  // Pro 플랜 maxDuration 300초 한도 안에서 76교를 Promise.all 로 한 번에 처리.
  // 학교당 다운로드 timeout 15초 + sharp/upload 가 동시 실행되어도 충분히 여유.
  const perSchool = await Promise.all(listSchools().map(processSchool));

  // 4. 슬라이딩 윈도우 cleanup (전 학교 공통, 키 있을 때만)
  const prune = mirrorOn ? await pruneOldPhotos(ymd) : { enabled: false, pruned: 0 };

  return NextResponse.json({
    triggeredAt: new Date().toISOString(),
    ymd,
    mirrorEnabled: mirrorOn,
    elapsedMs: Date.now() - startedAt,
    schools: perSchool,
    prune,
  });
}
