import type { Metadata } from 'next';
import Link from 'next/link';
import FeedbackBoard from '@/components/FeedbackBoard';
import { isFeedbackEnabled } from '@/lib/feedback';

// process.env 접근은 Request-time API 가 아니라 선언 없이는 정적 프리렌더되어
// 피처 플래그 분기가 빌드 시점에 고정된다. 명시 선언으로 배포별 env 를
// 다음 요청부터 즉시 반영 (재배포 불필요).
export const dynamic = 'force-dynamic';

// layout 상속에 기대면 og:title 이 layout 기본값 '오늘의 급식'으로 덮인다.
export const metadata: Metadata = {
  title: '개발 건의 — 오늘의 급식',
  openGraph: {
    title: '개발 건의',
    description: '학교 급식 앱에 바라는 점을 남겨주세요',
    images: [{ url: '/api/og' }],
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function FeedbackPage() {
  return (
    <>
      <header className="px-5 pt-5 pb-4">
        <Link
          href="/"
          className="text-sm text-stone-500 hover:text-orange-500 transition-colors"
        >
          ← 메인으로
        </Link>
      </header>

      {isFeedbackEnabled() ? (
        <FeedbackBoard />
      ) : (
        <div className="mx-5 p-5 bg-amber-100 border-2 border-dashed border-amber-300 rounded-2xl text-center">
          <span className="text-4xl block mb-2">💤</span>
          <p className="font-['Gaegu'] font-bold text-lg text-stone-700">
            지금은 의견 접수를 쉬고 있어요
          </p>
        </div>
      )}
    </>
  );
}
