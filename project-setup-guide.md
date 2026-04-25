# 🍱 급식 벤치마크 — 프로젝트 시작 가이드

청계초등학교 급식 메뉴를 보여주는 모바일 웹사이트를 Next.js + Supabase로 만드는 단계별 가이드입니다.
이 문서를 Cursor에게 그대로 보여주면서 함께 진행하세요.

---

## 🎯 프로젝트 목표

**Phase 1 (이 가이드의 범위)**: 청계초 이번주 급식 메뉴를 모바일에서 예쁘게 보여주기
**Phase 2**: 급식 사진 업로드 + 인스타 스타일 갤러리
**Phase 3**: 학교 검색해서 추가하기 (여러 학교 확장)

---

## 📋 기술 스택 (왜 이걸 쓰는지)

| 기술 | 용도 | 이유 |
|---|---|---|
| **Next.js 15** | React 프레임워크 | 프론트+백엔드 통합, Vercel 무료 배포 |
| **TypeScript** | 타입 안전성 | 실수 줄이고 Cursor AI가 더 잘 이해함 |
| **Tailwind CSS v4** | 스타일링 | 클래스 기반, 빠른 UI 구축 |
| **Supabase** | 백엔드 (DB + 스토리지) | PostgreSQL + 이미지 업로드 무료 |
| **Vercel** | 배포 | Git 푸시하면 자동 배포, 무료 |
| **NEIS Open API** | 급식 데이터 | 공식, 무료 |

---

## ✅ 사전 준비 체크리스트

시작 전에 아래를 준비하세요:

- [ ] **Node.js 20+ 설치** — https://nodejs.org (LTS 버전)
- [ ] **GitHub 계정** — 코드 저장용
- [ ] **Cursor 설치** — https://cursor.com
- [ ] **Supabase 계정** — https://supabase.com (GitHub으로 로그인 가능)
- [ ] **Vercel 계정** — https://vercel.com (GitHub으로 로그인)
- [ ] **NEIS API 키** (선택) — https://open.neis.go.kr 에서 회원가입 후 발급. 없어도 하루 1000회까진 됨.

---

## 🚀 Step 1. 프로젝트 생성

### 1-1. 터미널에서 프로젝트 만들기

작업할 폴더에서 터미널을 열고:

```bash
npx create-next-app@latest school-meal --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

질문이 나오면 기본값 그대로 Enter. 다음과 같이 대답하면 됩니다:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Turbopack: **Yes** (빠름)
- Customize import alias: **No**

### 1-2. Cursor로 열기

```bash
cd school-meal
cursor .
```

### 1-3. 개발 서버 확인

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속. Next.js 기본 페이지가 보이면 성공!

---

## 🗄️ Step 2. Supabase 프로젝트 생성

### 2-1. Supabase 대시보드에서

1. https://supabase.com/dashboard 접속
2. **New Project** 클릭
3. 설정:
   - **Name**: `school-meal`
   - **Database Password**: 강력한 비밀번호 생성 후 **꼭 저장** (나중에 복구 불가)
   - **Region**: `Northeast Asia (Seoul)` ← 한국이니까
   - **Pricing Plan**: `Free`
4. **Create new project** 클릭 (2~3분 대기)

### 2-2. API 키 복사

프로젝트 생성 완료 후:
1. 왼쪽 메뉴 → **Project Settings** → **API**
2. 두 값을 메모장에 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** 키: `eyJhbG...` (긴 문자열)

---

## 🔐 Step 3. 환경 변수 설정

### 3-1. `.env.local` 파일 생성

프로젝트 루트(package.json이 있는 폴더)에 `.env.local` 파일을 만드세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# NEIS Open API (선택 — 없어도 일일 1000회 가능)
NEIS_API_KEY=
```

> ⚠️ `.env.local`은 `.gitignore`에 이미 포함되어 있어서 GitHub에 올라가지 않아요. 절대 공개 저장소에 키를 올리지 마세요.

### 3-2. Supabase 클라이언트 라이브러리 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 📁 Step 4. 프로젝트 구조 설정

Cursor에 다음 구조로 폴더/파일을 만들어달라고 하세요:

