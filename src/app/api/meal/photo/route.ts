import { NextRequest, NextResponse } from 'next/server';
import { CHONGGYE_TARGET, fetchPhotoForDate } from '@/lib/schoolScraper';

// 사진 정보는 학교 홈페이지 갱신 주기를 고려해 1시간 CDN 캐시.
// stale-while-revalidate 로 학교 서버 일시 장애에도 24시간 마지막 응답 활용.
const CACHE_OK = 'public, s-maxage=3600, stale-while-revalidate=86400';
// 에러/지원외 응답은 짧게만 캐시해 학교 회복 즉시 반영.
const CACHE_SHORT = 'public, s-maxage=60';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ymd = searchParams.get('ymd');
  const sysId = searchParams.get('sysId');

  if (!ymd || !/^\d{8}$/.test(ymd)) {
    return NextResponse.json(
      { error: 'ymd parameter (YYYYMMDD) is required' },
      { status: 400 }
    );
  }

  // 현재는 청계초만 지원. Phase 3에서 sysId 로 분기 확장 예정.
  if (sysId && sysId !== CHONGGYE_TARGET.sysId) {
    return NextResponse.json(
      { photoUrl: null },
      { headers: { 'Cache-Control': CACHE_SHORT } }
    );
  }

  try {
    const photoUrl = await fetchPhotoForDate(CHONGGYE_TARGET, ymd);
    return NextResponse.json(
      { photoUrl },
      { headers: { 'Cache-Control': CACHE_OK } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // 사진 로드 실패는 치명적이지 않음 — 200 + null 로 응답하면 UI가 깨지지 않음
    return NextResponse.json(
      { photoUrl: null, warning: message },
      { headers: { 'Cache-Control': CACHE_SHORT } }
    );
  }
}
