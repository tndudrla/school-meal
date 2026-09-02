# 수원 mi 추출 실패 학교 목록 (Stage 15, AC-2b)

Stage 15 수집 (2026-09-02, `build-school-config.mjs --atpt J10 --city 수원시
--id-prefix suwon_`, mi 동시성 5) 에서 mi 추출에 실패해 `scrape` 없이 등록된
학교. **후속 보정 대상** (Open Question 2 → 분기 (b) 이월 확정 — 스펙 Non-Goals
"사진 안 잡히는 학교의 mi 보정 및 VERIFIED_REASONS 등재는 후속 TODO" 준수).

`M` (scrape 보유 수원 학교 수) = 101 − 2 = **99**.

| 학교명 | id | host | sysId | 실패 사유 |
|---|---|---|---|---|
| 율전초등학교 | `suwon_yuljeon` | `yuljeon-e.goesw.kr` | `yuljeon-e` | main.do 에 selectFoodMenuView/menuAccessCheck 식단 링크 없음 |
| 황곡초등학교 | `suwon_hwanggok` | `hgok-e.goesw.kr` | `hgok-e` | main.do 에 selectFoodMenuView/menuAccessCheck 식단 링크 없음 |

참고 — mi 실패는 아니지만 scrape 없이 등록된 학교 (보정 대상 아님):

| 학교명 | id | 사유 |
|---|---|---|
| 중앙기독초등학교 | `suwon_cca` | 사립 (`www.suwoncca.org`) — 지원 스크래퍼 없음. 서울 명지초·구로 천이초와 동일 처리 (영구) |

## 보정 방법 (후속 작업자용)

각 학교 홈페이지에서 급식 식단 페이지를 사람이 찾아 URL 의 `mi` 파라미터를
확인 → `src/lib/schools/gyeonggi/suwon.ts` 해당 entry 에
`scrape: { kind: 'goeay', host, sysId, mi }` 를 수동 추가. 두 학교 모두
현재 상태는 "메뉴는 보이고 사진은 안 보임" (앱 정상 동작, V-5 에서 확인).
