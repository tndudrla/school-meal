/**
 * 학교 급식 사진을 Supabase Storage 에 미러링하는 모듈 (Stage 3).
 *
 * 북극성: 전국 1만 학교 확장 시에도 OG/앱이 학교 서버 응답 속도에 의존하지 않게 한다.
 *
 * 슬라이딩 윈도우: 오늘 + 과거 7일치만 보존. 그 이전은 매 cron 실행마다 자동 삭제.
 *   이유: 1만 학교 × 365일 = 사실상 무한 누적. 7일치면 학교당 ~700KB, 1000교에서도
 *   Free tier(1GB) 안에서 운영 가능.
 *
 * 피처 플래그: SUPABASE_SERVICE_ROLE_KEY 가 없으면 모든 함수가 no-op.
 *   → 환경변수 미설정 상태에서도 라이브 사이트는 Stage 1+2 동작 그대로 유지.
 */

import sharp from 'sharp';
import { fetchWeekPhotos, toAbsolutePhotoUrl } from '@/lib/schoolScraper';
import { getServiceRoleClient, getAnonClient } from '@/lib/supabase/admin';
import type { SchoolConfig } from '@/lib/schools';

const BUCKET = 'meal-photos';
const SLIDING_WINDOW_DAYS = 7; // 오늘 + 과거 7일

// 리사이즈 정책: OG 이미지가 540px 폭이라 1280px 면 충분히 선명.
// JPEG q=80 + progressive 면 5MB 원본이 ~150KB 로 압축됨 (97% 절감).
// 이는 1만 학교 확장 시 Storage(1GB free → Pro 250GB 안에서 운영) 의 핵심 결정.
const RESIZE_MAX = 1280;
const JPEG_QUALITY = 80;

interface MirrorResult {
  schoolId: string;
  enabled: boolean;
  uploaded: number;
  skipped: number;
  failed: number;
  missing: number;
  error?: string;
  /** 디버그용: 개별 ymd 실패 사유 (성공이 누적되면 제거 가능) */
  failures?: Array<{ ymd: string; stage: string; message: string }>;
}

interface PruneResult {
  enabled: boolean;
  pruned: number;
  cutoff?: string;
  error?: string;
}

interface PhotoRow {
  source_url: string;
  content_hash: string | null;
  storage_path: string;
}

/** YYYYMMDD 에서 N일 뺀 YYYYMMDD. UTC 자정 기준 정규화. */
export function ymdMinusDays(ymd: string, days: number): string {
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10) - 1;
  const d = parseInt(ymd.substring(6, 8), 10);
  const t = Date.UTC(y, m, d) - days * 24 * 60 * 60 * 1000;
  const dt = new Date(t);
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
}

/** ArrayBuffer → sha256 hex. Web Crypto API 사용 (Node/Edge 모두 지원). */
export async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 한 학교의 이번 주 사진을 Supabase 에 미러.
 * - URL/해시 동일 시 다운로드 스킵 → 학교 서버 부담 ↓
 * - 다운로드 실패는 한 ymd 단위로 격리 (다른 ymd 계속 진행)
 */
