'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FeedbackItem {
  id: string;
  body: string;
  vote_count: number;
  admin_reply: string | null;
}

/**
 * 메인 하단 읽기 전용 프리뷰 — 추천 상위 2개 + 진입 버튼.
 * 전체 보드/입력 폼은 /feedback 전용 페이지로 이동 (Step 3).
 *
 * enabled 3-state: 초기값 null(미확정) — 미확정/false/fetch 실패 모두
 * 아무것도 렌더하지 않는다. 성공 응답의 enabled:true 에서만 카드 표시.
 * 플래그 꺼진 배포에서 깜빡임(레이아웃 시프트) 방지.
 */
export default function FeedbackPreview() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/feedback?sort=top&limit=2')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setItems(data.items ?? []);
        setEnabled(data.enabled === true);
      })
      .catch(() => {
        if (cancelled) return;
        setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled !== true) return null;

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

      {items.length === 0 ? (
        <p className="text-xs text-stone-500 text-center py-2">
          첫 의견을 남겨주세요!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-amber-100"
            >
              <span className="shrink-0 flex flex-col items-center justify-center w-10 py-1 rounded-lg bg-amber-50 text-stone-600">
                <span className="text-sm leading-none">⬆</span>
                <span className="text-xs font-bold leading-tight mt-0.5">
                  {it.vote_count}
                </span>
              </span>
              <p className="flex-1 text-sm text-stone-700 truncate">
                {it.body}
              </p>
              {it.admin_reply && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">
                  답변완료
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/feedback"
        className="block mt-3 text-xs text-center text-orange-500 font-bold hover:text-orange-600 transition-colors"
      >
        의견 보러가기 · 남기기 →
      </Link>
    </section>
  );
}
