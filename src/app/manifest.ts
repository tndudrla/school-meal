import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '오늘의 급식',
    short_name: '급식',
    description: '학교 급식 메뉴와 사진을 한눈에',
    start_url: '/',
    display: 'standalone',
    background_color: '#FEF3C7',
    theme_color: '#FB923C',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
