import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { runPhotoCron } from '@/lib/cron/photoCronImpl';

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

// 경기 chunk 30 × ~3 batch ≈ 30~50초. Pro 한도 800 의 마진 큼.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // region 이 '경기 ' 로 시작하는 학교만 (경기 4도시).
  // region prefix 컨벤션은 src/lib/schools/gyeonggi.ts 모두 일관 (확인됨).
  const schools = listSchools().filter((s) => s.region.startsWith('경기 '));
  const result = await runPhotoCron({
    schools,
    label: 'gyeonggi',
    runPrune: false, // prune 은 서울 cron 에 위임 (전 region 공통 작업)
  });
  return NextResponse.json(result);
}