```
school-meal/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 메인 페이지 (급식 피드)
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── globals.css           # 글로벌 스타일
│   │   └── api/
│   │       └── meal/
│   │           └── route.ts      # NEIS API 프록시 (CORS 회피)
│   ├── components/
│   │   ├── WeekPicker.tsx        # 요일 선택 chip
│   │   ├── MealCard.tsx          # 급식 카드 (사진 + 메뉴)
│   │   └── PhotoPlaceholder.tsx  # 사진 없을 때 플레이스홀더
│   ├── lib/
│   │   ├── neis.ts               # NEIS API 호출 로직
│   │   ├── supabase/
│   │   │   ├── client.ts         # 브라우저용 Supabase 클라이언트
│   │   │   └── server.ts         # 서버용 Supabase 클라이언트
│   │   └── utils.ts              # 날짜 포맷 등
│   └── types/
│       └── meal.ts               # 타입 정의
├── .env.local
└── ...
```

### Cursor에게 이렇게 요청하세요:

> 위의 폴더 구조를 만들어주세요. 각 파일은 일단 빈 템플릿으로 만들어두고, 다음 Step에서 하나씩 채울게요.

---

## 🧩 Step 5. 핵심 파일 구현

아래 코드를 Cursor에게 각 파일 경로와 함께 복사해서 붙여넣어달라고 하거나, 직접 복붙하세요.

### 5-1. `src/types/meal.ts`

```typescript
export interface Meal {
  date: string;          // YYYYMMDD
  mealType: string;      // 중식, 석식 등
  dishes: Dish[];
  calories: string;      // "653.6 Kcal"
  nutrients?: string;
}

export interface Dish {
  name: string;
  allergies: string[];   // ["1", "2", "5"] 같은 알레르기 번호
}

export interface School {
  atptCode: string;      // J10 (경기도교육청)
  schoolCode: string;    // SD_SCHUL_CODE
  name: string;
  address?: string;
}
```

### 5-2. `src/lib/utils.ts`

```typescript
export const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

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

export function parseYmd(ymd: string): Date {
  return new Date(
    parseInt(ymd.substring(0, 4)),
    parseInt(ymd.substring(4, 6)) - 1,
    parseInt(ymd.substring(6, 8))
  );
}
```

### 5-3. `src/lib/neis.ts`

```typescript
import type { Meal, Dish } from '@/types/meal';

const NEIS_BASE = 'https://open.neis.go.kr/hub';

interface NeisMealRow {
  MLSV_YMD: string;
  MMEAL_SC_NM: string;
  DDISH_NM: string;
  CAL_INFO?: string;
  NTR_INFO?: string;
}

export async function fetchMealFromNeis(params: {
  atptCode: string;
  schoolCode: string;
  ymd: string;
  apiKey?: string;
}): Promise<Meal | null> {
  const url = new URL(`${NEIS_BASE}/mealServiceDietInfo`);
  url.searchParams.set('Type', 'json');
  url.searchParams.set('pIndex', '1');
  url.searchParams.set('pSize', '10');
  url.searchParams.set('ATPT_OFCDC_SC_CODE', params.atptCode);
  url.searchParams.set('SD_SCHUL_CODE', params.schoolCode);
  url.searchParams.set('MLSV_YMD', params.ymd);
  if (params.apiKey) url.searchParams.set('KEY', params.apiKey);

  const res = await fetch(url.toString(), {
    // 서버에서 호출 → CORS 무관
    next: { revalidate: 3600 }, // 1시간 캐싱
  });

  if (!res.ok) throw new Error(`NEIS API error: ${res.status}`);

  const data = await res.json();

  // 결과 없을 때 (INFO-200 = "해당하는 데이터가 없습니다")
  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
    return null;
  }

  const rows: NeisMealRow[] = data.mealServiceDietInfo?.[1]?.row || [];
  if (rows.length === 0) return null;

  // 중식 우선
  const lunch = rows.find((r) => r.MMEAL_SC_NM === '중식') || rows[0];

  return {
    date: lunch.MLSV_YMD,
    mealType: lunch.MMEAL_SC_NM,
    dishes: parseDishes(lunch.DDISH_NM),
    calories: lunch.CAL_INFO || '',
    nutrients: lunch.NTR_INFO,
  };
}

function parseDishes(raw: string): Dish[] {
  if (!raw) return [];
  return raw
    .split('<br/>')
    .map((item) => {
      const match = item.trim().match(/^(.+?)\s*(?:\(([\d.]+)\))?\s*$/);
      if (!match) return null;
      const name = match[1].replace(/\*+$/, '').trim();
      const allergies = match[2] ? match[2].split('.') : [];
      return { name, allergies };
    })
    .filter((d): d is Dish => d !== null && d.name.length > 0);
}
```

