# 학교 등록·사진 현황

> 자동 생성: `scripts/generate-school-status.mjs`
> 측정 기준: 2026년 4월 평일 (전체) 중 하루라도 사진 있으면 ✅.
> 마지막 갱신: 2026-05-02 (기준 ymd 20260428)

## 요약

- 등록: **685교**
- 사진 가능 ✅: **654교** (95.5%)
- 사진 실패 ⬜: 24교 (학교 미업로드 또는 외부 차단)
- scrape 미지원 ➖: 7교 (NEIS 메뉴만)

## 수작업 확인 대상

자치구 표 안 ⬜/➖ 만 한 곳에 모아 둠. 학교 사이트 직접 들어가 확인 후
`scripts/generate-school-status.mjs` 의 `VERIFIED_REASONS` 갱신 → 재실행.

### 사진 실패 ⬜ — 24교

학교 미업로드, 외부 접근 차단, 다른 뷰어 등 원인 다양. 한 학교씩 확인.

| id | 학교 | 자치구 | 비고 |
|---|---|---|---|
| `kwanmun` | 관문초등학교 | 경기 과천 | 미업로드 (사용자 확인 2026-05-02) |
| `kwanyang` | 관양초등학교 | 경기 안양 | 외부 접근 차단 (사용자 확인 2026-05-02 — "잘못된 접속 정보" alert) |
| `seoul_banpo` | 서울반포초등학교 | 서울 서초 | 미업로드 (사용자 확인 2026-05-02) |
| `seoul_bondong` | 서울본동초등학교 | 서울 동작 | 4월 전체 미업로드 (자동 검증 2026-05-02 — 평일 22일 모두 0건) |
| `seoul_heukseok` | 서울흑석초등학교 | 서울 동작 | 4월 전체 미업로드 (자동 검증 2026-05-02 — 평일 22일 모두 0건) |
| `seoul_cau` | 중앙대학교사범대학부속초등학교 | 서울 동작 | 4월 전체 미업로드 (자동 검증 2026-05-02 — 평일 22일 모두 0건) |
| `seoul_daecheong` | 서울대청초등학교 | 서울 강남 | 미업로드 (사용자 확인 2026-05-02) |
| `seoul_bongeun` | 서울봉은초등학교 | 서울 강남 | 미업로드 (사용자 확인 2026-05-02) |
| `seoul_yulhyeon` | 서울율현초등학교 | 서울 강남 | 외부 뷰어 사용 (사용자 확인 2026-05-02 — viewhosting.ssem.or.kr blob URL, 현행 sen-es scraper 미지원, 별도 조사 TODO) |
| `seoul_gaerong` | 서울개롱초등학교 | 서울 송파 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_geumdong` | 서울금동초등학교 | 서울 금천 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_youngwon` | 서울영원초등학교 | 서울 영등포 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_singang` | 서울신강초등학교 | 서울 양천 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_mapo` | 서울마포초등학교 | 서울 마포 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_hongik` | 홍익대학교사범대학부속초등학교 | 서울 마포 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_susaek` | 서울수색초등학교 | 서울 은평 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_bogwang` | 서울보광초등학교 | 서울 용산 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_sinyongsan` | 서울신용산초등학교 | 서울 용산 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_itaewon` | 서울이태원초등학교 | 서울 용산 | 미업로드 또는 외부 차단 (미확인) |
| `kyunghee_es` | 경희초등학교 | 서울 동대문 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_yongdu` | 서울용두초등학교 | 서울 동대문 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_myunjoong` | 서울면중초등학교 | 서울 중랑 | 미업로드 또는 외부 차단 (미확인) |
| `seoul_miyang` | 서울미양초등학교 | 서울 강북 | 미업로드 또는 외부 차단 (미확인) |
| `dongbuk` | 동북초등학교 | 서울 도봉 | 미업로드 또는 외부 차단 (미확인) |

### scrape 미지원 ➖ — 7교

NEIS 메뉴만 노출 (의도된 상태). 다른 시도/사립 도메인이라 sen-es / goeay 스크래퍼 무관.
필요 시 스크래퍼 추가 개발 후 `scrape` 필드 채우면 됨.

| id | 학교 | 자치구 | 비고 |
|---|---|---|---|
| `seoul_cheoni` | 서울천이초등학교 | 서울 구로 | NEIS 메뉴만 (사진 미지원 의도) |
| `myongji` | 명지초등학교 | 서울 서대문 | NEIS 메뉴만 (사진 미지원 의도) |
| `hanyang_es` | 한양초등학교 | 서울 성동 | NEIS 메뉴만 (사진 미지원 의도) |
| `gyeongbok_es` | 경복초등학교 | 서울 광진 | NEIS 메뉴만 (사진 미지원 의도) |
| `kumsung_es` | 금성초등학교 | 서울 중랑 | NEIS 메뉴만 (사진 미지원 의도) |
| `younghoon_es` | 영훈초등학교 | 서울 강북 | NEIS 메뉴만 (사진 미지원 의도) |
| `lila` | 리라초등학교 | 서울 중구 | NEIS 메뉴만 (사진 미지원 의도) |

## 자치구별 현황

### 경기 과천 — 5/6 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `gwacheon` | 과천초등학교 | (goeay) |
| ⬜ | `kwanmun` | 관문초등학교 | 미업로드 (사용자 확인 2026-05-02) |
| ✅ | `munwon` | 문원초등학교 | (goeay) |
| ✅ | `chonggye` | 청계초등학교 | (goeay) |
| ✅ | `gcgh` | 과천갈현초등학교 | (goeay) |
| ✅ | `yulmok` | 과천율목초등학교 | (goeay) |

### 경기 의왕 — 15/15 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `galmoe` | 갈뫼초등학교 | (goeay) |
| ✅ | `gocheon` | 고천초등학교 | (goeay) |
| ✅ | `naedong` | 내동초등학교 | (goeay) |
| ✅ | `naeson` | 내손초등학교 | (goeay) |
| ✅ | `deokjang` | 덕장초등학교 | (goeay) |
| ✅ | `morak` | 모락초등학교 | (goeay) |
| ✅ | `baekwoon` | 백운초등학교 | (goeay) |
| ✅ | `baekunhosu` | 백운호수초등학교 | (goeay) |
| ✅ | `ojeon` | 오전초등학교 | (goeay) |
| ✅ | `wanggok` | 왕곡초등학교 | (goeay) |
| ✅ | `uiwangdeokseong` | 의왕덕성초등학교 | (goeay) |
| ✅ | `uiwangbugok` | 의왕부곡초등학교 | (goeay) |
| ✅ | `uiwang` | 의왕초등학교 | (goeay) |
| ✅ | `uiwangpureun` | 의왕푸른초등학교 | (goeay) |
| ✅ | `poil` | 포일초등학교 | (goeay) |

### 경기 안양 — 40/41 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ⬜ | `kwanyang` | 관양초등학교 | 외부 접근 차단 (사용자 확인 2026-05-02 — "잘못된 접속 정보" alert) |
| ✅ | `kwiin` | 귀인초등학교 | (goeay) |
| ✅ | `nanum` | 나눔초등학교 | (goeay) |
| ✅ | `daran` | 달안초등학교 | (goeay) |
| ✅ | `dongan` | 동안초등학교 | (goeay) |
| ✅ | `minbaeg` | 민백초등학교 | (goeay) |
| ✅ | `beolmal` | 벌말초등학교 | (goeay) |
| ✅ | `bumgye` | 범계초등학교 | (goeay) |
| ✅ | `burim` | 부림초등학교 | (goeay) |
| ✅ | `bisan` | 비산초등학교 | (goeay) |
| ✅ | `sammoru` | 샘모루초등학교 | (goeay) |
| ✅ | `kwanak` | 안양관악초등학교 | (goeay) |
| ✅ | `aynam` | 안양남초등학교 | (goeay) |
| ✅ | `aydh` | 안양덕현초등학교 | (goeay) |
| ✅ | `anyangdong` | 안양동초등학교 | (goeay) |
| ✅ | `aybuan` | 안양부안초등학교 | (goeay) |
| ✅ | `buheung` | 안양부흥초등학교 | (goeay) |
| ✅ | `ayshingi` | 안양신기초등학교 | (goeay) |
| ✅ | `ayja` | 안양중앙초등학교 | (goeay) |
| ✅ | `indeogwon` | 인덕원초등학교 | (goeay) |
| ✅ | `pc` | 평촌초등학교 | (goeay) |
| ✅ | `haeoleum` | 해오름초등학교 | (goeay) |
| ✅ | `ayhogye` | 호계초등학교 | (goeay) |
| ✅ | `hoseong` | 호성초등학교 | (goeay) |
| ✅ | `howon` | 호원초등학교 | (goeay) |
| ✅ | `heesung` | 희성초등학교 | (goeay) |
| ✅ | `dukchon` | 덕천초등학교 | (goeay) |
| ✅ | `manan` | 만안초등학교 | (goeay) |
| ✅ | `myeonghak` | 명학초등학교 | (goeay) |
| ✅ | `bakdal` | 박달초등학교 | (goeay) |
| ✅ | `sambong` | 삼봉초등학교 | (goeay) |
| ✅ | `samsung` | 삼성초등학교 | (goeay) |
| ✅ | `suksu` | 석수초등학교 | (goeay) |
| ✅ | `sinan` | 신안초등학교 | (goeay) |
| ✅ | `ayseo` | 안양서초등학교 | (goeay) |
| ✅ | `ayangji` | 안양양지초등학교 | (goeay) |
| ✅ | `anyang` | 안양초등학교 | (goeay) |
| ✅ | `ayhoam` | 안양호암초등학교 | (goeay) |
| ✅ | `anil` | 안일초등학교 | (goeay) |
| ✅ | `yeonhyeon` | 연현초등학교 | (goeay) |
| ✅ | `hwachang` | 화창초등학교 | (goeay) |

### 경기 군포 — 13/13 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `gunpo` | 군포초등학교 | (goeay) |
| ✅ | `geumjeong` | 금정초등학교 | (goeay) |
| ✅ | `sanbon` | 산본초등학교 | (goeay) |
| ✅ | `gunpoyangjeong` | 군포양정초등학교 | (goeay) |
| ✅ | `heungjin` | 흥진초등학교 | (goeay) |
| ✅ | `gwangjeong` | 광정초등학교 | (goeay) |
| ✅ | `neungnae` | 능내초등학교 | (goeay) |
| ✅ | `gungnae` | 궁내초등학교 | (goeay) |
| ✅ | `taeeul` | 태을초등학교 | (goeay) |
| ✅ | `ogeum` | 오금초등학교 | (goeay) |
| ✅ | `songan` | 송안초등학교 | (goeay) |
| ✅ | `gunpodaeya` | 군포대야초등학교 | (goeay) |
| ✅ | `haneol` | 한얼초등학교 | (goeay) |

### 서울 서초 — 23/24 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_gyeseong` | 계성초등학교 | (sajip-bbs) |
| ✅ | `seoul_snueps` | 서울교육대학교부설초등학교 | (sen-es) |
| ✅ | `seoul_maeheon` | 서울매헌초등학교 | (sen-es) |
| ✅ | `seoul_banwon` | 서울반원초등학교 | (sen-es) |
| ⬜ | `seoul_banpo` | 서울반포초등학교 | 미업로드 (사용자 확인 2026-05-02) |
| ✅ | `seoul_bangbae` | 서울방배초등학교 | (sen-es) |
| ✅ | `seoul_bangil` | 서울방일초등학교 | (sen-es) |
| ✅ | `seoul_banghyun` | 서울방현초등학교 | (sen-es) |
| ✅ | `seoul_seorae` | 서울서래초등학교 | (sen-es) |
| ✅ | `seoul_seowon` | 서울서원초등학교 | (sen-es) |
| ✅ | `seoul_seoi` | 서울서이초등학교 | (sen-es) |
| ✅ | `seoul_seoil` | 서울서일초등학교 | (sen-es) |
| ✅ | `seoul_seocho` | 서울서초초등학교 | (sen-es) |
| ✅ | `seoul_sindong` | 서울신동초등학교 | (sen-es) |
| ✅ | `seoul_sinjung` | 서울신중초등학교 | (sen-es) |
| ✅ | `seoul_yangjae` | 서울양재초등학교 | (sen-es) |
| ✅ | `seoul_eonnam` | 서울언남초등학교 | (sen-es) |
| ✅ | `seoul_woomyeon` | 서울우면초등학교 | (sen-es) |
| ✅ | `seoul_woosol` | 서울우솔초등학교 | (sen-es) |
| ✅ | `seoul_wooam` | 서울우암초등학교 | (sen-es) |
| ✅ | `seoul_wonmyong` | 서울원명초등학교 | (sen-es) |
| ✅ | `seoul_wonchon` | 서울원촌초등학교 | (sen-es) |
| ✅ | `seoul_isu` | 서울이수초등학교 | (sen-es) |
| ✅ | `seoul_jamwon` | 서울잠원초등학교 | (sen-es) |

