/**
 * 서울 종로구 13교 — Stage 14-18 (2026-05-03), Phase D 두 번째 자치구.
 *
 * 모두 sen.es.kr. 사립 다수 (상명대부속·서울대부설·운현) 도 host sen.es.kr.
 */

import type { SchoolConfig } from '../index';

export const JONGNO_SCHOOLS: Record<string, SchoolConfig> = {
  sangmyung_es: {
    id: 'sangmyung_es',
    name: '상명대학교사범대학부속초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061056' },
    scrape: { kind: 'sen-es', host: 'sangmyung-ae.sen.es.kr' },
  },
  seoul_kyodong: {
    id: 'seoul_kyodong',
    name: '서울교동초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061058' },
    scrape: { kind: 'sen-es', host: 'kyodong.sen.es.kr' },
  },
  snu_es: {
    id: 'snu_es',
    name: '서울대학교사범대학부설초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061128' },
    scrape: { kind: 'sen-es', host: 'snu.sen.es.kr' },
  },
  seoul_dongnimmun: {
    id: 'seoul_dongnimmun',
    name: '서울독립문초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061063' },
    scrape: { kind: 'sen-es', host: 'dnm.sen.es.kr' },
  },
  seoul_maedong_jr: {
    id: 'seoul_maedong_jr',
    name: '서울매동초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061064' },
    scrape: { kind: 'sen-es', host: 'maedong.sen.es.kr' },
  },
  seoul_myungshin: {
    id: 'seoul_myungshin',
    name: '서울명신초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061065' },
    scrape: { kind: 'sen-es', host: 'myungshin.sen.es.kr' },
  },
  seoul_segumjung: {
    id: 'seoul_segumjung',
    name: '서울세검정초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061070' },
    scrape: { kind: 'sen-es', host: 'segumjung.sen.es.kr' },
  },
  seoul_jaedong: {
    id: 'seoul_jaedong',
    name: '서울재동초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061079' },
    scrape: { kind: 'sen-es', host: 'jaedong.sen.es.kr' },
  },
  seoul_changshin: {
    id: 'seoul_changshin',
    name: '서울창신초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061080' },
    scrape: { kind: 'sen-es', host: 'chang-shin.sen.es.kr' },
  },
  seoul_chungwoon: {
    id: 'seoul_chungwoon',
    name: '서울청운초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061082' },
    scrape: { kind: 'sen-es', host: 'chungwoon.sen.es.kr' },
  },
  seoul_hyehwa: {
    id: 'seoul_hyehwa',
    name: '서울혜화초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061087' },
    scrape: { kind: 'sen-es', host: 'hyehwa.sen.es.kr' },
  },
  seoul_hyoje: {
    id: 'seoul_hyoje',
    name: '서울효제초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061088' },
    scrape: { kind: 'sen-es', host: 'hyoje.sen.es.kr' },
  },
  unhyun: {
    id: 'unhyun',
    name: '운현초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061093' },
    scrape: { kind: 'sen-es', host: 'unhyun.sen.es.kr' },
  },
};
