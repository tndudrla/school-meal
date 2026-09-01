import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { runPhotoCron } from '@/lib/cron/photoCronImpl';
import { isGyeonggiRest } from '@/lib/cron/gyeonggiGroups';

/**
 * 경기 사진 미러 cron — Stage 14-31 (2026-05-03) region 분리.
 *
 * 4도시 (안양·과천·의왕·군포) = 약 75교. chunk 30 × ~3 batch ≈ 30~50초.
 * 서울 cron 과 같은 schedule 로 trigger 되지만 독립 함수 invocation 으로
 * parallel 실행되어 wall time 분산.
 *
 * prune 은 서울 cron 에 위임 (`runPrune: false`). 슬라이딩 윈도우 cleanup 은
 * 전 region 공통이라 한 번만 수행.
 *
 * schedule: KST 13:30 / 16:00 / 19:00 (서울과 동일).
 */

// Stage 15 정정 (2026-09-02): maxDuration 300 → 800.
// 서울 두 cron 은 Stage 14-33 에서 800 으로 올렸는데 경기만 누락돼 있었다.
// work-log "안 할 것" 목록의 "보수적 300/600 시작 금지" 조항 — 학교 서버
// 변동성 + 동시 trigger 부담 흡수 마진은 Pro 한도 끝까지 확보한다.
// 4도시 75교 chunk 30 × ~3 batch ≈ 30~50초라 실사용 마진은 여전히 큼.
export const maxDuration = 800;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // Stage 15: 수원 제외 여집합 술어로 축소. 수원 102교는 goesw.kr 단일
  // 도메인이라 전용 cron (refresh-photos-suwon) 이 담당. startsWith('경기 ')
  // 를 유지하면 177교를 이 함수가 삼켜 wall time 폭증 (504 재현 경로).
  // 술어 관리는 src/lib/cron/gyeonggiGroups.ts — 새 경기 시·군은 자동 포함.
  const schools = listSchools().filter((s) => isGyeonggiRest(s.region));
  const result = await runPhotoCron({
    schools,
    label: 'gyeonggi',
    runPrune: false, // prune 은 서울 cron 에 위임 (전 region 공통 작업)
  });
  return NextResponse.json(result);
}