### 서울 동작 — 18/21 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_gangnam` | 서울강남초등학교 | (sen-es) |
| ✅ | `seoul_namsa` | 서울남사초등학교 | (sen-es) |
| ✅ | `seoul_namsung` | 서울남성초등학교 | (sen-es) |
| ✅ | `seoul_noryangjin` | 서울노량진초등학교 | (sen-es) |
| ✅ | `seoul_daelim` | 서울대림초등학교 | (sen-es) |
| ✅ | `seoul_dongjak` | 서울동작초등학교 | (sen-es) |
| ✅ | `seoul_munchang` | 서울문창초등학교 | (sen-es) |
| ✅ | `seoul_boramae` | 서울보라매초등학교 | (sen-es) |
| ⬜ | `seoul_bondong` | 서울본동초등학교 | 4월 전체 미업로드 (자동 검증 2026-05-02 — 평일 22일 모두 0건) |
| ✅ | `seoul_samil` | 서울삼일초등학교 | (sen-es) |
| ✅ | `seoul_sangdo` | 서울상도초등학교 | (sen-es) |
| ✅ | `seoul_sanghyun` | 서울상현초등학교 | (sen-es) |
| ✅ | `seoul_singil` | 서울신길초등학교 | (sen-es) |
| ✅ | `seoul_shinnamsung` | 서울신남성초등학교 | (sen-es) |
| ✅ | `seoul_shinsangdo` | 서울신상도초등학교 | (sen-es) |
| ✅ | `seoul_yeongbon` | 서울영본초등학교 | (sen-es) |
| ✅ | `seoul_younghwa` | 서울영화초등학교 | (sen-es) |
| ✅ | `seoul_eunlo` | 서울은로초등학교 | (sen-es) |
| ✅ | `seoul_haenglim` | 서울행림초등학교 | (sen-es) |
| ⬜ | `seoul_heukseok` | 서울흑석초등학교 | 4월 전체 미업로드 (자동 검증 2026-05-02 — 평일 22일 모두 0건) |
| ⬜ | `seoul_cau` | 중앙대학교사범대학부속초등학교 | 4월 전체 미업로드 (자동 검증 2026-05-02 — 평일 22일 모두 0건) |

### 서울 관악 — 22/22 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_kwanak` | 서울관악초등학교 | (sen-es) |
| ✅ | `seoul_guam` | 서울구암초등학교 | (sen-es) |
| ✅ | `seoul_nangok` | 서울난곡초등학교 | (sen-es) |
| ✅ | `seoul_nanwoo` | 서울난우초등학교 | (sen-es) |
| ✅ | `seoul_nanhyang` | 서울난향초등학교 | (sen-es) |
| ✅ | `seoul_nambu` | 서울남부초등학교 | (sen-es) |
| ✅ | `seoul_danggok` | 서울당곡초등학교 | (sen-es) |
| ✅ | `seoul_misung` | 서울미성초등학교 | (sen-es) |
| ✅ | `seoul_bongcheon` | 서울봉천초등학교 | (sen-es) |
| ✅ | `seoul_bonghyun` | 서울봉현초등학교 | (sen-es) |
| ✅ | `seoul_sadang` | 서울사당초등학교 | (sen-es) |
| ✅ | `seoul_samseong` | 서울삼성초등학교 | (sen-es) |
| ✅ | `seoul_sillim` | 서울신림초등학교 | (sen-es) |
| ✅ | `seoul_sinbong` | 서울신봉초등학교 | (sen-es) |
| ✅ | `seoul_sinseong` | 서울신성초등학교 | (sen-es) |
| ✅ | `seoul_sinwoo` | 서울신우초등학교 | (sen-es) |
| ✅ | `seoul_wondang` | 서울원당초등학교 | (sen-es) |
| ✅ | `seoul_wonshin` | 서울원신초등학교 | (sen-es) |
| ✅ | `seoul_euncheon` | 서울은천초등학교 | (sen-es) |
| ✅ | `seoul_inhun` | 서울인헌초등학교 | (sen-es) |
| ✅ | `seoul_jowon` | 서울조원초등학교 | (sen-es) |
| ✅ | `seoul_chungryong` | 서울청룡초등학교 | (sen-es) |

