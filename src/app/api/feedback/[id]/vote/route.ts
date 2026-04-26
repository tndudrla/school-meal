import { NextRequest, NextResponse } from 'next/server';
import { voteFeedback, isFeedbackEnabled } from '@/lib/feedback';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isFeedbackEnabled()) {
    return NextResponse.json({ error: 'disabled' }, { status: 503 });
  }
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  const newCount = await voteFeedback(id);
  if (newCount === null) {
    return NextResponse.json({ error: '추천 처리 실패' }, { status: 500 });
  }
  return NextResponse.json({ vote_count: newCount });
}
