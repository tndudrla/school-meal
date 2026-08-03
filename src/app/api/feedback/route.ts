import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  listFeedback,
  createFeedback,
  isFeedbackEnabled,
} from '@/lib/feedback';

export const runtime = 'nodejs';

const DEFAULT_LIMIT = 50;

/** 인식 불가 값은 400 대신 기본값으로 폴백 — 오염값이 Supabase 까지 닿아 500 나는 경로 차단. */
function parseListParams(searchParams: URLSearchParams): {
  sort: 'top' | 'recent';
  limit: number;
  offset: number;
} {
  const rawSort = searchParams.get('sort');
  const sort = rawSort === 'recent' ? 'recent' : 'top';

  const rawLimit = parseInt(searchParams.get('limit') ?? '', 10);
  const limit =
    Number.isNaN(rawLimit) || rawLimit < 0
      ? DEFAULT_LIMIT
      : Math.min(Math.max(rawLimit, 1), 50);

  const rawOffset = parseInt(searchParams.get('offset') ?? '', 10);
  const offset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  return { sort, limit, offset };
}

// 피드백 기능 비활성 시 200 + 빈 items — 클라이언트가 섹션을 안 그리도록.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { sort, limit, offset } = parseListParams(searchParams);

  if (!isFeedbackEnabled()) {
    return NextResponse.json(
      { items: [], hasMore: false, enabled: false },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { rows, hasMore } = await listFeedback({ sort, limit, offset });
  // 프리뷰 요청(상위 소량 조회)만 CDN 캐시로 흡수 — 그 외 GET 은 기존과 동일하게 no-store.
  const isPreviewRequest = limit <= 2 && offset === 0 && sort === 'top';
  const cacheControl = isPreviewRequest
    ? 's-maxage=60, stale-while-revalidate=300'
    : 'no-store';
  return NextResponse.json(
    { items: rows, hasMore, enabled: true },
    { headers: { 'Cache-Control': cacheControl } }
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
