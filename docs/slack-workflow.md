# Slack 양방향 운영 가이드

`Powerdaily` 워크스페이스의 `#claude-code` 채널을 통한 Claude 양방향 제어
셋업 기록과 운영 메모. PC ↔ 폰 작업 전환을 위해 2026-05-01 도입.

---

## 한눈에 보기

```
[폰 Slack #claude-code] @Claude 명령
        ↓
[Anthropic Claude 앱] → Claude Code Web 작업 트리거
        ↓
[GitHub tndudrla/school-meal] 새 브랜치 + 변경 커밋 + PR
        ↓
[#claude-code 채널] PR 링크 + View session 버튼 응답
        ↓
[폰] PR 클릭 → Vercel preview 자동 배포 → 시각 검증 → Merge
```

기존 `#claude-code` 채널에 흐르던 단방향 알림(`Schoo-meal` webhook —
PC Claude Code 의 Stop / Notification hook) 은 그대로 두고, 양방향 대화용
`Claude` 봇만 추가 설치한 형태. 두 봇이 같은 채널에 공존.

---

## 셋업 기록 (2026-05-01)

### 출발점
- `Powerdaily` Slack 워크스페이스 보유
- `#claude-code` 채널에 `Schoo-meal` 봇이 단방향 알림 푸시 중
  (Claude Code 의 `Stop` / `Notification` hook → incoming webhook)
- PC ↔ 폰 작업 전환 욕구 → Slack 양방향 채택

### 단계별 진행
1. **Anthropic 공식 Claude Slack 앱 설치** — 워크스페이스 앱 검색에서 "Claude" → Add to Slack
2. **Claude.ai 계정 연결** — 환영 화면의 `Connect Account` → claude.ai 로그인 → Authorize
   - 연결 계정: `sooyoungkim@kakao.com`
3. **GitHub 연결** — `/web-setup` 슬래시 커맨드가 자동 처리
   - 연결된 GitHub: `tndudrla` (school-meal repo 권한 포함)
   - Claude Code Web (`https://claude.ai/code`) 동시 활성
4. **첫 명령 검증** — `#claude-code` 채널에서 멘션:
   ```
   @Claude school-meal repo 의 dev 브랜치 docs/work-log.md 마지막 단락 한 줄 요약
   ```
   → Claude 가 실제로 dev 브랜치 fetch → work-log 읽고 정확한 Stage 14-1 예고 단락 요약 반환

### 결정적 제약 (Anthropic 공식 명시)
> **"You currently can't trigger Claude Code tasks by messaging the Claude app directly — you can only tag it in another conversation."**

- **DM ≠ 작업 명령** — 봇과 1:1 DM 으로는 Claude Code 트리거 안 됨
- **채널 멘션 = 작업 명령** — `#claude-code` 같은 채널에서 `@Claude <명령>` 형태
- 이 한계 때문에 1인 워크스페이스라도 채널이 반드시 필요

### Routing Mode (Claude 앱 설정)
- **`Code only`**: 코딩·기술 작업만 라우팅
- **`Code + Chat`**: 코딩 + 일반 대화·분석·글쓰기 자동 분기 ← 권장
- 2026-05-01 시점 기본값 `Code only`. `Code + Chat` 으로 변경 권장

### Model 설정
- **Opus** (최강) — 그대로 둘 것

---

## 운영 워크플로우

### PC vs 폰 분담

| 작업 종류 | PC (Cursor / Claude Code CLI) | 폰 (Slack `@Claude`) |
|---|---|---|
| 신규 scraper · 파서 설계 | ✅ 깊은 IDE 작업 | ❌ 화면 좁음 |
| 학교 1~5교 추가 | ✅ | ✅ |
| 학교 20+교 일괄 추가 | ✅ 빌드 스크립트 | △ 시간 오래 걸림 |
| 문서 (work-log, README) 수정 | ✅ | ✅ |
| 오타·문구 수정 | ✅ | ✅ |
| 로컬 `npm run dev` 검증 | ✅ 필수 | ❌ 불가 → Vercel preview 로 대체 |
| Vercel preview 시각 검증 | △ 브라우저 | ✅ 폰이 더 빠름 |
| PR 코멘트 응답 | ✅ | ✅ |
| 긴급 hotfix | ✅ | △ 응답 2~5초 지연 |

### 명령 베스트 패턴

