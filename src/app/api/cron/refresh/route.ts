import { NextRequest, NextResponse } from 'next/server';
import { fetchWeekPhotos } from '@/lib/schoolScraper';
import { fetchMealFromNeis } from '@/lib/neis';
import { formatDate } from '@/lib/utils';
import { listSchools } from '@/lib/schools';

/**
 * 주기적으로 NEIS 메뉴 + 학교 홈페이지 사진을 미리 불러와 캐시를 데움.
 * 등록된 모든 학교를 순회한다 (Stage 2). 한 학교 실패는 다른 학교를 막지 않음.
 *
 * Stage 3 에서 Supabase 미러 단계가 같은 cron 안에 추가될 예정.
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

  const perSchool = await Promise.all(
    listSchools().map(async (school) => {
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
      if (school.scrape) {
        try {
          const photos = await fetchWeekPhotos(school.scrape, ymd);
          result.photos = {
            count: Object.keys(photos).length,
            ymds: Object.keys(photos),
          };
        } catch (err) {
          result.photosError = err instanceof Error ? err.message : String(err);
        }
      }

      return result;
    })
  );

  return NextResponse.json({
    triggeredAt: new Date().toISOString(),
    ymd,
    schools: perSchool,
  });
}
