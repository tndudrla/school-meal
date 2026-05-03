import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { runPhotoCron } from '@/lib/cron/photoCronImpl';
import { isSeoulGroup1 } from '@/lib/cron/seoulDistricts';

/**
 * 서울 강남권 (한강 이남 11구) 사진 미러 cron — Stage 14-32 (2026-05-03).
 *
 * Stage 14-31 통합 서울 cron (610교) 의 600s 504 처방으로 강남권/강북권
 * 분할. 본 cron 은 강남·강동·강서·관악·구로·금천·동작·서초·송파·양천·
 * 영등포 11구 = 304교 처리.
 *
 * 자치구 list 는 src/lib/cron/seoulDistricts.ts 의 SEOUL_GROUP_1 에서 관리.
 * 새 강남권 자치구 등록 시 그 list 도 갱신해야 cron 누락 사고 방지.
 *
 * prune (sliding window cleanup) 도 본 cron 안에서 수행 — 전 region 공통
 * 작업이라 한 라우트에서만. Seoul-2, gyeonggi cron 은 prune 위임.
 *
 * schedule: KST 13:30 / 16:00 / 19:00 (vercel.json). Seoul-2, gyeonggi cron
 * 과 같은 시각 parallel invocation.
 */

// Stage 14-33 갱신 (2026-05-03): maxDuration 300 → 800.
// 14-32 첫 회차에서 두 서울 cron 동시 trigger 로 sen.es.kr 동시 60 connection
// 부담 (각 cron chunk 30) → 학교당 wall 5초+ 누적 → 300s 한도 초과 504.
// Pro plan 800s 한도까지 끌어올려 학교 서버 변동성 흡수 마진 확보.
// 304교 / chunk 30 / wall ~25s × 11 batch ≈ 275~280s. 800 마진 ~520s.
export const maxDuration = 800;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const schools = listSchools().filter((s) => isSeoulGroup1(s.region));
  const result = await runPhotoCron({
    schools,
    label: 'seoul-1',
    runPrune: true, // 전 region 공통 prune 은 본 cron 에서만
  });
  return NextResponse.json(result);
}