### 서울 강남 — 31/34 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_gaewon` | 서울개원초등학교 | (sen-es) |
| ✅ | `seoul_gaeil` | 서울개일초등학교 | (sen-es) |
| ✅ | `seoul_gaepo` | 서울개포초등학교 | (sen-es) |
| ✅ | `seoul_gaehyeon` | 서울개현초등학교 | (sen-es) |
| ✅ | `seoul_kuryong` | 서울구룡초등학교 | (sen-es) |
| ✅ | `seoul_nonhyun` | 서울논현초등학교 | (sen-es) |
| ✅ | `seoul_daegok` | 서울대곡초등학교 | (sen-es) |
| ✅ | `seoul_daedo` | 서울대도초등학교 | (sen-es) |
| ✅ | `seoul_daemo` | 서울대모초등학교 | (sen-es) |
| ✅ | `seoul_daewang` | 서울대왕초등학교 | (sen-es) |
| ✅ | `seoul_daejin` | 서울대진초등학교 | (sen-es) |
| ⬜ | `seoul_daecheong` | 서울대청초등학교 | 미업로드 (사용자 확인 2026-05-02) |
| ✅ | `seoul_daechi` | 서울대치초등학교 | (sen-es) |
| ✅ | `seoul_daehyun` | 서울대현초등학교 | (sen-es) |
| ✅ | `seoul_dogok` | 서울도곡초등학교 | (sen-es) |
| ✅ | `seoul_doseong` | 서울도성초등학교 | (sen-es) |
| ⬜ | `seoul_bongeun` | 서울봉은초등학교 | 미업로드 (사용자 확인 2026-05-02) |
| ✅ | `seoul_samneung` | 서울삼릉초등학교 | (sen-es) |
| ✅ | `seoul_semyung` | 서울세명초등학교 | (sen-es) |
| ✅ | `seoul_suseo` | 서울수서초등학교 | (sen-es) |
| ✅ | `seoul_shingu` | 서울신구초등학교 | (sen-es) |
| ✅ | `seoul_apgujeong` | 서울압구정초등학교 | (sen-es) |
| ✅ | `seoul_yangjeon` | 서울양전초등학교 | (sen-es) |
| ✅ | `seoul_eonbuk` | 서울언북초등학교 | (sen-es) |
| ✅ | `seoul_eonju` | 서울언주초등학교 | (sen-es) |
| ✅ | `seoul_yeoksam` | 서울역삼초등학교 | (sen-es) |
| ✅ | `seoul_younghee` | 서울영희초등학교 | (sen-es) |
| ✅ | `seoul_wangbuk` | 서울왕북초등학교 | (sen-es) |
| ⬜ | `seoul_yulhyeon` | 서울율현초등학교 | 외부 뷰어 사용 (사용자 확인 2026-05-02 — viewhosting.ssem.or.kr blob URL, 현행 sen-es scraper 미지원, 별도 조사 TODO) |
| ✅ | `seoul_ilwon` | 서울일원초등학교 | (sen-es) |
| ✅ | `seoul_jagok` | 서울자곡초등학교 | (sen-es) |
| ✅ | `seoul_cheongdam` | 서울청담초등학교 | (sen-es) |
| ✅ | `seoul_poi` | 서울포이초등학교 | (sen-es) |
| ✅ | `seoul_hakdong` | 서울학동초등학교 | (sen-es) |

### 서울 송파 — 40/41 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_gadong` | 서울가동초등학교 | (sen-es) |
| ✅ | `seoul_garak` | 서울가락초등학교 | (sen-es) |
| ✅ | `seoul_gawon` | 서울가원초등학교 | (sen-es) |
| ✅ | `seoul_gaju` | 서울가주초등학교 | (sen-es) |
| ⬜ | `seoul_gaerong` | 서울개롱초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_geoyeo` | 서울거여초등학교 | (sen-es) |
| ✅ | `seoul_geowon` | 서울거원초등학교 | (sen-es) |
| ✅ | `seoul_namcheon` | 서울남천초등학교 | (sen-es) |
| ✅ | `seoul_macheon` | 서울마천초등학교 | (sen-es) |
| ✅ | `seoul_moondeok` | 서울문덕초등학교 | (sen-es) |
| ✅ | `seoul_moonjung` | 서울문정초등학교 | (sen-es) |
| ✅ | `seoul_moonhyeon` | 서울문현초등학교 | (sen-es) |
| ✅ | `seoul_bangsan` | 서울방산초등학교 | (sen-es) |
| ✅ | `seoul_bangi` | 서울방이초등학교 | (sen-es) |
| ✅ | `seoul_beodle` | 서울버들초등학교 | (sen-es) |
| ✅ | `seoul_samjeon` | 서울삼전초등학교 | (sen-es) |
| ✅ | `seoul_seokchon` | 서울석촌초등학교 | (sen-es) |
| ✅ | `seoul_seryun` | 서울세륜초등학교 | (sen-es) |
| ✅ | `seoul_songrye` | 서울송례초등학교 | (sen-es) |
| ✅ | `seoul_songjeon` | 서울송전초등학교 | (sen-es) |
| ✅ | `seoul_songpa` | 서울송파초등학교 | (sen-es) |
| ✅ | `seoul_singa` | 서울신가초등학교 | (sen-es) |
| ✅ | `seoul_sincheon` | 서울신천초등학교 | (sen-es) |
| ✅ | `seoul_aju` | 서울아주초등학교 | (sen-es) |
| ✅ | `seoul_youngpung` | 서울영풍초등학교 | (sen-es) |
| ✅ | `seoul_ogum` | 서울오금초등학교 | (sen-es) |
| ✅ | `seoul_oryun` | 서울오륜초등학교 | (sen-es) |
| ✅ | `seoul_westar` | 서울위례별초등학교 | (sen-es) |
| ✅ | `seoul_wiryesol` | 서울위례솔초등학교 | (sen-es) |
| ✅ | `seoul_jamdong` | 서울잠동초등학교 | (sen-es) |
| ✅ | `seoul_jamshin` | 서울잠신초등학교 | (sen-es) |
| ✅ | `seoul_jamsil` | 서울잠실초등학교 | (sen-es) |
| ✅ | `seoul_jamil` | 서울잠일초등학교 | (sen-es) |
| ✅ | `seoul_jamjeon` | 서울잠전초등학교 | (sen-es) |
| ✅ | `seoul_jamhyun` | 서울잠현초등학교 | (sen-es) |
| ✅ | `seoul_joongdae` | 서울중대초등학교 | (sen-es) |
| ✅ | `seoul_tosung` | 서울토성초등학교 | (sen-es) |
| ✅ | `seoul_pyunghwa` | 서울평화초등학교 | (sen-es) |
| ✅ | `seoul_poongnap` | 서울풍납초등학교 | (sen-es) |
| ✅ | `seoul_poongsung` | 서울풍성초등학교 | (sen-es) |
| ✅ | `seoul_haenuri` | 서울해누리초등학교 | (sen-es) |

### 서울 강동 — 29/29 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_gangdeok` | 서울강덕초등학교 | (sen-es) |
| ✅ | `seoul_gangdong` | 서울강동초등학교 | (sen-es) |
| ✅ | `seoul_gangmyeong` | 서울강명초등학교 | (sen-es) |
| ✅ | `seoul_gangbit` | 서울강빛초등학교 | (sen-es) |
| ✅ | `seoul_gangsol` | 서울강솔초등학교 | (sen-es) |
| ✅ | `seoul_gangil` | 서울강일초등학교 | (sen-es) |
| ✅ | `seoul_goduk` | 서울고덕초등학교 | (sen-es) |
| ✅ | `seoul_gomyung` | 서울고명초등학교 | (sen-es) |
| ✅ | `seoul_goil` | 서울고일초등학교 | (sen-es) |
| ✅ | `seoul_gohyeon` | 서울고현초등학교 | (sen-es) |
| ✅ | `seoul_gildong` | 서울길동초등학교 | (sen-es) |
| ✅ | `seoul_daemyeong` | 서울대명초등학교 | (sen-es) |
| ✅ | `seoul_doonchon` | 서울둔촌초등학교 | (sen-es) |
| ✅ | `seoul_myungduk` | 서울명덕초등학교 | (sen-es) |
| ✅ | `seoul_myongwon` | 서울명원초등학교 | (sen-es) |
| ✅ | `seoul_myeongil` | 서울명일초등학교 | (sen-es) |
| ✅ | `seoul_myogok` | 서울묘곡초등학교 | (sen-es) |
| ✅ | `seoul_sangil` | 서울상일초등학교 | (sen-es) |
| ✅ | `seoul_sunrin` | 서울선린초등학교 | (sen-es) |
| ✅ | `seoul_sunsa` | 서울선사초등학교 | (sen-es) |
| ✅ | `seoul_seongnae` | 서울성내초등학교 | (sen-es) |
| ✅ | `seoul_seongil` | 서울성일초등학교 | (sen-es) |
| ✅ | `seoul_shinmyung` | 서울신명초등학교 | (sen-es) |
| ✅ | `seoul_shinam` | 서울신암초등학교 | (sen-es) |
| ✅ | `seoul_wirye` | 서울위례초등학교 | (sen-es) |
| ✅ | `seoul_cheondong` | 서울천동초등학교 | (sen-es) |
| ✅ | `seoul_chunil` | 서울천일초등학교 | (sen-es) |
| ✅ | `seoul_chunho` | 서울천호초등학교 | (sen-es) |
| ✅ | `seoul_hansan` | 서울한산초등학교 | (sen-es) |

