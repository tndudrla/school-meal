/**
 * 익명 개발 건의사항 + 추천 (Stage 12).
 *
 * - 데이터: Supabase `feedback` 테이블 (마이그레이션: docs/migrations/stage12_feedback.sql)
 * - 클라이언트는 `/api/feedback` 라우트를 통해서만 접근. 직접 Supabase 호출 X
 * - 피처 플래그: SUPABASE_SERVICE_ROLE_KEY 없으면 비활성 (UI 도 안 보임)
 *
 * Stage 7~9 의 익명 흐름과 같은 톤 — 가벼운 의견 보드, 댓글·식별 없음.
 *
 * Stage 12-1 — 본인 수정/삭제 (마이그레이션: stage12_1_feedback_edit_token.sql)
 *   - 작성 시 평문 UUID 토큰 발급 → DB 엔 sha256 해시만 저장
 *   - 평문은 1회 응답으로 전달 → 클라이언트가 localStorage 보관
 *   - 수정/삭제 시 토큰 동봉 → 서버가 해시 비교
 */

import crypto from 'node:crypto';
import { getServiceRoleClient, getAnonClient } from '@/lib/supabase/admin';

export interface FeedbackRow {
  id: string;
  body: string;
  created_at: string;
  vote_count: number;
  /** 관리자 답변 (Stage 12-2). 없으면 null. */
  admin_reply: string | null;
  /** 관리자 답변 작성 시각. admin_reply 와 함께 박힘. */
  admin_replied_at: string | null;
}

/** SUPABASE_SERVICE_ROLE_KEY 가 있어야 피드백 기능이 켜짐. */
export function isFeedbackEnabled(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

interface ListFeedbackOptions {
  /** 'top' = 추천 많은 순(동률 시 최근 순), 'recent' = 최신 순. 기본 'top'. */
  sort?: 'top' | 'recent';
  limit?: number;
  offset?: number;
}

/** 공개 리스트. sort='top' 은 추천 많은 순(동률 시 최근 순), 'recent' 는 최신 순. */
export async function listFeedback(
  opts: ListFeedbackOptions = {}
): Promise<{ rows: FeedbackRow[]; hasMore: boolean }> {
  const { sort = 'top', limit = 50, offset = 0 } = opts;
  const sb = getAnonClient();
  if (!sb) return { rows: [], hasMore: false };

  let query = sb
    .from('feedback')
    .select('id, body, created_at, vote_count, admin_reply, admin_replied_at')
    .eq('hidden', false);
  if (sort === 'recent') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false });
  }
  // limit+1 로 조회해 다음 페이지 존재 여부(hasMore) 를 판정 — 여분 1건은 rows 에서 잘라냄.
  const { data, error } = await query.range(offset, offset + limit);
  if (error) {
    console.error('listFeedback failed', error);
    return { rows: [], hasMore: false };
  }
  const all = (data ?? []) as FeedbackRow[];
  const hasMore = all.length > limit;
  return { rows: all.slice(0, limit), hasMore };
}

interface CreateInput {
  body: string;
  fingerprint: string;
}

type CreateResult = { id: string; editToken: string } | { error: string };

/** sha256 hex. 토큰 비교용. */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * 새 의견 등록. 글자 수·욕설·cooldown 검증 포함.
 *
 * 30초 cooldown: 같은 fingerprint(IP+UA 해시)가 30초 내 제출 있으면 거절.
 * 의도적으로 짧음 — 같은 사람의 연속 제출만 막고 다른 사용자 차단은 안 함.
 *
 * 응답에 평문 editToken 1회 전달 — 클라이언트가 localStorage 보관 후
 * 수정/삭제 시 동봉. DB 엔 sha256 해시만 저장.
 */
