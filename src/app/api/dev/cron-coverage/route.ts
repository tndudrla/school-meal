import { NextResponse } from 'next/server';
import { listSchools } from '@/lib/schools';
import { isSeoulGroup1, isSeoulGroup2 } from '@/lib/cron/seoulDistricts';
import { isSuwon, isGyeonggiRest } from '@/lib/cron/gyeonggiGroups';

/**
 * cron 고아 학교 검출기 — Stage 15 AC-17 (2026-09-02).
 *
 * scrape 보유 학교 전체를 4개 사진 cron 필터 술어에 대조해, 어느 cron 에도
 * 속하지 않는 학교 (= 사진이 영원히 갱신되지 않는 학교) 를 찾는다.
 * **게이트: orphans 가 빈 배열이어야 한다.** 1건이라도 나오면 배포 중단.
 *
 * 반드시 실제 술어를 import 한다 — 스크립트 안에 문자열 비교로 재구현하면
 * 검사 대상이 실제 술어가 아니라 사본이 되어 게이트가 무력화되고, 그 실패는
 * 조용하다 (사본은 0건을 출력하고 통과시킨다).
 *
 * `seoulDistricts.ts` 의 "두 list 합 == 자치구 갯수" 주석과 같은 사고를 막되,
 * 주석 (읽는 사람에게만 작동) 이 아니라 실행 가능한 검사로. 부산·인천 등
 * 새 region 이 추가돼도 그대로 작동한다 — **새 region/술어 추가 시 반드시
 * 이 라우트를 실행할 것** (술어가 늘면 아래 PREDICATES 에도 추가).
 *
 * 사용: npm run dev 상태에서 curl localhost:3000/api/dev/cron-coverage
 * (읽기 전용 집계라 프로덕션 노출 무해. 운영 데이터 접근 없음)
 */

const PREDICATES: Array<[string, (region: string) => boolean]> = [
  ['seoul-1', isSeoulGroup1],
  ['seoul-2', isSeoulGroup2],
  ['suwon', isSuwon],
  ['gyeonggi-rest', isGyeonggiRest],
];

export async function GET() {
  const scrapable = listSchools().filter((s) => s.scrape);

  const counts: Record<string, number> = {};
  for (const [label] of PREDICATES) counts[label] = 0;

  const orphans: Array<{ id: string; name: string; region: string }> = [];
  const overlaps: Array<{ id: string; region: string; matched: string[] }> = [];

  for (const s of scrapable) {
    const matched = PREDICATES.filter(([, pred]) => pred(s.region)).map(([label]) => label);
    for (const label of matched) counts[label]++;
    if (matched.length === 0) orphans.push({ id: s.id, name: s.name, region: s.region });
    if (matched.length > 1) overlaps.push({ id: s.id, region: s.region, matched });
  }

  const sum = Object.values(counts).reduce((a, b) => a + b, 0);
  return NextResponse.json({
    scrapableTotal: scrapable.length,
    counts,
    sum, // == scrapableTotal 이어야 함 (겹침도 빈틈도 없음)
    orphans, // 게이트: 빈 배열
    overlaps, // 게이트: 빈 배열
    registeredTotal: listSchools().length,
  });
}
