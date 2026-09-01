# Deep Interview Spec: 개발 건의 보드 — 전용 페이지 분리 + 정돈

## Metadata
- Interview ID: di-feedback-board-20260803
- Rounds: 5 (+ Round 0 topology)
- Final Ambiguity Score: 9.5%
- Type: brownfield
- Generated: 2026-08-03
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.95 | 0.35 | 0.333 |
| Constraint Clarity | 0.90 | 0.25 | 0.225 |
| Success Criteria | 0.85 | 0.25 | 0.213 |
| Context Clarity | 0.90 | 0.15 | 0.135 |
| **Total Clarity** | | | **0.905** |
| **Ambiguity** | | | **0.095** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| 진입 방식 분리 | active | 메인 인라인 보드 제거 → 버튼+맛보기 + 전용 페이지 `/feedback` | 화면 형태(라우트 페이지)·메인 잔여물(버튼+맛보기) 확정 |
| 보드 형태 개선 | active | 전용 페이지에 맞는 "정돈된 전용 보드"로 재구성 (기능 확장 없음) | 개선 요소 목록 확정, 풀 게시판화는 non-goal |

## Goal
메인 화면 하단에 인라인으로 펼쳐진 개발 건의 보드를 **별도 라우트 페이지 `/feedback`** 으로
분리한다. 메인에는 **진입 버튼 + 맛보기**(추천 상위 또는 최신 운영자 답변 1~2개 + 더보기)만
남긴다. 전용 페이지의 보드는 기능 확장 없이 **정돈된 전용 보드**로 재구성한다.

해결하려는 문제 (Round 4 확인): ① 메인 페이지가 너무 길어짐 — 급식 확인이라는 핵심 경험
대비 하단 보드가 무거움. ② 외관/완성도 — 앱이 더 정돈된 느낌이면 좋겠음.
참여량 증가·미래 트래픽 대비는 목표가 **아님**.

## Constraints
- 계정 없는 익명 원칙 유지 (fingerprint cooldown + localStorage 토큰 방식 그대로)
- DB 스키마 변경 없음 — 기존 `feedback` 테이블·`/api/feedback` 라우트 재사용
- 답변완료 뱃지는 `admin_reply` 존재 여부만으로 표시 (신규 컬럼 불필요)
- 피처 플래그 유지: `SUPABASE_SERVICE_ROLE_KEY` 없으면 버튼·맛보기·페이지 모두 비노출
- 기존 디자인 언어 유지 (Gaegu 폰트, amber/orange 파스텔 톤, 라운드 카드)
- 완성도 > 기능: 빈 상태(empty state)를 만드는 기능 추가 금지

## Non-Goals
- 사용자 댓글 (운영자 답변만 유지)
- 카테고리/건의 유형 분류
- 처리 상태 라벨용 신규 스키마 (검토중/반영됨 등)
- 계정/로그인 도입
- 참여 유도 장치 (알림, 뱃지 게이미피케이션 등)

## Acceptance Criteria
- [ ] `/feedback` 라우트 진입 시 전용 보드 페이지가 뜬다 (뒤로가기로 메인 복귀)
- [ ] 메인 하단에는 버튼 + 맛보기(1~2개) + 더보기만 남고 전체 보드는 사라진다
- [ ] 맛보기에서 더보기/버튼 클릭 → `/feedback` 이동
- [ ] 전용 보드: 정렬 탭(추천순/최신순) 동작
- [ ] 전용 보드: 운영자 답변 있는 글에 "답변 완료" 뱃지 표시
- [ ] 전용 보드: 더보기(페이지네이션) 동작 — 현재 limit 50 고정 해소
- [ ] 글 0개일 때 빈 상태 디자인 표시
- [ ] 작성·수정·삭제·추천·30초 cooldown 등 기존 기능 회귀 없음 (localStorage 토큰 그대로)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 미설정 시 관련 UI 전부 비노출 (기존 동작 유지)
- [ ] 메인 페이지 길이가 눈에 띄게 짧아짐 (보드 전체 제거 확인)

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "별도 화면"의 형태가 자명하다 | 라우트 vs 오버레이 (R1) | 사용자 위임 → 라우트 페이지 `/feedback` 확정 (R5) |
| 현 보드 원칙(익명·무댓글)은 불가침 | 어디까지 열 수 있나 (R2) | 검토는 전부 열되, 최종안은 익명·무댓글 유지 |
| 보드 개선 = 기능 확장 | 진짜 문제가 뭔가 (R4 Contrarian) | 문제는 메인 길이 + 완성도 → 기능 확장은 non-goal |
| 게시판다운 형태가 더 낫다 | 빈 기능의 역효과 지적 (R5) | "정돈된 전용 보드" 채택, 풀 게시판화 기각 |

