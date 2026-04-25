import type { Metadata } from 'next';
import './globals.css';

// 브라우저 탭/즐겨찾기에 보이는 고정 제목. 학교·날짜 무관하게 항상 같음
// (Stage 8-1 — 즐겨찾기 텍스트에 그날 날짜가 박히던 사고의 처방).
// 카톡 공유 카드의 풍성한 제목은 page.tsx 의 openGraph.title 가 별도 담당.
export const metadata: Metadata = {
  title: '학교 급식 벤치마크',
  description: '학교 급식 메뉴와 사진을 한눈에',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="color-scheme" content="light only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Gaegu:wght@400;700&family=Hi+Melody&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-amber-50 min-h-screen"
        style={{ fontFamily: "'Gowun Dodum', sans-serif" }}
      >
        <div className="max-w-[480px] mx-auto pb-20">{children}</div>
      </body>
    </html>
  );
}
