/**
 * 서울 강북구 14교 — Stage 14-25 (2026-05-03), Phase E 마지막 자치구.
 *
 * 13교 sen.es.kr + 1교 (영훈초 사립) host younghoon.es.kr → scrape 생략.
 *
 * 본 stage 완료 = 서울 25개 자치구 전체 등록 완료.
 */

import type { SchoolConfig } from '../index';

export const GANGBUK_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_miyang: {
    id: 'seoul_miyang',
    name: '서울미양초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121304' },
    scrape: { kind: 'sen-es', host: 'mi-yang.sen.es.kr' },
  },
  seoul_beondong: {
    id: 'seoul_beondong',
    name: '서울번동초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121305' },
    scrape: { kind: 'sen-es', host: 'beondong.sen.es.kr' },
  },
  seoul_samgaksan: {
    id: 'seoul_samgaksan',
    name: '서울삼각산초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121306' },
    scrape: { kind: 'sen-es', host: 'samgaksan.sen.es.kr' },
  },
  seoul_samyang: {
    id: 'seoul_samyang',
    name: '서울삼양초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121308' },
    scrape: { kind: 'sen-es', host: 'samyang.sen.es.kr' },
  },
  seoul_songjoong: {
    id: 'seoul_songjoong',
    name: '서울송중초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121312' },
    scrape: { kind: 'sen-es', host: 'songjoong.sen.es.kr' },
  },
  seoul_songcheon: {
    id: 'seoul_songcheon',
    name: '서울송천초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121313' },
    scrape: { kind: 'sen-es', host: 'song-cheon.sen.es.kr' },
  },
  seoul_soosong: {
    id: 'seoul_soosong',
    name: '서울수송초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121314' },
    scrape: { kind: 'sen-es', host: 'soosong.sen.es.kr' },
  },
  seoul_suyu: {
    id: 'seoul_suyu',
    name: '서울수유초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121315' },
    scrape: { kind: 'sen-es', host: 'suyu.sen.es.kr' },
  },
  seoul_ohhyun: {
    id: 'seoul_ohhyun',
    name: '서울오현초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121321' },
    scrape: { kind: 'sen-es', host: 'ohhyun.sen.es.kr' },
  },
  seoul_wooi: {
    id: 'seoul_wooi',
    name: '서울우이초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121322' },
    scrape: { kind: 'sen-es', host: 'wooi.sen.es.kr' },
  },
  seoul_youhyeon: {
    id: 'seoul_youhyeon',
    name: '서울유현초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121324' },
    scrape: { kind: 'sen-es', host: 'youhyeon.sen.es.kr' },
  },
  seoul_insu: {
    id: 'seoul_insu',
    name: '서울인수초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121325' },
    scrape: { kind: 'sen-es', host: 'insu.sen.es.kr' },
  },
  seoul_hwagye: {
    id: 'seoul_hwagye',
    name: '서울화계초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121334' },
    scrape: { kind: 'sen-es', host: 'hwagye.sen.es.kr' },
  },
  younghoon_es: {
    id: 'younghoon_es',
    name: '영훈초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121339' },
    // scrape 생략 — host = www.younghoon.es.kr (사립). NEIS 메뉴만.
  },
};