```
@Claude
[작업]: 한 줄 요약
[브랜치]: dev 또는 새 브랜치명 명시
[참고]: docs/work-log.md Stage N, 또는 관련 파일 경로
[검증]: npm run build / Vercel preview / 시각 확인 항목
```

복잡한 작업일수록 컨텍스트 명시. Claude 가 응답 하단의 `View session`
버튼으로 추론 과정 노출하므로, 잘못 이해했으면 같은 채널에서 즉시 수정 명령.

### PR 자동 생성 vs 직접 commit

- **기본**: 새 브랜치 + PR 생성 (안전)
- **직접 dev 에 commit**: `dev 브랜치에 직접 commit, PR 없이` 명시
- **권장**: PR 생성 흐름 — Claude 작업이 의도와 다를 때 머지 전 폰으로 발견 가능
  (Vercel preview 가 PR 마다 별도 URL 생성 → 폰에서 즉시 시각 확인)

---

## PR 흐름 (개념)

PR (Pull Request): 변경사항을 메인 코드에 반영하기 전 검토받는 GitHub 표준 절차.

```
main ──●──●──●──●──         (안정 코드)
              └─●──●─       (작업 브랜치)
                   │
                   ▼
              [PR 생성]     검토·CI·preview
                   │
                   ▼
main ──●──●──●──●──●──●──   (검증 후 머지)
```

**왜 도입**:
- Claude 자동 작업의 안전망 (의도 다른 코드 머지 전 발견)
- Vercel 이 PR 마다 별도 preview URL 자동 생성 → 폰 시각 검증
- 롤백 단위 명확

**현재 정책**: dev → main 머지는 PR 거쳐서. dev 자체에 직접 push 는 1인 운영 편의상 허용.

---

## `#claude-code` 채널 메시지 종류

같은 채널에 두 종류 봇이 메시지 푸시. 봇 이름으로 구분.

| 봇 | 정체 | 메시지 패턴 |
|---|---|---|
| `Schoo-meal` | 단방향 webhook (PC Claude Code hook) | `[C:\...\school-meal] Stop` / `Notification` |
| `Claude` | 양방향 Anthropic 공식 앱 | `Working in tndudrla/school-meal ...` 등 |

거슬리면 채널 분리 가능 (예: `#claude-cmd` 별도). 일단 통합 운영해보고 결정.

---

## 보안 메모

- **NEIS API 키, Supabase service role key 등 비밀값을 Slack 메시지에 절대 안 붙이기**
  - 1인 워크스페이스라도 admin = 본인 계정 탈취 시 노출 위험
  - 모든 비밀값은 Vercel env 또는 로컬 환경변수만
- Slack 무료 플랜 메시지 90일 보존 — 비밀값 자동 만료된다고 안심하지 말 것
- Claude 앱 권한은 GitHub repo 단위로 최소화 (`school-meal` 만, 모든 repo X)

---

## 폰 셋업 (참고)

PC 셋업 끝나면 폰은 5분.

1. iOS App Store / Android Play Store → "Slack" 설치
2. 로그인 (이메일 매직 링크 또는 비밀번호)
3. `Powerdaily` 워크스페이스 자동 표시
4. `#claude-code` 채널 → 테스트:
   ```
   @Claude 폰 테스트 — 응답되니
   ```

---

## 한계와 우회

| 한계 | 우회 |
|---|---|
| 로컬 `npm run dev` 못 띄움 | Vercel preview 로 대체 |
| Slack DM 으로 작업 트리거 X | 채널 멘션 (`@Claude`) 사용 |
| 응답 2~5초 지연 | 긴급 hotfix 는 PC 가 빠름 |
| 한 메시지 너무 길면 잘림 | 작업 잘게 쪼개기 |
| Claude 가 의도와 다르게 작업 | PR 흐름으로 머지 전 발견 |
| Slack 90일 메시지 보존 | 중요 결정은 work-log.md 에 누적 |

---

## 향후 개선 후보

- [ ] Routing Mode → `Code + Chat` 변경 (현재 `Code only`)
- [ ] 폰 Slack 앱 설치·로그인
- [ ] Stage 14-1 (서울 사진 scraper) 을 Slack 명령으로 시도 — 양방향 첫 실전
- [ ] 명령 자주 쓰는 패턴 snippet 화 (Slack `/quick` 같은 단축)
- [ ] 채널 분리 검토: `#claude-cmd` (양방향) vs `#claude-code` (단방향 알림)
- [ ] `Schoo-meal` webhook 이름 정정 (`school-meal` 오타)
