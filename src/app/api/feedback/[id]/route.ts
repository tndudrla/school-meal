import { NextRequest, NextResponse } from 'next/server';
import {
  updateFeedback,
  deleteFeedback,
  isFeedbackEnabled,
} from '@/lib/feedback';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 본인 글 수정/삭제 (Stage 12-1).
// 토큰 검증은 lib/feedback.ts 내부에서 sha256 해시 비교.
// 토큰은 Authorization: Bearer <token> 헤더로 전달 (URL/로그 노출 회피).

function readToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length).trim() || null;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isFeedbackEnabled()) {
    return NextResponse.json({ error: 'disabled' }, { status: 503 });
  }
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const token = readToken(req);
  if (!token) {
    return NextResponse.json({ error: '토큰이 없어요' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.body !== 'string') {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const result = await updateFeedback({ id, body: body.body, editToken: token });
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isFeedbackEnabled()) {
    return NextResponse.json({ error: 'disabled' }, { status: 503 });
  }
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const token = readToken(req);
  if (!token) {
    return NextResponse.json({ error: '토큰이 없어요' }, { status: 401 });
  }

  const result = await deleteFeedback({ id, editToken: token });
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
