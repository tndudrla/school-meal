/**
 * 서울 중구 12교 — Stage 14-19 (2026-05-03), Phase D 세 번째 자치구.
 *
 * 11교 sen.es.kr + 1교 (리라초) host www.lila.es.kr → scrape 생략.
 * 동산초·숭의초 등 사립도 host sen.es.kr 라 등록 가능.
 */

import type { SchoolConfig } from '../index';

export const JUNG_SCHOOLS: Record<string, SchoolConfig> = {
  dongsan_jg: {
    id: 'dongsan_jg',
    name: '동산초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061054' },
    scrape: { kind: 'sen-es', host: 'seoul-dongsan.sen.es.kr' },
  },
  lila: {
    id: 'lila',
    name: '리라초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061055' },
    // scrape 생략 — host = www.lila.es.kr (사립). NEIS 메뉴만, 사진 미지원.
  },
  seoul_gwanghee: {
    id: 'seoul_gwanghee',
    name: '서울광희초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061057' },
    scrape: { kind: 'sen-es', host: 'gwanghee.sen.es.kr' },
  },
  seoul_namsan: {
    id: 'seoul_namsan',
    name: '서울남산초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061060' },
    scrape: { kind: 'sen-es', host: 'namsan.sen.es.kr' },
  },
  seoul_deoksoo: {
    id: 'seoul_deoksoo',
    name: '서울덕수초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061062' },
    scrape: { kind: 'sen-es', host: 'deoksoo.sen.es.kr' },
  },
  seoul_bongrae: {
    id: 'seoul_bongrae',
    name: '서울봉래초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061067' },
    scrape: { kind: 'sen-es', host: 'seoul-bongrae.sen.es.kr' },
  },
  seoul_sindang: {
    id: 'seoul_sindang',
    name: '서울신당초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061072' },
    scrape: { kind: 'sen-es', host: 'shindang.sen.es.kr' },
  },
  seoul_jangchung: {
    id: 'seoul_jangchung',
    name: '서울장충초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061078' },
    scrape: { kind: 'sen-es', host: 'jangchung.sen.es.kr' },
  },
  seoul_cheonggu: {
    id: 'seoul_cheonggu',
    name: '서울청구초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061081' },
    scrape: { kind: 'sen-es', host: 'cheonggu.sen.es.kr' },
  },
  seoul_chungmu: {
    id: 'seoul_chungmu',
    name: '서울충무초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061084' },
    scrape: { kind: 'sen-es', host: 'seoulchungmu.sen.es.kr' },
  },
  seoul_heungin: {
    id: 'seoul_heungin',
    name: '서울흥인초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061090' },
    scrape: { kind: 'sen-es', host: 'heungin.sen.es.kr' },
  },
  soongeui: {
    id: 'soongeui',
    name: '숭의초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061091' },
    scrape: { kind: 'sen-es', host: 'soongeui.sen.es.kr' },
  },
};
