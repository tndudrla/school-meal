/**
 * service_role 키를 사용하는 Supabase 클라이언트.
 *
 * ⚠️ **서버 전용**. 이 모듈을 클라이언트 컴포넌트에서 import 하면
 *    service_role 키가 번들에 포함되어 모든 사용자에게 노출된다 (보안 사고).
 *    Stage 3 에서 이 클라이언트는 cron 라우트와 OG/photo 라우트의
 *    "쓰기/관리" 경로에서만 사용된다.
 *
 * 피처 플래그: `SUPABASE_SERVICE_ROLE_KEY` 환경변수가 없으면 null 을 반환.
 *    호출자는 null 체크로 미러 단계를 자연스럽게 스킵한다.
 *
 * SSR 쿠키 의존 없음. 매 요청마다 가벼운 새 클라이언트 생성 (세션 영속화 X).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

export function getServiceRoleClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** 읽기 전용 (anon) 클라이언트. 키가 없으면 null. */
let cachedAnon: SupabaseClient | null | undefined;

export function getAnonClient(): SupabaseClient | null {
  if (cachedAnon !== undefined) return cachedAnon;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    cachedAnon = null;
    return null;
  }

  cachedAnon = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAnon;
}
