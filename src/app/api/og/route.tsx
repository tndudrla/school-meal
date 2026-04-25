import { ImageResponse } from 'next/og';
import { fetchMealFromNeis } from '@/lib/neis';
import { parseYmd, formatDate, DOW } from '@/lib/utils';

const SCHOOL_NAME = '청계초등학교';
const ATPT = 'J10';
const SCHOOL_CODE = '7569109';

export const runtime = 'nodejs';

// SNS 미리보기는 자주 바뀔 필요 없음 — CDN 1시간 캐시로 NEIS 호출 최소화.
//
// Stage 1: 학교 사진을 OG 이미지에 임베드하지 않는다.
// 이유: next/og 가 <img src=학교URL> 를 만나면 서버 사이드에서 사진을 다운로드/디코딩하는데,
//       학교 서버가 응답이 느린 경우(관측: 27초) 카카오톡 OG 봇이 타임아웃되어
//       빈 미리보기가 카톡 캐시에 박히는 사고가 발생.
// Stage 3 에서 Supabase Storage 미러로 사진을 안전하게 박을 예정.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawYmd = searchParams.get('ymd');
  const ymd = rawYmd && /^\d{8}$/.test(rawYmd) ? rawYmd : formatDate(new Date());

  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;

  const meal = await fetchMealFromNeis({
    atptCode: ATPT,
    schoolCode: SCHOOL_CODE,
    ymd,
    apiKey: process.env.NEIS_API_KEY,
  }).catch(() => null);

  const dishes = meal?.dishes.slice(0, 6).map((d) => d.name) ?? [];

  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#FFFBEB',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 좌측: 패턴 배경 + 도시락 이모지 (Stage 3 에서 미러된 학교 사진으로 교체 예정) */}
        <div
          style={{
            width: 540,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FDD5B8',
            backgroundImage:
              'repeating-linear-gradient(45deg, #FFEFD0 0, #FFEFD0 18px, #FDD5B8 18px, #FDD5B8 19px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: 220 }}>🍱</div>
        </div>

        {/* 우측: 메뉴 텍스트 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 50px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 32,
                color: '#F97316',
                fontWeight: 700,
                marginBottom: 12,
                display: 'flex',
              }}
            >
              🍱 {SCHOOL_NAME}
            </div>
            <div
              style={{
                fontSize: 56,
                color: '#1C1917',
                fontWeight: 800,
                marginBottom: 30,
                display: 'flex',
              }}
            >
              {dateLabel}
            </div>

            {dishes.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {dishes.map((name, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 32,
                      color: '#292524',
                    }}
                  >
                    <span
                      style={{
                        color: '#F97316',
                        marginRight: 14,
                        display: 'flex',
                      }}
                    >
                      ●
                    </span>
                    {name}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  fontSize: 32,
                  color: '#78716C',
                  display: 'flex',
                }}
              >
                급식 정보가 없는 날이에요
              </div>
            )}
          </div>

          {meal?.calories && (
            <div
              style={{
                fontSize: 26,
                color: '#92400E',
                backgroundColor: '#FDE68A',
                padding: '8px 16px',
                borderRadius: 999,
                alignSelf: 'flex-start',
                display: 'flex',
              }}
            >
              {meal.calories}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  // 결과를 새 Response로 감싸 캐시 헤더 부여
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
