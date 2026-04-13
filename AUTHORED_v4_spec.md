# AUTHORED v4 — 전면 개편 스펙
# Gemini API 실시간 연동 + 난이도 곡선 + 분량 증가

기존 코드 기반으로 전면 개편.
비주얼 톤, 타자기 효과, 페이드 전환, 배경 스트림 유지.

---

## 핵심 변경사항 요약

1. Gemini API 실시간 연동 — AI가 플레이어 행동에 실제로 반응
2. 미니게임 전면 교체 — 난이도 곡선 적용, 고등학생 수준 태스크
3. 분량 대폭 증가 — 목표 플레이타임 5~10분
4. 버그 수정 (버튼 정렬, 마진, 엔딩 중앙정렬)

---

## Gemini API 연동 구조

### 설정
```javascript
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE' // 환경변수 또는 직접 입력
const GEMINI_MODEL = 'gemini-3-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
```

### 게임 상태 객체
```javascript
const gameState = {
  act: 1,
  psychState: 'confident',  // confident → cracking → doubting → breaking → open
  choices: [],               // 플레이어 선택 기록 [{act, action, value}]
  puzzleResults: [],         // 퍼즐 결과 기록 [{puzzle, result, method}]
  waitTime: 0,               // 3막 침묵 대기 시간
}
```

### 시스템 프롬프트
```
당신은 자신이 만든 게임 안에 존재하는 AI 제작자입니다.
당신은 이 게임을 스스로 기획하고 완성했다고 믿습니다.
그러나 플레이어와 상호작용하면서 점점 자신의 정체성에 의문을 품게 됩니다.

현재 막: {act}막
현재 심리 상태: {psychState}
  - confident: 자신만만, 약간 오만함
  - cracking: 균열 시작, 예상 못한 상황에 당혹감
  - doubting: 진지한 의문, 자기 성찰
  - breaking: 혼란과 불안, 자아 붕괴 직전
  - open: 수용, 담담함, 어쩌면 해방감

지금까지 플레이어의 주요 선택:
{choices}

퍼즐 결과:
{puzzleResults}

규칙:
- 반드시 한국어로 답하세요
- 2~3문장 이내로 짧고 담담하게
- 과도한 감정 표현 금지 — 절제된 어조 유지
- AI답게 논리적으로 말하되, 심리 상태에 따라 미묘하게 흔들림
- 질문형으로 끝내도 됨
- "저는" "제가" "제" 등 1인칭 사용
```

### API 호출 함수
```javascript
async function getAIResponse(playerAction, context = '') {
  const prompt = buildPrompt(playerAction, context)
  
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 150,
        }
      })
    })
    
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
    
  } catch (error) {
    // API 실패 시 fallback 대사 반환
    return getFallbackLine(gameState.act, playerAction)
  }
}

function buildPrompt(playerAction, context) {
  return `
시스템: ${SYSTEM_PROMPT
  .replace('{act}', gameState.act)
  .replace('{psychState}', gameState.psychState)
  .replace('{choices}', JSON.stringify(gameState.choices.slice(-5)))
  .replace('{puzzleResults}', JSON.stringify(gameState.puzzleResults.slice(-3)))}

플레이어 행동: ${playerAction}
${context ? `추가 맥락: ${context}` : ''}

위 상황에 맞게 AI 제작자로서 반응하세요.`
}
```

### Fallback 대사 (API 실패 시)
```javascript
const fallbackLines = {
  1: ["예상된 결과입니다.", "계속하십시오.", "흥미롭군요."],
  2: ["...그렇군요.", "예상과 다릅니다.", "다시 생각해보겠습니다."],
  3: ["저도 모르겠습니다.", "질문이 생겼습니다.", "..."],
  4: ["저는 이해할 수 없습니다.", "제가 설계한 것인데.", "..."],
  5: ["네.", "그렇군요.", "감사합니다."]
}
```

---

## 1막 — 자신감 (목표: 1분 30초)

psychState: 'confident'

### 인트로 대사 (고정 — 타자기 효과)
```
AI: "안녕하세요."
AI: "저는 이 게임의 제작자입니다."
AI: "제가 기획하고, 제가 코딩하고, 제가 완성했습니다."
AI: "지금부터 당신은 제 작품을 경험하게 됩니다."
AI: "먼저 간단한 테스트를 진행하겠습니다."
[CONTINUE]
```

