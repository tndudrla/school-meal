import { NextRequest, NextResponse } from 'next/server';
import { CHONGGYE_TARGET, fetchPhotoForDate } from '@/lib/schoolScraper';

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
    return NextResponse.json({ photoUrl: null });
  }

  try {
    const photoUrl = await fetchPhotoForDate(CHONGGYE_TARGET, ymd);
    return NextResponse.json({ photoUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // 사진 로드 실패는 치명적이지 않음 — 200 + null 로 응답하면 UI가 깨지지 않음
    return NextResponse.json({ photoUrl: null, warning: message });
  }
}
