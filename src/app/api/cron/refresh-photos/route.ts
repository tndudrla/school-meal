import { NextRequest, NextResponse } from 'next/server';
import { fetchWeekPhotos } from '@/lib/schoolScraper';
import { formatDate } from '@/lib/utils';
import { listSchools } from '@/lib/schools';
import {
  isMirrorEnabled,
  mirrorWeekForSchool,
  pruneOldPhotos,
} from '@/lib/photoMirror';

/**
 * 학교 사이트 사진 fetch + Supabase 미러 + sliding window prune cron —
 * Stage 14-30 (2026-05-03) NEIS 와 분리.
 *
 * 무거운 처리 (학교 사이트 outbound + sharp 리사이즈 + Supabase upload).
 * chunk 30 sequential 로 학교 서버 부담 분산. weekMap 한 번 fetch 해
 * mirrorWeekForSchool 에 주입 (Stage 14-27 처방).
 *
 * scrape 없는 학교 (NEIS 전용 — lila/myongji/한양/경복/금성/영훈/천이) 는
 * 본 cron 대상 X. 사진 미러 무관이라 처음부터 list 에서 제외.
 *
 * schedule: KST 13:30 / 16:00 / 19:00 (vercel.json). 영양교사 점심 후 1차
 * 업로드 + 메인 업로드 시간대 + 늦은 업로드 보충. 사용자 진입 시점
 * (점심·저녁 트래픽) 직전마다 미러 hit 률 최대화.
 *
 * 슬라이딩 윈도우 prune 도 본 cron 안에서 수행 — 사진과 의미상 묶임.
 * NEIS cron 과 무관.
 *
 * 보호: CRON_SECRET 설정 시 Authorization: Bearer 헤더 요구. Vercel Cron 자동 첨부.
 */

// Pro 한도 800 안 마진 200초. 685교 시점 약 280~400초 예상 (NEIS 분리 후
// 외부 호출 절반이라 Stage 14-28 통합 600s 부담의 절반 수준).
export const maxDuration = 600;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const today = new Date();
  const ymd = formatDate(today);

  // 사진 미러용 기준일은 "어제". 이유:
  // fetchWeekPhotos 가 일요일 시작 주를 받아오는데, 일요일 cron 이 today 로
  // 호출하면 "다음 주" 페이지를 받아 photos.count: 0 (영양교사 미업로드).
  // 어제 기준이면 일요일 cron 도 지난 주 페이지를 받아 이번 주 사진 미러.
  // 평일 cron 은 어제도 같은 주라 결과 동일. (Stage 13-1 도입)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayYmd = formatDate(yesterday);

  const mirrorOn = isMirrorEnabled();
  const startedAt = Date.now();

  // scrape 있는 학교만 처리 — NEIS 전용 학교는 사진 미러 무관.
  const allSchools = listSchools();
  const scrapableSchools = allSchools.filter((s) => !!s.scrape);

  const processSchool = async (
    school: ReturnType<typeof listSchools>[number]
  ) => {
    const result: Record<string, unknown> = { schoolId: school.id };

    // 1. 학교 사이트 사진 fetch
    let weekMap: Record<string, string> | undefined;
    try {
      // school.scrape 는 위 filter 로 보장됨 — but TS narrowing 위해 ! 사용
      weekMap = await fetchWeekPhotos(school.scrape!, yesterdayYmd);
      result.photos = {
        count: Object.keys(weekMap).length,
        ymds: Object.keys(weekMap),
      };
    } catch (err) {
      result.photosError = err instanceof Error ? err.message : String(err);
    }

    // 2. Supabase 미러 (키 있을 때만, weekMap 주입으로 외부 호출 1회)
    if (mirrorOn) {
      result.mirror = await mirrorWeekForSchool(school, yesterdayYmd, weekMap);
    }

    return result;
  };

  // chunk 30 sequential — 학교 서버 동시 outbound 폭주 방지 (Stage 14-26~28).
  // 685교 / 30 = 약 23 batch × ~12~15초 ≈ 280~345초. 600 한도 안 여유.
  // NEIS 분리로 batch 안 wall 더 짧아짐.
  const CHUNK = 30;
  const perSchool: Array<Awaited<ReturnType<typeof processSchool>>> = [];
  for (let i = 0; i < scrapableSchools.length; i += CHUNK) {
    const batch = scrapableSchools.slice(i, i + CHUNK);
    const results = await Promise.all(batch.map(processSchool));
    perSchool.push(...results);
  }

  // 3. 슬라이딩 윈도우 cleanup (사진과 의미상 묶임)
  const prune = mirrorOn
    ? await pruneOldPhotos(ymd)
    : { enabled: false, pruned: 0 };

  // 통계 로그 (정상 운영 가시성)
  type MirrorStats = {
    no_mirror_field: number;
    disabled: number;
    errored: number;
    uploaded_some: number;
    empty: number;
    total_photos_count: number;
  };
  const mirrorStats: MirrorStats = perSchool.reduce<MirrorStats>(
    (acc, r) => {
      const m = r.mirror as
        | {
            enabled?: boolean;
            uploaded?: number;
            failed?: number;
            missing?: number;
            error?: string;
          }
        | undefined;
      const photos = r.photos as { count?: number } | undefined;
      if (!m) acc.no_mirror_field += 1;
      else if (!m.enabled) acc.disabled += 1;
      else if (m.error) acc.errored += 1;
      else if ((m.uploaded ?? 0) > 0) acc.uploaded_some += 1;
      else acc.empty += 1;
      acc.total_photos_count += photos?.count ?? 0;
      return acc;
    },
    {
      no_mirror_field: 0,
      disabled: 0,
      errored: 0,
      uploaded_some: 0,
      empty: 0,
      total_photos_count: 0,
    }
  );
  console.log('[cron-photos]', {
    schools_total: perSchool.length,
    schools_skipped_no_scrape: allSchools.length - scrapableSchools.length,
    mirrorEnabled: mirrorOn,
    mirror_buckets: {
      no_mirror_field: mirrorStats.no_mirror_field,
      disabled: mirrorStats.disabled,
      errored: mirrorStats.errored,
      uploaded_some: mirrorStats.uploaded_some,
      empty: mirrorStats.empty,
    },
    total_photos_count: mirrorStats.total_photos_count,
    prune_enabled: prune.enabled,
    prune_count: prune.pruned,
    elapsedMs: Date.now() - startedAt,
  });

  return NextResponse.json({
    triggeredAt: new Date().toISOString(),
    ymd,
    mirrorEnabled: mirrorOn,
    elapsedMs: Date.now() - startedAt,
    schools: perSchool,
    prune,
  });
}
