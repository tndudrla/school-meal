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
 * 한 학교의 sliding window 사진을 Supabase 에 미러.
 * - 윈도우 = 이번 주 (월~금). cron 이 하루 3회 (08/14:30/17) 도는 동안 매번
 *   같은 주를 채우고, 다음 주가 시작되면 자동으로 새 주 페이지를 받음.
 * - URL/해시 동일 시 다운로드 스킵 → 학교 서버 부담 ↓
 * - 다운로드 실패는 한 ymd 단위로 격리 (다른 ymd 계속 진행)
 *
 * 슬라이딩 윈도우 운영 (Stage 14-26 정리, 2026-05-03):
 *   - cleanup cutoff = today - 7일. 즉 오늘 + 과거 7일치 (8일) 보존.
 *   - cron 이 매 회차 새 ymd 사진을 그 주 페이지에서 받아 미러에 추가.
 *   - 7일 이전 (다다음 주 진입 시 지난 주 사진) 자동 prune.
 *   - 두 주 합치기 도입 시도 (initial Stage 14-26) → 685교 × 두 주 fetch 가
 *     300초 한도 초과로 504. 롤백. 일요일 시점 빈 결과는 다음 cron 회차
 *     (월요일 08:00 자동) 에서 새 주 페이지에 사진이 등록되며 자연 해결.
 *
 * weekMap 주입 (Stage 14-27, 2026-05-03):
 *   - cron route 에서 photos 단계에 이미 fetchWeekPhotos 를 호출함.
 *     같은 학교에 대해 두 번 호출하면 학교 서버 outbound 가 2배 → 685교 시점
 *     300초 504 의 주범 중 하나. cron 에서 받은 weekMap 을 그대로 주입해
 *     학교 서버 호출 50% 절감. 미러를 단독으로 호출하는 다른 경로(부재) 도
 *     안전하게 유지하기 위해 optional 파라미터로 두고 미주입 시만 fetch.
 */
export async function mirrorWeekForSchool(
  school: SchoolConfig,
  todayYmd: string,
  preFetchedWeekMap?: Record<string, string>
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
  if (preFetchedWeekMap) {
    weekMap = preFetchedWeekMap;
  } else {
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
  }

  // 한 ymd 처리의 결과 분류 (병렬 reduce 용)
  type Outcome =
    | { kind: 'uploaded' }
    | { kind: 'skipped' }
    | { kind: 'failed'; ymd: string; stage: string; message: string };

  // 한 ymd 단위 작업. throw 하지 않고 Outcome 으로 격리해 다른 ymd 와 독립 진행.
  // 병렬 실행: 가장 느린 한 장 시간만 들도록 — Vercel Hobby 60s 한도 안에 들어오게 함.
  const runOne = async ([ymd, relPath]: [string, string]): Promise<Outcome> => {
    const sourceUrl = toAbsolutePhotoUrl(school.scrape!, relPath);
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
        // DB 만 보고 스킵하면, 누가 Storage 파일을 수동 삭제했을 때 영영 복구 안 됨.
        // 같은 폴더에서 해당 ymd.jpg 가 실제 있는지 확인 (목록 1건만).
        stage = 'verify-storage';
        const { data: listed, error: listError } = await sb.storage
          .from(BUCKET)
          .list(school.id, { search: `${ymd}.jpg`, limit: 1 });
        if (listError) throw listError;
        if (listed && listed.some((f) => f.name === `${ymd}.jpg`)) {
          return { kind: 'skipped' };
        }
        // 파일이 사라졌으면 다운로드~업로드 경로로 떨어뜨려 자동 복구
      }

      // 2. 다운로드 (15초 타임아웃)
      // Stage 13: 45초였으나 한 장이 너무 오래 잡으면 같은 학교의 다른 6장을
      // 막아 미러가 7장 중 1~3장만 들어오는 사고. 5MB 이미지가 15초 넘게
      // 걸리면 학교 서버 이상이라 보고 포기 — 다음 라운드/cron 에서 재시도.
      stage = 'download';
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
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
        return { kind: 'skipped' };
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

      return { kind: 'uploaded' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { kind: 'failed', ymd, stage, message };
    }
  };

  // 학교당 동시 다운로드 캡 — 학교 서버 폭격 방지 + 부트스트랩 시 60s 한도 안에 들어오게.
  // 정상 운영 중엔 select-existing 으로 대부분 skip 되므로 영향 없음.
  // Stage 13: 3 → 5. cron route 에서 학교 자체를 청크로 쪼개 동시 학교 수가
  // 76 → 10 으로 줄었으므로, 학교당 동시성을 늘려도 학교 서버 부담 총합은 비슷.
  // 한 학교 7장이 1~2 라운드에 끝나 timeout 15s 가드와 시너지.
  const CONCURRENCY = 5;
  const entries = Object.entries(weekMap);
  const outcomes: Outcome[] = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const batchOutcomes = await Promise.all(batch.map(runOne));
    outcomes.push(...batchOutcomes);
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
  for (const o of outcomes) {
    if (o.kind === 'uploaded') result.uploaded++;
    else if (o.kind === 'skipped') result.skipped++;
    else {
      result.failed++;
      result.failures!.push({ ymd: o.ymd, stage: o.stage, message: o.message });
    }
  }
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