### 5-4. `src/app/api/meal/route.ts` — NEIS API 프록시

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchMealFromNeis } from '@/lib/neis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const atptCode = searchParams.get('atpt') || 'J10';
  const schoolCode = searchParams.get('school');
  const ymd = searchParams.get('ymd');

  if (!schoolCode || !ymd) {
    return NextResponse.json(
      { error: 'school and ymd parameters are required' },
      { status: 400 }
    );
  }

  try {
    const meal = await fetchMealFromNeis({
      atptCode,
      schoolCode,
      ymd,
      apiKey: process.env.NEIS_API_KEY,
    });

    return NextResponse.json({ meal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 }); 
  }
}
```

> 💡 **이게 왜 필요한가?**: NEIS API를 브라우저에서 직접 부르면 CORS 에러가 날 수 있어요. Next.js API Route에서 대신 부르면(서버→서버) 이 문제가 사라집니다. 아까 "Failed to fetch"의 원인이었어요.

### 5-5. `src/components/WeekPicker.tsx`

```tsx
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
```

### 5-6. `src/components/MealCard.tsx`

```tsx
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
```

### 5-7. `src/app/layout.tsx` (기본 생성된 파일 수정)

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '오늘의 급식 | 청계초등학교',
  description: '청계초등학교 급식 메뉴를 한눈에',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="color-scheme" content="light only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Gaegu:wght@400;700&family=Hi+Melody&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-amber-50 min-h-screen" style={{ fontFamily: "'Gowun Dodum', sans-serif" }}>
        <div className="max-w-[480px] mx-auto pb-20">
          {children}
        </div>
      </body>
    </html>
  );
}
```

### 5-8. `src/app/globals.css`

Tailwind v4 설정을 유지하면서 추가:

```css
@import "tailwindcss";

@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 다크모드 강제 비활성화 */
@media (prefers-color-scheme: dark) {
  html { color-scheme: light !important; }
}
```

### 5-9. `src/app/page.tsx` — 메인 페이지

```tsx
'use client';

import { useEffect, useState } from 'react';
import WeekPicker from '@/components/WeekPicker';
import MealCard from '@/components/MealCard';
import { getThisWeekDates, formatDate, DOW } from '@/lib/utils';
import type { Meal } from '@/types/meal';

// 청계초등학교 설정 (Step 6에서 실제 코드로 교체)
const SCHOOL = {
  atptCode: 'J10',
  schoolCode: '7531375', // 임시값 — 확인 후 수정
  name: '청계초등학교',
};

export default function HomePage() {
  const weekDates = getThisWeekDates();
  const [selectedYmd, setSelectedYmd] = useState<string>(formatDate(weekDates[0]));
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/meal?atpt=${SCHOOL.atptCode}&school=${SCHOOL.schoolCode}&ymd=${selectedYmd}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setMeal(data.meal);
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
        <MealCard ymd={selectedYmd} meal={meal} />
      )}

      <div className="mx-5 p-4 bg-amber-100 rounded-2xl text-xs text-stone-600 leading-relaxed border border-dashed border-amber-200">
        <strong className="text-orange-500 font-['Gaegu']">📸 사진 안내</strong>
        <br />
        학교 홈페이지에 사진이 올라오면 자동으로 표시돼요. 아직 없으면 메뉴 아이콘만 예쁘게 보여드려요!
      </div>
    </>
  );
}
```

---

## 🔎 Step 6. 청계초 정확한 학교 코드 찾기

위 `page.tsx`의 `schoolCode: '7531375'`는 **추정값**이에요. 실제 코드를 찾아야 합니다.

### 방법 1: 브라우저로 NEIS API 직접 호출

브라우저 주소창에 붙여넣기 (JSON이 그대로 뜸):

