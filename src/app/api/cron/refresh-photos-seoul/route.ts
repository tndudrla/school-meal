import { NextRequest, NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { runPhotoCron } from '@/lib/cron/photoCronImpl';

/**
 * 서울 자치구 사진 미러 cron — Stage 14-31 (2026-05-03) region 분리.
 *
 * 25개 자치구 = 약 610교. chunk 30 sequential × ~21 batch ≈ 280~315초.
 * Stage 14-30 통합 사진 cron 의 592s 마진 부족 처방으로 region 분리.
 *
 * prune 도 본 cron 안에서 수행 — 전 region 공통이라 서울/경기 둘 다 돌리면
 * 중복. 서울이 회차 더 무겁고 자주 도는 자연스런 위치라 여기서 처리.
 *
 * schedule: KST 13:30 / 16:00 / 19:00 (vercel.json). 영양교사 점심 후
 * 1차 업로드 + 메인 업로드 후 + 늦은 업로드 보충 + 저녁 트래픽 직전.
 *
 * 1500교 시점: 자치구 그룹 분리 (예: 강남·강서·... vs 노원·도봉·...) 검토.
 */

// 서울 chunk 30 × ~21 batch ≈ 280~315초. Pro 한도 800 안 마진 약 290초.
export const maxDuration = 600;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // region 이 '서울 ' 로 시작하는 학교만 (서울 25 자치구).
  // region prefix 컨벤션은 src/lib/schools/seoul/* 모두 일관 (확인됨).
  const schools = listSchools().filter((s) => s.region.startsWith('서울 '));
  const result = await runPhotoCron({
    schools,
    label: 'seoul',
    runPrune: true, // 서울 cron 만 prune. 경기 cron 은 false.
  });
  return NextResponse.json(result);
}
