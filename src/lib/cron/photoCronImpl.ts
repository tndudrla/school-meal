/**
 * 사진 cron 공통 핵심 로직 (Stage 14-31, 2026-05-03 도입).
 *
 * 두 cron 라우트 (refresh-photos-seoul / refresh-photos-gyeonggi) 가 공유하는
 * 처리 단계 — fetchWeekPhotos → mirrorWeekForSchool → 통계 로그 → optional prune.
 *
 * 라우트는 region filter 적용된 schools list 만 외부에서 주입. region 별
 * 분리 ≠ photoMirror 동작 차이 — 단지 학교 list 의 부분집합을 다룰 뿐.
 *
 * Stage 14-30 통합 cron 의 사진 부분 로직을 그대로 추출. region prefix 의존성
 * 은 라우트 측에서 처리 (`s.region.startsWith('서울 ')` 등).
 */

import { fetchWeekPhotos } from '@/lib/schoolScraper';
import { formatDate } from '@/lib/utils';
import {
  isMirrorEnabled,
  mirrorWeekForSchool,
  pruneOldPhotos,
} from '@/lib/photoMirror';
import type { SchoolConfig } from '@/lib/schools';

interface RunOpts {
  /** 처리 대상 학교들 (region filter 적용된 list) */
  schools: SchoolConfig[];
  /** 로그 식별자 (예: 'seoul', 'gyeonggi'). [cron-photos-<label>] 로 출력. */
  label: string;
  /** 슬라이딩 윈도우 prune 수행 여부. 한 region cron 만 true (현재 서울). */
  runPrune: boolean;
}

interface MirrorStats {
  no_mirror_field: number;
  disabled: number;
  errored: number;
  uploaded_some: number;
  empty: number;
  total_photos_count: number;
}

export async function runPhotoCron({ schools, label, runPrune }: RunOpts) {
  const today = new Date();
  const ymd = formatDate(today);

  // 사진 미러용 기준일은 "어제". 이유:
  // fetchWeekPhotos 가 일요일 시작 주를 받아오는데, 일요일 cron 이 today 로
  // 호출하면 "다음 주" 페이지를 받아 photos.count: 0 (영양교사 미업로드).
  // 어제 기준이면 일요일 cron 도 지난 주 페이지를 받아 이번 주 사진 미러.
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayYmd = formatDate(yesterday);

  const mirrorOn = isMirrorEnabled();
  const startedAt = Date.now();

  // scrape 있는 학교만 처리 — NEIS 전용 학교는 사진 미러 무관.
  const scrapableSchools = schools.filter((s) => !!s.scrape);

  const processSchool = async (school: SchoolConfig) => {
    const result: Record<string, unknown> = { schoolId: school.id };

    // 1. 학교 사이트 사진 fetch
    let weekMap: Record<string, string> | undefined;
    try {
      // school.scrape 는 위 filter 로 보장됨 — TS narrowing 위해 ! 사용
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

  // chunk 30 sequential — 학교 서버 동시 outbound 폭주 방지.
  // region 분리 후 batch 수 자체가 줄어 (서울 ~21 / 경기 ~3) 누적 효과 약화.
  const CHUNK = 30;
  const perSchool: Array<Awaited<ReturnType<typeof processSchool>>> = [];
  for (let i = 0; i < scrapableSchools.length; i += CHUNK) {
    const batch = scrapableSchools.slice(i, i + CHUNK);
    const results = await Promise.all(batch.map(processSchool));
    perSchool.push(...results);
  }

  // 3. 슬라이딩 윈도우 prune — 전 region 공통 작업이라 한 cron 만 수행.
  // runPrune=false 인 라우트 (예: 경기) 는 스킵.
  const prune =
    runPrune && mirrorOn
      ? await pruneOldPhotos(ymd)
      : { enabled: false, pruned: 0 };

  // 통계 로그 — [cron-photos-<label>] 식별자로 region 별 구분 가능
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

  console.log(`[cron-photos-${label}]`, {
    schools_total: perSchool.length,
    schools_skipped_no_scrape: schools.length - scrapableSchools.length,
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

  return {
    triggeredAt: new Date().toISOString(),
    label,
    ymd,
    mirrorEnabled: mirrorOn,
    elapsedMs: Date.now() - startedAt,
    schools: perSchool,
    prune,
  };
}
