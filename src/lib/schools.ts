/**
 * 학교 메타 레지스트리.
 *
 * 북극성: 전국 초·중·고로 확장. 새 학교 추가는 SCHOOLS 객체에 한 항목 등록으로 끝나야 한다.
 *
 * Stage 3 에서 사진 미러를 켜면 'scrape' 가 있는 학교만 미러 대상이 된다.
 * NEIS 만 지원하는 학교(다른 시도 교육청 도메인 등)는 'scrape' 생략 가능 — 메뉴는 보이고
 * 사진은 안 보인다.
 */

import type { SchoolScrapeTarget } from './schoolScraper';
import { CHONGGYE_TARGET } from './schoolScraper';

export type SchoolLevel = 'elementary' | 'middle' | 'high';

export interface SchoolConfig {
  /** URL 친화 키. /?schoolId=chonggye, /api/og?schoolId=chonggye 등에 쓰임. */
  id: string;
  /** 사용자 노출 이름. */
  name: string;
  level: SchoolLevel;
  /** 사용자 노출용 짧은 지역 표기. */
  region: string;
  /** NEIS Open API 식별자. */
  neis: { atptCode: string; schoolCode: string };
  /** 학교 홈페이지 사진 스크래핑 가능한 경우의 설정. */
  scrape?: SchoolScrapeTarget;
}

export const SCHOOLS: Record<string, SchoolConfig> = {
  chonggye: {
    id: 'chonggye',
    name: '청계초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569109' },
    scrape: CHONGGYE_TARGET,
  },
};

export const DEFAULT_SCHOOL_ID = 'chonggye';

/**
 * id 로 학교 조회. 잘못된 id 는 기본 학교(청계초)로 폴백.
 * 의도적으로 throw 하지 않는다 — 잘못된 schoolId 가 넘어와도 서비스는 동작해야 한다.
 */
export function getSchool(id?: string | null): SchoolConfig {
  if (id && SCHOOLS[id]) return SCHOOLS[id];
  return SCHOOLS[DEFAULT_SCHOOL_ID];
}

/** 등록된 모든 학교. cron 등에서 순회 용도. */
export function listSchools(): SchoolConfig[] {
  return Object.values(SCHOOLS);
}