### 서울 금천 — 17/18 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `donggwang` | 동광초등학교 | (sen-es) |
| ✅ | `seoul_gasan` | 서울가산초등학교 | (sen-es) |
| ✅ | `seoul_geumnarae` | 서울금나래초등학교 | (sen-es) |
| ⬜ | `seoul_geumdong` | 서울금동초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_geumsan` | 서울금산초등학교 | (sen-es) |
| ✅ | `seoul_geumcheon` | 서울금천초등학교 | (sen-es) |
| ✅ | `seoul_doksan` | 서울독산초등학교 | (sen-es) |
| ✅ | `seoul_doosan` | 서울두산초등학교 | (sen-es) |
| ✅ | `seoul_mungyo` | 서울문교초등학교 | (sen-es) |
| ✅ | `seoul_munbaek` | 서울문백초등학교 | (sen-es) |
| ✅ | `seoul_munsung` | 서울문성초등학교 | (sen-es) |
| ✅ | `seoul_backsan` | 서울백산초등학교 | (sen-es) |
| ✅ | `seoul_siheung` | 서울시흥초등학교 | (sen-es) |
| ✅ | `seoul_sinheung` | 서울신흥초등학교 | (sen-es) |
| ✅ | `seoul_ancheon` | 서울안천초등학교 | (sen-es) |
| ✅ | `seoul_yeongnam` | 서울영남초등학교 | (sen-es) |
| ✅ | `seoul_jungshim` | 서울정심초등학교 | (sen-es) |
| ✅ | `seoul_topdong` | 서울탑동초등학교 | (sen-es) |

### 서울 영등포 — 22/23 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_dangsan` | 서울당산초등학교 | (sen-es) |
| ✅ | `seoul_dangseo` | 서울당서초등학교 | (sen-es) |
| ✅ | `seoul_dangjung` | 서울당중초등학교 | (sen-es) |
| ✅ | `seoul_daegil` | 서울대길초등학교 | (sen-es) |
| ✅ | `seoul_daedong` | 서울대동초등학교 | (sen-es) |
| ✅ | `seoul_daebang` | 서울대방초등학교 | (sen-es) |
| ✅ | `seoul_daeyoung` | 서울대영초등학교 | (sen-es) |
| ✅ | `seoul_dorim` | 서울도림초등학교 | (sen-es) |
| ✅ | `seoul_doshin` | 서울도신초등학교 | (sen-es) |
| ✅ | `seoul_mullae` | 서울문래초등학교 | (sen-es) |
| ✅ | `seoul_seonyu` | 서울선유초등학교 | (sen-es) |
| ✅ | `seoul_sindaerim` | 서울신대림초등학교 | (sen-es) |
| ✅ | `seoul_shinyoung` | 서울신영초등학교 | (sen-es) |
| ✅ | `seoul_yeouido` | 서울여의도초등학교 | (sen-es) |
| ✅ | `seoul_youngdong` | 서울영동초등학교 | (sen-es) |
| ✅ | `seoul_yeongdeungpo` | 서울영등포초등학교 | (sen-es) |
| ✅ | `seoul_younglim` | 서울영림초등학교 | (sen-es) |
| ✅ | `seoul_youngmoon` | 서울영문초등학교 | (sen-es) |
| ✅ | `seoul_youngsin` | 서울영신초등학교 | (sen-es) |
| ⬜ | `seoul_youngwon` | 서울영원초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_youngjoong` | 서울영중초등학교 | (sen-es) |
| ✅ | `seoul_usin` | 서울우신초등학교 | (sen-es) |
| ✅ | `seoul_yunjung` | 서울윤중초등학교 | (sen-es) |

### 서울 구로 — 26/27 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_kaemyong` | 서울개명초등학교 | (sen-es) |
| ✅ | `seoul_gaebong` | 서울개봉초등학교 | (sen-es) |
| ✅ | `seoul_gaewoong` | 서울개웅초등학교 | (sen-es) |
| ✅ | `seoul_kohsan` | 서울고산초등학교 | (sen-es) |
| ✅ | `seoul_gowon` | 서울고원초등학교 | (sen-es) |
| ✅ | `seoul_gocheok` | 서울고척초등학교 | (sen-es) |
| ✅ | `seoul_guronam` | 서울구로남초등학교 | (sen-es) |
| ✅ | `seoul_guro` | 서울구로초등학교 | (sen-es) |
| ✅ | `seoul_guil` | 서울구일초등학교 | (sen-es) |
| ✅ | `seoul_dukeui` | 서울덕의초등학교 | (sen-es) |
| ✅ | `seoul_dongguro` | 서울동구로초등학교 | (sen-es) |
| ✅ | `seoul_maebong` | 서울매봉초등학교 | (sen-es) |
| ✅ | `seoul_mirae` | 서울미래초등학교 | (sen-es) |
| ✅ | `seoul_segok` | 서울세곡초등학교 | (sen-es) |
| ✅ | `seoul_singuro` | 서울신구로초등학교 | (sen-es) |
| ✅ | `seoul_sindorim` | 서울신도림초등학교 | (sen-es) |
| ✅ | `seoul_sinmirim` | 서울신미림초등학교 | (sen-es) |
| ✅ | `seoul_youngseo` | 서울영서초등학교 | (sen-es) |
| ✅ | `seoul_youngil` | 서울영일초등학교 | (sen-es) |
| ✅ | `seoul_oryunam` | 서울오류남초등학교 | (sen-es) |
| ✅ | `seoul_oryu` | 서울오류초등학교 | (sen-es) |
| ✅ | `seoul_ojung` | 서울오정초등학교 | (sen-es) |
| ✅ | `seoul_onsu` | 서울온수초등학교 | (sen-es) |
| ✅ | `seoul_cheonwang` | 서울천왕초등학교 | (sen-es) |
| ➖ | `seoul_cheoni` | 서울천이초등학교 | NEIS 메뉴만 (사진 미지원 의도) |
| ✅ | `seoul_skyforest` | 서울하늘숲초등학교 | (sen-es) |
| ✅ | `seoul_hangdong` | 서울항동초등학교 | (sen-es) |

