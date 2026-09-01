# Open Questions

플랜 실행 전/중에 사람 결정이 필요한 항목을 한 곳에 모은다.

`[BLOCKING]` = 착수 전에 답이 나와야 진행 가능
`[NON-BLOCKING]` = 실행 중 판단해도 되는 항목

---

## suwon-expansion-stage15 - 2026-09-02

플랜: `.omc/plans/suwon-expansion-stage15.md`

### BLOCKING

- [ ] **`[BLOCKING]` 중앙기독초등학교의 id 확정** (`suwon_jungangchristian` / `suwon_cca` / 기타) — `build-school-config.mjs:275`는 `sysId`가 null이면 id를 `SCHUL_NM`(한글)으로 설정한다. 한글 id는 URL 파라미터에 그대로 노출되고, 배포 후에는 공유 링크에 고착돼 변경 비용이 크다. (R-13, AC-5)

- [ ] **`[BLOCKING]` mi 추출 실패 학교를 이번 Stage에서 보정할 것인가** — (a) 보정 → `M = 101` / (b) 후속 이월 → `M = Step 1 실측값`. **AC-3 / AC-11 / V-1 / V-3의 기대값이 전부 이 결정에 달려 있다.** 101을 상수로 박으면 (b) 분기에서 게이트가 거짓 실패한다. 어느 분기든 AC-2b(실패 학교 목록 산출)는 필수이며 `M > 0`은 hard gate.

- [ ] **`[BLOCKING]` 약칭 host 13개의 로마자 id 확정** (`dsw`, `swsg`, `swjc`, `hgok`, `omokk`, `cmschool`, `swkumgok`, `swgumho`, `swmaehwa`, `swsunil`, `swhwaseo`, `swhwayang`, `eui`) — 학교명 발음 기반 수동 해석. `swkumgok`/`swgumho`처럼 로마자화 규칙이 갈리는 것이 있다. 커밋 전 학교명과 나란히 놓고 1회 육안 대조 필요. 배포 후 공유 링크 고착은 중앙기독초 1건과 성격이 같고 건수는 13배다. (R-9, 심각도 중)

### NON-BLOCKING

- [ ] **`[NON-BLOCKING]` `refresh-neis` chunk 도입 여부** — region 필터 없이 787교 × 2 = 1,574 동시 요청을 단일 `Promise.all`로 낸다(`maxDuration = 300`). AC-19의 임계(`errored` > 기준선+10, 또는 `elapsedMs` > 240,000)에 걸리면 후속 Stage 등록. 이번 범위는 관측 + 임계 판정까지.

- [ ] **`[NON-BLOCKING]` `gyeonggi.ts` → `gyeonggi/` 전면 전환 시점** — 이번엔 동명 파일/디렉터리 공존(옵션 A-1)으로 간다. 경기 나머지 시·군 추가 시 구조 정리가 필요하다. (ADR Follow-up 1)

- [ ] **`[NON-BLOCKING]` 수원 cron을 경기 통합으로 재흡수할 시점** — 전용 cron의 근거는 `goesw.kr` 격리 관측이다. 몇 주간 안정적으로 관측되면 그 목적이 소멸하므로 D-1(통합)로 되돌려 cron entry와 함수 수를 줄이는 것이 합리적일 수 있다. (ADR Follow-up 1-b)

### 해소됨 (재질문 불필요)

- ~~`경기 수원`의 `regionOrder` 위치~~ → **AC-12에서 "경기 4도시 뒤, 서울 앞"으로 확정.** 중복 질문이라 삭제.
- ~~기존 경기 75교 중 scrape 생략 학교가 있는가~~ → **없음. 75교 전원 보유** (실측 2026-09-02). `VERIFIED_REASONS`를 scrape 생략 목록으로 오해한 것이었다 — 그 테이블은 문서 생성용 사유 표시일 뿐이다.
- ~~prune이 신규 수원 미러를 지울 위험~~ → **없음.** `pruneOldPhotos()`는 `ymd < cutoff` 날짜 기준.
- ~~`gyeonggi.ts` + `gyeonggi/` 공존이 컴파일되는가~~ → **된다.** tsc bundler 실증 exit 0.
