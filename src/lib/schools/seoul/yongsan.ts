/**
 * 서울 용산구 15교 — Stage 14-17 (2026-05-03), Phase D 첫 자치구.
 *
 * 모두 sen.es.kr. 신광초 (사립, 서울 prefix 없음) 도 host sen.es.kr.
 * id 충돌 없음.
 */

import type { SchoolConfig } from '../index';

export const YONGSAN_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_keumyang: {
    id: 'seoul_keumyang',
    name: '서울금양초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061059' },
    scrape: { kind: 'sen-es', host: 'keumyang.sen.es.kr' },
  },
  seoul_namjeong: {
    id: 'seoul_namjeong',
    name: '서울남정초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061061' },
    scrape: { kind: 'sen-es', host: 'seoul-nj.sen.es.kr' },
  },
  seoul_bogwang: {
    id: 'seoul_bogwang',
    name: '서울보광초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061066' },
    scrape: { kind: 'sen-es', host: 'bogwang.sen.es.kr' },
  },
  seoul_samkwang: {
    id: 'seoul_samkwang',
    name: '서울삼광초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061068' },
    scrape: { kind: 'sen-es', host: 'seoulsamkwang.sen.es.kr' },
  },
  seoul_seobinggo: {
    id: 'seoul_seobinggo',
    name: '서울서빙고초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061069' },
    scrape: { kind: 'sen-es', host: 'seobinggo.sen.es.kr' },
  },
  seoul_sinyongsan: {
    id: 'seoul_sinyongsan',
    name: '서울신용산초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061073' },
    scrape: { kind: 'sen-es', host: 'sys.sen.es.kr' },
  },
  seoul_yongsan: {
    id: 'seoul_yongsan',
    name: '서울용산초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061074' },
    scrape: { kind: 'sen-es', host: 'yongsan.sen.es.kr' },
  },
  seoul_yongam: {
    id: 'seoul_yongam',
    name: '서울용암초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061075' },
    scrape: { kind: 'sen-es', host: 'yongam.sen.es.kr' },
  },
  seoul_wonhyo: {
    id: 'seoul_wonhyo',
    name: '서울원효초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061076' },
    scrape: { kind: 'sen-es', host: 'wonhyo.sen.es.kr' },
  },
  seoul_itaewon: {
    id: 'seoul_itaewon',
    name: '서울이태원초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061077' },
    scrape: { kind: 'sen-es', host: 'itaewon.sen.es.kr' },
  },
  seoul_cheongpa: {
    id: 'seoul_cheongpa',
    name: '서울청파초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061083' },
    scrape: { kind: 'sen-es', host: 's-cheongpa.sen.es.kr' },
  },
  seoul_hangang: {
    id: 'seoul_hangang',
    name: '서울한강초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061085' },
    scrape: { kind: 'sen-es', host: 'hangang.sen.es.kr' },
  },
  seoul_hannam: {
    id: 'seoul_hannam',
    name: '서울한남초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061086' },
    scrape: { kind: 'sen-es', host: 'hannam.sen.es.kr' },
  },
  seoul_huam: {
    id: 'seoul_huam',
    name: '서울후암초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061089' },
    scrape: { kind: 'sen-es', host: 'huam.sen.es.kr' },
  },
  singwang: {
    id: 'singwang',
    name: '신광초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061092' },
    scrape: { kind: 'sen-es', host: 'skes.sen.es.kr' },
  },
};
