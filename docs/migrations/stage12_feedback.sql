-- Stage 12 — 익명 개발 건의사항 + 추천
--
-- 실행: Supabase Dashboard → SQL Editor → 새 쿼리에 전체 붙여넣고 실행.
-- 한 번만 실행하면 됨. 멱등 안 함 (CREATE TABLE 재실행 시 오류 — 이미
-- 있으면 무시하고 넘어가도 됨).
--
-- 운영 노트:
--   - 욕설 등 사후 숨김: UPDATE feedback SET hidden = true WHERE id = '...';
--   - 의견 통째로 삭제: DELETE FROM feedback WHERE id = '...';
--   - vote_count 직접 보정: 어이없게 높은 추천 수 발견 시 hidden 처리 권장
--     (히스토리 보존)

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) between 5 and 500),
  created_at timestamptz not null default now(),
  vote_count integer not null default 0,
  -- IP + UA 의 sha256 해시. 30초 cooldown 만 위해 보관 (개인 식별 X)
  client_fingerprint text,
  -- 욕설/스팸 사후 숨김. UI 에서 자동 제외
  hidden boolean not null default false
);

-- 정렬용 인덱스 — 추천 많은 순, 동률 시 최근 순
create index if not exists feedback_vote_count_desc
  on feedback (vote_count desc, created_at desc)
  where hidden = false;

-- fingerprint cooldown 조회용 인덱스
create index if not exists feedback_fingerprint_recent
  on feedback (client_fingerprint, created_at desc);

-- vote_count 동시성 안전 증가 RPC.
-- security definer 로 service role 권한 → anon 도 RPC 호출 가능하지만
-- (실제로는 server route handler 만 호출). 클라이언트가 직접 RPC 호출해도
-- vote_count 만 +1 가능 — 임의 값 못 박음.
create or replace function increment_feedback_vote(p_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  update feedback
    set vote_count = vote_count + 1
    where id = p_id and hidden = false
    returning vote_count into new_count;
  return new_count;
end;
$$;

-- RLS 활성화: 클라이언트는 select 만, 쓰기는 service role 만
alter table feedback enable row level security;

-- 공개 read (anon 키로 listFeedback 동작)
drop policy if exists feedback_anon_select on feedback;
create policy feedback_anon_select
  on feedback for select
  to anon, authenticated
  using (hidden = false);

-- insert/update/delete 는 정책 없음 → service role 만 가능
-- (service_role 키는 RLS 우회)
