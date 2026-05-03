import { NextRequest, NextResponse } from 'next/server';
import { fetchMealFromNeis } from '@/lib/neis';
import { formatDate } from '@/lib/utils';
import { listSchools } from '@/lib/schools';

/**
 * NEIS 메뉴만 워밍하는 cron — Stage 14-30 (2026-05-03) 분리.
 *
 * 685교 시점 (Stage 14-26~28) 통합 cron 이 600s 한도 초과 504 재발 →
 * NEIS 워밍과 사진 미러를 두 cron 으로 분리. 본 라우트는 NEIS 만 처리.
 *
 * 단일 endpoint (open.neis.go.kr) 라 chunk 분할 무의미. 전체 학교를 한 번의
 * Promise.all 로 처리. 학교당 2회 호출 (오늘 + 내일 메뉴). 685교 시점에
 * 약 50~100s 안 끝남.
 *
 * schedule: KST 08:00 / 14:30 / 17:00 (vercel.json). 아침 8시는 NEIS 만
 * 돌아 영양교사 사진 업로드 전에 메뉴 캐시 워밍.
 *
 * 보호: CRON_SECRET 설정 시 Authorization: Bearer 헤더 요구. Vercel Cron 자동 첨부.
 */

// Pro 한도 800 안 마진 큼. 5000교 시점 재검토.
export const maxDuration = 300;

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

  const startedAt = Date.now();
  const all = listSchools();

  // 단일 Promise.all — open.neis.go.kr 한 host 라 학교 서버 throttle 무관.
  // 685교 × 2 = 1370 요청 동시. NEIS 자체 rate limit 발동 시 chunk 도입.
  const results = await Promise.all(
    all.map(async (school) => {
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
        return {
          schoolId: school.id,
          today: !!todayMeal,
          tomorrow: !!tomorrowMeal,
        };
      } catch (err) {
        return {
          schoolId: school.id,
          today: false,
          tomorrow: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  // 통계 로그 (정상 운영 가시성)
  const okToday = results.filter((r) => r.today).length;
  const okTomorrow = results.filter((r) => r.tomorrow).length;
  const errored = results.filter((r) => 'error' in r).length;
  console.log('[cron-neis]', {
    schools_total: all.length,
    ok_today: okToday,
    ok_tomorrow: okTomorrow,
    errored,
    elapsedMs: Date.now() - startedAt,
  });

  return NextResponse.json({
    triggeredAt: new Date().toISOString(),
    ymd,
    tomorrowYmd,
    elapsedMs: Date.now() - startedAt,
    schools: results,
  });
}