export async function createFeedback(input: CreateInput): Promise<CreateResult> {
  const trimmed = input.body.trim();
  if (trimmed.length < 5 || trimmed.length > 500) {
    return { error: '5자 이상 500자 이하로 입력해주세요' };
  }
  if (containsBadWords(trimmed)) {
    return { error: '표현을 조금 다듬어주세요' };
  }

  const sb = getServiceRoleClient();
  if (!sb) return { error: '피드백 기능이 비활성 상태입니다' };

  // 같은 fingerprint 가 30초 내 제출했으면 거절
  const since = new Date(Date.now() - 30_000).toISOString();
  const { data: recent } = await sb
    .from('feedback')
    .select('id')
    .eq('client_fingerprint', input.fingerprint)
    .gt('created_at', since)
    .limit(1);
  if (recent && recent.length > 0) {
    return { error: '잠시 후 다시 시도해주세요 (30초 간격)' };
  }

  const editToken = crypto.randomUUID();
  const editTokenHash = hashToken(editToken);

  const { data, error } = await sb
    .from('feedback')
    .insert({
      body: trimmed,
      client_fingerprint: input.fingerprint,
      edit_token_hash: editTokenHash,
    })
    .select('id')
    .single();
  if (error || !data) {
    console.error('createFeedback insert failed', error);
    return { error: '저장에 실패했어요. 잠시 후 다시 시도해주세요' };
  }
  return { id: data.id as string, editToken };
}

interface UpdateInput {
  id: string;
  body: string;
  editToken: string;
}

type MutateResult = { ok: true } | { error: string; status?: number };

/** 본인 글 수정. 토큰 일치 시에만. */
export async function updateFeedback(input: UpdateInput): Promise<MutateResult> {
  const trimmed = input.body.trim();
  if (trimmed.length < 5 || trimmed.length > 500) {
    return { error: '5자 이상 500자 이하로 입력해주세요', status: 400 };
  }
  if (containsBadWords(trimmed)) {
    return { error: '표현을 조금 다듬어주세요', status: 400 };
  }

  const sb = getServiceRoleClient();
  if (!sb) return { error: '피드백 기능이 비활성 상태입니다', status: 503 };

  // 1. 글 가져와서 토큰 해시 비교
  const { data: row, error: selErr } = await sb
    .from('feedback')
    .select('edit_token_hash, hidden')
    .eq('id', input.id)
    .maybeSingle<{ edit_token_hash: string | null; hidden: boolean }>();
  if (selErr || !row) {
    return { error: '글을 찾을 수 없어요', status: 404 };
  }
  if (row.hidden) {
    return { error: '숨김 처리된 글은 수정할 수 없어요', status: 403 };
  }
  if (!row.edit_token_hash || row.edit_token_hash !== hashToken(input.editToken)) {
    return { error: '본인 글이 아니에요', status: 403 };
  }

  // 2. body 업데이트
  const { error: updErr } = await sb
    .from('feedback')
    .update({ body: trimmed })
    .eq('id', input.id);
  if (updErr) {
    console.error('updateFeedback failed', updErr);
    return { error: '수정에 실패했어요', status: 500 };
  }
  return { ok: true };
}

interface DeleteInput {
  id: string;
  editToken: string;
}

/** 본인 글 삭제. 토큰 일치 시에만. */
export async function deleteFeedback(input: DeleteInput): Promise<MutateResult> {
  const sb = getServiceRoleClient();
  if (!sb) return { error: '피드백 기능이 비활성 상태입니다', status: 503 };

  const { data: row, error: selErr } = await sb
    .from('feedback')
    .select('edit_token_hash')
    .eq('id', input.id)
    .maybeSingle<{ edit_token_hash: string | null }>();
  if (selErr || !row) {
    return { error: '글을 찾을 수 없어요', status: 404 };
  }
  if (!row.edit_token_hash || row.edit_token_hash !== hashToken(input.editToken)) {
    return { error: '본인 글이 아니에요', status: 403 };
  }

  const { error: delErr } = await sb
    .from('feedback')
    .delete()
    .eq('id', input.id);
  if (delErr) {
    console.error('deleteFeedback failed', delErr);
    return { error: '삭제에 실패했어요', status: 500 };
  }
  return { ok: true };
}

/** 추천 +1. 동시성 안전을 위해 SQL 함수 호출. 새 vote_count 반환. */
export async function voteFeedback(id: string): Promise<number | null> {
  const sb = getServiceRoleClient();
  if (!sb) return null;
  const { data, error } = await sb.rpc('increment_feedback_vote', { p_id: id });
  if (error) {
    console.error('voteFeedback rpc failed', error);
    return null;
  }
  return typeof data === 'number' ? data : null;
}

// 운영하면서 발견되는 표현 추가. 정확도 추구 X — 사후 hidden 으로 보완.
const BAD_WORDS = ['시발', '씨발', 'ㅅㅂ', '병신', 'ㅄ', '개새끼', '지랄'];

function containsBadWords(s: string): boolean {
  const lower = s.toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w.toLowerCase()));
}
