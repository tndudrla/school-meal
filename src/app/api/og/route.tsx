import { ImageResponse } from 'next/og';
import { fetchMealFromNeis } from '@/lib/neis';
import { getSchool } from '@/lib/schools';
import { getMirroredPhotoUrl } from '@/lib/photoMirror';
import { parseYmd, formatDate, DOW } from '@/lib/utils';

export const runtime = 'nodejs';

// SNS 미리보기는 자주 바뀔 필요 없음 — CDN 1시간 캐시로 NEIS 호출 최소화.
//
// Stage 1: 학교 사진 임베드 제거 (학교 서버 27초 타임아웃 → 카톡 OG 깨짐 사고).
// Stage 3: Supabase Storage 미러에서만 사진 임베드.
// Stage 3-3: next/og <img src=external> 가 운영에서 500 으로 떨어지는 케이스 발견
//   → 사진 있는 날은 ImageResponse 를 만들지 않고 미러 URL 로 307 redirect.
//   카톡/SNS OG 봇이 Supabase CDN 이미지를 직접 카드로 표시 → 사진만 풀카드.
//   사진 없는 날만 메뉴 텍스트 카드(ImageResponse) 폴백.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawYmd = searchParams.get('ymd');
  const ymd = rawYmd && /^\d{8}$/.test(rawYmd) ? rawYmd : formatDate(new Date());
  const school = getSchool(searchParams.get('schoolId'));

  // 사진 우선 — 있으면 즉시 미러 URL 로 redirect. NEIS 도 안 쳐도 됨.
  const mirroredPhotoUrl = await getMirroredPhotoUrl(school.id, ymd).catch(
    () => null
  );
  if (mirroredPhotoUrl) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: mirroredPhotoUrl,
        // Vercel CDN 1시간 캐시. 미러 사진은 cron 마다 갱신되므로 1h 면 충분.
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  // 사진 없는 날 — 기존 메뉴 텍스트 카드 폴백
  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;

  const meal = await fetchMealFromNeis({
    atptCode: school.neis.atptCode,
    schoolCode: school.neis.schoolCode,
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
        {/* 좌측: 패턴 배경 + 도시락 이모지 (사진 없는 날의 폴백 카드) */}
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
              🍱 {school.name}
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
