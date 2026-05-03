-- Stage 12-2 — 개발 건의에 관리자 답변
--
-- 실행: Supabase Dashboard → SQL Editor → 새 쿼리에 전체 붙여넣고 실행.
-- 한 번만 실행하면 됨 (멱등 처리 — 이미 있으면 skip).
--
-- 운영 노트:
--   답변 작성 (관리자가 Supabase Dashboard SQL Editor 에서 직접):
--     update feedback
--     set admin_reply = '여기에 답변 내용',
--         admin_replied_at = now()
--     where id = '<피드백 id>';
--
--   답변 수정: 같은 update 다시 실행 — admin_replied_at 도 새로 박힘.
--
--   답변 삭제 (UI 에서 답변 박스 안 보이게):
--     update feedback
--     set admin_reply = null, admin_replied_at = null
--     where id = '<피드백 id>';
--
--   답변 달린 글들 한 번에 보기:
--     select id, body, admin_reply, admin_replied_at
--     from feedback
--     where admin_reply is not null
--     order by admin_replied_at desc;

alter table feedback
  add column if not exists admin_reply text,
  add column if not exists admin_replied_at timestamptz;

-- 답변 달린 글만 조회용 인덱스 (관리자 운영 편의 — 답변 누락된 글 추적 등)
create index if not exists feedback_admin_reply_recent
  on feedback (admin_replied_at desc)
  where admin_reply is not null;
