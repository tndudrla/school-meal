/**
 * ImageResponse 용 한글 폰트 로더 (Stage 11-1).
 *
 * next/og 의 satori 는 시스템 폰트를 못 읽어 폰트를 명시 임베드해야 함.
 * Pretendard 의 Regular/Bold 를 GitHub raw CDN 에서 fetch 후 ArrayBuffer 반환.
 * Next.js fetch 의 자동 캐시(같은 URL 1시간)가 첫 호출 후 비용 흡수.
 *
 * 폴백: 폰트 fetch 실패해도 ImageResponse 자체는 동작 (sans-serif 로 떨어짐).
 */

const PRETENDARD_REGULAR_URL =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Regular.otf';

const PRETENDARD_BOLD_URL =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf';

interface FontSpec {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
}

let cached: FontSpec[] | null = null;

/** Pretendard Regular + Bold 를 ImageResponse fonts 옵션 형태로 반환. */
export async function loadPretendardFonts(): Promise<FontSpec[]> {
  if (cached) return cached;
  try {
    const [reg, bold] = await Promise.all([
      fetch(PRETENDARD_REGULAR_URL, {
        // 폰트 파일은 거의 안 변함 → 1일 캐시
        next: { revalidate: 86400 },
      }).then((r) => r.arrayBuffer()),
      fetch(PRETENDARD_BOLD_URL, {
        next: { revalidate: 86400 },
      }).then((r) => r.arrayBuffer()),
    ]);
    cached = [
      { name: 'Pretendard', data: reg, weight: 400, style: 'normal' },
      { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
    ];
    return cached;
  } catch (err) {
    // 실패하면 빈 배열 — ImageResponse 가 sans-serif 폴백
    console.error('Pretendard fonts fetch failed', err);
    return [];
  }
}
