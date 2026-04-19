'use client';

import { DOW, formatDate } from '@/lib/utils';

interface Props {
  dates: Date[];
  selectedYmd: string;
  onSelect: (ymd: string) => void;
}

export default function WeekPicker({ dates, selectedYmd, onSelect }: Props) {
  const todayYmd = formatDate(new Date());

  return (
    <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
      {dates.map((date) => {
        const ymd = formatDate(date);
        const isToday = ymd === todayYmd;
        const isActive = ymd === selectedYmd;

        return (
          <button
            key={ymd}
            onClick={() => onSelect(ymd)}
            className={`
              flex-shrink-0 min-w-[56px] px-1 py-2.5 rounded-2xl border-2 text-center
              font-['Gaegu'] transition-all
              ${isActive
                ? 'bg-orange-500 border-orange-500 text-white -translate-y-0.5 shadow-[0_2px_0_#D4BC93]'
                : isToday
                ? 'bg-yellow-300 border-yellow-300 text-stone-800'
                : 'bg-amber-50 border-amber-200 text-stone-800'}
            `}
          >
            <span className="block text-xs mb-0.5 opacity-85">
              {DOW[date.getDay()]}
            </span>
            <span className="block text-lg font-bold">{date.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
