/**
 * 익명 개발 건의사항 + 추천 (Stage 12).
 *
 * - 데이터: Supabase `feedback` 테이블 (마이그레이션: docs/migrations/stage12_feedback.sql)
 * - 클라이언트는 `/api/feedback` 라우트를 통해서만 접근. 직접 Supabase 호출 X
 * - 피처 플래그: SUPABASE_SERVICE_ROLE_KEY 없으면 비활성 (UI 도 안 보임)
 *
 * Stage 7~9 의 익명 흐름과 같은 톤 — 가벼운 의견 보드, 댓글·식별 없음.
 */

import { getServiceRoleClient, getAnonClient } from '@/lib/supabase/admin';

export interface FeedbackRow {
  id: string;
  body: string;
  created_at: string;
  vote_count: number;
}

/** SUPABASE_SERVICE_ROLE_KEY 가 있어야 피드백 기능이 켜짐. */
export function isFeedbackEnabled(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** 공개 리스트 — 추천 많은 순, 동률 시 최근 순. */
export async function listFeedback(limit = 50): Promise<FeedbackRow[]> {
  const sb = getAnonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('feedback')
    .select('id, body, created_at, vote_count')
    .eq('hidden', false)
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('listFeedback failed', error);
    return [];
  }
  return (data ?? []) as FeedbackRow[];
}

interface CreateInput {
  body: string;
  fingerprint: string;
}

type CreateResult = { id: string } | { error: string };

/**
 * 새 의견 등록. 글자 수·욕설·cooldown 검증 포함.
 *
 * 30초 cooldown: 같은 fingerprint(IP+UA 해시)가 30초 내 제출 있으면 거절.
 * 의도적으로 짧음 — 같은 사람의 연속 제출만 막고 다른 사용자 차단은 안 함.
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

  const { data, error } = await sb
    .from('feedback')
    .insert({ body: trimmed, client_fingerprint: input.fingerprint })
    .select('id')
    .single();
  if (error || !data) {
    console.error('createFeedback insert failed', error);
    return { error: '저장에 실패했어요. 잠시 후 다시 시도해주세요' };
  }
  return { id: data.id as string };
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