export async function mirrorWeekForSchool(
  school: SchoolConfig,
  todayYmd: string
): Promise<MirrorResult> {
  const sb = getServiceRoleClient();
  if (!sb || !school.scrape) {
    return {
      schoolId: school.id,
      enabled: false,
      uploaded: 0,
      skipped: 0,
      failed: 0,
      missing: 0,
    };
  }

  let weekMap: Record<string, string>;
  try {
    weekMap = await fetchWeekPhotos(school.scrape, todayYmd);
  } catch (err) {
    return {
      schoolId: school.id,
      enabled: true,
      uploaded: 0,
      skipped: 0,
      failed: 0,
      missing: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const result: MirrorResult = {
    schoolId: school.id,
    enabled: true,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    missing: 0,
    failures: [],
  };

  for (const [ymd, relPath] of Object.entries(weekMap)) {
    const sourceUrl = toAbsolutePhotoUrl(school.scrape, relPath);
    let stage = 'init';

    try {
      // 1. 기존 행 조회
      stage = 'select-existing';
      const { data: existing, error: selectError } = await sb
        .from('meal_photos')
        .select('source_url, content_hash, storage_path')
        .eq('school_id', school.id)
        .eq('ymd', ymd)
        .maybeSingle<PhotoRow>();
      if (selectError) throw selectError;

      if (existing && existing.source_url === sourceUrl) {
        result.skipped++;
        continue;
      }

      // 2. 다운로드 (45초 타임아웃)
      // 청계초 사진 한 장이 5MB+ 이고 학교 서버가 한국 외 리전에서 느림.
      // Vercel Hobby 함수 최대 60초라 45초까지 허용.
      stage = 'download';
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 45000);
      let buf: ArrayBuffer;
      try {
        const res = await fetch(sourceUrl, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`download HTTP ${res.status}`);
        buf = await res.arrayBuffer();
      } finally {
        clearTimeout(timer);
      }

      // 3. sharp 로 리사이즈·압축 (5MB → ~150KB, 97% 절감)
      // 원본 형식 무관하게 모두 JPEG 로 통일 → 캐시·CDN 효율 ↑
      stage = 'resize';
      const resized = await sharp(Buffer.from(buf))
        .rotate() // EXIF 회전 적용 후 메타 제거 (sharp 의 표준 패턴)
        .resize({
          width: RESIZE_MAX,
          height: RESIZE_MAX,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();

      // 4. 해시로 변경 감지 (리사이즈 결과 기준 — 내용 변화 정확히 반영)
      stage = 'hash';
      // Buffer → 새 ArrayBuffer 로 복사 (SharedArrayBuffer 가능성 회피)
      const resizedAb = new Uint8Array(resized).buffer;
      const hash = await sha256Hex(resizedAb);
      if (existing?.content_hash === hash) {
        // 내용 동일, URL 만 바뀜 → DB 만 갱신
        stage = 'update-source-url';
        await sb
          .from('meal_photos')
          .update({ source_url: sourceUrl })
          .match({ school_id: school.id, ymd });
        result.skipped++;
        continue;
      }

      // 5. Storage 업로드 (upsert) — 모두 .jpg 로 통일
      stage = 'storage-upload';
      const storagePath = `${school.id}/${ymd}.jpg`;
      const upload = await sb.storage.from(BUCKET).upload(storagePath, resized, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (upload.error) throw upload.error;

      // 6. DB upsert
      stage = 'db-upsert';
      const upsert = await sb.from('meal_photos').upsert({
        school_id: school.id,
        ymd,
        storage_path: storagePath,
        source_url: sourceUrl,
        content_hash: hash,
        bytes: resized.byteLength,
      });
      if (upsert.error) throw upsert.error;

      result.uploaded++;
    } catch (err) {
      result.failed++;
      const message = err instanceof Error ? err.message : String(err);
      result.failures!.push({ ymd, stage, message });
    }
  }

  // 성공만 있으면 디버그 필드는 제거
  if (result.failures && result.failures.length === 0) {
    delete result.failures;
  }

  return result;
}

/**
 * 슬라이딩 윈도우 cleanup.
 * `ymd < cutoff` 인 모든 행과 Storage 객체를 삭제.
 * cutoff = today - SLIDING_WINDOW_DAYS (즉 오늘 포함 SLIDING_WINDOW_DAYS+1일치 보존)
 */
export async function pruneOldPhotos(todayYmd: string): Promise<PruneResult> {
  const sb = getServiceRoleClient();
  if (!sb) return { enabled: false, pruned: 0 };

  const cutoff = ymdMinusDays(todayYmd, SLIDING_WINDOW_DAYS);

  try {
    const { data: stale } = await sb
      .from('meal_photos')
      .select('storage_path')
      .lt('ymd', cutoff);

    if (!stale || stale.length === 0) {
      return { enabled: true, pruned: 0, cutoff };
    }

    // Storage 객체 일괄 삭제
    const paths = stale.map((r) => r.storage_path as string);
    const removeRes = await sb.storage.from(BUCKET).remove(paths);
    if (removeRes.error) throw removeRes.error;

    // DB 행 삭제
    const deleteRes = await sb
      .from('meal_photos')
      .delete()
      .lt('ymd', cutoff);
    if (deleteRes.error) throw deleteRes.error;

    return { enabled: true, pruned: stale.length, cutoff };
  } catch (err) {
    return {
      enabled: true,
      pruned: 0,
      cutoff,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 미러된 사진의 public Storage URL 조회.
 * 미러에 없거나 Supabase 미설정 시 null.
 */
export async function getMirroredPhotoUrl(
  schoolId: string,
  ymd: string
): Promise<string | null> {
  // 읽기는 anon 으로 충분 (RLS read 정책으로 공개)
  const sb = getAnonClient();
  if (!sb) return null;

  const { data } = await sb
    .from('meal_photos')
    .select('storage_path')
    .eq('school_id', schoolId)
    .eq('ymd', ymd)
    .maybeSingle<{ storage_path: string }>();

  if (!data) return null;

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(data.storage_path);
  return pub.publicUrl ?? null;
}

/** Supabase 미러가 활성화되어 있는지(키가 있는지). */
export function isMirrorEnabled(): boolean {
  return getServiceRoleClient() !== null;
}
