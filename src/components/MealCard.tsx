'use client';

import { useState } from 'react';
import type { Meal } from '@/types/meal';
import { DOW, parseYmd } from '@/lib/utils';

interface Props {
  ymd: string;
  meal: Meal | null;
  photoUrl?: string | null;
  schoolName?: string;
  /**
   * 공유 버튼 클릭 시점에 호출되는 URL 빌더. 부모가 정의.
   * Stage 8 부터 클라이언트 URL 자동 동기화를 빼서, 공유 시점에만 명시적으로
   * 빌드. 미지정 시 폴백으로 `window.location.href` 사용 (구버전 호환).
   */
  getShareUrl?: () => string;
}

const EMOJI_MAP: Record<string, string> = {
  비빔밥: '🍲', 불고기: '🥩', 치킨: '🍗', 돈까스: '🍖',
  밥: '🍚', 국: '🍲', 김치: '🥬', 떡볶이: '🍢',
  생선: '🐟', 새우: '🦐', 계란: '🥚',
};

function pickEmoji(mainDish: string): string {
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (mainDish.includes(key)) return emoji;
  }
  return '🍽️';
}

export default function MealCard({
  ymd,
  meal,
  photoUrl,
  schoolName,
  getShareUrl,
}: Props) {
  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;
  const [shareToast, setShareToast] = useState<string | null>(null);

  async function handleShare() {
    if (typeof window === 'undefined') return;

    const shareUrl = getShareUrl ? getShareUrl() : window.location.href;

    const dishesPreview =
      meal && meal.dishes.length > 0
        ? meal.dishes
            .slice(0, 5)
            .map((d) => d.name)
            .join(', ')
        : '';

    const title = `${schoolName ?? '학교'} ${dateLabel} 급식`;
    const text = dishesPreview ? `🍱 ${dishesPreview}` : '오늘의 급식 보기';

    // 1. Web Share API 우선
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        // 사용자가 공유 시트를 취소한 경우는 무시. 그 외엔 폴백으로.
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 2. 클립보드 폴백
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast('링크가 복사됐어요!');
    } catch {
      setShareToast('복사에 실패했어요. 주소를 직접 복사해주세요.');
    }
    setTimeout(() => setShareToast(null), 2000);
  }

  if (!meal) {
    return (
      <div className="mx-5 mb-5 bg-amber-50 border-2 border-amber-200 rounded-3xl overflow-hidden shadow-[0_4px_0_#E5D2A8]">
        <div className="aspect-[4/3] flex items-center justify-center bg-amber-100">
          <div className="text-center p-6">
            <span className="text-6xl block mb-3">🌙</span>
            <p className="font-['Hi_Melody'] text-xl text-stone-600">
              오늘은 급식이 없어요
            </p>
            <p className="text-xs text-stone-500 mt-1.5 opacity-70">
              휴일이거나 방학 기간일 수 있어요
            </p>
          </div>
        </div>
        <div className="p-5">
          <p className="font-['Gaegu'] text-xl font-bold">{dateLabel}</p>
        </div>
      </div>
    );
  }

  const mainDish = meal.dishes[0]?.name || '';
  const heroEmoji = pickEmoji(mainDish);

  return (
    <div className="mx-5 mb-5 bg-amber-50 border-2 border-amber-200 rounded-3xl overflow-hidden shadow-[0_4px_0_#E5D2A8] animate-[cardIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
      <div className="aspect-[4/3] relative bg-[repeating-linear-gradient(45deg,#FFEFD0_0,#FFEFD0_12px,#FDD5B8_12px,#FDD5B8_13px)] flex items-center justify-center">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={mainDish} className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="absolute top-3 left-3 bg-stone-800 text-amber-50 text-xs px-2.5 py-1 rounded-full font-['Gaegu'] font-bold tracking-wider">
              사진 준비중
            </span>
            <div className="text-center p-6">
              <span className="text-6xl block mb-3">{heroEmoji}</span>
              <p className="font-['Hi_Melody'] text-xl text-stone-800">{mainDish}</p>
              <p className="text-xs text-stone-500 mt-1.5 opacity-70">
                사진이 올라오면 여기에 보여드릴게요
              </p>
            </div>
          </>
        )}

        {/* 공유 버튼 — 사진 영역 우상단 */}
        <button
          onClick={handleShare}
          aria-label="공유하기"
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-stone-900/55 hover:bg-stone-900/75 backdrop-blur-sm text-amber-50 flex items-center justify-center transition-colors shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        {/* 토스트 메시지 (클립보드 폴백 시) */}
        {shareToast && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900/85 text-amber-50 text-xs px-3 py-1.5 rounded-full font-['Gaegu']">
            {shareToast}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-dashed border-amber-200">
          <span className="font-['Gaegu'] text-xl font-bold">{dateLabel}</span>
          {meal.calories && (
            <span className="text-xs bg-yellow-300 px-2.5 py-1 rounded-full">
              {meal.calories}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-2.5">
          {meal.dishes.map((dish, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-base leading-relaxed">
              <span className="text-orange-500 text-lg leading-snug shrink-0">●</span>
              <span>
                {dish.name}
                {dish.allergies.length > 0 && (
                  <span className="text-xs text-stone-500 opacity-60 ml-1">
                    ({dish.allergies.join('.')})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
