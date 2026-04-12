// game.js — AUTHORED 게임 로직

const state = {
  act: 1,
  choices: [],
  endingType: null,
  act2UnexpectedPath: false,
};

// ───── DOM 레퍼런스 ─────
const dialogueArea = document.getElementById('dialogue-area');
const buttonArea   = document.getElementById('button-area');
const puzzleArea   = document.getElementById('puzzle-area');
const puzzleCanvas = document.getElementById('puzzle-canvas');
const puzzleHint   = document.getElementById('puzzle-hint');
const bgStream     = document.getElementById('bg-stream');
const scene        = document.getElementById('scene');
const credits      = document.getElementById('credits');

// ───── 타자기 효과 ─────
function typewriter(element, text, speed = 40) {
  return new Promise(resolve => {
    let i = 0;
    element.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    element.appendChild(cursor);

    const interval = setInterval(() => {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
      } else {
        clearInterval(interval);
        cursor.remove();
        resolve();
      }
    }, speed);
  });
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ───── 씬 페이드 전환 ─────
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

// ───── 대화 출력 ─────
function clearDialogue() {
  dialogueArea.innerHTML = '';
  buttonArea.innerHTML = '';
  buttonArea.classList.remove('visible');
  puzzleArea.classList.remove('visible');
}

async function runDialogue(lines) {
  return new Promise(async (outerResolve) => {
    let i = 0;

    async function next() {
      if (i >= lines.length) {
        outerResolve();
        return;
      }

      const line = lines[i++];

      if (line.type === 'ai') {
        const el = document.createElement('p');
        el.className = 'dialogue-line';
        dialogueArea.appendChild(el);
        el.classList.add('visible');

        // 4막 글리치 효과
        if (state.act === 4 && Math.random() < 0.3) {
          await pause(200);
          el.classList.add('glitch');
        }

        await typewriter(el, line.text, 38);
        await pause(300);
        await next();

      } else if (line.type === 'pause') {
        await pause(line.duration || 1000);
        await next();

      } else if (line.type === 'continue') {
        showContinueButton().then(() => {
          outerResolve();
        });

      } else if (line.type === 'choice') {
        showChoices(line.choices).then(chosen => {
          state.choices.push(chosen);
          outerResolve(chosen);
        });

      } else if (line.type === 'credits') {
        showCredits();

      } else {
        await next();
      }
    }

    await next();
  });
}

// ───── 버튼 ─────
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buttonArea.classList.add('visible');
      });
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buttonArea.classList.add('visible');
      });
    });
  });
}

// ───── 퍼즐 ─────
const PUZZLE_DOTS = [
  { x: 0.20, y: 0.25 }, // 0: 왼쪽 위
  { x: 0.50, y: 0.10 }, // 1: 가운데 위
  { x: 0.80, y: 0.25 }, // 2: 오른쪽 위
  { x: 0.65, y: 0.80 }, // 3: 오른쪽 아래
  { x: 0.35, y: 0.80 }, // 4: 왼쪽 아래
];

// 1막 정답 순서: 0→1→2→3→4
const ACT1_ORDER = [0, 1, 2, 3, 4];
// 2막: 2→1→0→4→3 (예상 경로), 어떤 순서든 모든 점 연결하면 통과
const ACT2_EXPECTED_START = 1; // "2번 점(index 1)부터"

let puzzleState = {
  clicked: [],
  completed: false,
  requiredOrder: null, // null이면 순서 무관
};

function getPuzzleCoords(canvas) {
  return PUZZLE_DOTS.map(d => ({
    x: d.x * canvas.width,
    y: d.y * canvas.height,
  }));
}

function drawPuzzle(canvas, ctx, clicked) {
  const coords = getPuzzleCoords(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 연결선 그리기
  if (clicked.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,255,204,0.5)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(coords[clicked[0]].x, coords[clicked[0]].y);
    for (let i = 1; i < clicked.length; i++) {
      ctx.lineTo(coords[clicked[i]].x, coords[clicked[i]].y);
    }
    ctx.stroke();
  }

  // 점 그리기
  coords.forEach((c, i) => {
    const isClicked = clicked.includes(i);
    ctx.beginPath();
    ctx.arc(c.x, c.y, isClicked ? 6 : 5, 0, Math.PI * 2);
    ctx.fillStyle = isClicked ? '#00ffcc' : 'rgba(232,232,232,0.6)';
    ctx.fill();

    // 번호 표시
    ctx.fillStyle = isClicked ? '#0a0a0f' : 'rgba(232,232,232,0.4)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i + 1, c.x, c.y);
  });
}