```
https://open.neis.go.kr/hub/schoolInfo?Type=json&pSize=100&SCHUL_NM=청계초등학교&ATPT_OFCDC_SC_CODE=J10
```

응답에서 **과천시** 주소의 학교를 찾고, 그 `SD_SCHUL_CODE` 값을 `page.tsx`에 반영.

### 방법 2: 임시 검색 페이지 만들기

Cursor에게 이렇게 요청:

> `/src/app/search/page.tsx`를 만들어서 학교명으로 검색하는 기능을 추가해줘. NEIS `/api/schools/search?q=청계초` 엔드포인트를 새로 만들고, 검색 결과의 `SD_SCHUL_CODE`를 복사할 수 있게 보여줘.

---

## 🚢 Step 7. Vercel 배포

### 7-1. GitHub에 올리기

```bash
git init
git add .
git commit -m "initial: school meal prototype"

# GitHub에서 새 레포 만들고
git remote add origin https://github.com/YOUR_USERNAME/school-meal.git
git branch -M main
git push -u origin main
```

### 7-2. Vercel 연결

1. https://vercel.com/new
2. **Import Git Repository** → `school-meal` 선택
3. **Environment Variables** 섹션에 `.env.local`의 내용 복붙
4. **Deploy** 클릭 (1~2분 대기)
5. 완료되면 `https://school-meal-xxx.vercel.app` 같은 URL을 받음 → 모바일에서 접속!

---

## 🎯 완료 체크리스트

Phase 1이 완성되면 아래가 모두 가능해야 합니다:

- [ ] `npm run dev` 실행 후 http://localhost:3000 에서 청계초 급식이 뜸
- [ ] 요일 탭 클릭하면 다른 날짜 메뉴로 전환됨
- [ ] 모바일 브라우저에서 열어도 레이아웃이 깨지지 않음
- [ ] Vercel URL을 공유해서 다른 사람도 볼 수 있음

---

## 🔜 Phase 2 예고 (사진 업로드)

다음 단계에서 할 일:
1. Supabase에 `meal_photos` 테이블 생성 (school_code, date, photo_url, uploaded_at)
2. Supabase Storage 버킷 `meal-photos` 생성
3. 업로드 페이지 `/upload` 추가 (간단한 비밀번호 보호)
4. `MealCard`가 Supabase에서 해당 날짜 사진이 있는지 확인하고 표시
5. 여러 사진이 있으면 인스타 스타일 스와이프 갤러리

---

## 💡 Cursor AI 활용 팁

진행하다 막히면 Cursor 채팅창에 이렇게 붙여넣으세요:

**에러가 났을 때:**
> 다음 에러가 났어. 해결해줘: [에러 메시지 붙여넣기]

**기능 추가할 때:**
> `src/app/page.tsx`에 학교 선택 드롭다운을 추가해줘. 청계초등학교, 과천초등학교 두 개를 선택할 수 있게.

**코드 이해 안 될 때:**
> `src/lib/neis.ts`의 `parseDishes` 함수가 뭘 하는지 설명해줘.

**스타일 바꿀 때:**
> `MealCard` 컴포넌트의 배경을 연한 민트색으로 바꿔줘.

---

## 📚 참고 자료

- Next.js 공식 문서: https://nextjs.org/docs
- Supabase + Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- NEIS Open API: https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN17320190722180924242823
- Tailwind CSS: https://tailwindcss.com/docs

---

## ❓ 자주 나오는 문제 & 해결

### "학교 코드를 찾을 수 없어요"
→ Step 6의 방법 1로 브라우저에서 직접 NEIS 검색 API 호출해서 확인

### "Failed to fetch" 에러가 계속 나요
→ `.env.local` 파일 만들고 Supabase 키 제대로 넣었는지 확인. 개발 서버(`npm run dev`) 재시작 필요

### "CORS 에러" 가 나요
→ NEIS를 브라우저에서 직접 호출하고 있을 가능성. `/api/meal` 프록시를 통해서만 호출하는지 확인

### Vercel 배포 후 500 에러
→ Vercel 대시보드에서 환경 변수 `NEIS_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 확인

---

**준비됐으면 Step 1부터 시작하세요! 막히는 지점이 있으면 Cursor에 이 문서 내용을 보여주면서 물어보면 됩니다.**
