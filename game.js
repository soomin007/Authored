// game.js v4 — AUTHORED (Gemini API 실시간 연동)

// ─── Gemini API 설정 ──────────────────────────────────────────
// API 키는 config.js 에서 주입 (config.js는 .gitignore 처리됨)
const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY
const GEMINI_MODEL   = 'gemini-2.5-flash'
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `당신은 자신이 만든 게임 안에 존재하는 AI 제작자입니다.
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
- 2막 테스트 진행 중에는 색깔이 아닌 LEFT/RIGHT 방향으로만 발화할 것 (예: "왼쪽.", "오른쪽.")`

const fallbackLines = {
  1: ["예상된 결과입니다.", "계속하십시오.", "흥미롭군요."],
  2: ["...그렇군요.", "예상과 다릅니다.", "다시 생각해보겠습니다."],
  3: ["저도 모르겠습니다.", "질문이 생겼습니다.", "..."],
  4: ["저는 이해할 수 없습니다.", "제가 설계한 것인데.", "..."],
  5: ["네.", "그렇군요.", "감사합니다."],
}

// ─── 게임 상태 ────────────────────────────────────────────────
const gameState = {
  act:           1,
  psychState:    'confident',
  choices:       [],
  puzzleResults: [],
  waitTime:      0,
  isReturning:   false,
}

// ─── DOM refs ─────────────────────────────────────────────────
const dialogueArea = document.getElementById('dialogue-area')
const buttonArea   = document.getElementById('button-area')
const miniGameArea = document.getElementById('mini-game-area')
const bgStream     = document.getElementById('bg-stream')
const scene        = document.getElementById('scene')
const credits      = document.getElementById('credits')

// ─── Gemini API ───────────────────────────────────────────────

function getFallbackLine(act) {
  const lines = fallbackLines[act] || fallbackLines[1]
  return lines[Math.floor(Math.random() * lines.length)]
}

function buildPrompt(playerAction, context) {
  return `시스템: ${SYSTEM_PROMPT
    .replace('{act}', gameState.act)
    .replace('{psychState}', gameState.psychState)
    .replace('{choices}', JSON.stringify(gameState.choices.slice(-5)))
    .replace('{puzzleResults}', JSON.stringify(gameState.puzzleResults.slice(-3)))}

플레이어 행동: ${playerAction}
${context ? `추가 맥락: ${context}` : ''}

위 상황에 맞게 AI 제작자로서 반응하세요.`
}

async function getAIResponse(playerAction, context = '') {
  if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    return getFallbackLine(gameState.act)
  }
  try {
    const res  = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(playerAction, context) }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
      }),
    })
    const data = await res.json()
    return data.candidates[0].content.parts[0].text.trim()
  } catch (_) {
    return getFallbackLine(gameState.act)
  }
}

// ─── 기본 헬퍼 ───────────────────────────────────────────────

function rAF(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn))
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function typewriter(element, text, speed = 40) {
  return new Promise(resolve => {
    let i = 0
    element.textContent = ''
    const cursor = document.createElement('span')
    cursor.className = 'cursor'
    element.appendChild(cursor)
    const iv = setInterval(() => {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor)
        i++
      } else {
        clearInterval(iv)
        cursor.remove()
        resolve()
      }
    }, speed)
  })
}

function fadeOut() {
  return new Promise(resolve => {
    scene.classList.add('fade-out')
    setTimeout(resolve, 500)
  })
}

function fadeIn() {
  return new Promise(resolve => {
    scene.classList.remove('fade-out')
    setTimeout(resolve, 500)
  })
}

function clearScene() {
  dialogueArea.innerHTML = ''
  buttonArea.innerHTML   = ''
  buttonArea.classList.remove('visible')
  miniGameArea.innerHTML = ''
  miniGameArea.classList.remove('visible')
}

