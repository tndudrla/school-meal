import { ImageResponse } from 'next/og';
import { fetchMealFromNeis } from '@/lib/neis';
import { getSchool } from '@/lib/schools';
import { getMirroredPhotoUrl } from '@/lib/photoMirror';
import { parseYmd, formatDate, DOW } from '@/lib/utils';

export const runtime = 'nodejs';

// SNS 미리보기는 자주 바뀔 필요 없음 — CDN 1시간 캐시로 NEIS 호출 최소화.
//
// Stage 1: 학교 사진 임베드 제거 (학교 서버 27초 타임아웃 → 카톡 OG 깨짐 사고).
// Stage 3: Supabase Storage 미러에서만 사진 임베드. 미러 미설정/미스 시 자동 폴백
//   (이모지 카드). 미러 URL 은 Supabase CDN 이라 응답이 일관되게 빠름.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawYmd = searchParams.get('ymd');
  const ymd = rawYmd && /^\d{8}$/.test(rawYmd) ? rawYmd : formatDate(new Date());
  const school = getSchool(searchParams.get('schoolId'));

  const date = parseYmd(ymd);
  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;

  // 메뉴 + 미러된 사진 URL 병렬 조회. 둘 다 실패해도 OG 는 생성됨.
  const [meal, mirroredPhotoUrl] = await Promise.all([
    fetchMealFromNeis({
      atptCode: school.neis.atptCode,
      schoolCode: school.neis.schoolCode,
      ymd,
      apiKey: process.env.NEIS_API_KEY,
    }).catch(() => null),
    getMirroredPhotoUrl(school.id, ymd).catch(() => null),
  ]);

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
        {/* 좌측: Supabase 미러된 사진(있으면) 또는 패턴 배경 + 도시락 이모지(폴백) */}
        <div
          style={{
            width: 540,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FDD5B8',
            backgroundImage: mirroredPhotoUrl
              ? undefined
              : 'repeating-linear-gradient(45deg, #FFEFD0 0, #FFEFD0 18px, #FDD5B8 18px, #FDD5B8 19px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {mirroredPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mirroredPhotoUrl}
              alt=""
              width={540}
              height={630}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: 220 }}>🍱</div>
          )}
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