### 서울 양천 — 29/30 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_galsan` | 서울갈산초등학교 | (sen-es) |
| ✅ | `seoul_gangseo` | 서울강서초등학교 | (sen-es) |
| ✅ | `seoul_kangsin` | 서울강신초등학교 | (sen-es) |
| ✅ | `seoul_gangwol` | 서울강월초등학교 | (sen-es) |
| ✅ | `seoul_kyongin` | 서울경인초등학교 | (sen-es) |
| ✅ | `seoul_gyenam` | 서울계남초등학교 | (sen-es) |
| ✅ | `seoul_nammyeong` | 서울남명초등학교 | (sen-es) |
| ✅ | `seoul_mokdong` | 서울목동초등학교 | (sen-es) |
| ✅ | `seoul_mogun` | 서울목운초등학교 | (sen-es) |
| ✅ | `seoul_mokwon` | 서울목원초등학교 | (sen-es) |
| ✅ | `seoul_seojeong` | 서울서정초등학교 | (sen-es) |
| ⬜ | `seoul_singang` | 서울신강초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_singi` | 서울신기초등학교 | (sen-es) |
| ✅ | `seoul_sinnam` | 서울신남초등학교 | (sen-es) |
| ✅ | `seoul_sinmoc` | 서울신목초등학교 | (sen-es) |
| ✅ | `seoul_sinseo` | 서울신서초등학교 | (sen-es) |
| ✅ | `seoul_shinwon` | 서울신원초등학교 | (sen-es) |
| ✅ | `seoul_sineun` | 서울신은초등학교 | (sen-es) |
| ✅ | `seoul_yanggang` | 서울양강초등학교 | (sen-es) |
| ✅ | `seoul_yangdong` | 서울양동초등학교 | (sen-es) |
| ✅ | `seoul_yangmyung` | 서울양명초등학교 | (sen-es) |
| ✅ | `seoul_yangmok` | 서울양목초등학교 | (sen-es) |
| ✅ | `seoul_yangwon` | 서울양원초등학교 | (sen-es) |
| ✅ | `seoul_yanghwa` | 서울양화초등학교 | (sen-es) |
| ✅ | `seoul_youngdo` | 서울영도초등학교 | (sen-es) |
| ✅ | `seoul_wolchon` | 서울월촌초등학교 | (sen-es) |
| ✅ | `seoul_eunjung` | 서울은정초등학교 | (sen-es) |
| ✅ | `seoul_jangsoo` | 서울장수초등학교 | (sen-es) |
| ✅ | `seoul_jeongmok` | 서울정목초등학교 | (sen-es) |
| ✅ | `seoul_jihyang` | 서울지향초등학교 | (sen-es) |

### 서울 강서 — 35/35 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_gagok` | 서울가곡초등학교 | (sen-es) |
| ✅ | `seoul_kayang` | 서울가양초등학교 | (sen-es) |
| ✅ | `seoul_gaehwa` | 서울개화초등학교 | (sen-es) |
| ✅ | `seoul_kongjin` | 서울공진초등학교 | (sen-es) |
| ✅ | `seoul_konghang` | 서울공항초등학교 | (sen-es) |
| ✅ | `seoul_naebalsan` | 서울내발산초등학교 | (sen-es) |
| ✅ | `seoul_deungma` | 서울등마초등학교 | (sen-es) |
| ✅ | `seoul_dungmyong` | 서울등명초등학교 | (sen-es) |
| ✅ | `seoul_deungseo` | 서울등서초등학교 | (sen-es) |
| ✅ | `seoul_dungyang` | 서울등양초등학교 | (sen-es) |
| ✅ | `seoul_deungwon` | 서울등원초등학교 | (sen-es) |
| ✅ | `seoul_deungchon` | 서울등촌초등학교 | (sen-es) |
| ✅ | `seoul_deunghyun` | 서울등현초등학교 | (sen-es) |
| ✅ | `seoul_balsan` | 서울발산초등학교 | (sen-es) |
| ✅ | `seoul_banghwa` | 서울방화초등학교 | (sen-es) |
| ✅ | `seoul_baekseok` | 서울백석초등학교 | (sen-es) |
| ✅ | `seoul_samjeong` | 서울삼정초등학교 | (sen-es) |
| ✅ | `seoul_songjeong` | 서울송정초등학교 | (sen-es) |
| ✅ | `seoul_songhwa` | 서울송화초등학교 | (sen-es) |
| ✅ | `seoul_sumyeong` | 서울수명초등학교 | (sen-es) |
| ✅ | `seoul_singok` | 서울신곡초등학교 | (sen-es) |
| ✅ | `seoul_sinwol` | 서울신월초등학교 | (sen-es) |
| ✅ | `seoul_sinjeong` | 서울신정초등학교 | (sen-es) |
| ✅ | `seoul_yangcheon` | 서울양천초등학교 | (sen-es) |
| ✅ | `seoul_yeomkyoung` | 서울염경초등학교 | (sen-es) |
| ✅ | `seoul_yeomdong` | 서울염동초등학교 | (sen-es) |
| ✅ | `seoul_yeomchang` | 서울염창초등학교 | (sen-es) |
| ✅ | `seoul_ujang` | 서울우장초등학교 | (sen-es) |
| ✅ | `seoul_woljung` | 서울월정초등학교 | (sen-es) |
| ✅ | `seoul_jeonggok` | 서울정곡초등학교 | (sen-es) |
| ✅ | `seoul_chihyeon` | 서울치현초등학교 | (sen-es) |
| ✅ | `seoul_topsan` | 서울탑산초등학교 | (sen-es) |
| ✅ | `seoul_hwagok` | 서울화곡초등학교 | (sen-es) |
| ✅ | `seoul_hwail` | 서울화일초등학교 | (sen-es) |
| ✅ | `yooseok` | 유석초등학교 | (sen-es) |

