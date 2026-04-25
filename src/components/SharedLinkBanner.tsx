'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** URL 로 진입한 schoolId (공유 링크 케이스). 없으면 안 보임. */
  schoolId?: string;
  /** 표시용 학교명. */
  schoolName: string;
}

const FAVORITES_KEY = 'favoriteSchoolIds';
const DISMISS_KEY_PREFIX = 'sharedLinkBanner:';

/**
 * 공유 링크로 진입했을 때 (URL 에 schoolId 있음) "이 학교 즐겨찾기에
 * 추가하시겠어요?" 한 번 안내. 추가하거나 닫으면 그 schoolId 는 다시 안 뜸.
 */
export default function SharedLinkBanner({ schoolId, schoolName }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!schoolId) return; // URL 진입 아님

    try {
      // 이미 즐겨찾기에 있는지
      const fav = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? '[]');
      if (Array.isArray(fav) && fav.includes(schoolId)) return;
      // 이미 닫음/추가 한 적 있는지
      if (window.localStorage.getItem(DISMISS_KEY_PREFIX + schoolId) === '1') return;
      setShow(true);
    } catch {
      // localStorage 실패 무시
    }
  }, [schoolId]);

  function dismiss() {
    setShow(false);
    if (typeof window !== 'undefined' && schoolId) {
      window.localStorage.setItem(DISMISS_KEY_PREFIX + schoolId, '1');
    }
  }

  function addFavorite() {
    if (typeof window === 'undefined' || !schoolId) return;
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY) ?? '[]';
      const fav = JSON.parse(raw);
      const arr = Array.isArray(fav) ? fav : [];
      if (!arr.includes(schoolId)) arr.push(schoolId);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
    } catch {
      // 실패해도 사용자 흐름 막지 않음
    }
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="mx-5 mt-3 p-3 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-between gap-2">
      <div className="text-xs text-stone-700 leading-relaxed flex-1">
        <span className="text-base">⭐</span>{' '}
        <strong className="text-orange-500 font-['Gaegu']">{schoolName}</strong>
        {' '}을 즐겨찾기에 추가할까요?
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={addFavorite}
          className="text-xs px-3 py-1.5 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
        >
          추가
        </button>
        <button
          onClick={dismiss}
          aria-label="안내 닫기"
          className="text-stone-400 hover:text-stone-600 px-2 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
