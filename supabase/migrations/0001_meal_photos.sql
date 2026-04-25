-- 0001_meal_photos.sql
-- 학교 급식 사진 미러 테이블.
-- 슬라이딩 윈도우(오늘 + 과거 7일치)로 운영 — 그 이전은 cron 이 자동 삭제.
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → New query → 이 파일 내용 전체 붙여넣고 Run.
--
-- 권한 모델:
--   - 읽기: anon 공개 (OG 라우트 등에서 storage_path 조회)
--   - 쓰기: service_role 만 (RLS 우회. INSERT/UPDATE/DELETE 정책은 의도적으로 만들지 않음)

create table if not exists public.meal_photos (
  school_id    text not null,                  -- SCHOOLS 레지스트리 키 (예: 'chonggye')
  ymd          text not null,                  -- 'YYYYMMDD'
  storage_path text not null,                  -- 'chonggye/20260425.jpg' (bucket 내부 경로)
  source_url   text not null,                  -- 학교 원본 URL (변경 감지용)
  content_hash text,                           -- sha256 hex (32바이트)
  bytes        integer,                        -- 파일 크기 (모니터링용)
  uploaded_at  timestamptz not null default now(),
  primary key (school_id, ymd)
);

-- 슬라이딩 윈도우 cleanup 쿼리(`ymd < cutoff`) 가속용
create index if not exists meal_photos_ymd_idx on public.meal_photos (ymd);

-- RLS: 읽기는 anon 공개, 쓰기는 service_role 만
alter table public.meal_photos enable row level security;

drop policy if exists "meal_photos read" on public.meal_photos;
create policy "meal_photos read" on public.meal_photos
  for select using (true);

-- service_role 은 RLS 자동 우회. 따라서 INSERT/UPDATE/DELETE 정책은 만들지 않음.
-- 이는 의도된 설계: 클라이언트(anon)에서 메타 변조 불가, cron(service_role)만 변경 가능.

-- ---------------------------------------------------------------------------
-- Storage 버킷 정책 (대시보드 Storage > Policies 에서 별도 설정 필요)
-- 버킷 'meal-photos' 를 Public 으로 생성한 뒤 아래 select 정책만 추가:
--
--   create policy "meal-photos public read"
--     on storage.objects for select
--     using ( bucket_id = 'meal-photos' );
--
-- service_role 은 우회되므로 write 정책 불필요.
-- ---------------------------------------------------------------------------
