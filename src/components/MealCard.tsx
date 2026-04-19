import type { Meal } from '@/types/meal';
import { DOW, parseYmd } from '@/lib/utils';

interface Props {
  ymd: string;
  meal: Meal | null;
  photoUrl?: string | null;
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

export default function MealCard({ ymd, meal, photoUrl }: Props) {
  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;

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
