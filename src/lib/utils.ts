export const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// 조회 가능한 최소 날짜 (서비스 시작일)
export const MIN_DATE = new Date(2026, 0, 1); // 2026-01-01

export function getThisWeekDates(baseDate: Date = new Date()): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);

  if (day === 0) {
    // 일요일 → 다음날(월)부터
    monday.setDate(baseDate.getDate() + 1);
  } else if (day === 6) {
    // 토요일 → 이틀 뒤(월)부터
    monday.setDate(baseDate.getDate() + 2);
  } else {
    // 평일 → 이번주 월요일
    monday.setDate(baseDate.getDate() - (day - 1));
  }

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// offset 0 = 이번 주, -1 = 지난 주, +1 = 다음 주
export function getWeekDatesByOffset(offset: number): Date[] {
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);
  return getThisWeekDates(base);
}

// 해당 주가 MIN_DATE 이전으로 완전히 벗어났는지 (월~금이 모두 MIN 이전)
export function isWeekBeforeMin(weekDates: Date[]): boolean {
  const friday = weekDates[weekDates.length - 1];
  return friday < MIN_DATE;
}

// 해당 주가 미래 주인지 (월이 오늘 이후 주)
export function isWeekInFuture(weekDates: Date[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = weekDates[0];
  return monday > today;
}

export function formatWeekRange(weekDates: Date[]): string {
  const start = weekDates[0];
  const end = weekDates[weekDates.length - 1];
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = `${start.getMonth() + 1}월 ${start.getDate()}일`;
  const endLabel = sameMonth
    ? `${end.getDate()}일`
    : `${end.getMonth() + 1}월 ${end.getDate()}일`;
  return `${startLabel} ~ ${endLabel}`;
}

export function parseYmd(ymd: string): Date {
  return new Date(
    parseInt(ymd.substring(0, 4)),
    parseInt(ymd.substring(4, 6)) - 1,
    parseInt(ymd.substring(6, 8))
  );
}

// 첫 진입 시 노출할 날짜.
// 평일 → 오늘, 주말 → 다음 주 월요일 (학부모 진입 시 가장 가까운 식단 일).
export function getDefaultDate(baseDate: Date = new Date()): Date {
  const day = baseDate.getDay();
  if (day === 0 || day === 6) {
    return getThisWeekDates(baseDate)[0]; // 다음 주 월요일
  }
  // 평일은 시간대 영향 제거된 그날의 자정
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
}
