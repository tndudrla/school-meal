import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// 브라우저 탭/즐겨찾기에 보이는 고정 제목. 학교·날짜 무관하게 항상 같음
// (Stage 8-1 — 즐겨찾기 텍스트에 그날 날짜가 박히던 사고의 처방).
// 카톡 공유 카드의 풍성한 제목은 page.tsx 의 openGraph.title 가 별도 담당.
//
// Stage 9:
// - metadataBase — OG 이미지의 상대 경로(/api/og 등)를 절대 URL 로 자동 변환.
//   일부 OG 봇(특히 카톡)이 절대 URL 만 받음.
// - manifest + appleWebApp — PWA "홈 화면에 추가" 활성화. manifest 는
//   app/manifest.ts 가 /manifest.webmanifest 로 서빙.
export const metadata: Metadata = {
  metadataBase: new URL('https://school-meal-phi.vercel.app'),
  title: '오늘의 급식',
  description: '학교 급식 메뉴와 사진을 한눈에',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: '오늘의 급식',
    statusBarStyle: 'default',
  },
  // 사이트 기본 OG — page.tsx 의 무인자 분기(generateMetadata)와 동일 값.
  // 학교별 페이지는 자체 generateMetadata 가 이 값을 덮으므로 기존 동작 유지.
  openGraph: {
    title: '오늘의 급식',
    description: '학교 급식 메뉴와 사진을 한눈에',
    type: 'website',
    locale: 'ko_KR',
    siteName: '오늘의 급식',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: '오늘의 급식' }],
  },
};

// Next.js 14+ 부터 themeColor 는 metadata 가 아니라 viewport 로 분리됨.
export const viewport: Viewport = {
  themeColor: '#FB923C',
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
        <Analytics />
      </body>
    </html>
  );
}
