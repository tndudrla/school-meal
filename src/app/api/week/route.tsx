/**
 * 주간 식단표 PNG 생성 (Stage 10 / Stage 10-1).
 *
 * 학부모 가정통신문 용도. A4 1장 고정. 흑백 인쇄 친화.
 *
 * Stage 10-1 방향 전환:
 *   기존: 컬러풀 박스 + 이모지 + 세로 가변 → 인쇄 부적합
 *   현재: 표 형태 + 검정 텍스트 + 1240×1754 고정 → 컬러도 흑백도 깔끔
 *
 * 디자인 원칙:
 *   - 이모지 X (흑백 프린터 빈 사각형 방지)
 *   - 둥근 박스/배경색 X (잉크 낭비)
 *   - 얇은 회색 테두리 + 진한 검정 텍스트
 *   - 인쇄 마진: 내부 여백 60~80px (A4 ~210mm 폭에 인쇄 safe ≈ 195mm)
 *   - 메뉴 다 들어가게 폰트 신중히 — 12개 메뉴까지 가능
 */

import { ImageResponse } from 'next/og';
import { fetchMealFromNeis } from '@/lib/neis';
import { getSchool } from '@/lib/schools';
import {
  getWeekDatesByOffset,
  formatDate,
  formatWeekRange,
  DOW,
} from '@/lib/utils';
import { formatAllergyNames } from '@/lib/allergies';
import type { Meal } from '@/types/meal';

export const runtime = 'nodejs';

const WIDTH = 1240;
const HEIGHT = 1754;

// 인쇄 친화 — 검정 + 회색 톤만
const COLOR = {
  bg: '#FFFFFF',
  text: '#111111',
  subText: '#555555',
  faint: '#888888',
  border: '#222222',
  borderLight: '#CCCCCC',
  accentBg: '#F2F2F2', // 헤더 행 옅은 회색 (흑백 인쇄에서도 자연스러움)
};

// 알레르기 19종 (식약처 표준) — 푸터 매핑 표용
const ALLERGY_FOOTER = [
  '1.난류', '2.우유', '3.메밀', '4.땅콩', '5.대두',
  '6.밀', '7.고등어', '8.게', '9.새우', '10.돼지고기',
  '11.복숭아', '12.토마토', '13.아황산류', '14.호두', '15.닭고기',
  '16.쇠고기', '17.오징어', '18.조개류', '19.잣',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const school = getSchool(searchParams.get('schoolId'));
  const weekDates = getWeekDatesByOffset(offset);
  const weekRange = formatWeekRange(weekDates);

  // 월~금 병렬 fetch — 캐시 hit 면 즉시 반환 (revalidate: 3600)
  const meals = await Promise.all(
    weekDates.map((d) =>
      fetchMealFromNeis({
        atptCode: school.neis.atptCode,
        schoolCode: school.neis.schoolCode,
        ymd: formatDate(d),
        apiKey: process.env.NEIS_API_KEY,
      }).catch(() => null)
    )
  );

  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLOR.bg,
          fontFamily: 'sans-serif',
          padding: '70px 80px',
          color: COLOR.text,
        }}
      >
        {/* 제목 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: COLOR.subText,
              fontWeight: 500,
              display: 'flex',
              marginBottom: 8,
            }}
          >
            {school.name}
          </div>
          <div
            style={{
              fontSize: 56,
              color: COLOR.text,
              fontWeight: 800,
              display: 'flex',
            }}
          >
            {weekRange} 주간 식단
          </div>
        </div>

        {/* 표 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: `2px solid ${COLOR.border}`,
            flex: 1,
          }}
        >
          {/* 표 헤더 */}
          <div
            style={{
              display: 'flex',
              backgroundColor: COLOR.accentBg,
              borderBottom: `2px solid ${COLOR.border}`,
            }}
          >
            <div
              style={{
                width: 130,
                padding: '14px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
                borderRight: `1px solid ${COLOR.border}`,
              }}
            >
              요일
            </div>
            <div
              style={{
                flex: 1,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                fontSize: 26,
                fontWeight: 700,
                borderRight: `1px solid ${COLOR.border}`,
              }}
            >
              메뉴
            </div>
            <div
              style={{
                width: 160,
                padding: '14px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              칼로리
            </div>
          </div>

          {/* 5일 행 */}
          {weekDates.map((d, idx) => renderRow(d, meals[idx], idx === 4))}
        </div>

        {/* 푸터 — 알레르기 매핑 표 + 출처 */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            color: COLOR.subText,
            fontSize: 18,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: COLOR.text,
              marginBottom: 6,
              display: 'flex',
            }}
          >
            알레르기 유발 식품 (식약처 19종)
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 16px',
              marginBottom: 12,
            }}
          >
            {ALLERGY_FOOTER.map((s) => (
              <span key={s} style={{ display: 'flex' }}>
                {s}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', color: COLOR.faint, fontSize: 16 }}>
            출처: school-meal-phi.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'image/png',
      // 주 식단은 자주 안 바뀜. 1시간 CDN 캐시.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function renderRow(date: Date, meal: Meal | null, isLast: boolean) {
  const dowName = DOW[date.getDay()];
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
  const hasDishes = meal && meal.dishes.length > 0;

  // 메뉴는 슬래시 구분 한 텍스트로. 알레르기는 (1.5.8) 형태 그대로 옆에
  // (푸터에 매핑 표 있어 이름 풀이 불필요).
  const menuText = hasDishes
    ? meal!.dishes
        .map((dish) => {
          const allergy =
            dish.allergies.length > 0 ? ` (${dish.allergies.join('.')})` : '';
          return `${dish.name}${allergy}`;
        })
        .join(' / ')
    : '급식 정보가 없는 날이에요';

  return (
    <div
      key={dateLabel}
      style={{
        display: 'flex',
        flex: 1,
        borderBottom: isLast ? 'none' : `1px solid ${COLOR.borderLight}`,
        minHeight: 0,
      }}
    >
      {/* 요일 셀 */}
      <div
        style={{
          width: 130,
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: `1px solid ${COLOR.border}`,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            display: 'flex',
            marginBottom: 4,
          }}
        >
          {dowName}
        </div>
        <div
          style={{
            fontSize: 22,
            color: COLOR.subText,
            display: 'flex',
          }}
        >
          {dateLabel}
        </div>
      </div>

      {/* 메뉴 셀 */}
      <div
        style={{
          flex: 1,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          fontSize: 24,
          lineHeight: 1.5,
          color: hasDishes ? COLOR.text : COLOR.faint,
          borderRight: `1px solid ${COLOR.border}`,
        }}
      >
        {menuText}
      </div>

      {/* 칼로리 셀 */}
      <div
        style={{
          width: 160,
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          color: COLOR.subText,
        }}
      >
        {meal?.calories ?? '-'}
      </div>
    </div>
  );
}
