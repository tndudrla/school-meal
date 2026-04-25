'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { listSchools } from '@/lib/schools';
import type { SchoolConfig } from '@/lib/schools';

const FAV_KEY = 'favoriteSchoolIds';
const HOME_KEY = 'homeSchoolId';

interface Props {
  /** 현재 선택된 학교 id */
  currentSchoolId: string;
  /** 모달에서 학교를 골랐을 때 호출. 부모는 이 id 로 라우팅/상태 갱신. */
  onSelect: (schoolId: string) => void;
}

/**
 * 헤더의 학교명을 누르면 열리는 풀스크린 모달.
 * - portal 로 document.body 에 마운트 → 상위 sticky/transform 컨테이너 영향 0
 * - 풀스크린이라 학교 수가 6 → 100 으로 늘어도 자연 확장
 * - 본문은 자연 스크롤 (자체 max-height 안 둠)
 *
 * 즐겨찾기는 기기-로컬 (localStorage). 서버 동기화는 계정 도입 후 결정.
 */
export default function SchoolSwitcher({ currentSchoolId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [homeSchoolId, setHomeSchoolIdState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');

  // SSR 안전: portal 은 mount 이후에만 렌더
  useEffect(() => {
    setMounted(true);
  }, []);

  // mount 시 localStorage 에서 즐겨찾기 + 홈 학교 로드
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
    const home = window.localStorage.getItem(HOME_KEY);
    if (home) setHomeSchoolIdState(home);
  }, []);

  // 모달 열렸을 때 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  // 홈 학교 토글: 같은 학교 누르면 해제(null), 다른 학교면 교체.
  // 다음 직접 진입(URL 에 schoolId 없음) 시 MealView 가 이 값을 읽어 활성 학교 갱신.
  const toggleHomeSchool = (schoolId: string) => {
    const next = homeSchoolId === schoolId ? null : schoolId;
    setHomeSchoolIdState(next);
    try {
      if (next) {
        window.localStorage.setItem(HOME_KEY, next);
      } else {
        window.localStorage.removeItem(HOME_KEY);
      }
    } catch {
      // localStorage 실패는 UI 만 갱신하고 무시
    }
  };

  const handlePick = (schoolId: string) => {
    onSelect(schoolId);
    setOpen(false);
    setQuery(''); // 다음 열기 시 깨끗하게
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
  };

  const all = listSchools();
  const currentSchool = all.find((s) => s.id === currentSchoolId) ?? all[0];
  const favorites = all.filter((s) => favoriteIds.includes(s.id));

  // 검색어 정규화 — 공백/대소문자 무시. 빈 문자열이면 검색 비활성.
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // 검색 결과 — 학교명·region 어느 쪽이든 매치
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(normalizedQuery) ||
        s.region.toLowerCase().includes(normalizedQuery)
    );
  }, [all, normalizedQuery, isSearching]);

  // region 별 그룹핑 (학교 수 늘어나도 자연 확장)
  const groupedByRegion = useMemo(() => {
    const map = new Map<string, SchoolConfig[]>();
    for (const school of all) {
      const list = map.get(school.region) ?? [];
      list.push(school);
      map.set(school.region, list);
    }
    return Array.from(map.entries());
  }, [all]);

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

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] bg-amber-50 flex flex-col animate-[fadeIn_0.15s_ease-out]"
              role="dialog"
              aria-modal="true"
            >
              {/* 상단 고정바 — 닫기 + 제목 + 검색 입력창 */}
              <div className="border-b-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-200 text-stone-700 hover:bg-amber-200 flex items-center justify-center"
                    aria-label="닫기"
                  >
                    ←
                  </button>
                  <h2 className="font-['Gaegu'] text-2xl font-bold text-stone-800">
                    학교 선택
                  </h2>
                  <span className="ml-auto text-xs text-stone-500 font-['Gaegu']">
                    {all.length}개교
                  </span>
                </div>
                <div className="px-5 pb-3 max-w-[480px] mx-auto w-full">
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      🔍
                    </span>
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="학교명 또는 지역으로 검색"
                      className="w-full bg-amber-100 border-2 border-amber-200 rounded-full pl-11 pr-10 py-2.5 text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-orange-400 focus:bg-amber-50 transition-colors"
                      autoComplete="off"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        aria-label="검색어 지우기"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-200 text-stone-600 hover:bg-amber-300 flex items-center justify-center text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 본문 — 자연 스크롤. 검색 중엔 단일 결과 리스트, 아니면 즐겨찾기 + region 그룹. */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-[480px] mx-auto px-5 py-4 pb-10">
                  {isSearching ? (
                    <section>
                      <h3 className="font-['Gaegu'] text-sm font-bold text-stone-600 mb-2">
                        검색 결과
                        <span className="ml-1.5 text-xs text-stone-400 font-normal">
                          ({searchResults.length})
                        </span>
                      </h3>
                      {searchResults.length === 0 ? (
                        <p className="text-xs text-stone-500 bg-amber-100 rounded-2xl px-4 py-3 border border-dashed border-amber-200">
                          매치되는 학교가 없어요. 학교명/지역 일부만 입력해도 됩니다.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {searchResults.map((school) => (
                            <SchoolRow
                              key={school.id}
                              school={school}
                              active={school.id === currentSchoolId}
                              favorite={favoriteIds.includes(school.id)}
                              home={school.id === homeSchoolId}
                              onPick={() => handlePick(school.id)}
                              onToggleFav={() => toggleFavorite(school.id)}
                              onToggleHome={() => toggleHomeSchool(school.id)}
                            />
                          ))}
                        </ul>
                      )}
                    </section>
                  ) : (
                    <>
                      {/* 즐겨찾기 섹션 */}
                      <section className="mb-6">
                        <h3 className="font-['Gaegu'] text-base font-bold text-orange-500 mb-2">
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
                                home={school.id === homeSchoolId}
                                onPick={() => handlePick(school.id)}
                                onToggleFav={() => toggleFavorite(school.id)}
                                onToggleHome={() => toggleHomeSchool(school.id)}
                              />
                            ))}
                          </ul>
                        )}
                      </section>

                      {/* 전체 학교 — region 별 그룹 */}
                      {groupedByRegion.map(([region, schools]) => (
                        <section key={region} className="mb-5">
                          <h3 className="font-['Gaegu'] text-sm font-bold text-stone-600 mb-2">
                            {region}
                            <span className="ml-1.5 text-xs text-stone-400 font-normal">
                              ({schools.length})
                            </span>
                          </h3>
                          <ul className="flex flex-col gap-2">
                            {schools.map((school) => (
                              <SchoolRow
                                key={school.id}
                                school={school}
                                active={school.id === currentSchoolId}
                                favorite={favoriteIds.includes(school.id)}
                                home={school.id === homeSchoolId}
                                onPick={() => handlePick(school.id)}
                                onToggleFav={() => toggleFavorite(school.id)}
                                onToggleHome={() => toggleHomeSchool(school.id)}
                              />
                            ))}
                          </ul>
                        </section>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

interface RowProps {
  school: SchoolConfig;
  active: boolean;
  favorite: boolean;
  home: boolean;
  onPick: () => void;
  onToggleFav: () => void;
  onToggleHome: () => void;
}

function SchoolRow({
  school,
  active,
  favorite,
  home,
  onPick,
  onToggleFav,
  onToggleHome,
}: RowProps) {
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
        className="flex-1 text-left flex flex-col min-w-0"
      >
        <span className="font-['Gaegu'] text-lg font-bold leading-snug truncate">
          {home && <span className="mr-1">🏠</span>}
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
          onToggleHome();
        }}
        aria-label={home ? '기본 학교 해제' : '기본 학교로 설정'}
        title={home ? '기본 학교 해제' : '기본 학교로 설정'}
        className={`w-10 h-10 ml-2 flex items-center justify-center rounded-full text-lg transition-transform hover:scale-110 ${
          home
            ? 'bg-orange-300'
            : active
              ? 'bg-orange-400'
              : 'bg-amber-100'
        }`}
      >
        <span className={home ? 'opacity-100' : 'opacity-30'}>🏠</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav();
        }}
        aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        className={`w-10 h-10 ml-2 flex items-center justify-center rounded-full text-lg transition-transform hover:scale-110 ${
          favorite
            ? 'bg-yellow-300 text-stone-800'
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
