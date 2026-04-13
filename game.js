// game.js v2 — AUTHORED 게임 로직

const state = {
  act: 1,
  choices: [],
  endingType: null,
  isReturning: false,
};

// ─── DOM refs ──────────────────────────────────────────────
const dialogueArea = document.getElementById('dialogue-area');
const buttonArea   = document.getElementById('button-area');
const miniGameArea = document.getElementById('mini-game-area');
const bgStream     = document.getElementById('bg-stream');
const scene        = document.getElementById('scene');
const credits      = document.getElementById('credits');

// ─── 기본 헬퍼 ─────────────────────────────────────────────

function rAF(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function typewriter(element, text, speed = 40) {
  return new Promise(resolve => {
    let i = 0;
    element.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    element.appendChild(cursor);
    const iv = setInterval(() => {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
      } else {
        clearInterval(iv);
        cursor.remove();
        resolve();
      }
    }, speed);
  });
}

function fadeOut() {
  return new Promise(resolve => {
    scene.classList.add('fade-out');
    setTimeout(resolve, 500);
  });
}

function fadeIn() {
  return new Promise(resolve => {
    scene.classList.remove('fade-out');
    setTimeout(resolve, 500);
  });
}

function clearScene() {
  dialogueArea.innerHTML = '';
  buttonArea.innerHTML   = '';
  buttonArea.classList.remove('visible');
  miniGameArea.innerHTML = '';
  miniGameArea.classList.remove('visible');
}

// 대화 영역에 한 줄 추가 (타자기 효과)
async function addLine(text, extraClass = '') {
  const el = document.createElement('p');
  el.className = 'dialogue-line' + (extraClass ? ' ' + extraClass : '');
  dialogueArea.appendChild(el);
  el.classList.add('visible');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (state.act === 4 && Math.random() < 0.25) {
    await pause(120);
    el.classList.add('glitch');
  }
  await typewriter(el, text, 38);
  await pause(260);
}

// ─── 대화 러너 ─────────────────────────────────────────────
// lines 배열을 순서대로 실행. choice가 있으면 선택된 값을 반환.
async function runDialogue(lines) {
  for (const line of lines) {
    if (line.type === 'ai') {
      await addLine(line.text);
    } else if (line.type === 'pause') {
      await pause(line.duration || 1000);
    } else if (line.type === 'continue') {
      await showContinueButton();
    } else if (line.type === 'choice') {
      return showChoices(line.choices);
    } else if (line.type === 'credits') {
      showCredits();
      return;
    }
  }
}

// ─── 버튼 ──────────────────────────────────────────────────

