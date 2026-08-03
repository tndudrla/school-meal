'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface FeedbackItem {
  id: string;
  body: string;
  created_at: string;
  vote_count: number;
  /** 관리자 답변 (Stage 12-2). 없으면 null. */
  admin_reply: string | null;
  /** 관리자 답변 작성 시각. */
  admin_replied_at: string | null;
}

/** ISO 시각 → "M월 D일" 또는 "YYYY-MM-DD" (1년 이상 차이). 사용자 노출용 짧은 표기. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  if (sameYear) {
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const VOTED_KEY = 'votedFeedbackIds';
const COOLDOWN_KEY = 'lastFeedbackPostAt';
const TOKENS_KEY = 'feedbackEditTokens'; // { [id]: token } 객체
const COOLDOWN_MS = 30_000;

const MIN_LEN = 5;
const MAX_LEN = 500;
const PAGE_LIMIT = 20;
const TABS_MIN_ITEMS = 10;

type SortMode = 'top' | 'recent';

function readVotedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(VOTED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeVotedSet(set: Set<string>) {
  try {
    window.localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage 실패 무시 — UX 저하만, 동작 막지는 않음
  }
}

// 본인 글 토큰 보관 (Stage 12-1). 객체 형태 { [feedbackId]: editToken }.
// 다른 기기/브라우저 가면 사라짐 — 의도된 트레이드오프 (익명 본질).
function readTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function writeTokens(map: Record<string, string>) {
  try {
    window.localStorage.setItem(TOKENS_KEY, JSON.stringify(map));
  } catch {
    // 무시
  }
}

/**
 * 익명 개발 건의사항 보드 (Stage 12, 12-1 본인 수정/삭제).
 * - 풋터 아래 위치
 * - 추천 많은 순 정렬
 * - 추천 중복은 localStorage 로 관리
 * - 본인 글(localStorage 토큰 보유) 만 수정/삭제 버튼 노출
 */