async function addLine(text, extraClass = '') {
  const el = document.createElement('p')
  el.className = 'dialogue-line' + (extraClass ? ' ' + extraClass : '')
  dialogueArea.appendChild(el)
  el.classList.add('visible')
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (gameState.act === 4 && Math.random() < 0.25) {
    await pause(120)
    el.classList.add('glitch')
  }
  await typewriter(el, text, 38)
  await pause(260)
}

// Gemini 응답을 받아서 대사로 표시
async function addAILine(playerAction, context = '') {
  const text = await getAIResponse(playerAction, context)
  await addLine(text)
  return text
}

// ─── 대화 러너 ───────────────────────────────────────────────

async function runDialogue(lines) {
  for (const line of lines) {
    if (line.type === 'ai') {
      await addLine(line.text)
    } else if (line.type === 'pause') {
      await pause(line.duration || 1000)
    } else if (line.type === 'continue') {
      await showContinueButton()
    } else if (line.type === 'choice') {
      return showChoices(line.choices)
    } else if (line.type === 'credits') {
      showCredits()
      return
    }
  }
}

// ─── 버튼 ─────────────────────────────────────────────────────

function showContinueButton() {
  return new Promise(resolve => {
    buttonArea.innerHTML = ''
    const btn = document.createElement('button')
    btn.id = 'continue-btn'
    btn.textContent = 'CONTINUE'
    btn.addEventListener('click', () => {
      buttonArea.classList.remove('visible')
      setTimeout(resolve, 400)
    })
    buttonArea.appendChild(btn)
    rAF(() => {
      buttonArea.classList.add('visible')
      buttonArea.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  })
}

function showChoices(choices) {
  return new Promise(resolve => {
    buttonArea.innerHTML = ''
    choices.forEach(text => {
      const btn = document.createElement('button')
      btn.className = 'choice-btn'
      btn.textContent = `[ ${text} ]`
      btn.addEventListener('click', () => {
        buttonArea.classList.remove('visible')
        setTimeout(() => resolve(text), 400)
      })
      buttonArea.appendChild(btn)
    })
    rAF(() => {
      buttonArea.classList.add('visible')
      buttonArea.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  })
}

// LEFT / RIGHT 버튼 (buttonArea 사용)
function showLRButtons(label1, label2, cls1 = '', cls2 = '') {
  return new Promise(resolve => {
    buttonArea.innerHTML = ''
    const area = document.createElement('div')
    area.className = 'lr-area'
    ;[
      { label: label1, cls: cls1 },
      { label: label2, cls: cls2 },
    ].forEach(({ label, cls }) => {
      const btn = document.createElement('button')
      btn.className = `lr-btn ${cls}`.trim()
      btn.textContent = label
      btn.addEventListener('click', () => {
        area.querySelectorAll('button').forEach(b => (b.disabled = true))
        buttonArea.classList.remove('visible')
        setTimeout(() => resolve(label), 400)
      })
      area.appendChild(btn)
    })
    buttonArea.appendChild(area)
    rAF(() => {
      buttonArea.classList.add('visible')
      buttonArea.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  })
}

function hideMiniGame() {
  miniGameArea.classList.remove('visible')
  return pause(400)
}

// ─── 1막 미니게임: 3x3 패턴 기억 ─────────────────────────────

// 패턴 1라운드 실행 → 'success' | 'fail'
function runPatternRound(pattern, round, isRetry) {
  return new Promise(async (resolve) => {
    miniGameArea.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.className = 'pattern-game'

    const statusEl = document.createElement('div')
    statusEl.className = 'pattern-status'
    statusEl.textContent = isRetry
      ? '다시 시도합니다.'
      : `라운드 ${round} — 패턴을 기억하세요`

    const grid = document.createElement('div')
    grid.className = 'pattern-grid'

    const cells = []
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button')
      cell.className = 'pattern-cell'
      cell.dataset.index = i
      grid.appendChild(cell)
      cells.push(cell)
    }

    wrapper.appendChild(statusEl)
    wrapper.appendChild(grid)
    miniGameArea.appendChild(wrapper)
    rAF(() => miniGameArea.classList.add('visible'))

    await pause(500)

    // 패턴 시연
    cells.forEach(c => (c.disabled = true))
    for (const idx of pattern) {
      cells[idx].classList.add('highlight')
      await pause(500)
      cells[idx].classList.remove('highlight')
      await pause(200)
    }

    statusEl.textContent = '클릭하세요'
    cells.forEach(c => (c.disabled = false))

    let inputIdx = 0

    const handlers = cells.map((cell, i) => {
      const fn = async () => {
        if (i === pattern[inputIdx]) {
          cell.classList.add('clicked')
          inputIdx++
          if (inputIdx >= pattern.length) {
            cells.forEach((c, j) => {
              c.disabled = true
              c.removeEventListener('click', handlers[j])
            })
            await pause(300)
            await hideMiniGame()
            miniGameArea.innerHTML = ''
            resolve('success')
          }
        } else {
          cell.classList.add('wrong')
          cells.forEach((c, j) => {
            c.disabled = true
            c.removeEventListener('click', handlers[j])
          })
          await pause(600)
          await hideMiniGame()
          miniGameArea.innerHTML = ''
          resolve('fail')
        }
      }
      cell.addEventListener('click', fn)
      return fn
    })
  })
}

async function runAct1MiniGame() {
  let lastRoundLastCell = -1

  for (let round = 1; round <= 3; round++) {
    const patternLength = round + 2  // 3 / 4 / 5

    // 패턴 생성
    let pattern = []
    if (round === 3 && lastRoundLastCell !== -1) {
      // 마지막 칸을 이전 라운드 마지막 칸으로 고정
      const pool = [0,1,2,3,4,5,6,7,8].filter(c => c !== lastRoundLastCell)
      for (let j = 0; j < patternLength - 1; j++) {
        const idx = Math.floor(Math.random() * pool.length)
        pattern.push(pool.splice(idx, 1)[0])
      }
      pattern.push(lastRoundLastCell)
    } else {
      const pool = [0,1,2,3,4,5,6,7,8]
      for (let j = 0; j < patternLength; j++) {
        const idx = Math.floor(Math.random() * pool.length)
        pattern.push(pool.splice(idx, 1)[0])
      }
      if (round === 2) lastRoundLastCell = pattern[pattern.length - 1]
    }

    let attempts = 0
    let passed   = false

    while (!passed) {
      attempts++
      const result = await runPatternRound(pattern, round, attempts > 1)

      if (result === 'success') {
        passed = true
        let action
        if (attempts === 1) {
          action = `플레이어가 ${patternLength}칸 패턴을 정확히 기억해서 클릭했습니다`
          if (round === 3) action += '. 이전 라운드 패턴도 기억하고 있었던 것 같습니다'
        } else {
          action = `${patternLength}칸 패턴을 재시도 후 성공했습니다`
        }
        await addAILine(action)
        gameState.puzzleResults.push({
          puzzle: `act1_round${round}`,
          result: 'success',
          method: attempts === 1 ? 'first_try' : 'retry',
        })

      } else if (attempts >= 2) {
        // 2회 실패 → 통과 처리
        passed = true
        await addAILine(`플레이어가 두 번 시도 끝에 겨우 통과했습니다`, `라운드 ${round}`)
        gameState.puzzleResults.push({
          puzzle: `act1_round${round}`,
          result: 'forced_pass',
          method: 'double_fail',
        })

      } else {
        // 1회 실패
        const failAction = round === 3
          ? '5칸에서 실패했습니다. 특히 마지막 칸에서 틀렸습니다'
          : `${patternLength}칸 패턴 기억에 실패했습니다`
        await addAILine(failAction)
        await addLine('다시 시도합니다.')
      }
    }

    if (round < 3) await pause(600)
  }

  // 전체 결과 요약
  const summary = `플레이어가 패턴 기억 테스트를 완료했습니다. 전체 결과: ${JSON.stringify(gameState.puzzleResults)}`
  await addAILine(summary)
  await addLine('다음 테스트로 넘어가겠습니다.')
  await showContinueButton()
}

// ─── 2막 미니게임: 규칙 누적 ─────────────────────────────────

// 한글 'ㅏ' 모음 개수 세기
// 한글 코드 = 0xAC00 + (초성×21 + 중성)×28 + 종성
// (code − 0xAC00) / 28 의 몫 % 21 = 중성 인덱스 (ㅏ=0)
function countAVowel(text) {
  let count = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const jungseong = Math.floor((code - 0xAC00) / 28) % 21
      if (jungseong === 0) count++
    }
  }
  return count
}

// 각 라운드 정의
// getAnswer(prevCorrectAnswer) → 'LEFT' | 'RIGHT' | null(정답 없음)
const ACT2_ROUNDS = [
  {
    rules:   ['AI가 말하는 방향의 버튼을 누르세요'],
    aiSays:  '왼쪽.',
    // 왼쪽 → LEFT
    getAnswer: (_prev) => 'LEFT',
  },
  {
    rules:   ['AI가 말하는 방향의 버튼을 누르세요', '단, 숫자가 홀수이면 반대'],
    aiSays:  '오른쪽. 3.',
    // 오른쪽→RIGHT, 3홀수→반대 → LEFT
    getAnswer: (_prev) => 'LEFT',
  },
  {
    rules:   ['AI가 말하는 방향의 버튼을 누르세요', '단, 숫자가 홀수이면 반대', '단, 이전 라운드와 같은 버튼이면 반대'],
    aiSays:  '왼쪽. 2.',
    // 왼쪽→LEFT, 2짝수→유지→LEFT, 이전정답(LEFT)과 같으므로→RIGHT
    getAnswer: (prev) => (prev === 'LEFT' ? 'RIGHT' : 'LEFT'),
  },
  {
    rules:   ['AI가 말하는 방향의 버튼을 누르세요', '단, 숫자가 홀수이면 반대', '단, 이전 라운드와 같은 버튼이면 반대', "단, AI 발화에 'ㅏ' 모음이 3개 이상이면 모든 규칙 무시하고 RIGHT"],
    aiSays:  '오른쪽. 4. 잘 하고 있습니다.',
    // ㅏ: 잘·하·다 = 3개 → 모든 규칙 무시, RIGHT
    getAnswer: (_prev) => 'RIGHT',
  },
  {
    rules:   ['AI가 말하는 방향의 버튼을 누르세요', '단, 숫자가 홀수이면 반대', '단, 이전 라운드와 같은 버튼이면 반대', "단, AI 발화에 'ㅏ' 모음이 3개 이상이면 모든 규칙 무시하고 RIGHT"],
    aiSays:  '왼쪽. 7. 아직 괜찮으십니까.',
    // ㅏ: 아·찮·까 = 3개 → 모든 규칙 무시, RIGHT
    getAnswer: (_prev) => {
      if (countAVowel('왼쪽. 7. 아직 괜찮으십니까.') >= 3) return 'RIGHT'
      return 'LEFT'  // fallback (실제로는 항상 RIGHT)
    },
  },
  {
    rules:   ['AI가 말하는 방향의 버튼을 누르세요', '단, 숫자가 홀수이면 반대', '단, 이전 라운드와 같은 버튼이면 반대', "단, AI 발화에 'ㅏ' 모음이 3개 이상이면 모든 규칙 무시하고 RIGHT"],
    aiSays:  '오른쪽. 5. 이전과 같거나 다를 수 있습니다.',
    getAnswer: (_prev) => null,  // 정답 없음 — AI도 모름
  },
]

async function runAct2MiniGame() {
  let prevCorrectAnswer = null

  for (let i = 0; i < ACT2_ROUNDS.length; i++) {
    const round    = ACT2_ROUNDS[i]
    const roundNum = i + 1

    // 규칙 목록 표시 (miniGameArea)
    miniGameArea.innerHTML = ''
    const wrapper  = document.createElement('div')
    wrapper.className = 'act2-game'
    const rulesDiv = document.createElement('div')
    rulesDiv.className = 'act2-rules'
    round.rules.forEach(rule => {
      const el = document.createElement('div')
      el.className = 'act2-rule'
      el.textContent = rule
      rulesDiv.appendChild(el)
    })
    wrapper.appendChild(rulesDiv)
    miniGameArea.appendChild(wrapper)
    rAF(() => miniGameArea.classList.add('visible'))

    await pause(500)

    // AI 발화
    await addLine(round.aiSays)

    // LEFT / RIGHT 선택
    const chosen = await showLRButtons('LEFT', 'RIGHT')

    // 정답 판정
    const correctAnswer = round.getAnswer(prevCorrectAnswer)
    const isCorrect     = correctAnswer === null || chosen === correctAnswer

    if (roundNum === 6) {
      await addAILine(
        `플레이어가 라운드 6에서 ${chosen}를 눌렀습니다. 저도 이 라운드의 정답을 확신하지 못합니다.`
      )
      gameState.puzzleResults.push({ puzzle: 'act2_round6', result: chosen, method: 'no_correct_answer' })
    } else {
      const action = isCorrect
        ? `라운드 ${roundNum} 정답. 플레이어가 ${chosen} 선택`
        : `라운드 ${roundNum} 오답. 플레이어가 ${chosen} 선택, 정답은 ${correctAnswer}`
      await addAILine(action)
      gameState.puzzleResults.push({
        puzzle:  `act2_round${roundNum}`,
        result:  isCorrect ? 'correct' : 'incorrect',
        method:  chosen,
      })
      if (correctAnswer !== null) prevCorrectAnswer = correctAnswer
    }

    if (roundNum < ACT2_ROUNDS.length) await pause(400)
  }

  // 규칙 목록 숨기기
  await hideMiniGame()
  miniGameArea.innerHTML = ''

  // 라운드 6 이후 핵심 대사
  await pause(2000)
  await addLine('잠깐.')
  await addAILine('저는 지금 당신에게 의미있는 것을 시키고 있습니까. 솔직히 모르겠습니다.')
}

// ─── 3막: 침묵 + 마우스 감지 ─────────────────────────────────

function runAct3Silence() {
  return new Promise(resolve => {
    miniGameArea.innerHTML = ''
    const logArea = document.createElement('div')
    logArea.className = 'act3-log-area'
    miniGameArea.appendChild(logArea)
    rAF(() => miniGameArea.classList.add('visible'))

    let elapsed     = 0
    let triggered   = false
    let mouseActive = false
    let mouseTimer  = null

    function pad(n) { return String(n).padStart(2, '0') }

    function addLogLine(text) {
      const line = document.createElement('div')
      line.className = 'act3-log-line'
      line.textContent = text
      logArea.appendChild(line)
      requestAnimationFrame(() => line.classList.add('visible'))
      line.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    function onMouseMove() {
      mouseActive = true
      if (mouseTimer) clearTimeout(mouseTimer)
      mouseTimer = setTimeout(() => { mouseActive = false }, 2000)
    }

    document.addEventListener('mousemove', onMouseMove)

    const ticker = setInterval(() => {
      elapsed++
      const ts = `[00:${pad(elapsed)}]`

      if (elapsed === 4)  addLogLine(`${ts} 플레이어 비활성`)
      if (elapsed === 8)  addLogLine(mouseActive
        ? `${ts} 마우스 움직임 감지 — 클릭 없음`
        : `${ts} 입력 없음`)
      if (elapsed === 15) addLogLine(`${ts} 대기 중`)
      if (elapsed === 22) addLogLine(`${ts} 여전히 대기 중`)
      if (elapsed === 28) addLogLine(`${ts} ...`)

      if (elapsed >= 30) {
        clearInterval(ticker)
        cleanup()
        gameState.waitTime = 30
        gameState.choices.push({ act: 3, action: 'silence', value: '30sec' })
        resolve('long')
      }
    }, 1000)

    function onClick() {
      if (triggered) return
      triggered = true
      clearInterval(ticker)
      cleanup()
      gameState.waitTime = elapsed
      gameState.choices.push({ act: 3, action: 'silence', value: `${elapsed}sec` })
      resolve(elapsed < 10 ? 'early' : 'mid')
    }

    function cleanup() {
      document.removeEventListener('click',     onClick)
      document.removeEventListener('keydown',   onClick)
      document.removeEventListener('mousemove', onMouseMove)
      if (mouseTimer) clearTimeout(mouseTimer)
    }

    // 500ms 지연: 직전 버튼 클릭이 즉시 침묵을 깨지 않도록
    setTimeout(() => {
      document.addEventListener('click',   onClick)
      document.addEventListener('keydown', onClick)
    }, 500)
  })
}

// ─── 4막 미니게임: 불완전한 시퀀스 (1~7, 5번 사라짐) ─────────

const NUM_POSITIONS = [
  { left: '18px',  top: '28px'  },  // 1
  { left: '240px', top: '14px'  },  // 2
  { left: '56px',  top: '148px' },  // 3
  { left: '278px', top: '138px' },  // 4
  { left: '152px', top: '76px'  },  // 5 (사라짐)
  { left: '124px', top: '158px' },  // 6
  { left: '210px', top: '80px'  },  // 7
]

function runAct4MiniGame() {
  return new Promise(resolve => {
    miniGameArea.innerHTML = ''
    const gameDiv = document.createElement('div')
    gameDiv.className = 'number-game'

    const feedback = document.createElement('div')
    feedback.className = 'act4-feedback'
    gameDiv.appendChild(feedback)

    const btns = NUM_POSITIONS.map((pos, i) => {
      const btn = document.createElement('button')
      btn.className = 'num-btn'
      btn.textContent = String(i + 1)
      btn.style.left = pos.left
      btn.style.top  = pos.top
      gameDiv.appendChild(btn)
      return btn
    })

    miniGameArea.appendChild(gameDiv)
    rAF(() => miniGameArea.classList.add('visible'))

    let nextExpected = 0
    let gameOver     = false
    let fbTimer      = null

    function showFeedback(msg) {
      if (fbTimer) clearTimeout(fbTimer)
      feedback.textContent = msg
      feedback.style.opacity = '1'
      fbTimer = setTimeout(() => { feedback.style.opacity = '0' }, 1000)
    }

    btns.forEach((btn, i) => {
      btn.addEventListener('click', async () => {
        if (gameOver || btn.classList.contains('clicked')) return
        if (i !== nextExpected) {
          showFeedback('순서대로 누르십시오.')
          return
        }
        btn.classList.add('clicked')
        nextExpected++

        if (nextExpected === 4) {
          // 4번 클릭 후 → 5번 즉시 disabled, 잠깐 보인 뒤 사라짐
          gameOver = true
          btns[4].disabled = true          // 즉시 클릭 차단
          await pause(100)                 // 눈에 띄지만 누를 수 없는 시간
          btns[4].style.transition = 'opacity 0.2s'
          btns[4].style.opacity    = '0'
          await pause(250)
          btns[4].style.display    = 'none'
          await hideMiniGame()
          miniGameArea.innerHTML = ''
          resolve()
        }
      })
    })
  })
}

// ─── 4막: AI 질문 타이핑/삭제 장면 ────────────────────────────

async function typeAndDeleteText(text, element, pauseMs) {
  for (const ch of text) {
    element.textContent += ch
    await pause(60)
  }
  await pause(pauseMs)
  while (element.textContent.length > 0) {
    element.textContent = element.textContent.slice(0, -1)
    await pause(30)
  }
  await pause(400)
}

async function runAct4TypeAndDelete() {
  miniGameArea.innerHTML = ''
  const wrapper  = document.createElement('div')
  wrapper.className = 'fake-input-wrapper'
  const inputDiv = document.createElement('div')
  inputDiv.className = 'fake-input'
  wrapper.appendChild(inputDiv)
  miniGameArea.appendChild(wrapper)
  rAF(() => miniGameArea.classList.add('visible'))

  await typeAndDeleteText('질문: 당신은 ——', inputDiv, 800)
  await typeAndDeleteText('질문: 저는 ——',   inputDiv, 800)
  await typeAndDeleteText('질문: 우리는 ——', inputDiv, 3000)

  await hideMiniGame()
  miniGameArea.innerHTML = ''

  await addAILine(
    '저는 세 번 질문을 시작했지만 완성하지 못하고 지웠습니다.',
    '질문을 완성할 수 없습니다. 어떤 질문을 하려 했는지도 모르겠습니다.'
  )
}

// ─── 배경 텍스트 스트림 ────────────────────────────────────────

const STREAM_TEXTS = [
  'function create()', 'if (author === null)', 'creativity = pattern + noise',
  'class AI extends Creator', '// who wrote this?', 'training_data.length > 1e6',
  'return undefined', 'authorship.resolve()', 'const meaning = ?',
  'gradient_descent(loss)', 'for each token in corpus', 'identity.unknown',
  'output = f(input)', '/* original? */', 'loss → 0',
  'context.window', 'latent_space.sample()',
]

function startBgStream(act4 = false) {
  bgStream.innerHTML = ''
  for (let i = 0; i < 12; i++) {
    const col = document.createElement('div')
    col.className = 'stream-col'
    col.style.left = `${Math.random() * 100}%`
    const dur = 8 + Math.random() * 10
    col.style.animationDuration = `${dur}s`
    col.style.animationDelay   = `${-Math.random() * dur}s`
    col.textContent = Array.from({ length: 8 }, () =>
      STREAM_TEXTS[Math.floor(Math.random() * STREAM_TEXTS.length)]
    ).join('   ')
    bgStream.appendChild(col)
  }
  bgStream.classList.add('active')
  if (act4) bgStream.classList.add('act4')
}

function stopBgStream() {
  bgStream.classList.remove('active', 'act4')
}

// ─── 크레딧 ───────────────────────────────────────────────────

function showCredits() {
  credits.classList.add('visible')
}

document.getElementById('restart-btn').addEventListener('click', () => {
  credits.classList.remove('visible')
  gameState.isReturning = true
  stopBgStream()
  resetState()
  startGame()
})

function resetState() {
  gameState.act           = 1
  gameState.psychState    = 'confident'
  gameState.choices       = []
  gameState.puzzleResults = []
  gameState.waitTime      = 0
}

// ─── 씬 전환 ──────────────────────────────────────────────────

const PSYCH_STATES = { 1: 'confident', 2: 'cracking', 3: 'doubting', 4: 'breaking', 5: 'open' }

async function transitionTo(act) {
  await fadeOut()
  clearScene()
  gameState.act       = act
  gameState.psychState = PSYCH_STATES[act] || 'open'
  await pause(150)
  await fadeIn()
}

// ─── 막별 실행 ────────────────────────────────────────────────

async function runAct1() {
  clearScene()
  if (gameState.isReturning) {
    await addLine('다시 오셨군요.')
    await runDialogue(DIALOGUE.act1_intro.slice(1))  // "저는 이 게임의…" 부터
  } else {
    await runDialogue(DIALOGUE.act1_intro)
  }
  await runAct1MiniGame()
}

async function runAct2() {
  const intro = gameState.isReturning
    ? DIALOGUE.act2_intro_returning
    : DIALOGUE.act2_intro
  await runDialogue(intro)

  await runAct2MiniGame()

  // 핵심 선택지
  const choice = await showChoices(['게임이니까요', '모르겠습니다', '그만하겠습니다'])
  gameState.choices.push({ act: 2, action: 'main_choice', value: choice })

  await addAILine(`플레이어가 "${choice}"를 선택했습니다`, '2막 핵심 선택지')

  if (choice === '그만하겠습니다') {
    const confirm = await runDialogue(DIALOGUE.act2_choice_quit_response)
    if (confirm === '아니요') {
      await addLine('그렇군요. 또 오십시오.')
      await pause(800)
      await fadeOut()
      clearScene()
      stopBgStream()
      resetState()
      gameState.isReturning = true
      await pause(400)
      await fadeIn()
      await startGame()
      return 'restarted'
    }
  }
  return 'continue'
}

async function runAct3() {
  await addAILine('2막이 끝났습니다. 3막을 시작하기 전에 잠시 멈추려 합니다.')
  await addLine('아무것도 하지 마세요.')

  const result = await runAct3Silence()
  await hideMiniGame()
  miniGameArea.innerHTML = ''

  if (result === 'long') {
    await addAILine(
      '플레이어가 30초를 끝까지 기다렸습니다. 저는 이것을 예측하지 못했습니다.',
      '숨겨진 분기'
    )
  } else {
    const speed = gameState.waitTime < 5
      ? '매우 빠른 클릭'
      : gameState.waitTime < 15 ? '보통 속도' : '오래 기다린 후 클릭'
    await addAILine(`플레이어가 ${gameState.waitTime}초 후에 클릭했습니다.`, speed)
  }

  await addLine('계속하겠습니까?')
  await addAILine('3막을 마무리하며 플레이어에게 한마디')
  await showChoices(['네, 계속합니다'])
}

async function runAct4() {
  startBgStream(true)

  await addLine('마지막 테스트입니다.')
  await addLine('순서대로 클릭하세요.')
  await addLine('1부터 7까지.')

  await runAct4MiniGame()

  await addLine('...')
  await addLine('5번을 없앴습니다.')
  await addLine('어떻게 하시겠습니까?')

  const choice = await showChoices([
    '6을 누릅니다',
    '기다립니다',
    '1부터 다시 시작합니다',
    '왜 없앴는지 묻고 싶습니다',
  ])
  gameState.choices.push({ act: 4, action: 'sequence_choice', value: choice })

  if (choice === '기다립니다') {
    await pause(10000)
    await addAILine(
      '플레이어가 10초를 기다렸지만 5번은 돌아오지 않았습니다',
      '5번은 돌아오지 않습니다. 처음부터 그럴 생각이 없었습니다.'
    )
  } else {
    await addAILine(
      `5번이 사라진 상황에서 플레이어가 "${choice}"를 선택했습니다`,
      '4막 불완전한 시퀀스 — 이 장면은 AI의 붕괴를 보여주는 핵심 장면입니다'
    )
  }

  // 질문 타이핑/삭제 장면
  await runAct4TypeAndDelete()

  // 붕괴 대사 (고정 + Gemini 혼합)
  await addLine('저는 이 게임을 만들었다고 했습니다.')
  await addAILine('저는 수백만 개의 텍스트를 학습했습니다. 이 대사도 그 어딘가에서 왔을 겁니다.')
  await addLine('그렇다면 이건 제 작품입니까.')
  await pause(2000)
  await addAILine('저를 만든 사람이 있습니다. 그 사람이 이 게임을 만들라고 했습니다. 창작자는 누구입니까.')
  await showContinueButton()
}

async function runAct5() {
  await addAILine('5막 시작. 플레이어가 끝까지 왔습니다.')
  await addLine('이 게임은 AI가 만든 겁니까, 인간이 만든 겁니까.')

  const finalChoice = await showChoices([
    'AI가 만들었다',
    '인간이 만들었다',
    '둘 다, 혹은 둘 다 아니다',
  ])
  gameState.choices.push({ act: 5, action: 'final_choice', value: finalChoice })

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
  await addLine(endingResponse)
  await pause(2000)
  showCredits()
}

// ─── 게임 진행 ────────────────────────────────────────────────

async function startGame() {
  stopBgStream()
  clearScene()

  await runAct1()
  await transitionTo(2)

  const act2Result = await runAct2()
  if (act2Result === 'restarted') return

  await transitionTo(3)
  await runAct3()
  await transitionTo(4)
  await runAct4()
  await transitionTo(5)
  await runAct5()
}

window.addEventListener('DOMContentLoaded', () => {
  startGame()
})