### 서울 마포 — 20/22 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_kongduck` | 서울공덕초등학교 | (sen-es) |
| ✅ | `seoul_donggyo` | 서울동교초등학교 | (sen-es) |
| ⬜ | `seoul_mapo` | 서울마포초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_mangwon` | 서울망원초등학교 | (sen-es) |
| ✅ | `seoul_sangam` | 서울상암초등학교 | (sen-es) |
| ✅ | `seoul_sangji` | 서울상지초등학교 | (sen-es) |
| ✅ | `seoul_seogang` | 서울서강초등학교 | (sen-es) |
| ✅ | `seoul_seokyo` | 서울서교초등학교 | (sen-es) |
| ✅ | `seoul_sangsan_mp` | 서울성산초등학교 | (sen-es) |
| ✅ | `seoul_seongseo` | 서울성서초등학교 | (sen-es) |
| ✅ | `seoul_sungwon` | 서울성원초등학교 | (sen-es) |
| ✅ | `seoul_soeui` | 서울소의초등학교 | (sen-es) |
| ✅ | `seoul_sinbuk` | 서울신북초등학교 | (sen-es) |
| ✅ | `seoul_sinseok` | 서울신석초등학교 | (sen-es) |
| ✅ | `seoul_ahyun` | 서울아현초등학교 | (sen-es) |
| ✅ | `seoul_yeomri` | 서울염리초등학교 | (sen-es) |
| ✅ | `seoul_yonggang` | 서울용강초등학교 | (sen-es) |
| ✅ | `seoul_jungdong` | 서울중동초등학교 | (sen-es) |
| ✅ | `seoul_changchon` | 서울창천초등학교 | (sen-es) |
| ✅ | `seoul_haneul` | 서울하늘초등학교 | (sen-es) |
| ✅ | `seoul_hanseo` | 서울한서초등학교 | (sen-es) |
| ⬜ | `seoul_hongik` | 홍익대학교사범대학부속초등학교 | 미업로드 또는 외부 차단 (미확인) |

### 서울 서대문 — 18/19 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `kyonggi_es` | 경기초등학교 | (sen-es) |
| ➖ | `myongji` | 명지초등학교 | NEIS 메뉴만 (사진 미지원 의도) |
| ✅ | `seoul_gajaeul` | 서울가재울초등학교 | (sen-es) |
| ✅ | `seoul_goeun` | 서울고은초등학교 | (sen-es) |
| ✅ | `seoul_geumhwa` | 서울금화초등학교 | (sen-es) |
| ✅ | `seoul_daesin` | 서울대신초등학교 | (sen-es) |
| ✅ | `seoul_midong` | 서울미동초등학교 | (sen-es) |
| ✅ | `seoul_bukgajwa` | 서울북가좌초등학교 | (sen-es) |
| ✅ | `seoul_buksung` | 서울북성초등학교 | (sen-es) |
| ✅ | `seoul_ansan` | 서울안산초등학교 | (sen-es) |
| ✅ | `seoul_yeonga` | 서울연가초등학교 | (sen-es) |
| ✅ | `seoul_yeonhui` | 서울연희초등학교 | (sen-es) |
| ✅ | `seoul_inwang` | 서울인왕초등학교 | (sen-es) |
| ✅ | `seoul_changseo` | 서울창서초등학교 | (sen-es) |
| ✅ | `seoul_hongyeon` | 서울홍연초등학교 | (sen-es) |
| ✅ | `seoul_hongeun` | 서울홍은초등학교 | (sen-es) |
| ✅ | `seoul_hongje` | 서울홍제초등학교 | (sen-es) |
| ✅ | `ewha_es` | 이화여자대학교사범대학부속초등학교 | (sen-es) |
| ✅ | `chugye` | 추계초등학교 | (sen-es) |

### 서울 은평 — 29/30 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_galhyun` | 서울갈현초등학교 | (sen-es) |
| ✅ | `seoul_gusan` | 서울구산초등학교 | (sen-es) |
| ✅ | `seoul_guhyun` | 서울구현초등학교 | (sen-es) |
| ✅ | `seoul_nokbun` | 서울녹번초등학교 | (sen-es) |
| ✅ | `seoul_daeeun` | 서울대은초등학교 | (sen-es) |
| ✅ | `seoul_daejo` | 서울대조초등학교 | (sen-es) |
| ✅ | `seoul_bukhansan` | 서울북한산초등학교 | (sen-es) |
| ✅ | `seoul_bulgwang` | 서울불광초등학교 | (sen-es) |
| ✅ | `seoul_sangsin` | 서울상신초등학교 | (sen-es) |
| ✅ | `seoul_seosin` | 서울서신초등학교 | (sen-es) |
| ✅ | `seoul_suri` | 서울수리초등학교 | (sen-es) |
| ⬜ | `seoul_susaek` | 서울수색초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_sindo` | 서울신도초등학교 | (sen-es) |
| ✅ | `seoul_sinsa` | 서울신사초등학교 | (sen-es) |
| ✅ | `seoul_eoul` | 서울어울초등학교 | (sen-es) |
| ✅ | `seoul_yeokchon` | 서울역촌초등학교 | (sen-es) |
| ✅ | `seoul_yeonkwang` | 서울연광초등학교 | (sen-es) |
| ✅ | `seoul_yeonsin` | 서울연신초등학교 | (sen-es) |
| ✅ | `seoul_yeoneun` | 서울연은초등학교 | (sen-es) |
| ✅ | `seoul_yeoncheon` | 서울연천초등학교 | (sen-es) |
| ✅ | `seoul_eunmyeong` | 서울은명초등학교 | (sen-es) |
| ✅ | `seoul_eunbit` | 서울은빛초등학교 | (sen-es) |
| ✅ | `seoul_eunjin` | 서울은진초등학교 | (sen-es) |
| ✅ | `seoul_eunpyeong` | 서울은평초등학교 | (sen-es) |
| ✅ | `seoul_eungam` | 서울응암초등학교 | (sen-es) |
| ✅ | `seoul_jeungsan` | 서울증산초등학교 | (sen-es) |
| ✅ | `seoul_jingwan` | 서울진관초등학교 | (sen-es) |
| ✅ | `sunil` | 선일초등학교 | (sen-es) |
| ✅ | `yale` | 예일초등학교 | (sen-es) |
| ✅ | `choongam` | 충암초등학교 | (sen-es) |

### 서울 용산 — 12/15 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_keumyang` | 서울금양초등학교 | (sen-es) |
| ✅ | `seoul_namjeong` | 서울남정초등학교 | (sen-es) |
| ⬜ | `seoul_bogwang` | 서울보광초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_samkwang` | 서울삼광초등학교 | (sen-es) |
| ✅ | `seoul_seobinggo` | 서울서빙고초등학교 | (sen-es) |
| ⬜ | `seoul_sinyongsan` | 서울신용산초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_yongsan` | 서울용산초등학교 | (sen-es) |
| ✅ | `seoul_yongam` | 서울용암초등학교 | (sen-es) |
| ✅ | `seoul_wonhyo` | 서울원효초등학교 | (sen-es) |
| ⬜ | `seoul_itaewon` | 서울이태원초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_cheongpa` | 서울청파초등학교 | (sen-es) |
| ✅ | `seoul_hangang` | 서울한강초등학교 | (sen-es) |
| ✅ | `seoul_hannam` | 서울한남초등학교 | (sen-es) |
| ✅ | `seoul_huam` | 서울후암초등학교 | (sen-es) |
| ✅ | `singwang` | 신광초등학교 | (sen-es) |

### 서울 종로 — 13/13 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `sangmyung_es` | 상명대학교사범대학부속초등학교 | (sen-es) |
| ✅ | `seoul_kyodong` | 서울교동초등학교 | (sen-es) |
| ✅ | `snu_es` | 서울대학교사범대학부설초등학교 | (sen-es) |
| ✅ | `seoul_dongnimmun` | 서울독립문초등학교 | (sen-es) |
| ✅ | `seoul_maedong_jr` | 서울매동초등학교 | (sen-es) |
| ✅ | `seoul_myungshin` | 서울명신초등학교 | (sen-es) |
| ✅ | `seoul_segumjung` | 서울세검정초등학교 | (sen-es) |
| ✅ | `seoul_jaedong` | 서울재동초등학교 | (sen-es) |
| ✅ | `seoul_changshin` | 서울창신초등학교 | (sen-es) |
| ✅ | `seoul_chungwoon` | 서울청운초등학교 | (sen-es) |
| ✅ | `seoul_hyehwa` | 서울혜화초등학교 | (sen-es) |
| ✅ | `seoul_hyoje` | 서울효제초등학교 | (sen-es) |
| ✅ | `unhyun` | 운현초등학교 | (sen-es) |

### 서울 성동 — 20/21 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `seoul_kyungdong` | 서울경동초등학교 | (sen-es) |
| ✅ | `seoul_kyeongsu` | 서울경수초등학교 | (sen-es) |
| ✅ | `seoul_kyongil_sd` | 서울경일초등학교 | (sen-es) |
| ✅ | `seoul_geumbuk` | 서울금북초등학교 | (sen-es) |
| ✅ | `seoul_geumok` | 서울금옥초등학교 | (sen-es) |
| ✅ | `seoul_geumho` | 서울금호초등학교 | (sen-es) |
| ✅ | `seoul_dongmyung_sd` | 서울동명초등학교 | (sen-es) |
| ✅ | `seoul_dongho` | 서울동호초등학교 | (sen-es) |
| ✅ | `seoul_majang` | 서울마장초등학교 | (sen-es) |
| ✅ | `seoul_muhag` | 서울무학초등학교 | (sen-es) |
| ✅ | `seoul_sageun` | 서울사근초등학교 | (sen-es) |
| ✅ | `seoul_sungsu` | 서울성수초등학교 | (sen-es) |
| ✅ | `seoul_songwon` | 서울송원초등학교 | (sen-es) |
| ✅ | `seoul_soongshin` | 서울숭신초등학교 | (sen-es) |
| ✅ | `seoul_oksu` | 서울옥수초등학교 | (sen-es) |
| ✅ | `seoul_okjeong` | 서울옥정초등학교 | (sen-es) |
| ✅ | `seoul_yongdab` | 서울용답초등학교 | (sen-es) |
| ✅ | `seoul_eungbong` | 서울응봉초등학교 | (sen-es) |
| ✅ | `seoul_haengdang` | 서울행당초등학교 | (sen-es) |
| ✅ | `seoul_haenghyun` | 서울행현초등학교 | (sen-es) |
| ➖ | `hanyang_es` | 한양초등학교 | NEIS 메뉴만 (사진 미지원 의도) |

### 서울 광진 — 20/21 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ➖ | `gyeongbok_es` | 경복초등학교 | NEIS 메뉴만 (사진 미지원 의도) |
| ✅ | `seoul_gwangnam` | 서울광남초등학교 | (sen-es) |
| ✅ | `seoul_kwangjang` | 서울광장초등학교 | (sen-es) |
| ✅ | `seoul_gwangjin` | 서울광진초등학교 | (sen-es) |
| ✅ | `seoul_gunam` | 서울구남초등학교 | (sen-es) |
| ✅ | `seoul_guui` | 서울구의초등학교 | (sen-es) |
| ✅ | `seoul_dongeui` | 서울동의초등학교 | (sen-es) |
| ✅ | `seoul_dongja` | 서울동자초등학교 | (sen-es) |
| ✅ | `seoul_seongja` | 서울성자초등학교 | (sen-es) |
| ✅ | `seoul_sinyang` | 서울신양초등학교 | (sen-es) |
| ✅ | `seoul_sinja` | 서울신자초등학교 | (sen-es) |
| ✅ | `seoul_yangnam` | 서울양남초등학교 | (sen-es) |
| ✅ | `seoul_yangjin` | 서울양진초등학교 | (sen-es) |
| ✅ | `seoul_yonggok` | 서울용곡초등학교 | (sen-es) |
| ✅ | `seoul_yongma` | 서울용마초등학교 | (sen-es) |
| ✅ | `seoul_jayang` | 서울자양초등학교 | (sen-es) |
| ✅ | `seoul_jangan` | 서울장안초등학교 | (sen-es) |
| ✅ | `seoul_junggwang` | 서울중광초등학교 | (sen-es) |
| ✅ | `seoul_jungma` | 서울중마초등학교 | (sen-es) |
| ✅ | `seoul_seongdong` | 성동초등학교 | (sen-es) |
| ✅ | `seoul_sejong` | 세종초등학교 | (sen-es) |

### 서울 동대문 — 19/21 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ⬜ | `kyunghee_es` | 경희초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_kunja` | 서울군자초등학교 | (sen-es) |
| ✅ | `seoul_dapsimni` | 서울답십리초등학교 | (sen-es) |
| ✅ | `seoul_dongdab` | 서울동답초등학교 | (sen-es) |
| ✅ | `seoul_baebong` | 서울배봉초등학교 | (sen-es) |
| ✅ | `seoul_seoul36` | 서울삼육초등학교 | (sen-es) |
| ✅ | `seoul_shindap` | 서울신답초등학교 | (sen-es) |
| ✅ | `seoul_anpyeong` | 서울안평초등학교 | (sen-es) |
| ⬜ | `seoul_yongdu` | 서울용두초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_imun` | 서울이문초등학교 | (sen-es) |
| ✅ | `seoul_jangpyung` | 서울장평초등학교 | (sen-es) |
| ✅ | `seoul_jeongok` | 서울전곡초등학교 | (sen-es) |
| ✅ | `seoul_jeonnong` | 서울전농초등학교 | (sen-es) |
| ✅ | `seoul_jeondong` | 서울전동초등학교 | (sen-es) |
| ✅ | `seoul_jongam` | 서울종암초등학교 | (sen-es) |
| ✅ | `seoul_chongryang` | 서울청량초등학교 | (sen-es) |
| ✅ | `seoul_hongneung` | 서울홍릉초등학교 | (sen-es) |
| ✅ | `seoul_hongpa` | 서울홍파초등학교 | (sen-es) |
| ✅ | `seoul_hwykyung` | 서울휘경초등학교 | (sen-es) |
| ✅ | `seoul_hwibong` | 서울휘봉초등학교 | (sen-es) |
| ✅ | `eunseok` | 은석초등학교 | (sen-es) |

### 서울 중랑 — 22/24 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ➖ | `kumsung_es` | 금성초등학교 | NEIS 메뉴만 (사진 미지원 의도) |
| ✅ | `seoul_dongwon` | 서울동원초등학교 | (sen-es) |
| ✅ | `seoul_mangwoo` | 서울망우초등학교 | (sen-es) |
| ✅ | `seoul_myunnam` | 서울면남초등학교 | (sen-es) |
| ✅ | `seoul_myeondong` | 서울면동초등학교 | (sen-es) |
| ✅ | `seoul_myeonmok` | 서울면목초등학교 | (sen-es) |
| ✅ | `seoul_myeonbuk` | 서울면북초등학교 | (sen-es) |
| ✅ | `seoul_myeonil` | 서울면일초등학교 | (sen-es) |
| ⬜ | `seoul_myunjoong` | 서울면중초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_mookdong` | 서울묵동초등학교 | (sen-es) |
| ✅ | `seoul_mookhyun` | 서울묵현초등학교 | (sen-es) |
| ✅ | `seoul_bonghwa` | 서울봉화초등학교 | (sen-es) |
| ✅ | `seoul_sangbong` | 서울상봉초등학교 | (sen-es) |
| ✅ | `seoul_saesol` | 서울새솔초등학교 | (sen-es) |
| ✅ | `seoul_sinnae` | 서울신내초등학교 | (sen-es) |
| ✅ | `seoul_sinmook` | 서울신묵초등학교 | (sen-es) |
| ✅ | `seoul_shinhyun` | 서울신현초등학교 | (sen-es) |
| ✅ | `seoul_yangwonsoop` | 서울양원숲초등학교 | (sen-es) |
| ✅ | `seoul_wonmuk` | 서울원묵초등학교 | (sen-es) |
| ✅ | `seoul_jungkok` | 서울중곡초등학교 | (sen-es) |
| ✅ | `seoul_jungnang` | 서울중랑초등학교 | (sen-es) |
| ✅ | `seoul_joongmok` | 서울중목초등학교 | (sen-es) |
| ✅ | `seoul_junghwa` | 서울중화초등학교 | (sen-es) |
| ✅ | `seoul_jungheung` | 서울중흥초등학교 | (sen-es) |