export default function FeedbackBoard() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [sort, setSort] = useState<SortMode>('top');
  const [showTabs, setShowTabs] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // mount: 목록 + localStorage 초기 로드
  useEffect(() => {
    setVoted(readVotedSet());
    setTokens(readTokens());
    refresh('top');
    // 진행 중인 cooldown 복원
    const last = parseInt(
      window.localStorage.getItem(COOLDOWN_KEY) ?? '0',
      10
    );
    const remain = last + COOLDOWN_MS - Date.now();
    if (remain > 0) setCooldownLeft(Math.ceil(remain / 1000));
  }, []);

  // cooldown 카운트다운
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setTimeout(() => setCooldownLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownLeft]);

  const refresh = useCallback(async (sortMode: SortMode) => {
    try {
      const res = await fetch(
        `/api/feedback?sort=${sortMode}&limit=${PAGE_LIMIT}&offset=0`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      const nextItems: FeedbackItem[] = data.items ?? [];
      setItems(nextItems);
      setEnabled(data.enabled !== false);
      setHasMore(!!data.hasMore);
      setShowTabs(nextItems.length >= TABS_MIN_ITEMS);
    } catch {
      setItems([]);
      setHasMore(false);
    }
  }, []);

  const changeSort = useCallback(
    (nextSort: SortMode) => {
      if (nextSort === sort) return;
      setSort(nextSort);
      setItems(null);
      refresh(nextSort);
    },
    [sort, refresh]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !items) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/feedback?sort=${sort}&limit=${PAGE_LIMIT}&offset=${items.length}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      const more: FeedbackItem[] = data.items ?? [];
      setItems((prev) => {
        const base = prev ?? [];
        const existingIds = new Set(base.map((it) => it.id));
        return [...base, ...more.filter((it) => !existingIds.has(it.id))];
      });
      setHasMore(!!data.hasMore);
    } catch {
      // 실패 시 조용히 무시 — 더보기 버튼은 그대로 남아 재시도 가능
    } finally {
      setLoadingMore(false);
    }
  }, [sort, items, loadingMore]);

  const trimmed = body.trim();
  const tooShort = trimmed.length < MIN_LEN;
  const tooLong = trimmed.length > MAX_LEN;
  const canSubmit = !posting && !tooShort && !tooLong && cooldownLeft <= 0;

  async function submit() {
    if (!canSubmit) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '저장에 실패했어요');
        return;
      }
      // 성공 — 토큰 저장, 폼 비우기, cooldown 시작, 목록 새로고침
      if (data.id && data.editToken) {
        const next = { ...tokens, [data.id]: data.editToken };
        setTokens(next);
        writeTokens(next);
      }
      setBody('');
      const now = Date.now();
      window.localStorage.setItem(COOLDOWN_KEY, String(now));
      setCooldownLeft(Math.ceil(COOLDOWN_MS / 1000));
      await refresh(sort);
    } catch {
      setError('저장에 실패했어요. 잠시 후 다시 시도해주세요');
    } finally {
      setPosting(false);
    }
  }

  async function vote(id: string) {
    if (voted.has(id)) return;
    // 낙관적 업데이트
    const next = new Set(voted);
    next.add(id);
    setVoted(next);
    writeVotedSet(next);
    setItems((prev) =>
      prev
        ? prev.map((it) =>
            it.id === id ? { ...it, vote_count: it.vote_count + 1 } : it
          )
        : prev
    );
    try {
      const res = await fetch(`/api/feedback/${id}/vote`, { method: 'POST' });
      if (!res.ok) throw new Error('vote failed');
      const data = await res.json();
      // 서버가 알려준 정확한 수로 보정
      setItems((prev) =>
        prev
          ? prev.map((it) =>
              it.id === id ? { ...it, vote_count: data.vote_count } : it
            )
          : prev
      );
    } catch {
      // 롤백
      const rollback = new Set(next);
      rollback.delete(id);
      setVoted(rollback);
      writeVotedSet(rollback);
      setItems((prev) =>
        prev
          ? prev.map((it) =>
              it.id === id ? { ...it, vote_count: Math.max(0, it.vote_count - 1) } : it
            )
          : prev
      );
    }
  }

  function startEdit(it: FeedbackItem) {
    setEditingId(it.id);
    setEditBody(it.body);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody('');
    setEditError(null);
  }

  async function saveEdit(id: string) {
    const token = tokens[id];
    if (!token) return;
    const trimmedEdit = editBody.trim();
    if (trimmedEdit.length < MIN_LEN || trimmedEdit.length > MAX_LEN) {
      setEditError(`${MIN_LEN}자 이상 ${MAX_LEN}자 이하로 입력해주세요`);
      return;
    }
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: trimmedEdit }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error ?? '수정에 실패했어요');
        return;
      }
      setItems((prev) =>
        prev
          ? prev.map((it) => (it.id === id ? { ...it, body: trimmedEdit } : it))
          : prev
      );
      cancelEdit();
    } catch {
      setEditError('수정에 실패했어요');
    }
  }

  async function remove(id: string) {
    const token = tokens[id];
    if (!token) return;
    if (!window.confirm('이 글을 정말 삭제할까요?')) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? '삭제에 실패했어요');
        return;
      }
      // 토큰 제거 + 목록에서 제거
      const nextTokens = { ...tokens };
      delete nextTokens[id];
      setTokens(nextTokens);
      writeTokens(nextTokens);
      setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));
    } catch {
      window.alert('삭제에 실패했어요');
    }
  }

  const counter = useMemo(() => {
    const len = trimmed.length;
    return `${len} / ${MAX_LEN}`;
  }, [trimmed]);

  // 피처 비활성: 섹션 자체 안 그림
  if (items !== null && !enabled) return null;

  return (
    <section className="mx-5 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
      <div className="mb-2">
        <strong className="text-orange-500 font-['Gaegu'] text-base">
          💬 개발 건의
        </strong>
        <p className="text-xs text-stone-500 mt-0.5">
          베타 단계라 의견 주시면 큰 도움이 돼요. 익명이에요.
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="mb-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MAX_LEN + 50 /* 약간 여유 — 서버에서도 검증 */}
          placeholder="이런 기능이 있으면 좋겠어요…"
          rows={3}
          className="w-full p-2.5 text-sm bg-white border border-amber-200 rounded-xl resize-y focus:outline-none focus:border-orange-400 placeholder:text-stone-400"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span
            className={`text-xs ${
              tooLong ? 'text-red-500' : 'text-stone-400'
            }`}
          >
            {counter}
          </span>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="text-xs px-3 py-1.5 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {posting
              ? '보내는 중...'
              : cooldownLeft > 0
              ? `${cooldownLeft}초 후 가능`
              : '의견 보내기'}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1.5">{error}</p>
        )}
      </div>

      {/* 정렬 탭 — 첫 로드 결과 10개 이상일 때만 노출 */}
      {showTabs && (
        <div className="flex items-center gap-1.5 mb-3">
          <button
            onClick={() => changeSort('top')}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${
              sort === 'top'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-stone-500 border border-amber-200'
            }`}
          >
            추천순
          </button>
          <button
            onClick={() => changeSort('recent')}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${
              sort === 'recent'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-stone-500 border border-amber-200'
            }`}
          >
            최신순
          </button>
        </div>
      )}

      {/* 목록 */}
      {items === null ? (
        <div className="flex flex-col gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-12 bg-amber-100/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-6 text-center">
          <span className="text-2xl">💬</span>
          <p className="text-xs text-stone-500">
            아직 의견이 없어요. 첫 의견을 남겨주세요!
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((it) => {
            const hasVoted = voted.has(it.id);
            const isMine = !!tokens[it.id];
            const isEditing = editingId === it.id;
            return (
              <li
                key={it.id}
                className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-amber-100"
              >
                <button
                  onClick={() => vote(it.id)}
                  disabled={hasVoted}
                  aria-label="추천"
                  className={`shrink-0 flex flex-col items-center justify-center w-10 py-1 rounded-lg transition-colors ${
                    hasVoted
                      ? 'bg-orange-100 text-orange-500 cursor-default'
                      : 'bg-amber-50 hover:bg-amber-100 text-stone-600'
                  }`}
                >
                  <span className="text-sm leading-none">⬆</span>
                  <span className="text-xs font-bold leading-tight mt-0.5">
                    {it.vote_count}
                  </span>
                </button>

                {isEditing ? (
                  <div className="flex-1">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      maxLength={MAX_LEN + 50}
                      rows={3}
                      className="w-full p-2 text-sm bg-amber-50 border border-amber-200 rounded-lg resize-y focus:outline-none focus:border-orange-400"
                    />
                    {editError && (
                      <p className="text-xs text-red-500 mt-1">{editError}</p>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-1.5">
                      <button
                        onClick={cancelEdit}
                        className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => saveEdit(it.id)}
                        className="text-xs px-2.5 py-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-words">
                      {it.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-400">
                        {formatDate(it.created_at)}
                      </span>
                      {isMine && (
                        <>
                          <span className="text-[10px] text-orange-500/80 font-bold">
                            내 글
                          </span>
                          <button
                            onClick={() => startEdit(it)}
                            className="text-[11px] text-stone-500 hover:text-orange-500"
                            aria-label="수정"
                          >
                            ✏️ 수정
                          </button>
                          <button
                            onClick={() => remove(it.id)}
                            className="text-[11px] text-stone-500 hover:text-red-500"
                            aria-label="삭제"
                          >
                            🗑️ 삭제
                          </button>
                        </>
                      )}
                    </div>
                    {it.admin_reply && (
                      <div className="mt-2.5 p-2.5 bg-orange-50 border-l-4 border-orange-300 rounded-r-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-orange-600">
                            🍱 운영자 답변
                          </span>
                          {it.admin_replied_at && (
                            <span className="text-[10px] text-stone-400">
                              {formatDate(it.admin_replied_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-words">
                          {it.admin_reply}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* 더보기 — hasMore 일 때만 */}
      {items !== null && items.length > 0 && hasMore && (
        <div className="flex justify-center mt-3">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-xs px-4 py-1.5 rounded-full bg-white border border-amber-200 text-stone-600 font-bold hover:bg-amber-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loadingMore ? '불러오는 중...' : '더보기'}
          </button>
        </div>
      )}

      {/* 안내 — 한 줄. localStorage 한계 */}
      <p className="text-[10px] text-stone-400 mt-3 text-center">
        본인 글은 작성한 기기에서만 수정·삭제할 수 있어요
      </p>
    </section>
  );
}