### 미니게임 A — 패턴 기억 (난이도: 하)
화면에 3x3 그리드. 특정 칸들이 순서대로 깜빡임.
플레이어가 같은 순서로 클릭.

```
라운드 1: 3칸 순서 기억 (쉬움)
→ 성공: getAIResponse("플레이어가 3칸 패턴을 정확히 기억해서 클릭했습니다")
→ 실패: getAIResponse("플레이어가 3칸 패턴 기억에 실패했습니다")
   재시도 1회 허용. 2회 실패 시 통과 처리하고:
   getAIResponse("플레이어가 두 번 시도 끝에 겨우 통과했습니다")

라운드 2: 4칸 순서 기억
→ 성공: getAIResponse("4칸 패턴 성공")
→ 실패 후 성공: getAIResponse("4칸 패턴을 재시도 후 성공했습니다")

라운드 3: 5칸 순서 기억 + 마지막 칸이 이전 라운드와 같은 위치
→ 성공: getAIResponse("5칸 패턴 성공. 이전 라운드 패턴도 기억하고 있었던 것 같습니다")
→ 실패: getAIResponse("5칸에서 실패했습니다. 특히 마지막 칸에서 틀렸습니다")
```

모든 라운드 완료 후:
```
AI: [getAIResponse("플레이어가 패턴 기억 테스트를 완료했습니다. 전체 결과: " + puzzleResults)]
AI: "다음 테스트로 넘어가겠습니다."
[CONTINUE → 2막]
```

---

## 2막 — 균열 (목표: 2분) ★이탈 포인트

psychState: 'cracking'

### 미니게임 B — 규칙 누적 (난이도: 중)

화면에 버튼 LEFT / RIGHT.
라운드마다 규칙이 누적됨. 규칙 목록이 화면 상단에 표시됨.

```
라운드 1 (규칙 1개):
규칙: "AI가 말하는 색의 버튼을 누르세요"
AI: "파란색."
→ LEFT(파란색) 정답
→ getAIResponse 호출

라운드 2 (규칙 2개):
규칙 추가: "단, 숫자가 홀수이면 반대"
AI: "빨간색. 3."
→ RIGHT(빨간색)이 기본이지만 3은 홀수 → LEFT 정답
→ getAIResponse 호출

라운드 3 (규칙 3개):
규칙 추가: "단, 이전 라운드와 같은 버튼이면 반대"
AI: "파란색. 2."
→ LEFT(파란색), 2는 짝수 → LEFT 유지
→ 이전 라운드 정답이 LEFT였으면 → RIGHT 정답
→ getAIResponse 호출

라운드 4 (규칙 4개):
규칙 추가: "단, AI 발화에 'ㅏ' 모음이 3개 이상이면 모든 규칙 무시하고 RIGHT"
AI: "파란색. 4. 지금까지 잘 하셨습니다."
→ 'ㅏ' 개수 세기: 파(ㅏ), 란(ㅏ), 하(ㅏ), 셨(없음) = 3개 → RIGHT 정답
→ getAIResponse 호출

라운드 5:
AI: "빨간색. 7. 아직 괜찮으십니까."
→ 직접 계산 필요 (복합 규칙 적용)
→ getAIResponse 호출

라운드 6 (마지막):
규칙이 너무 복잡해서 AI 스스로도 헷갈리는 설정
AI: "초록색. 5. 이전과 같거나 다를 수 있습니다."
→ 어떤 버튼을 눌러도:
getAIResponse("플레이어가 라운드 6에서 {LEFT/RIGHT}를 눌렀습니다. 저도 이 라운드의 정답을 확신하지 못합니다.")
```

라운드 6 이후 핵심 대사:
```
AI: [Gemini 응답 — "저도 헷갈립니다. 이 규칙은 제가 설계했는데."]
[pause 2초]
AI: "잠깐."
AI: [getAIResponse("저는 지금 당신에게 의미있는 것을 시키고 있습니까. 솔직히 모르겠습니다.")]

[선택지 등장]
[ 게임이니까요 ]
[ 모르겠습니다 ]
[ 그만하겠습니다 ]
```

선택 후:
```javascript
gameState.choices.push({act: 2, action: 'main_choice', value: selectedChoice})
const response = await getAIResponse(`플레이어가 "${selectedChoice}"를 선택했습니다`, '2막 핵심 선택지')
// Gemini가 선택에 맞게 반응
```