### 서울 성북 — 29/29 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `kwangwoon_es` | 광운초등학교 | (sen-es) |
| ✅ | `daegwang_es` | 대광초등학교 | (sen-es) |
| ✅ | `maewon_es` | 매원초등학교 | (sen-es) |
| ✅ | `seoul_gaewoon` | 서울개운초등학교 | (sen-es) |
| ✅ | `seoul_gilwon` | 서울길원초등학교 | (sen-es) |
| ✅ | `seoul_gireum` | 서울길음초등학교 | (sen-es) |
| ✅ | `seoul_donam` | 서울돈암초등학교 | (sen-es) |
| ✅ | `seoul_dongsin_sb` | 서울동신초등학교 | (sen-es) |
| ✅ | `seoul_mia` | 서울미아초등학교 | (sen-es) |
| ✅ | `seoul_samsun` | 서울삼선초등학교 | (sen-es) |
| ✅ | `seoul_sukgye` | 서울석계초등학교 | (sen-es) |
| ✅ | `seoul_seokgwan` | 서울석관초등학교 | (sen-es) |
| ✅ | `seoul_sungbuk` | 서울성북초등학교 | (sen-es) |
| ✅ | `seoul_soonggok` | 서울숭곡초등학교 | (sen-es) |
| ✅ | `seoul_soongduck` | 서울숭덕초등학교 | (sen-es) |
| ✅ | `seoul_sungrye` | 서울숭례초등학교 | (sen-es) |
| ✅ | `seoul_soongin` | 서울숭인초등학교 | (sen-es) |
| ✅ | `seoul_anam` | 서울안암초등학교 | (sen-es) |
| ✅ | `seoul_wolgok_sb` | 서울월곡초등학교 | (sen-es) |
| ✅ | `seoul_ilshin` | 서울일신초등학교 | (sen-es) |
| ✅ | `seoul_janggok` | 서울장곡초등학교 | (sen-es) |
| ✅ | `seoul_jangwol_sb` | 서울장월초등학교 | (sen-es) |
| ✅ | `seoul_jangwi` | 서울장위초등학교 | (sen-es) |
| ✅ | `seoul_jeongdeok` | 서울정덕초등학교 | (sen-es) |
| ✅ | `seoul_jeongneung` | 서울정릉초등학교 | (sen-es) |
| ✅ | `seoul_jungsu` | 서울정수초등학교 | (sen-es) |
| ✅ | `seoul_cheongdeok` | 서울청덕초등학교 | (sen-es) |
| ✅ | `sungshin_es` | 성신초등학교 | (sen-es) |
| ✅ | `uchon_es` | 우촌초등학교 | (sen-es) |

