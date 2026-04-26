import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  listFeedback,
  createFeedback,
  isFeedbackEnabled,
} from '@/lib/feedback';

export const runtime = 'nodejs';

// 피드백 기능 비활성 시 200 + 빈 items — 클라이언트가 섹션을 안 그리도록.
export async function GET() {
  if (!isFeedbackEnabled()) {
    return NextResponse.json(
      { items: [], enabled: false },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const items = await listFeedback();
  return NextResponse.json(
    { items, enabled: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  if (!isFeedbackEnabled()) {
    return NextResponse.json(
      { error: '피드백 기능이 비활성 상태입니다' },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.body !== 'string') {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  // IP + UA 해시로 30초 cooldown. 개인 식별 X — 짧은 시간 내 같은 단말 차단 용도.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}|${ua}`)
    .digest('hex');

  const result = await createFeedback({ body: body.body, fingerprint });
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  // editToken 은 한 번만 응답에 포함 — 클라이언트가 localStorage 보관 후
  // 수정/삭제 시 동봉. 서버 측 DB 엔 sha256 해시만 저장.
  return NextResponse.json({
    ok: true,
    id: result.id,
    editToken: result.editToken,
  });
}