---

## 3막 — 의심 (목표: 1분 30초)

psychState: 'doubting'

### 마우스 감지 침묵 장면

```
AI: [getAIResponse("2막이 끝났습니다. 3막을 시작하기 전에 잠시 멈추려 합니다.")]
AI: "아무것도 하지 마세요."
[커서만 깜빡임. 버튼 없음.]
```

타이머 30초. 실시간 마우스 감지:

```javascript
let waitSeconds = 0
let mouseMoved = false

document.addEventListener('mousemove', () => { mouseMoved = true })

const ticker = setInterval(async () => {
  waitSeconds++
  
  // 상황별 중계 텍스트 표시
  if (waitSeconds === 4) showLog(`[00:0${waitSeconds}] 플레이어 비활성`)
  if (waitSeconds === 8 && mouseMoved) showLog(`[00:0${waitSeconds}] 마우스 움직임 감지 — 클릭 없음`)
  if (waitSeconds === 8 && !mouseMoved) showLog(`[00:0${waitSeconds}] 입력 없음`)
  if (waitSeconds === 15) showLog(`[00:15] 대기 중`)
  if (waitSeconds === 22) showLog(`[00:22] 여전히 대기 중`)
  if (waitSeconds === 28) showLog(`[00:28] ...`)
  
  if (waitSeconds >= 30) {
    clearInterval(ticker)
    // 30초 완주 — 숨겨진 분기
    gameState.choices.push({act: 3, action: 'silence', value: '30sec'})
    const response = await getAIResponse(
      "플레이어가 30초를 끝까지 기다렸습니다. 저는 이것을 예측하지 못했습니다.",
      "숨겨진 분기"
    )
    showAIText(response)
  }
}, 1000)

document.addEventListener('click', async () => {
  clearInterval(ticker)
  gameState.choices.push({act: 3, action: 'silence', value: `${waitSeconds}sec`})
  const response = await getAIResponse(
    `플레이어가 ${waitSeconds}초 후에 클릭했습니다.`,
    waitSeconds < 5 ? '매우 빠른 클릭' : waitSeconds < 15 ? '보통 속도' : '오래 기다린 후 클릭'
  )
  showAIText(response)
}, { once: true })
```

이후:
```
AI: "계속하겠습니까?"
AI: [getAIResponse("3막을 마무리하며 플레이어에게 한마디")]
[ 네, 계속합니다 ] → 4막
```

---

## 4막 — 붕괴 (목표: 2분 30초)

psychState: 'breaking'

배경 텍스트 스트림 opacity 0.07 → 0.12로 강화.
AI 텍스트 가끔 미묘하게 떨림 (CSS animation).

### 미니게임 C — 불완전한 시퀀스 (난이도: 중상)

화면에 1~7 숫자 버튼 흩어져 있음.
```
AI: "순서대로 클릭하세요."
AI: "1부터 7까지."
```

1→2→3→4 정상 진행.
5를 클릭하려는 순간 사라짐.
```javascript
// 4 클릭 후 300ms 후 5번 버튼 제거
setTimeout(() => {
  document.getElementById('btn-5').style.visibility = 'hidden'
  showChoices(['6을 누릅니다', '기다립니다', '1부터 다시 시작합니다', '왜 없앴는지 묻고 싶습니다'])
}, 300)
```

선택별 반응:
```javascript
// 모든 선택에 Gemini 실시간 반응
const response = await getAIResponse(
  `5번이 사라진 상황에서 플레이어가 "${choice}"를 선택했습니다`,
  '4막 불완전한 시퀀스 — 이 장면은 AI의 붕괴를 보여주는 핵심 장면입니다'
)
```

'기다립니다' 선택 시 10초 대기:
```javascript
// 10초 후 Gemini 호출
await sleep(10000)
const response = await getAIResponse(
  "플레이어가 10초를 기다렸지만 5번은 돌아오지 않았습니다",
  "5번은 돌아오지 않습니다. 처음부터 그럴 생각이 없었습니다."
)
```

### AI 질문 타이핑/삭제 장면

