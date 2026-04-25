'use client';

import { useEffect, useState } from 'react';

const HINT_KEY = 'sawWeekExportHint';

interface Props {
  schoolId: string;
  schoolName: string;
  weekOffset: number;
  weekRangeLabel: string;
}

/**
 * 주간 식단표 PNG 내보내기 버튼.
 * - 모바일: navigator.share 로 카톡·문자·앨범 다 한 번에
 * - PC: <a download> 로 .png 저장
 *
 * `navigator.share({ url })` 가 아니라 `{ files }` 로 보내야 카톡에 이미지가
 * 첨부됨. URL 만 보내면 카톡 OG 봇이 일반 카드를 만들어 식단표 자체는 안 박힘.
 */
export default function WeekExportButton({
  schoolId,
  schoolName,
  weekOffset,
  weekRangeLabel,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // 첫 방문자에게 한 번만 "주간 식단표를 이미지로 받을 수 있어요" 풍선.
  // 클릭하거나 export 한 번 하면 dismissed 처리.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(HINT_KEY) === '1') return;
    // 1.5초 후 잠깐 노출 (페이지 로드 직후엔 사용자 시선이 메뉴 카드)
    const t = setTimeout(() => setShowHint(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function dismissHint() {
    setShowHint(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HINT_KEY, '1');
    }
  }

  async function handleExport() {
    if (busy) return;
    dismissHint();
    setBusy(true);
    try {
      const res = await fetch(
        `/api/week?schoolId=${encodeURIComponent(schoolId)}&offset=${weekOffset}`
      );
      if (!res.ok) throw new Error(`status ${res.status}`);
      const blob = await res.blob();

      // 파일명에 슬래시·콜론 등 OS 금지 문자 제거
      const safeRange = weekRangeLabel.replace(/[\\/:*?"<>|]/g, '_');
      const filename = `${schoolName}_${safeRange}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // 1. Web Share API — 파일 공유 가능 여부 확인 후 모바일 공유 시트.
      //    text 필드로 사이트 주소도 함께 전달 → 카톡에선 이미지 + 본문에
      //    URL 이 같이 박혀, 받은 사람이 사이트로 진입할 수 있음.
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `${schoolName} 주간 식단표`,
            text: `${schoolName} ${weekRangeLabel} 주간 식단표\nhttps://school-meal-phi.vercel.app`,
          });
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
          // share 실패 시 다운로드 폴백으로 흘러감
        }
      }

      // 2. 다운로드 폴백 (PC, 또는 share 미지원/실패)
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      setToast('이미지를 저장했어요!');
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('week export failed', err);
      setToast('내보내기에 실패했어요. 잠시 후 다시 시도해주세요.');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="relative">
        {/* 첫 방문 안내 풍선 — 한 번만 노출 */}
        {showHint && (
          <button
            type="button"
            onClick={dismissHint}
            className="absolute right-0 top-full mt-2 z-20 whitespace-nowrap text-xs bg-stone-900/90 text-amber-50 px-3 py-1.5 rounded-full font-['Gaegu'] shadow-lg animate-[fadeIn_0.2s_ease-out]"
            aria-label="안내 닫기"
          >
            ⬆ 주간 식단표 받기
          </button>
        )}
      <button
        onClick={handleExport}
        disabled={busy}
        aria-label="주간 식단표 이미지로 내보내기"
        title="주간 식단표 내보내기"
        className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-200 text-stone-700 hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
      >
        {busy ? (
          <span className="inline-block w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-hidden
          >
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
      </button>
      </div>

      {toast && (
        <div
          role="status"
          style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
          className="fixed left-1/2 -translate-x-1/2 bg-stone-900/90 text-amber-50 text-sm px-4 py-2 rounded-full font-['Gaegu'] shadow-lg z-50 max-w-[90vw] text-center animate-[fadeIn_0.15s_ease-out]"
        >
          {toast}
        </div>
      )}
    </>
  );
}
