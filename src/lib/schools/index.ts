/**
 * 학교 메타 레지스트리. (Stage 14-2 분리, 2026-05-02)
 *
 * 북극성: 전국 초·중·고로 확장. 새 학교 추가는 자치구별 파일에 한 항목 등록으로 끝나야 한다.
 *
 * 디렉터리 구조:
 *   gyeonggi.ts          — 경기 75교 (과천·의왕·안양·군포)
 *   seoul/seocho.ts      — 서울 서초구 24교
 *   seoul/dongjak.ts     — 서울 동작구 (Stage 14-2)
 *   seoul/gangnam.ts     — 서울 강남구 34교 (Stage 14-4)
 *   seoul/songpa.ts      — 서울 송파구 41교 (Stage 14-5)
 *   seoul/gangdong.ts    — 서울 강동구 29교 (Stage 14-6)
 *   seoul/geumcheon.ts   — 서울 금천구 18교 (Stage 14-7)
 *   seoul/yeongdeungpo.ts — 서울 영등포구 23교 (Stage 14-8)
 *   seoul/guro.ts        — 서울 구로구 27교 (Stage 14-9, 1교 scrape 생략)
 *   seoul/yangcheon.ts   — 서울 양천구 30교 (Stage 14-10)
 *   seoul/gangseo.ts     — 서울 강서구 35교 (Stage 14-11)
 *   seoul/nowon.ts       — 서울 노원구 42교 (Stage 14-12)
 *   seoul/<자치구>.ts    — Phase A~E 진행하며 추가
 *
 * Stage 3 에서 사진 미러를 켜면 'scrape' 가 있는 학교만 미러 대상이 된다.
 * NEIS 만 지원하는 학교(다른 시도 교육청 도메인 등)는 'scrape' 생략 가능 — 메뉴는 보이고
 * 사진은 안 보인다.
 */

import type { SchoolScrape } from '../schoolScraper';
import { GYEONGGI_SCHOOLS } from './gyeonggi';
import { SEOCHO_SCHOOLS } from './seoul/seocho';
import { DONGJAK_SCHOOLS } from './seoul/dongjak';
import { GWANAK_SCHOOLS } from './seoul/gwanak';
import { GANGNAM_SCHOOLS } from './seoul/gangnam';
import { SONGPA_SCHOOLS } from './seoul/songpa';
import { GANGDONG_SCHOOLS } from './seoul/gangdong';
import { GEUMCHEON_SCHOOLS } from './seoul/geumcheon';
import { YEONGDEUNGPO_SCHOOLS } from './seoul/yeongdeungpo';
import { GURO_SCHOOLS } from './seoul/guro';
import { YANGCHEON_SCHOOLS } from './seoul/yangcheon';
import { GANGSEO_SCHOOLS } from './seoul/gangseo';
import { NOWON_SCHOOLS } from './seoul/nowon';

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
  /**
   * 학교 홈페이지 사진 스크래퍼 설정.
   * `kind` 로 도메인 분기 (`'goeay'` 경기 / `'sen-es'` 서울 / `'sajip-bbs'` 사립).
   * 생략 시 메뉴는 보이고 사진은 안 보임 (NEIS only).
   */
  scrape?: SchoolScrape;
}

export const SCHOOLS: Record<string, SchoolConfig> = {
  ...GYEONGGI_SCHOOLS,
  ...SEOCHO_SCHOOLS,
  ...DONGJAK_SCHOOLS,
  ...GWANAK_SCHOOLS,
  ...GANGNAM_SCHOOLS,
  ...SONGPA_SCHOOLS,
  ...GANGDONG_SCHOOLS,
  ...GEUMCHEON_SCHOOLS,
  ...YEONGDEUNGPO_SCHOOLS,
  ...GURO_SCHOOLS,
  ...YANGCHEON_SCHOOLS,
  ...GANGSEO_SCHOOLS,
  ...NOWON_SCHOOLS,
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
