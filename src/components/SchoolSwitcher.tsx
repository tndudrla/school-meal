'use client';

import { useEffect, useState } from 'react';
import { listSchools } from '@/lib/schools';
import type { SchoolConfig } from '@/lib/schools';

const FAV_KEY = 'favoriteSchoolIds';

interface Props {
  /** 현재 선택된 학교 id */
  currentSchoolId: string;
  /** 시트 안에서 학교를 골랐을 때 호출. 부모는 이 id 로 라우팅/상태 갱신. */
  onSelect: (schoolId: string) => void;
}

/**
 * 헤더의 학교명을 누르면 열리는 바텀시트.
 * - 상단: 즐겨찾기 (localStorage 에 저장된 학교만)
 * - 하단: 전체 학교 목록 (`listSchools()`)
 * - 각 항목 우측에 ⭐ 토글 — 즐겨찾기 추가/해제
 *
 * 즐겨찾기는 기기-로컬 (localStorage). 서버 동기화는 계정 도입 후 결정.
 */
export default function SchoolSwitcher({ currentSchoolId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // mount 시 localStorage 에서 즐겨찾기 로드 (SSR 안전)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(FAV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed.filter((x): x is string => typeof x === 'string'));
        }
      }
    } catch {
      // 파싱 실패는 무시 — 빈 배열로 시작
    }
  }, []);

  // 시트 열렸을 때 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const persistFavorites = (next: string[]) => {
    setFavoriteIds(next);
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
    } catch {
      // localStorage 실패(시크릿 모드 일부 등) 는 UI 만 갱신하고 무시
    }
  };

  const toggleFavorite = (schoolId: string) => {
    if (favoriteIds.includes(schoolId)) {
      persistFavorites(favoriteIds.filter((id) => id !== schoolId));
    } else {
      persistFavorites([...favoriteIds, schoolId]);
    }
  };

  const handlePick = (schoolId: string) => {
    onSelect(schoolId);
    setOpen(false);
  };

  const all = listSchools();
  const currentSchool = all.find((s) => s.id === currentSchoolId) ?? all[0];
  const favorites = all.filter((s) => favoriteIds.includes(s.id));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-['Gaegu'] text-2xl font-bold text-stone-800 inline-flex items-center gap-1 hover:opacity-80"
        aria-label="학교 선택"
      >
        🍱 {currentSchool.name}
        <span className="text-base text-stone-500">▾</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* 백드롭 */}
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
          />

          {/* 시트 */}
          <div className="relative w-full max-w-[480px] bg-amber-50 rounded-t-3xl border-t-2 border-x-2 border-amber-200 shadow-[0_-6px_0_#E5D2A8] max-h-[80vh] flex flex-col animate-[slideUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-['Gaegu'] text-xl font-bold text-stone-800">
                학교 선택
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-200 text-stone-700 hover:bg-amber-200"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-6">
              {/* 즐겨찾기 섹션 */}
              <section className="mb-4">
                <h3 className="font-['Gaegu'] text-sm font-bold text-orange-500 mb-2">
                  ⭐ 즐겨찾기
                </h3>
                {favorites.length === 0 ? (
                  <p className="text-xs text-stone-500 bg-amber-100 rounded-2xl px-4 py-3 border border-dashed border-amber-200">
                    아래 학교의 ⭐ 별을 누르면 여기에 모여요
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {favorites.map((school) => (
                      <SchoolRow
                        key={school.id}
                        school={school}
                        active={school.id === currentSchoolId}
                        favorite
                        onPick={() => handlePick(school.id)}
                        onToggleFav={() => toggleFavorite(school.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>

              {/* 전체 학교 섹션 */}
              <section>
                <h3 className="font-['Gaegu'] text-sm font-bold text-stone-600 mb-2">
                  전체 학교 ({all.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {all.map((school) => (
                    <SchoolRow
                      key={school.id}
                      school={school}
                      active={school.id === currentSchoolId}
                      favorite={favoriteIds.includes(school.id)}
                      onPick={() => handlePick(school.id)}
                      onToggleFav={() => toggleFavorite(school.id)}
                    />
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface RowProps {
  school: SchoolConfig;
  active: boolean;
  favorite: boolean;
  onPick: () => void;
  onToggleFav: () => void;
}

function SchoolRow({ school, active, favorite, onPick, onToggleFav }: RowProps) {
  return (
    <li
      className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-colors ${
        active
          ? 'bg-orange-500 border-orange-500 text-white'
          : 'bg-amber-50 border-amber-200 text-stone-800 hover:bg-amber-100'
      }`}
    >
      <button
        type="button"
        onClick={onPick}
        className="flex-1 text-left flex flex-col"
      >
        <span className="font-['Gaegu'] text-lg font-bold leading-snug">
          {school.name}
        </span>
        <span
          className={`text-xs mt-0.5 ${active ? 'text-orange-100' : 'text-stone-500'}`}
        >
          {school.region}
        </span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav();
        }}
        aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        className={`w-9 h-9 ml-2 flex items-center justify-center rounded-full text-lg transition-transform hover:scale-110 ${
          favorite
            ? active
              ? 'bg-yellow-300 text-stone-800'
              : 'bg-yellow-300 text-stone-800'
            : active
              ? 'bg-orange-400 text-orange-100'
              : 'bg-amber-100 text-stone-400'
        }`}
      >
        {favorite ? '⭐' : '☆'}
      </button>
    </li>
  );
}
