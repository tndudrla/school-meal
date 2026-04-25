import type { Metadata } from 'next';
import MealView from '@/components/MealView';
import { fetchMealFromNeis } from '@/lib/neis';
import { getSchool } from '@/lib/schools';
import { parseYmd, formatDate, DOW } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ ymd?: string; schoolId?: string }>;
}

// 공유 링크가 가리키는 날짜의 메뉴를 미리 읽어 동적 OG 메타 구성
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { ymd: rawYmd, schoolId } = await searchParams;
  const ymd = rawYmd && /^\d{8}$/.test(rawYmd) ? rawYmd : formatDate(new Date());
  const school = getSchool(schoolId);

  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;

  let mealLine = '';
  try {
    const meal = await fetchMealFromNeis({
      atptCode: school.neis.atptCode,
      schoolCode: school.neis.schoolCode,
      ymd,
      apiKey: process.env.NEIS_API_KEY,
    });
    if (meal && meal.dishes.length > 0) {
      mealLine = meal.dishes
        .slice(0, 5)
        .map((d) => d.name)
        .join(', ');
    }
  } catch {
    // 메타데이터 실패는 무시 — 페이지 자체는 정상 동작
  }

  const title = `${school.name} ${dateLabel} 급식`;
  const description = mealLine
    ? `🍱 ${mealLine}`
    : '오늘의 급식, 한 상 차렸어요';
  // 기본 학교는 schoolId 생략. OG 라우트는 잘못된 schoolId 도 폴백 처리하므로 안전.
  const ogImageUrl =
    school.id === 'chonggye'
      ? `/api/og?ymd=${ymd}`
      : `/api/og?ymd=${ymd}&schoolId=${school.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      locale: 'ko_KR',
      siteName: `${school.name} 급식 벤치마크`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const { ymd, schoolId } = await searchParams;
  const initialYmd = ymd && /^\d{8}$/.test(ymd) ? ymd : undefined;
  const school = getSchool(schoolId);
  return <MealView initialYmd={initialYmd} schoolId={school.id} />;
}
