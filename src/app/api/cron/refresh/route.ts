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

// 학교 사진(5MB+) 다운로드가 학교 서버에서 느려 기본 10초 한도로는 부족.
// Vercel Hobby 플랜의 최대값 60초로 명시.
export const maxDuration = 60;

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

  // 학교당 wall time 가드. (Stage 13-2) 청크 budget 가드만으로는 한 학교가
  // 30초+ 잡아 청크 자체를 늦추는 사고 발생 → 504. 학교당 8초 cap 으로 강제 종료.
  // 못 끝낸 학교는 다음 cron 회차에서 select-existing 우회 후 재시도.
  const PER_SCHOOL_BUDGET_MS = 8_000;
  const sleep = (ms: number) =>
    new Promise<{ timedOut: true }>((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), ms)
    );

  // 학교 한 개를 처리하는 작업. 청크 분할 전후 동일 로직이라 함수로 추출.
  const processSchoolInner = async (school: ReturnType<typeof listSchools>[number]) => {
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

  // wall time 8초 가드로 감싸기. 한 학교가 학교 서버 느려서 30초+ 잡으면
  // 같은 청크의 다른 학교까지 같이 늦어져 함수 한도 hit. 8초 넘으면 그 학교는
  // timedOut 마크하고 다음 학교에 시간 양보. select-existing 덕에 다음 회차에서 즉시 skip.
  const processSchool = async (
    school: ReturnType<typeof listSchools>[number]
  ): Promise<Record<string, unknown>> => {
    const raced = await Promise.race([
      processSchoolInner(school),
      sleep(PER_SCHOOL_BUDGET_MS),
    ]);
    if ('timedOut' in raced && raced.timedOut === true) {
      return { schoolId: school.id, timedOut: true };
    }
    return raced as Record<string, unknown>;
  };

  // 76교를 한 번에 Promise.all 로 돌리면 학교당 wall time 이 함수 한도(60s)에
  // 균등 분할돼 학교 서버 응답이 조금만 느려도 다운로드가 잘려나간다.
  // (Stage 13 진단: bisan 등 다수 학교 미러가 7장 중 1~3장만 들어옴.)
  // 청크로 쪼개면 한 번에 N교만 동시 처리 → 학교당 wall time 확보.
  //
  // 한 회차에 못 끝내는 청크는 50초 근처에서 스킵하고 응답 반환.
  // 다음 cron 회차(또는 수동 Run) 가 이어받음. select-existing 로직 덕에
  // 이미 미러된 학교/날짜는 다음 회차에서 즉시 skip 되어 남은 학교에 시간 양보.
  // (Stage 13-2: 첫 회차 504 timeout 사고 처방.)
  const FUNCTION_BUDGET_MS = 50_000; // 60초 한도 - 안전 여유 10초
  const startedAt = Date.now();
  const schools = listSchools();
  const CHUNK_SIZE = 5;
  const perSchool: Awaited<ReturnType<typeof processSchool>>[] = [];
  let skipped = 0;
  for (let i = 0; i < schools.length; i += CHUNK_SIZE) {
    if (Date.now() - startedAt > FUNCTION_BUDGET_MS) {
      skipped = schools.length - i;
      break;
    }
    const chunk = schools.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(chunk.map(processSchool));
    perSchool.push(...results);
  }

  // 4. 슬라이딩 윈도우 cleanup (전 학교 공통, 키 있을 때만)
  // 시간 빠듯하면 prune 도 스킵 — 다음 회차에서 처리.
  const remainingMs = FUNCTION_BUDGET_MS - (Date.now() - startedAt);
  const prune =
    mirrorOn && remainingMs > 5_000
      ? await pruneOldPhotos(ymd)
      : { enabled: mirrorOn, pruned: 0, skipped: true };

  return NextResponse.json({
    triggeredAt: new Date().toISOString(),
    ymd,
    mirrorEnabled: mirrorOn,
    elapsedMs: Date.now() - startedAt,
    skippedSchools: skipped,
    schools: perSchool,
    prune,
  });
}
