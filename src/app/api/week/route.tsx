/**
 * 주간 식단표 PNG 생성 (Stage 10 — 가정통신문 용도).
 *
 * 학부모에게 보내는 한 주 식단 이미지 한 장. 모바일 뷰 + A4 인쇄 둘 다 만족.
 * 사진은 없음 (주 시작 전 시점이라 학교가 아직 사진 안 올림).
 *
 * 사이즈: 1240×1754 = A4(2:3) 비율, ~150 DPI 인쇄 품질.
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
// A4(2:3) 비율인 1754px 가 기본이지만, 메뉴 양에 따라 5일치가 안 들어갈
// 수 있어 콘텐츠 기반으로 동적 계산. 대부분 주는 1754px 안에 들어가지만
// 메뉴가 9개 넘는 날이 있는 주는 자동 확장.
const MIN_HEIGHT = 1754;

// amber/orange 톤 — 사이트 메인 컬러와 동일
const COLOR = {
  bg: '#FFFBEB',
  panelBg: '#FEF3C7',
  border: '#FDE68A',
  accent: '#F97316',
  text: '#1C1917',
  subText: '#78716C',
  allergyText: '#9A3412',
  caloriesBg: '#FDE68A',
  caloriesText: '#92400E',
};

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

  const allEmpty = meals.every((m) => !m || m.dishes.length === 0);

  // 콘텐츠 기반 세로 길이 계산. 안전 여유 ↑ — 알레르기 풀이가 긴 메뉴는
  // 한 줄이 두 줄로 wrap 될 수 있어 라인당 픽셀 추정이 빗나감. 모자라면
  // 푸터가 마지막 박스 위에 겹치는 사고가 남.
  //
  // 픽셀 추정:
  //  - 외곽 padding 상하 60+60 = 120
  //  - 헤더(학교명 + 주범위 + bottom border + margin) ≈ 200
  //  - 푸터(border-top + 텍스트 2줄 + margin) ≈ 100
  //  - 박스 헤더 (요일 + 칼로리) ≈ 56
  //  - 박스 패딩 22*2 = 44 + border 4 = 48
  //  - 메뉴 라인당 = fontSize 26 * lineHeight 1.3 + gap 6 ≈ 40px
  //    (알레르기 wrap 가능성 위해 라인당 1.4배 안전계수 = 56px)
  //  - 박스 사이 gap 18 * 4 = 72
  //  - 추가 안전 여유 240px
  const dynamicHeight = allEmpty
    ? MIN_HEIGHT
    : (() => {
        const dayBoxes = meals.map((m) => {
          const lines = m && m.dishes.length > 0 ? m.dishes.length : 1;
          return 56 + 48 + lines * 56;
        });
        const total =
          120 + 200 + 100 + 72 + 240 +
          dayBoxes.reduce((s, h) => s + h, 0);
        return Math.max(MIN_HEIGHT, total);
      })();

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
          padding: '60px 70px',
        }}
      >
        {/* 헤더 — 학교명 + 주 범위 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 30,
            borderBottom: `4px solid ${COLOR.accent}`,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              fontSize: 36,
              color: COLOR.accent,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            🍱 {school.name}
          </div>
          <div
            style={{
              fontSize: 64,
              color: COLOR.text,
              fontWeight: 800,
              display: 'flex',
            }}
          >
            {weekRange} 주간 식단
          </div>
        </div>

        {/* 5일 모두 비었을 때 */}
        {allEmpty ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLOR.subText,
            }}
          >
            <div style={{ fontSize: 200, marginBottom: 30 }}>🌙</div>
            <div style={{ fontSize: 40, display: 'flex' }}>
              아직 등록된 식단이 없어요
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {weekDates.map((d, idx) =>
              renderDay(d, meals[idx])
            )}
          </div>
        )}

        {/* 푸터 */}
        <div
          style={{
            marginTop: 30,
            paddingTop: 20,
            borderTop: `2px dashed ${COLOR.border}`,
            display: 'flex',
            flexDirection: 'column',
            color: COLOR.subText,
            fontSize: 22,
          }}
        >
          <div style={{ display: 'flex' }}>
            ※ 알레르기 표시는 식약처 19종 표준 기준입니다
          </div>
          <div style={{ display: 'flex', marginTop: 6 }}>
            school-meal-phi.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: dynamicHeight }
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

function renderDay(date: Date, meal: Meal | null) {
  const dayLabel = `${DOW[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}`;
  const hasDishes = meal && meal.dishes.length > 0;

  return (
    <div
      key={dayLabel}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLOR.panelBg,
        borderRadius: 20,
        padding: '22px 30px',
        border: `2px solid ${COLOR.border}`,
      }}
    >
      {/* 일별 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: hasDishes ? 14 : 0,
        }}
      >
        <div
          style={{
            fontSize: 36,
            color: COLOR.accent,
            fontWeight: 800,
            display: 'flex',
          }}
        >
          {dayLabel}
        </div>
        {meal?.calories && (
          <div
            style={{
              fontSize: 24,
              color: COLOR.caloriesText,
              backgroundColor: COLOR.caloriesBg,
              padding: '4px 14px',
              borderRadius: 999,
              display: 'flex',
            }}
          >
            {meal.calories}
          </div>
        )}
      </div>

      {/* 메뉴 목록 */}
      {hasDishes ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {meal!.dishes.map((dish, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                fontSize: 26,
                color: COLOR.text,
                lineHeight: 1.3,
              }}
            >
              <span
                style={{
                  color: COLOR.accent,
                  marginRight: 10,
                  display: 'flex',
                }}
              >
                ●
              </span>
              <span style={{ display: 'flex', flexWrap: 'wrap' }}>
                {dish.name}
                {dish.allergies.length > 0 && (
                  <span
                    style={{
                      color: COLOR.allergyText,
                      marginLeft: 8,
                      fontSize: 22,
                      display: 'flex',
                    }}
                  >
                    ({formatAllergyNames(dish.allergies)})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: 26,
            color: COLOR.subText,
            display: 'flex',
            paddingTop: 4,
          }}
        >
          급식 정보가 없는 날이에요
        </div>
      )}
    </div>
  );
}
