-- Stage 12-1 — 익명 피드백 본인 수정/삭제 (edit_token_hash 컬럼)
--
-- 실행: Supabase Dashboard → SQL Editor → 새 쿼리에 전체 붙여넣고 실행.
-- 멱등 안전 (IF NOT EXISTS / IF EXISTS).
--
-- 동작:
--   1. 글 작성 시 서버가 평문 UUID 토큰 생성 → 해시(SHA-256)만 DB 에 저장
--   2. 평문 토큰은 응답으로 클라이언트에 1회 전달 → localStorage 보관
--   3. 수정/삭제 시 클라이언트가 토큰 동봉 → 서버가 해시 비교
--
-- 한계: localStorage 사라지면 (브라우저 변경, 시크릿 모드, 데이터 삭제)
--   본인 글도 못 고침. 의도된 트레이드오프 (익명 본질 + 가벼움).

alter table feedback
  add column if not exists edit_token_hash text;

-- 기존 글들은 토큰 없음 → 수정/삭제 불가. 정상 동작.

-- 본인 수정/삭제도 server route 만 가능 (RLS 그대로 — service role 만 update/delete)
-- 별도 정책 추가 불필요.
