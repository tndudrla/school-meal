import type { Metadata } from 'next';
import MealView from '@/components/MealView';
import { fetchMealFromNeis } from '@/lib/neis';
import { parseYmd, formatDate, DOW } from '@/lib/utils';

const SCHOOL_NAME = '청계초등학교';
const ATPT = 'J10';
const SCHOOL_CODE = '7569109';

interface PageProps {
  searchParams: Promise<{ ymd?: string }>;
}

// 공유 링크가 가리키는 날짜의 메뉴를 미리 읽어 동적 OG 메타 구성
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { ymd: rawYmd } = await searchParams;
  const ymd = rawYmd && /^\d{8}$/.test(rawYmd) ? rawYmd : formatDate(new Date());

  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;

  let mealLine = '';
  try {
    const meal = await fetchMealFromNeis({
      atptCode: ATPT,
      schoolCode: SCHOOL_CODE,
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

  const title = `${SCHOOL_NAME} ${dateLabel} 급식`;
  const description = mealLine
    ? `🍱 ${mealLine}`
    : '오늘의 급식, 한 상 차렸어요';
  const ogImageUrl = `/api/og?ymd=${ymd}`;

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
      siteName: `${SCHOOL_NAME} 급식 벤치마크`,
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
  const { ymd } = await searchParams;
  const initialYmd = ymd && /^\d{8}$/.test(ymd) ? ymd : undefined;
  return <MealView initialYmd={initialYmd} />;
}