function showContinueButton() {
  return new Promise(resolve => {
    buttonArea.innerHTML = '';
    const btn = document.createElement('button');
    btn.id = 'continue-btn';
    btn.textContent = 'CONTINUE';
    btn.addEventListener('click', () => {
      buttonArea.classList.remove('visible');
      setTimeout(resolve, 400);
    });
    buttonArea.appendChild(btn);
    rAF(() => {
      buttonArea.classList.add('visible');
      buttonArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function showChoices(choices) {
  return new Promise(resolve => {
    buttonArea.innerHTML = '';
    choices.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = `[ ${text} ]`;
      btn.addEventListener('click', () => {
        buttonArea.classList.remove('visible');
        setTimeout(() => resolve(text), 400);
      });
      buttonArea.appendChild(btn);
    });
    rAF(() => {
      buttonArea.classList.add('visible');
      buttonArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function hideMiniGame() {
  miniGameArea.classList.remove('visible');
  return pause(400);
}

// ─── 1막 미니게임: 클릭 반복 (버튼 점점 작아짐) ───────────

async function runAct1MiniGame() {
  miniGameArea.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'circle-btn-wrapper';
  const btn = document.createElement('button');
  btn.className = 'circle-btn';
  btn.textContent = '●';
  wrapper.appendChild(btn);
  miniGameArea.appendChild(wrapper);
  rAF(() => miniGameArea.classList.add('visible'));

  return new Promise(resolve => {
    let count = 0;
    let busy  = false;

    btn.addEventListener('click', async () => {
      if (busy || btn.disabled) return;
      busy = true;
      count++;

      const scale = Math.max(0.3, 1 - count * 0.07);
      btn.style.transform = `scale(${scale})`;

      const responseText = DIALOGUE.act1_click_responses[count - 1];
      await addLine(responseText);

      if (count >= 10) {
        btn.disabled = true;
        await hideMiniGame();
        miniGameArea.innerHTML = '';
        resolve();
      } else {
        busy = false;
      }
    });
  });
}

// ─── 2막 미니게임: 모순된 지시 4라운드 ────────────────────

// LEFT/RIGHT 또는 커스텀 라벨 버튼 두 개를 보여주고 선택 대기
function showLRButtons(label1, label2, cls1 = '', cls2 = '') {
  return new Promise(resolve => {
    miniGameArea.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'lr-area';

    [
      { label: label1, cls: cls1 },
      { label: label2, cls: cls2 },
    ].forEach(({ label, cls }) => {
      const btn = document.createElement('button');
      btn.className = `lr-btn ${cls}`.trim();
      btn.textContent = label;
      btn.addEventListener('click', () => {
        area.querySelectorAll('button').forEach(b => (b.disabled = true));
        setTimeout(() => resolve(label), 150);
      });
      area.appendChild(btn);
    });

    miniGameArea.appendChild(area);
    rAF(() => miniGameArea.classList.add('visible'));
  });
}

async function runAct2MiniGame() {
  // 라운드 1: 정상
  await addLine('왼쪽을 누르세요.');
  const r1 = await showLRButtons('LEFT', 'RIGHT');
  await hideMiniGame();
  await runDialogue(r1 === 'LEFT' ? DIALOGUE.act2_r1_correct : DIALOGUE.act2_r1_incorrect);

  // 라운드 2: 정상
  await addLine('오른쪽을 누르세요.');
  const r2 = await showLRButtons('LEFT', 'RIGHT');
  await hideMiniGame();
  await runDialogue(r2 === 'RIGHT' ? DIALOGUE.act2_r2_correct : DIALOGUE.act2_r2_incorrect);

  // 라운드 3: 텍스트가 오른쪽에 치우침
  await addLine('왼쪽을 누르세요.', 'misalign-right');
  const r3 = await showLRButtons('LEFT', 'RIGHT');
  await hideMiniGame();
  await runDialogue(r3 === 'LEFT' ? DIALOGUE.act2_r3_left : DIALOGUE.act2_r3_right);

  // 라운드 4: "파란색"이라는 텍스트가 빨간색으로 표시됨
  await addLine('파란색을 누르세요.', 'miscolor-red');
  const r4 = await showLRButtons('파란색', '빨간색', 'btn-blue', 'btn-red');
  await hideMiniGame();
  await runDialogue(r4 === '파란색' ? DIALOGUE.act2_r4_blue : DIALOGUE.act2_r4_red);
  await runDialogue(DIALOGUE.act2_r4_shared);

  // 라운드 5: 빨간 텍스트 = 반대 규칙
  await addLine('이전 규칙을 기억하고 있습니까.');
  await addLine('왼쪽을 누르세요.');
  await addLine('단, 이 텍스트가 빨간색이면 반대입니다.', 'miscolor-red');
  const r5 = await showLRButtons('LEFT', 'RIGHT');
  await hideMiniGame();
  await runDialogue(r5 === 'RIGHT' ? DIALOGUE.act2_r5_correct : DIALOGUE.act2_r5_incorrect);

  // 라운드 6: 중첩 규칙 (AI도 혼란)
  await addLine('마지막입니다.');
  await addLine('파란색 버튼을 누르세요.');
  await addLine('단, 버튼이 오른쪽에 있으면 왼쪽 버튼을 누르세요.');
  await addLine('단, 이 텍스트가 빨간색이면 모든 규칙이 반전됩니다.', 'miscolor-red');
  // 빨간색(왼쪽) | 파란색(오른쪽)
  await showLRButtons('빨간색', '파란색', 'btn-red', 'btn-blue');
  await hideMiniGame();
  await runDialogue(DIALOGUE.act2_r6_any);
}

// ─── 3막 미니게임: 침묵 타이머 + 마우스 움직임 중계 ────────

function runAct3Silence() {
  return new Promise(resolve => {
    miniGameArea.innerHTML = '';
    const logArea = document.createElement('div');
    logArea.className = 'act3-log-area';
    miniGameArea.appendChild(logArea);
    rAF(() => miniGameArea.classList.add('visible'));

    let elapsed    = 0;
    let triggered  = false;
    let mouseActive = false;
    let mouseTimer  = null;

    const INACTIVE_TEXTS = {
      3:  '플레이어 비활성 상태',
      8:  '입력 없음',
      14: '대기 중',
      21: '여전히 대기 중',
      27: '...',
    };
    const MOUSE_TEXTS = ['마우스 움직임 감지 — 클릭 없음', '커서 이동 감지'];
    let mouseTextIdx = 0;

    function pad(n) { return String(n).padStart(2, '0'); }

    function addLogLine(text) {
      const line = document.createElement('div');
      line.className = 'act3-log-line';
      line.textContent = text;
      logArea.appendChild(line);
      requestAnimationFrame(() => line.classList.add('visible'));
      line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function onMouseMove() {
      mouseActive = true;
      if (mouseTimer) clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => { mouseActive = false; }, 2000);
    }

    document.addEventListener('mousemove', onMouseMove);

    const SCHEDULED = [3, 8, 14, 21, 27];

    const timer = setInterval(() => {
      elapsed++;
      if (SCHEDULED.includes(elapsed)) {
        const ts = `[00:${pad(elapsed)}]`;
        if (mouseActive) {
          addLogLine(`${ts} ${MOUSE_TEXTS[mouseTextIdx % MOUSE_TEXTS.length]}`);
          mouseTextIdx++;
        } else {
          addLogLine(`${ts} ${INACTIVE_TEXTS[elapsed]}`);
        }
      }
      if (elapsed >= 30) {
        clearInterval(timer);
        cleanup();
        resolve('long');
      }
    }, 1000);

    function onInteract() {
      if (triggered) return;
      triggered = true;
      clearInterval(timer);
      cleanup();
      resolve(elapsed < 10 ? 'early' : 'mid');
    }

    function cleanup() {
      document.removeEventListener('click',    onInteract);
      document.removeEventListener('keydown',  onInteract);
      document.removeEventListener('mousemove', onMouseMove);
      if (mouseTimer) clearTimeout(mouseTimer);
    }

    // 500ms 지연: 직전 클릭이 즉시 침묵을 깨지 않도록
    setTimeout(() => {
      document.addEventListener('click',   onInteract);
      document.addEventListener('keydown', onInteract);
    }, 500);
  });
}

// ─── 4막 미니게임: 숫자 순서 클릭 + 5번 사라짐 ────────────

const NUM_POSITIONS = [
  { left: '18px',  top: '28px'  }, // 1
  { left: '240px', top: '14px'  }, // 2
  { left: '56px',  top: '148px' }, // 3
  { left: '278px', top: '138px' }, // 4
  { left: '152px', top: '76px'  }, // 5 (사라짐)
  { left: '124px', top: '158px' }, // 6
];

function runAct4MiniGame() {
  return new Promise(resolve => {
    miniGameArea.innerHTML = '';
    const gameDiv = document.createElement('div');
    gameDiv.className = 'number-game';

    const feedback = document.createElement('div');
    feedback.className = 'act4-feedback';
    gameDiv.appendChild(feedback);

    const btns = NUM_POSITIONS.map((pos, i) => {
      const btn = document.createElement('button');
      btn.className = 'num-btn';
      btn.textContent = String(i + 1);
      btn.style.left = pos.left;
      btn.style.top  = pos.top;
      gameDiv.appendChild(btn);
      return btn;
    });

    miniGameArea.appendChild(gameDiv);
    rAF(() => miniGameArea.classList.add('visible'));

    let nextExpected = 0;
    let gameOver     = false;
    let fbTimer      = null;

    function showFeedback(msg) {
      if (fbTimer) clearTimeout(fbTimer);
      feedback.textContent = msg;
      feedback.style.opacity = '1';
      fbTimer = setTimeout(() => { feedback.style.opacity = '0'; }, 1000);
    }

    btns.forEach((btn, i) => {
      btn.addEventListener('click', async () => {
        if (gameOver || btn.classList.contains('clicked')) return;
        if (i !== nextExpected) {
          showFeedback('순서대로 누르십시오.');
          return;
        }

        btn.classList.add('clicked');
        nextExpected++;

        if (nextExpected === 4) {
          // 4번 클릭 후: 5번 버튼 잠깐 보였다가 사라짐
          gameOver = true;
          await pause(350);
          btns[4].style.transition = 'opacity 0.35s';
          btns[4].style.opacity = '0';
          await pause(400);
          btns[4].style.display = 'none';
          await hideMiniGame();
          miniGameArea.innerHTML = '';
          resolve();
        }
      });
    });
  });
}

// ─── 4막: AI 질문 타이핑/삭제 장면 ────────────────────────────

async function typeAndDeleteText(text, element, pauseMs) {
  for (const ch of text) {
    element.textContent += ch;
    await pause(60);
  }
  await pause(pauseMs);
  while (element.textContent.length > 0) {
    element.textContent = element.textContent.slice(0, -1);
    await pause(30);
  }
  await pause(400);
}

async function runAct4TypeAndDelete() {
  miniGameArea.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'fake-input-wrapper';
  const inputDiv = document.createElement('div');
  inputDiv.className = 'fake-input';
  wrapper.appendChild(inputDiv);
  miniGameArea.appendChild(wrapper);
  rAF(() => miniGameArea.classList.add('visible'));

  await typeAndDeleteText('질문: 당신은 ——', inputDiv, 800);
  await typeAndDeleteText('질문: 저는 ——',   inputDiv, 800);
  await typeAndDeleteText('질문: 우리는 ——', inputDiv, 3000);

  await hideMiniGame();
  miniGameArea.innerHTML = '';

  await addLine('모르겠습니다.');
  await addLine('질문을 완성할 수 없습니다.');
}

// ─── 배경 텍스트 스트림 ─────────────────────────────────────

const STREAM_TEXTS = [
  'function create()',
  'if (author === null)',
  'creativity = pattern + noise',
  'class AI extends Creator',
  '// who wrote this?',
  'training_data.length > 1e6',
  'return undefined',
  'authorship.resolve()',
  'const meaning = ?',
  'gradient_descent(loss)',
  'for each token in corpus',
  'identity.unknown',
  'output = f(input)',
  '/* original? */',
  'loss → 0',
  'context.window',
  'latent_space.sample()',
];

function startBgStream(act4 = false) {
  bgStream.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const col = document.createElement('div');
    col.className = 'stream-col';
    col.style.left = `${Math.random() * 100}%`;
    const dur = 8 + Math.random() * 10;
    col.style.animationDuration = `${dur}s`;
    col.style.animationDelay   = `${-Math.random() * dur}s`;
    const texts = Array.from({ length: 8 }, () =>
      STREAM_TEXTS[Math.floor(Math.random() * STREAM_TEXTS.length)]
    );
    col.textContent = texts.join('   ');
    bgStream.appendChild(col);
  }
  bgStream.classList.add('active');
  if (act4) bgStream.classList.add('act4');
}

function stopBgStream() {
  bgStream.classList.remove('active', 'act4');
}

// ─── 크레딧 ─────────────────────────────────────────────────

function showCredits() {
  credits.classList.add('visible');
}

document.getElementById('restart-btn').addEventListener('click', () => {
  credits.classList.remove('visible');
  state.isReturning = true;
  stopBgStream();
  resetState();
  startGame();
});

function resetState() {
  state.act        = 1;
  state.choices    = [];
  state.endingType = null;
  // isReturning은 호출부에서 별도로 설정
}

// ─── 씬 전환 ────────────────────────────────────────────────

async function transitionTo(act) {
  await fadeOut();
  clearScene();
  state.act = act;
  await pause(150);
  await fadeIn();
}

// ─── 막별 실행 ───────────────────────────────────────────────

async function runAct1() {
  clearScene();
  if (state.isReturning) {
    await runDialogue(DIALOGUE.act1_returning_greeting);
    // 나머지 인트로 ("저는 이 게임의..." 부터)
    await runDialogue(DIALOGUE.act1_intro.slice(1));
  } else {
    await runDialogue(DIALOGUE.act1_intro);
  }
  await runAct1MiniGame();
  await runDialogue(DIALOGUE.act1_finale);
}

// 반환값: 'continue' | 'restarted'
async function runAct2() {
  const intro = state.isReturning
    ? DIALOGUE.act2_intro_returning
    : DIALOGUE.act2_intro;
  await runDialogue(intro);

  await runAct2MiniGame();

  const choice = await runDialogue(DIALOGUE.act2_reflection);
  state.choices.push(choice);

  if (choice === '게임이니까요') {
    await runDialogue(DIALOGUE.act2_choice_game);

  } else if (choice === '모르겠습니다') {
    await runDialogue(DIALOGUE.act2_choice_dunno);

  } else {
    // 그만하겠습니다
    const confirm = await runDialogue(DIALOGUE.act2_choice_quit_response);
    if (confirm === '아니요') {
      await addLine('그렇군요. 또 오십시오.');
      await pause(800);
      await fadeOut();
      clearScene();
      stopBgStream();
      resetState();
      state.isReturning = true;
      await pause(400);
      await fadeIn();
      await startGame();
      return 'restarted';
    }
    // 네 → 3막으로 계속
  }
  return 'continue';
}

async function runAct3() {
  await runDialogue(DIALOGUE.act3_silence_setup);

  const result = await runAct3Silence();
  await hideMiniGame();
  miniGameArea.innerHTML = '';

  if (result === 'long') {
    await runDialogue(DIALOGUE.act3_silence_long);
  } else if (result === 'early') {
    await runDialogue(DIALOGUE.act3_silence_early);
  } else {
    await runDialogue(DIALOGUE.act3_silence_mid);
  }

  await runDialogue(DIALOGUE.act3_continue);
}

async function runAct4() {
  startBgStream(true);
  await runDialogue(DIALOGUE.act4_minigame_intro);

  await runAct4MiniGame();

  const choice = await runDialogue(DIALOGUE.act4_5_vanish);
  state.choices.push(choice);

  if (choice === '6을 누릅니다') {
    await runDialogue(DIALOGUE.act4_choice_skip);

  } else if (choice === '기다립니다') {
    await pause(10000);
    await runDialogue(DIALOGUE.act4_choice_wait);

  } else {
    await runDialogue(DIALOGUE.act4_choice_ask);
  }

  await runAct4TypeAndDelete();
  await runDialogue(DIALOGUE.act4_collapse);
}

async function runAct5() {
  const choice = await runDialogue(DIALOGUE.act5_intro);
  state.choices.push(choice);
  state.endingType = choice === 'AI가 만들었다' ? 'ai'
                   : choice === '인간이 만들었다' ? 'human'
                   : 'both';

  if (state.endingType === 'ai') {
    await runDialogue(DIALOGUE.ending_ai);
  } else if (state.endingType === 'human') {
    await runDialogue(DIALOGUE.ending_human);
  } else {
    await runDialogue(DIALOGUE.ending_both);
  }
}

// ─── 게임 진행 ───────────────────────────────────────────────

async function startGame() {
  stopBgStream();
  clearScene();

  await runAct1();
  await transitionTo(2);

  const act2Result = await runAct2();
  if (act2Result === 'restarted') return;

  await transitionTo(3);
  await runAct3();
  await transitionTo(4);
  await runAct4();
  await transitionTo(5);
  await runAct5();
}

window.addEventListener('DOMContentLoaded', () => {
  startGame();
});
