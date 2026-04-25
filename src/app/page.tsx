'use client';

import { useEffect, useMemo, useState } from 'react';
import WeekPicker from '@/components/WeekPicker';
import MealCard from '@/components/MealCard';
import {
  getWeekDatesByOffset,
  formatDate,
  formatWeekRange,
  isWeekBeforeMin,
  DOW,
} from '@/lib/utils';
import type { Meal } from '@/types/meal';

// 청계초등학교 (경기 과천시)
const SCHOOL = {
  atptCode: 'J10',
  schoolCode: '7569109',
  name: '청계초등학교',
};

export default function HomePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => getWeekDatesByOffset(weekOffset), [weekOffset]);

  const [selectedYmd, setSelectedYmd] = useState<string>(formatDate(weekDates[0]));
  const [meal, setMeal] = useState<Meal | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 주가 바뀌면 선택 날짜도 해당 주의 월요일로 초기화
  useEffect(() => {
    setSelectedYmd(formatDate(weekDates[0]));
  }, [weekDates]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPhotoUrl(null);

    const mealReq = fetch(
      `/api/meal?atpt=${SCHOOL.atptCode}&school=${SCHOOL.schoolCode}&ymd=${selectedYmd}`
    ).then((r) => r.json());

    const photoReq = fetch(`/api/meal/photo?ymd=${selectedYmd}`)
      .then((r) => r.json())
      .catch(() => ({ photoUrl: null }));

    Promise.all([mealReq, photoReq])
      .then(([mealData, photoData]) => {
        if (cancelled) return;
        if (mealData.error) {
          setError(mealData.error);
        } else {
          setMeal(mealData.meal);
        }
        setPhotoUrl(photoData.photoUrl ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYmd]);

  const today = new Date();
  const todayLabel = `${today.getMonth() + 1}.${today.getDate()} ${DOW[today.getDay()]}요일`;

  // 이전/다음 주 이동 가능 여부
  const prevDisabled = isWeekBeforeMin(getWeekDatesByOffset(weekOffset - 1));
  // 기준 주(offset 0, "이번주")가 사용자가 볼 수 있는 가장 미래 주
  const nextDisabled = weekOffset >= 0;
  const weekRangeLabel = formatWeekRange(weekDates);

  return (
    <>
      <header className="px-5 pt-5 pb-4 sticky top-0 z-10 bg-gradient-to-b from-amber-50 to-amber-50/70 backdrop-blur-sm">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="font-['Gaegu'] text-2xl font-bold text-stone-800">
            🍱 {SCHOOL.name}
          </h1>
          <span className="text-xs text-stone-500">{todayLabel}</span>
        </div>
        <p className="text-xs text-stone-500 pl-7">오늘의 급식, 한 상 차렸어요</p>
      </header>

      {/* 주 네비게이션 */}
      <div className="flex items-center justify-between px-5 pt-2">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          disabled={prevDisabled}
          className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-200 text-stone-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-200 transition-colors"
          aria-label="이전 주"
        >
          ◀
        </button>
        <div className="font-['Gaegu'] text-base font-bold text-stone-700">
          {weekRangeLabel}
          {weekOffset === 0 && (
            <span className="text-xs text-orange-500 ml-1.5">이번주</span>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={nextDisabled}
          className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-200 text-stone-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-200 transition-colors"
          aria-label="다음 주"
        >
          ▶
        </button>
      </div>

      <WeekPicker
        dates={weekDates}
        selectedYmd={selectedYmd}
        onSelect={setSelectedYmd}
      />

      {loading ? (
        <div className="text-center py-15 font-['Hi_Melody'] text-xl text-stone-500">
          <span className="inline-block text-4xl animate-[spin_1.2s_ease-in-out_infinite] mb-2">🍱</span>
          <br />
          맛있는 메뉴 가져오는 중...
        </div>
      ) : error ? (
        <div className="mx-5 p-5 bg-orange-100 border-2 border-dashed border-orange-500 rounded-2xl text-center">
          <span className="text-4xl block mb-2">😢</span>
          <p className="font-['Gaegu'] font-bold text-lg mb-1.5">데이터를 가져올 수 없어요</p>
          <p className="text-xs text-stone-500 leading-relaxed">{error}</p>
        </div>
      ) : (
        <MealCard ymd={selectedYmd} meal={meal} photoUrl={photoUrl} />
      )}

      <div className="mx-5 p-4 bg-amber-100 rounded-2xl text-xs text-stone-600 leading-relaxed border border-dashed border-amber-200">
        <strong className="text-orange-500 font-['Gaegu']">📸 사진 안내</strong>
        <br />
        학교 홈페이지에 사진이 올라오면 자동으로 표시돼요. 아직 없으면 메뉴 아이콘만 예쁘게 보여드려요!
      </div>
    </>
  );
}
