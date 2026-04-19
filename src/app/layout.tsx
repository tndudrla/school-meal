import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '오늘의 급식 | 청계초등학교',
  description: '청계초등학교 급식 메뉴를 한눈에',
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
