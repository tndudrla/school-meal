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
      // NEIS 내부 태그(CG, AG 등 끝의 대문자 2~3자)와 '*' 제거
      const name = match[1]
        .replace(/\*+$/, '')
        .replace(/[A-Z]{2,3}$/, '')
        .trim();
      const allergies = match[2] ? match[2].split('.') : [];
      return { name, allergies };
    })
    .filter((d): d is Dish => d !== null && d.name.length > 0);
}
