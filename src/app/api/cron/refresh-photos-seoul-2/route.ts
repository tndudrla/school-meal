import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { runPhotoCron } from '@/lib/cron/photoCronImpl';
import { isSeoulGroup2 } from '@/lib/cron/seoulDistricts';

/**
 * 서울 강북권 (한강 이북 14구) 사진 미러 cron — Stage 14-32 (2026-05-03).
 *
 * 강남권 (Seoul-1) 과 함께 통합 서울 cron 의 600s 504 처방. 본 cron 은
 * 강북·광진·노원·도봉·동대문·마포·서대문·성동·성북·용산·은평·종로·중·중랑
 * 14구 = 306교 처리.
 *
 * 자치구 list 는 src/lib/cron/seoulDistricts.ts 의 SEOUL_GROUP_2 에서 관리.
 *
 * prune 은 Seoul-1 에 위임 (`runPrune: false`).
 *
 * schedule: KST 13:30 / 16:00 / 19:00 (vercel.json). Seoul-1, gyeonggi cron
 * 과 같은 시각 parallel invocation.
 */

// Stage 14-33 갱신 (2026-05-03): maxDuration 300 → 800.
// Seoul-1 과 동일 처방 — 두 cron 동시 trigger sen.es.kr 60 부담 흡수.
// 306교 / chunk 30 / wall ~25s × 11 batch ≈ 275~280s. 800 마진 ~520s.
export const maxDuration = 800;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const schools = listSchools().filter((s) => isSeoulGroup2(s.region));
  const result = await runPhotoCron({
    schools,
    label: 'seoul-2',
    runPrune: false, // prune 은 Seoul-1 에 위임
  });
  return NextResponse.json(result);
}
