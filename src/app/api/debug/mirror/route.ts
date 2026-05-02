/**
 * 임시 진단 endpoint (2026-05-03) — 685교 미러 누락 원인 추적용.
 *
 * 보호: CRON_SECRET 과 동일한 Bearer 토큰 요구. 진단 끝나면 본 파일 통째로 삭제.
 *
 * 동작: 모든 학교에 대해 fetchWeekPhotos 만 호출 (다운로드·sharp·업로드 없음).
 *   schools_total / scrape_kinds / photos_count 분포 / 빈 학교 sample 반환.
 *   85초 한도 안에서 685교 처리 가능 — 외부 호출은 학교 사이트만, NEIS·Supabase 안 건드림.
 */

import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { fetchWeekPhotos } from '@/lib/schoolScraper';
import { formatDate } from '@/lib/utils';
import { getServiceRoleClient } from '@/lib/supabase/admin';

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayYmd = formatDate(yesterday);

  const sb = getServiceRoleClient();
  const supabaseClient = sb ? 'ok' : 'null (env missing or createClient fail)';

  const schools = listSchools();

  type Slot = {
    schoolId: string;
    kind?: string;
    photoCount: number;
    error?: string;
  };

  const results: Slot[] = await Promise.all(
    schools.map(async (s): Promise<Slot> => {
      if (!s.scrape) {
        return { schoolId: s.id, photoCount: 0 };
      }
      try {
        const map = await fetchWeekPhotos(s.scrape, yesterdayYmd);
        return {
          schoolId: s.id,
          kind: s.scrape.kind,
          photoCount: Object.keys(map).length,
        };
      } catch (err) {
        return {
          schoolId: s.id,
          kind: s.scrape.kind,
          photoCount: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  // 분류
  const byKind: Record<string, { total: number; empty: number; errored: number; with_photos: number }> = {};
  let noScrape = 0;
  const errors: Array<{ schoolId: string; kind?: string; error: string }> = [];
  const emptyByKind: Record<string, string[]> = {};

  for (const r of results) {
    if (!r.kind) {
      noScrape += 1;
      continue;
    }
    const bucket = byKind[r.kind] ?? (byKind[r.kind] = { total: 0, empty: 0, errored: 0, with_photos: 0 });
    bucket.total += 1;
    if (r.error) {
      bucket.errored += 1;
      if (errors.length < 10) errors.push({ schoolId: r.schoolId, kind: r.kind, error: r.error });
    } else if (r.photoCount === 0) {
      bucket.empty += 1;
      const arr = emptyByKind[r.kind] ?? (emptyByKind[r.kind] = []);
      if (arr.length < 5) arr.push(r.schoolId);
    } else {
      bucket.with_photos += 1;
    }
  }

  return NextResponse.json({
    yesterdayYmd,
    schools_total: schools.length,
    no_scrape: noScrape,
    supabaseClient,
    byKind,
    errors_sample: errors,
    empty_sample: emptyByKind,
  });
}
