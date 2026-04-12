# SESSION LOG — AUTHORED

---

## Session 01 · 2026-04-12

### 작업 개요
AUTHORED_spec.md 기반으로 프로젝트 초기 구현 (v1).

### 환경 설정
- 기존 git remote가 Enigma 저장소로 설정되어 있음
- `C:/Users/soomi/Dev/authored/` 경로의 git root가 홈 디렉토리(`C:/Users/soomi`)로 잡혀 있어 별도 git repo 초기화
- `https://github.com/soomin007/Authored.git` 으로 remote 재설정
- GitHub에 있던 기존 README("# Authored") 확인 후 새 README 작성

### 구현 내용 (v1)

**생성 파일**
| 파일 | 내용 |
|------|------|
| `index.html` | 단일 HTML 진입점. `dialogue-area`, `puzzle-area`, `button-area`, `credits` 구성 |
| `style.css` | 다크 테마 (#0a0a0f), JetBrains Mono, 타자기 커서, 배경 텍스트 스트림, 크레딧 |
| `game.js` | 타자기 효과, 씬 페이드 전환, 캔버스 점 연결 퍼즐, 배경 스트림, 막별 진행 |
| `dialogue.js` | 1~5막 전체 대사 데이터 |
| `README.md` | 프로젝트 소개, 막 구조표, 파일 구조, 기술 스택 |

**게임 구조 (v1)**
- 1막: 점 연결 퍼즐 (1→2→3→4→5 순서 강제)
- 2막: 동일 퍼즐, 자유 경로 — 2번 점에서 시작 여부로 "예상/예상 밖" 분기
- 3막: 3지선다 (네/아니요/모르겠습니다) 각각 다른 대사
- 4막: CSS `@keyframes` 배경 텍스트 스트림 + 글리치 효과 + 핵심 붕괴 대사
- 5막: 3종 엔딩 분기 (AI / 인간 / 둘 다 혹은 둘 다 아니다) → 크레딧

**커밋**: `af90c39` — `feat: AUTHORED 게임 초기 구현 (5막 전체)`

---

## Session 02 · 2026-04-13

### 작업 개요
AUTHORED v2 스펙 기반으로 미니게임 전면 교체 및 분기 대폭 확장.

### 변경 사항

**index.html**
- `puzzle-area` 제거
- `mini-game-area` 신규 추가 (미니게임 전용 영역 분리)

**style.css**
- 1막 원형 버튼 스타일 (`.circle-btn`, `.circle-btn-wrapper`)
- 2막 LEFT/RIGHT 버튼 (`.lr-area`, `.lr-btn`)
- 2막 텍스트 어긋남 클래스 (`.misalign-right`, `.miscolor-red`)
- 2막 색상 버튼 (`.btn-blue`, `.btn-red`)
- 3막 침묵 커서 (`.silence-area`, `.silence-cursor`)
- 4막 숫자 버튼 (`.number-game`, `.num-btn`)
- 4막 배경 스트림 강화: `#bg-stream.act4 .stream-col { opacity: 0.12 }`

**dialogue.js** — 완전 재작성
- `act1_returning_greeting`: 재방문 시 첫 인사 "다시 오셨군요."
- `act1_click_responses`: 10회 클릭 각 반응 배열
- `act2_intro_returning`: 재방문 시 2막 도입 대사
- 2막 4라운드 각 분기 대사 (`act2_r1~r4`, `act2_r4_shared`)
- `act2_reflection`: 핵심 3지선다 + `act2_choice_quit_response` 중첩 분기
- `act3_silence_early/mid/long`: 침묵 타이머 3분기
- `act4_5_vanish`: 5번 사라짐 후 3지선다
- `act4_choice_skip/wait/ask`: 각 선택 대사
- 5막 엔딩 C 대사 추가 ("당신도 모르고, 저도 모릅니다.")

**game.js** — 완전 재작성

| 함수 | 설명 |
|------|------|
| `runAct1MiniGame()` | 원형 버튼 클릭 10회, scale 감소 (`max(0.3, 1 - count*0.07)`) |
| `runAct2MiniGame()` | LEFT/RIGHT 4라운드. 라운드 3: 텍스트 오른쪽 치우침. 라운드 4: 텍스트 색 불일치 |
| `runAct3Silence()` | 30초 타이머 + click/keydown 감지. 0~9초=early, 10~29초=mid, 30초=long |
| `runAct4MiniGame()` | 숫자 1~6 흩어진 버튼, 4번 클릭 후 5번 잠깐 보였다 사라짐 |
| `startBgStream(act4)` | act4=true 시 `act4` 클래스 추가 → opacity 강화 |
| `resetState()` | 상태 초기화 (isReturning은 별도 설정) |

**숨겨진 분기 구현**
- 3막 30초 버티기 → 특별 대사 (`act3_silence_long`)
- 2막 `그만하겠습니다` → `아니요` → 페이드아웃 후 1막 재시작 (`isReturning = true`)
- 크레딧 "처음부터 다시" → `isReturning = true` → 1막 "다시 오셨군요."
- 4막 `왜 없앴는지 묻고 싶습니다` → 가장 긴 대사 분기

**커밋**: `3ad8778` — `feat: AUTHORED v2 — 미니게임 전면 교체 및 분기 확장`

---

## 현재 상태

- **배포**: `https://github.com/soomin007/Authored` (GitHub Pages 활성화 시 플레이 가능)
- **브랜치**: `main`
- **최신 커밋**: `3ad8778`