### 서울 강북 — 12/14 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ⬜ | `seoul_miyang` | 서울미양초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_beondong` | 서울번동초등학교 | (sen-es) |
| ✅ | `seoul_samgaksan` | 서울삼각산초등학교 | (sen-es) |
| ✅ | `seoul_samyang` | 서울삼양초등학교 | (sen-es) |
| ✅ | `seoul_songjoong` | 서울송중초등학교 | (sen-es) |
| ✅ | `seoul_songcheon` | 서울송천초등학교 | (sen-es) |
| ✅ | `seoul_soosong` | 서울수송초등학교 | (sen-es) |
| ✅ | `seoul_suyu` | 서울수유초등학교 | (sen-es) |
| ✅ | `seoul_ohhyun` | 서울오현초등학교 | (sen-es) |
| ✅ | `seoul_wooi` | 서울우이초등학교 | (sen-es) |
| ✅ | `seoul_youhyeon` | 서울유현초등학교 | (sen-es) |
| ✅ | `seoul_insu` | 서울인수초등학교 | (sen-es) |
| ✅ | `seoul_hwagye` | 서울화계초등학교 | (sen-es) |
| ➖ | `younghoon_es` | 영훈초등학교 | NEIS 메뉴만 (사진 미지원 의도) |

### 서울 도봉 — 22/23 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ⬜ | `dongbuk` | 동북초등학교 | 미업로드 또는 외부 차단 (미확인) |
| ✅ | `seoul_gain` | 서울가인초등학교 | (sen-es) |
| ✅ | `seoul_nuwon` | 서울누원초등학교 | (sen-es) |
| ✅ | `seoul_dobong` | 서울도봉초등학교 | (sen-es) |
| ✅ | `seoul_banghak` | 서울방학초등학교 | (sen-es) |
| ✅ | `seoul_baegun` | 서울백운초등학교 | (sen-es) |
| ✅ | `seoul_sungmi` | 서울숭미초등학교 | (sen-es) |
| ✅ | `seoul_sinbanghak` | 서울신방학초등학교 | (sen-es) |
| ✅ | `seoul_shinchang` | 서울신창초등학교 | (sen-es) |
| ✅ | `seoul_sinhak` | 서울신학초등학교 | (sen-es) |
| ✅ | `seoul_sinhwa` | 서울신화초등학교 | (sen-es) |
| ✅ | `seoul_ssangmun` | 서울쌍문초등학교 | (sen-es) |
| ✅ | `seoul_obong` | 서울오봉초등학교 | (sen-es) |
| ✅ | `seoul_wolcheon` | 서울월천초등학교 | (sen-es) |
| ✅ | `seoul_jawoon` | 서울자운초등학교 | (sen-es) |
| ✅ | `seoul_changkyung` | 서울창경초등학교 | (sen-es) |
| ✅ | `seoul_changdo` | 서울창도초등학교 | (sen-es) |
| ✅ | `seoul_changdong` | 서울창동초등학교 | (sen-es) |
| ✅ | `seoul_changlim` | 서울창림초등학교 | (sen-es) |
| ✅ | `seoul_changwon` | 서울창원초등학교 | (sen-es) |
| ✅ | `seoul_changil` | 서울창일초등학교 | (sen-es) |
| ✅ | `seoul_chodang` | 서울초당초등학교 | (sen-es) |
| ✅ | `hansin` | 한신초등학교 | (sen-es) |

### 서울 노원 — 42/42 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `smcho` | 상명초등학교 | (sen-es) |
| ✅ | `seoul_kyesang` | 서울계상초등학교 | (sen-es) |
| ✅ | `seoul_gongrung` | 서울공릉초등학교 | (sen-es) |
| ✅ | `seoul_gongyeon` | 서울공연초등학교 | (sen-es) |
| ✅ | `seoul_nowon` | 서울노원초등학교 | (sen-es) |
| ✅ | `seoul_noil` | 서울노일초등학교 | (sen-es) |
| ✅ | `seoul_nokcheon` | 서울녹천초등학교 | (sen-es) |
| ✅ | `seoul_danghyeon` | 서울당현초등학교 | (sen-es) |
| ✅ | `seoul_deokam` | 서울덕암초등학교 | (sen-es) |
| ✅ | `seoul_dongil` | 서울동일초등학교 | (sen-es) |
| ✅ | `seoul_bulam` | 서울불암초등학교 | (sen-es) |
| ✅ | `seoul_sanggyeong` | 서울상경초등학교 | (sen-es) |
| ✅ | `seoul_sanggye` | 서울상계초등학교 | (sen-es) |
| ✅ | `seoul_sanggok` | 서울상곡초등학교 | (sen-es) |
| ✅ | `seoul_sangsoo` | 서울상수초등학교 | (sen-es) |
| ✅ | `seoul_sangwon` | 서울상원초등학교 | (sen-es) |
| ✅ | `seoul_sangwol` | 서울상월초등학교 | (sen-es) |
| ✅ | `seoul_sangcheon` | 서울상천초등학교 | (sen-es) |
| ✅ | `seoul_sungok` | 서울선곡초등학교 | (sen-es) |
| ✅ | `seoul_surak` | 서울수락초등학교 | (sen-es) |
| ✅ | `seoul_suam` | 서울수암초등학교 | (sen-es) |
| ✅ | `seoul_singye` | 서울신계초등학교 | (sen-es) |
| ✅ | `seoul_sinsanggye` | 서울신상계초등학교 | (sen-es) |
| ✅ | `seoul_yeonji` | 서울연지초등학교 | (sen-es) |
| ✅ | `seoul_yeonchon` | 서울연촌초등학교 | (sen-es) |
| ✅ | `seoul_ongok` | 서울온곡초등학교 | (sen-es) |
| ✅ | `seoul_yongdong_nw` | 서울용동초등학교 | (sen-es) |
| ✅ | `seoul_yongwon` | 서울용원초등학교 | (sen-es) |
| ✅ | `seoul_wonkwang` | 서울원광초등학교 | (sen-es) |
| ✅ | `seoul_wolgye` | 서울월계초등학교 | (sen-es) |
| ✅ | `seoul_eulji` | 서울을지초등학교 | (sen-es) |
| ✅ | `seoul_junggye` | 서울중계초등학교 | (sen-es) |
| ✅ | `seoul_jungwon` | 서울중원초등학교 | (sen-es) |
| ✅ | `seoul_jungpyong` | 서울중평초등학교 | (sen-es) |
| ✅ | `seoul_joonghyun` | 서울중현초등학교 | (sen-es) |
| ✅ | `seoul_chonggye_nw` | 서울청계초등학교 | (sen-es) |
| ✅ | `seoul_taerang` | 서울태랑초등학교 | (sen-es) |
| ✅ | `seoul_taereung` | 서울태릉초등학교 | (sen-es) |
| ✅ | `seoul_hancheon` | 서울한천초등학교 | (sen-es) |
| ✅ | `cheongwon` | 청원초등학교 | (sen-es) |
| ✅ | `taegang` | 태강삼육초등학교 | (sen-es) |
| ✅ | `hwarang` | 화랑초등학교 | (sen-es) |

### 서울 중구 — 11/12 사진 가능

| 상태 | id | 학교 | 비고 |
|---|---|---|---|
| ✅ | `dongsan_jg` | 동산초등학교 | (sen-es) |
| ➖ | `lila` | 리라초등학교 | NEIS 메뉴만 (사진 미지원 의도) |
| ✅ | `seoul_gwanghee` | 서울광희초등학교 | (sen-es) |
| ✅ | `seoul_namsan` | 서울남산초등학교 | (sen-es) |
| ✅ | `seoul_deoksoo` | 서울덕수초등학교 | (sen-es) |
| ✅ | `seoul_bongrae` | 서울봉래초등학교 | (sen-es) |
| ✅ | `seoul_sindang` | 서울신당초등학교 | (sen-es) |
| ✅ | `seoul_jangchung` | 서울장충초등학교 | (sen-es) |
| ✅ | `seoul_cheonggu` | 서울청구초등학교 | (sen-es) |
| ✅ | `seoul_chungmu` | 서울충무초등학교 | (sen-es) |
| ✅ | `seoul_heungin` | 서울흥인초등학교 | (sen-es) |
| ✅ | `soongeui` | 숭의초등학교 | (sen-es) |