function setupPuzzle(act) {
  const W = 340, H = 200;
  puzzleCanvas.width = W;
  puzzleCanvas.height = H;
  const ctx = puzzleCanvas.getContext('2d');

  puzzleState = {
    clicked: [],
    completed: false,
    requiredOrder: act === 1 ? ACT1_ORDER : null,
  };

  drawPuzzle(puzzleCanvas, ctx, []);
  puzzleArea.classList.add('visible');

  if (act === 1) {
    puzzleHint.textContent = `힌트: 1 → 2 → 3 → 4 → 5 순서로 클릭하세요.`;
  } else {
    puzzleHint.textContent = `힌트: 2번 점부터 시작하여 모든 점을 연결하세요.`;
  }

  return new Promise(resolve => {
    function onClick(e) {
      if (puzzleState.completed) return;
      const rect = puzzleCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top)  * (H / rect.height);

      const coords = getPuzzleCoords(puzzleCanvas);
      let hit = -1;
      coords.forEach((c, i) => {
        if (!puzzleState.clicked.includes(i)) {
          const d = Math.hypot(mx - c.x, my - c.y);
          if (d < 18) hit = i;
        }
      });

      if (hit === -1) return;

      if (act === 1 && puzzleState.requiredOrder) {
        const expected = puzzleState.requiredOrder[puzzleState.clicked.length];
        if (hit !== expected) {
          puzzleHint.textContent = `${expected + 1}번 점을 클릭하세요.`;
          return;
        }
      }

      puzzleState.clicked.push(hit);
      drawPuzzle(puzzleCanvas, ctx, puzzleState.clicked);
      puzzleHint.textContent = `${puzzleState.clicked.length} / ${PUZZLE_DOTS.length} 연결됨`;

      if (puzzleState.clicked.length === PUZZLE_DOTS.length) {
        puzzleState.completed = true;
        puzzleCanvas.removeEventListener('click', onClick);

        // 2막: 예상 경로 여부 판단 (2번 점=index 1부터 시작했는지)
        if (act === 2) {
          state.act2UnexpectedPath = (puzzleState.clicked[0] !== ACT2_EXPECTED_START);
        }

        puzzleHint.textContent = '완료.';
        setTimeout(() => resolve(), 600);
      }
    }

    puzzleCanvas.addEventListener('click', onClick);
  });
}

// ───── 배경 텍스트 스트림 ─────
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

function startBgStream() {
  bgStream.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const col = document.createElement('div');
    col.className = 'stream-col';
    col.style.left = `${Math.random() * 100}%`;
    const dur = 8 + Math.random() * 10;
    col.style.animationDuration = `${dur}s`;
    col.style.animationDelay = `${-Math.random() * dur}s`;

    const texts = [];
    for (let j = 0; j < 8; j++) {
      texts.push(STREAM_TEXTS[Math.floor(Math.random() * STREAM_TEXTS.length)]);
    }
    col.textContent = texts.join('   ');
    bgStream.appendChild(col);
  }
  bgStream.classList.add('active');
}

function stopBgStream() {
  bgStream.classList.remove('active');
}

// ───── 크레딧 ─────
function showCredits() {
  credits.classList.add('visible');
}

document.getElementById('restart-btn').addEventListener('click', () => {
  credits.classList.remove('visible');
  state.act = 1;
  state.choices = [];
  state.endingType = null;
  state.act2UnexpectedPath = false;
  stopBgStream();
  startGame();
});

// ───── 막 진행 ─────
async function transitionTo(act) {
  await fadeOut();
  clearDialogue();
  state.act = act;
  await pause(200);
  await fadeIn();
}

async function runAct1() {
  await runDialogue(DIALOGUE.act1_intro);
  await runDialogue(DIALOGUE.act1_puzzle_guide);

  const puzzleDone = setupPuzzle(1);
  await puzzleDone;

  await pause(400);
  puzzleArea.classList.remove('visible');
  await pause(300);

  await runDialogue(DIALOGUE.act1_puzzle_complete);
}

async function runAct2() {
  clearDialogue();
  await runDialogue(DIALOGUE.act2_intro);

  const puzzleDone = setupPuzzle(2);
  await puzzleDone;

  await pause(400);
  puzzleArea.classList.remove('visible');
  await pause(300);

  if (state.act2UnexpectedPath) {
    await runDialogue(DIALOGUE.act2_unexpected);
  } else {
    await runDialogue(DIALOGUE.act2_expected);
  }
}

async function runAct3() {
  clearDialogue();
  const choice = await runDialogue(DIALOGUE.act3_intro);

  if (choice === '네') {
    await runDialogue(DIALOGUE.act3_yes);
  } else if (choice === '아니요') {
    await runDialogue(DIALOGUE.act3_no);
  } else {
    await runDialogue(DIALOGUE.act3_unsure);
  }

  await runDialogue(DIALOGUE.act3_continue);
}

async function runAct4() {
  clearDialogue();
  startBgStream();
  await runDialogue(DIALOGUE.act4);
}

async function runAct5() {
  clearDialogue();
  const choice = await runDialogue(DIALOGUE.act5_intro);

  if (choice === 'AI가 만들었다') {
    state.endingType = 'ai';
    await runDialogue(DIALOGUE.ending_ai);
  } else if (choice === '인간이 만들었다') {
    state.endingType = 'human';
    await runDialogue(DIALOGUE.ending_human);
  } else {
    state.endingType = 'both';
    await runDialogue(DIALOGUE.ending_both);
  }
}

// ───── 게임 시작 ─────
async function startGame() {
  clearDialogue();

  await runAct1();
  await transitionTo(2);
  await runAct2();
  await transitionTo(3);
  await runAct3();
  await transitionTo(4);
  await runAct4();
  await transitionTo(5);
  await runAct5();
}

// DOM 준비 후 시작
window.addEventListener('DOMContentLoaded', () => {
  startGame();
});
