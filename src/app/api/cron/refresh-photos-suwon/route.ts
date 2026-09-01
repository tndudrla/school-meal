import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { runPhotoCron } from '@/lib/cron/photoCronImpl';
import { isSuwon } from '@/lib/cron/gyeonggiGroups';

/**
 * 경기 수원 사진 미러 cron — Stage 15 (2026-09-02) 신설.
 *
 * 수원 101교 (scrape 보유 99교) 는 `*-e.goesw.kr` 단일 인프라 — work-log
 * 도메인 위험도 "높음". 기존 경기 4도시 (goeay/goegu 분산) 와 폭발 반경을
 * 분리하고 goesw.kr 첫 실사용 거동을 격리 관측하기 위한 전용 cron.
 * 안정 관측 후 경기 통합 재흡수 검토 (계획 ADR Follow-up 1-b).
 *
 * 필터 술어는 src/lib/cron/gyeonggiGroups.ts 의 isSuwon 에서 관리 —
 * refresh-photos-gyeonggi 의 isGyeonggiRest 와 합집합 = 경기 전체 불변식.
 *
 * prune 은 seoul-1 cron 에 위임 (`runPrune: false`) — 전 region 공통 작업.
 * schedule: KST 13:30 / 16:00 / 19:00 (다른 세 사진 cron 과 동일, vercel.json).
 * goesw.kr 은 기존 cron 들의 도메인과 겹치지 않아 동시 trigger 부담 합산 없음.
 */

// 99교 / chunk 30 = 4 batch. 도메인 2갈래 분산이던 경기 실측 (30~50s) 보다
// 단일 도메인 누적으로 느릴 수 있어 최대 ~120s 예상. Pro 한도 800 풀 사용
// (work-log "안 할 것": 보수적 300/600 시작 금지 — Stage 14-32/33 교훈).
export const maxDuration = 800;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const schools = listSchools().filter((s) => isSuwon(s.region));
  const result = await runPhotoCron({
    schools,
    label: 'suwon',
    runPrune: false, // prune 은 seoul-1 cron 에 위임 (전 region 공통 작업)
  });
  return NextResponse.json(result);
}