## Technical Context
- 단일 페이지 앱: `src/app/page.tsx` 하나. `/feedback` 이 앱 최초의 두 번째 페이지
- 현 위치: `src/components/MealView.tsx:263` 에서 `<FeedbackBoard />` 인라인 렌더
  (InstallPrompt 아래, footer 위)
- UI: `src/components/FeedbackBoard.tsx` (클라이언트 컴포넌트, localStorage 3키 사용)
- 로직: `src/lib/feedback.ts` — 목록(추천순 고정)·작성·수정·삭제·추천·욕설필터
- API: `/api/feedback` (목록·작성·수정·삭제·추천 모두 경유, 클라이언트 직접 Supabase 호출 없음)
- 정렬: 현재 vote_count desc → created_at desc 고정. 최신순 탭은 쿼리 파라미터 추가 필요
- limit 50 고정 → 페이지네이션은 offset 또는 커서 방식 선택 필요 (구현 단계 결정)
- 메인 맛보기: 기존 `/api/feedback` 목록 응답 재사용 (limit 2 등 파라미터화) 권장

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| 건의글(Feedback) | core domain | body, vote_count, created_at, hidden | has one 운영자답변, has many 추천 |
| 추천(Vote) | supporting | vote_count 집계, localStorage votedIds | belongs to 건의글 |
| 운영자답변(AdminReply) | supporting | admin_reply, admin_replied_at | belongs to 건의글 / "답변완료 뱃지" 근거 |
| 수정토큰(EditToken) | supporting | 평문(localStorage) / sha256(DB) | belongs to 건의글 |
| 보드페이지(/feedback) | new surface | 정렬탭, 페이지네이션, 빈상태 | renders 건의글 목록 |
| 맛보기(Preview) | new surface | 상위 1~2개 + 더보기 | lives in 메인, links to 보드페이지 |
| 진입버튼(EntryButton) | new surface | — | lives in 메인, links to 보드페이지 |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 6 | 6 | - | - | N/A |
| 2 | 9 | 3 | 0 | 6 | 67% |
| 3 | 10 | 1 | 0 | 9 | 90% |
| 4 | 10 | 0 | 0 | 10 | 100% |
| 5 | 10 | 0 | 0 | 10 | 100% |

2라운드 연속 100% — 도메인 모델 수렴. (후보였던 댓글·카테고리·상태라벨 3개는 R4~5 에서 non-goal 로 제거)

## Interview Transcript
<details>
<summary>Full Q&A (Round 0 + 5 rounds)</summary>

### Round 0 (Topology)
**Q:** "진입 방식 분리 + 보드 형태 검토" 2개 갈래가 맞나?
**A:** 둘 다 맞음

### Round 1
**Q:** 별도 화면의 형태는? (라우트 페이지 vs 오버레이)
**A:** 상관없음, 제안받고 싶음
**Ambiguity:** 58%

### Round 2
**Q:** 형태 검토에서 현 원칙(익명·무댓글·가벼움) 중 어디까지 건드려도 되나?
**A:** 다 열어둬도 됨
**Ambiguity:** 49%

### Round 3
**Q:** 분리 후 메인 화면 그 자리에는 뭐가 남아야 하나?
**A:** 버튼 + 맛보기
**Ambiguity:** 38%

### Round 4 (Contrarian)
**Q:** 글도 몇 개 없는데 왜 바꾸나 — 이 변경이 해결하려는 진짜 문제는?
**A:** 메인이 너무 길어짐 + 외관/완성도 문제
**Ambiguity:** 26%

### Round 5 (결정)
**Q:** 위임된 2건 언제 결정? → 지금 바로. 추천안 제시.
**A:** ① 라우트 페이지 /feedback 채택 ② 정돈된 전용 보드 채택
**Ambiguity:** 9.5%

</details>
