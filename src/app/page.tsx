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

  // 대표 URL 직접 공유 (학교·날짜 모두 미지정) — 사이트 자체를 소개하는
  // 일반 카드. Stage 9 — 카톡으로 / 만 공유했을 때 '청계초등학교 N월 N일
  // 급식' 으로 박히던 사고의 처방. 학교 한정 사이트로 오해받지 않게.
  if (!rawYmd && !schoolId) {
    return {
      openGraph: {
        title: '오늘의 급식',
        description: '학교 급식 메뉴와 사진을 한눈에',
        type: 'website',
        locale: 'ko_KR',
        siteName: '오늘의 급식',
        images: [{ url: '/api/og', width: 1200, height: 630, alt: '오늘의 급식' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: '오늘의 급식',
        description: '학교 급식 메뉴와 사진을 한눈에',
        images: ['/api/og'],
      },
    };
  }

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

  // OG/Twitter 카드용 풍성한 제목·설명. <title> 태그(브라우저 탭/즐겨찾기) 는
  // layout.tsx 의 고정 제목을 상속 — Stage 8-1 에서 즐겨찾기 텍스트에 그날 날짜가
  // 박히던 사고를 막기 위해 분리했다.
  const ogTitle = `${school.name} ${dateLabel} 급식`;
  const ogDescription = mealLine
    ? `🍱 ${mealLine}`
    : '오늘의 급식, 한 상 차렸어요';
  // 기본 학교는 schoolId 생략. OG 라우트는 잘못된 schoolId 도 폴백 처리하므로 안전.
  const ogImageUrl =
    school.id === 'chonggye'
      ? `/api/og?ymd=${ymd}`
      : `/api/og?ymd=${ymd}&schoolId=${school.id}`;

  return {
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      type: 'website',
      locale: 'ko_KR',
      siteName: `${school.name} 급식 벤치마크`,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const { ymd, schoolId } = await searchParams;
  const initialYmd = ymd && /^\d{8}$/.test(ymd) ? ymd : undefined;
  // URL 에 schoolId 가 진짜로 있고 등록된 학교일 때만 prop 으로 넘김.
  // 없거나 잘못됐으면 undefined → MealView 가 localStorage 의 홈 학교(Stage 7)
  // 를 적용한다. 여기서 getSchool() 폴백을 그대로 prop 으로 넘기면 항상 청계초가
  // 박혀 홈 학교 분기가 영영 안 동작했음 (Stage 8-2 버그픽스).
  const validSchoolId = schoolId && getSchool(schoolId).id === schoolId
    ? schoolId
    : undefined;
  return <MealView initialYmd={initialYmd} schoolId={validSchoolId} />;
}