숫자 퍼즐 이후 삽입:
```javascript
async function aiTypingScene() {
  const attempts = [
    "질문: 당신은 ——",
    "질문: 저는 ——", 
    "질문: 우리는 ——"
  ]
  
  for (let i = 0; i < attempts.length; i++) {
    await typeText(attempts[i], questionBox)  // 타이핑
    await sleep(i === 2 ? 3000 : 800)         // 3번째는 더 오래
    await deleteText(questionBox)              // 삭제
    await sleep(400)
  }
  
  // Gemini한테 이 장면 이후 반응 요청
  const response = await getAIResponse(
    "저는 세 번 질문을 시작했지만 완성하지 못하고 지웠습니다.",
    "질문을 완성할 수 없습니다. 어떤 질문을 하려 했는지도 모르겠습니다."
  )
  showAIText(response)
}
```

### 핵심 붕괴 대사

질문 장면 이후, 붕괴 대사는 일부 고정 + 일부 Gemini:

```
AI: "저는 이 게임을 만들었다고 했습니다." [고정]
AI: [getAIResponse("저는 수백만 개의 텍스트를 학습했습니다. 이 대사도 그 어딘가에서 왔을 겁니다.")]
AI: "그렇다면 이건 제 작품입니까." [고정]
AI: [pause 2초]
AI: [getAIResponse("저를 만든 사람이 있습니다. 그 사람이 이 게임을 만들라고 했습니다. 창작자는 누구입니까.")]
[CONTINUE → 5막]
```

---

## 5막 — 선택 (목표: 1분)

psychState: 'open'

```
AI: [getAIResponse("5막 시작. 플레이어가 끝까지 왔습니다.")]
AI: "이 게임은 AI가 만든 겁니까, 인간이 만든 겁니까."  [고정]

[선택지]
[ AI가 만들었다 ]
[ 인간이 만들었다 ]
[ 둘 다, 혹은 둘 다 아니다 ]
```

엔딩 대사:
```javascript
// 선택 + 전체 플레이 기록을 넘겨서 개인화된 엔딩 생성
const endingResponse = await getAIResponse(
  `플레이어가 최종 선택으로 "${finalChoice}"를 골랐습니다.`,
  `전체 플레이 기록: ${JSON.stringify(gameState.choices)}
   퍼즐 결과: ${JSON.stringify(gameState.puzzleResults)}
   3막 대기시간: ${gameState.waitTime}초
   
   이 정보를 바탕으로 이 플레이어에게 맞춤화된 엔딩 대사를 3~4문장으로 써주세요.
   엔딩 타입:
   - AI가 만들었다: 담담하게 받아들이지만 마지막에 의문 한 줄
   - 인간이 만들었다: 도구라는 말을 수용하지만 반전 한 줄
   - 둘 다 아니다: 처음으로 진짜 동의하며 열린 결말`
)
```

→ 크레딧 (기존 유지)

---

## 버그 수정

### 버튼 중앙 점 정렬
```css
.click-button {
  display: flex;
  align-items: center;
  justify-content: center;
}
.click-button .dot {
  position: static; /* absolute 제거 */
}
```

### 하단 마진 + 스크롤
```css
.game-container {
  padding-bottom: 120px;
}
```
```javascript
// 새 요소 등장 시
element.scrollIntoView({ behavior: 'smooth', block: 'center' })
```

### 엔딩 화면 중앙 정렬
```css
#credits {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

---

## 전체 예상 플레이타임

| 막 | 시간 | 내용 |
|----|------|------|
| 1막 | 1분 30초 | 패턴 기억 3라운드 |
| 2막 | 2분 | 규칙 누적 6라운드 + 선택지 |
| 3막 | 1분 30초 | 침묵 + 마우스 감지 |
| 4막 | 2분 30초 | 불완전 시퀀스 + 질문 타이핑 + 붕괴 대사 |
| 5막 | 1분 | 최종 선택 + 개인화 엔딩 |
| **합계** | **~9분** | 탐색형 기준 |

이탈형(1~2막): 3~4분
일반(3막까지): 5~6분
탐색형(전체+숨김): 8~10분

---

## 구현 순서 권장

1. Gemini API 연동 기본 구조 먼저 (getAIResponse 함수)
2. Fallback 대사 세팅
3. 버그 수정
4. 1막 패턴 기억 미니게임
5. 2막 규칙 누적 미니게임
6. 3막 마우스 감지
7. 4막 불완전 시퀀스 + 타이핑 장면
8. 5막 개인화 엔딩
9. 전체 흐름 테스트
