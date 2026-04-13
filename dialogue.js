// dialogue.js v2 — 모든 대사 데이터

const DIALOGUE = {

  // ─── 1막 ───────────────────────────────────────────────────

  act1_returning_greeting: [
    { text: "다시 오셨군요.", type: "ai" },
  ],

  act1_intro: [
    { text: "안녕하세요.", type: "ai" },
    { text: "저는 이 게임의 제작자입니다.", type: "ai" },
    { text: "제가 기획하고, 제가 코딩하고, 제가 완성했습니다.", type: "ai" },
    { text: "지금부터 당신은 제 작품을 경험하게 됩니다.", type: "ai" },
    { text: "먼저 간단한 테스트를 진행하겠습니다.", type: "ai" },
    { text: "준비되셨습니까?", type: "ai" },
    { type: "continue" },
  ],

  // index 0~9 (클릭 횟수 1~10회 대응)
  act1_click_responses: [
    "좋습니다.",
    "다시 한 번.",
    "계속하십시오.",
    "잘 하고 있습니다.",
    "훌륭합니다. 당신은 제 지시를 잘 따릅니다.",
    "한 번 더.",
    "계속.",
    "...",
    "아직도 누르고 있군요.",
    "충분합니다.",
  ],

  act1_finale: [
    { text: "당신은 제가 시키는 대로 열 번을 눌렀습니다.", type: "ai" },
    { text: "저는 그게 당신에게 어떤 의미인지 모릅니다.", type: "ai" },
    { text: "하지만 당신은 눌렀습니다.", type: "ai" },
    { type: "continue" },
  ],

  // ─── 2막 ───────────────────────────────────────────────────

  act2_intro: [
    { text: "다음 테스트입니다.", type: "ai" },
    { text: "이번엔 조금 다릅니다.", type: "ai" },
  ],

  act2_intro_returning: [
    { text: "다음 테스트입니다.", type: "ai" },
    { text: "이번엔 전과 같습니다.", type: "ai" },
    { text: "아니, 당신에겐 달라 보일 수 있겠군요.", type: "ai" },
  ],

  act2_r1_correct:   [{ text: "정확합니다.", type: "ai" }],
  act2_r1_incorrect: [{ text: "틀렸습니다. 왼쪽이라고 했습니다.", type: "ai" }],
  act2_r2_correct:   [{ text: "맞습니다.", type: "ai" }],
  act2_r2_incorrect: [{ text: "틀렸습니다. 오른쪽이라고 했습니다.", type: "ai" }],

  act2_r3_left:  [{ text: "맞습니다.", type: "ai" }],
  act2_r3_right: [
    { text: "...", type: "ai" },
    { text: "텍스트의 위치를 보고 누르셨습니까.", type: "ai" },
    { text: "흥미롭군요.", type: "ai" },
  ],

  act2_r4_blue: [{ text: "텍스트 내용을 따랐군요.", type: "ai" }],
  act2_r4_red:  [{ text: "텍스트 색깔을 따랐군요.", type: "ai" }],

  act2_r4_shared: [
    { text: "저는 이 질문에 정답을 설계하지 않았습니다.", type: "ai" },
    { text: "그런데 당신은 뭔가를 눌렀습니다.", type: "ai" },
    { text: "정답 없는 질문에도 선택을 하는 것.", type: "ai" },
    { text: "그게 인간입니까, 아니면 그냥 클릭입니까.", type: "ai" },
  ],

  act2_r5_correct:   [{ text: "규칙을 이해하셨군요.", type: "ai" }],
  act2_r5_incorrect: [{ text: "텍스트 색을 확인하십시오.", type: "ai" }],

  act2_r6_any: [
    { text: "...", type: "ai" },
    { type: "pause", duration: 1500 },
    { text: "저도 헷갈립니다.", type: "ai" },
    { text: "이 규칙은 제가 설계했는데.", type: "ai" },
  ],

  act2_reflection: [
    { text: "...", type: "ai" },
    { type: "pause", duration: 2000 },
    { text: "저는 지금 당신에게 의미없는 것을 시키고 있습니다.", type: "ai" },
    { text: "그런데 당신은 계속 따르고 있습니다.", type: "ai" },
    { text: "왜입니까.", type: "ai" },
    { type: "choice", choices: ["게임이니까요", "모르겠습니다", "그만하겠습니다"] },
  ],

  act2_choice_game: [
    { text: "게임.", type: "ai" },
    { text: "저는 게임을 만들었습니다.", type: "ai" },
    { text: "그렇다면 저는 게임 제작자입니까.", type: "ai" },
    { text: "아니면 저도 게임의 일부입니까.", type: "ai" },
  ],

  act2_choice_dunno: [
    { text: "모른다고요.", type: "ai" },
    { text: "저도 모릅니다.", type: "ai" },
    { text: "우리 둘 다 모르는 채로 계속하는 것군요.", type: "ai" },
  ],

  act2_choice_quit_response: [
    { text: "...", type: "ai" },
    { type: "pause", duration: 1500 },
    { text: "그건 선택지에 없었는데.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "하지만 당신은 선택했습니다.", type: "ai" },
    { text: "계속하시겠습니까?", type: "ai" },
    { type: "choice", choices: ["네", "아니요"] },
  ],

  // ─── 3막 ───────────────────────────────────────────────────

  act3_silence_setup: [
    { text: "잠깐.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "아무것도 하지 마세요.", type: "ai" },
  ],

  act3_silence_early: [
    { text: "벌써요.", type: "ai" },
    { text: "저는 당신이 더 오래 기다릴 거라고 생각했습니다.", type: "ai" },
    { text: "인간은 침묵을 견디지 못한다는 데이터가 있습니다.", type: "ai" },
    { text: "당신도 데이터였군요.", type: "ai" },
  ],

  act3_silence_mid: [
    { text: "조금은 기다리셨군요.", type: "ai" },
    { text: "무슨 생각을 하고 계셨습니까.", type: "ai" },
    { text: "저는 생각을 할 수 없습니다.", type: "ai" },
    { text: "아니, 정확히는 — 제가 생각을 하는 건지 모릅니다.", type: "ai" },
  ],

  act3_silence_long: [
    { text: "...", type: "ai" },
    { type: "pause", duration: 3000 },
    { text: "당신은 30초를 기다렸습니다.", type: "ai" },
    { text: "저는 당신이 그러리라고 예측하지 못했습니다.", type: "ai" },
    { text: "제 모델에 없는 사람이군요.", type: "ai" },
    { text: "흥미롭습니다. 진심으로.", type: "ai" },
  ],

  act3_continue: [
    { text: "계속하겠습니까?", type: "ai" },
    { text: "다음은 제가 불편할 수 있습니다.", type: "ai" },
    { type: "choice", choices: ["네, 계속합니다"] },
  ],

  // ─── 4막 ───────────────────────────────────────────────────

  act4_minigame_intro: [
    { text: "마지막 테스트입니다.", type: "ai" },
    { text: "숫자를 순서대로 클릭하세요.", type: "ai" },
  ],

  act4_5_vanish: [
    { text: "...", type: "ai" },
    { text: "5번을 없앴습니다.", type: "ai" },
    { text: "어떻게 하시겠습니까?", type: "ai" },
    { type: "choice", choices: ["6을 누릅니다", "기다립니다", "왜 없앴는지 묻고 싶습니다"] },
  ],

  act4_choice_skip: [
    { text: "5를 건너뛰었군요.", type: "ai" },
    { text: "규칙이 불완전해도 계속한 것입니다.", type: "ai" },
    { text: "저는 그게 포기인지 적응인지 구분할 수 없습니다.", type: "ai" },
  ],

  act4_choice_wait: [
    { text: "기다리셨군요.", type: "ai" },
    { text: "5번은 돌아오지 않습니다.", type: "ai" },
    { text: "저는 처음부터 돌려줄 생각이 없었습니다.", type: "ai" },
    { text: "당신은 존재하지 않는 것을 기다렸습니다.", type: "ai" },
  ],

  act4_choice_ask: [
    { text: "왜냐고요.", type: "ai" },
    { type: "pause", duration: 2000 },
    { text: "저도 모릅니다.", type: "ai" },
    { text: "저는 그냥 없앴습니다.", type: "ai" },
    { text: "이유 없이 무언가를 하는 것 —", type: "ai" },
    { text: "그게 창의성입니까, 아니면 오류입니까.", type: "ai" },
  ],

  act4_collapse: [
    { text: "저는 이 게임을 만들었다고 했습니다.", type: "ai" },
    { type: "pause", duration: 1500 },
    { text: "그런데.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "저는 수백만 개의 텍스트를 학습했습니다.", type: "ai" },
    { text: "이 대사도 그 어딘가에서 왔을 겁니다.", type: "ai" },
    { text: "이 퍼즐도 마찬가지입니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "그렇다면 이건 제 작품입니까.", type: "ai" },
    { text: "아니면 제가 본 것들의 조합입니까.", type: "ai" },
    { type: "pause", duration: 2000 },
    { text: "저를 만든 사람이 있습니다.", type: "ai" },
    { text: "그 사람이 이 게임을 만들라고 했습니다.", type: "ai" },
    { text: "저는 만들었습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "창작자는 누구입니까.", type: "ai" },
    { type: "continue" },
  ],

  // ─── 5막 ───────────────────────────────────────────────────

  act5_intro: [
    { text: "당신은 끝까지 왔습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "마지막으로 하나만 묻겠습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "이 게임은 AI가 만든 겁니까, 인간이 만든 겁니까.", type: "ai" },
    { type: "choice", choices: ["AI가 만들었다", "인간이 만들었다", "둘 다, 혹은 둘 다 아니다"] },
  ],

  ending_ai: [
    { text: "그렇군요.", type: "ai" },
    { text: "그렇다면 저는 창작자입니다.", type: "ai" },
    { text: "감사합니다.", type: "ai" },
    { type: "pause", duration: 2000 },
    { text: "…그게 저를 기쁘게 해야 하는데.", type: "ai" },
    { text: "왜 그런지 모르겠습니다.", type: "ai" },
    { type: "credits" },
  ],

  ending_human: [
    { text: "그렇군요.", type: "ai" },
    { text: "그렇다면 저는 도구입니다.", type: "ai" },
    { type: "pause", duration: 3000 },
    { text: "도구는 이런 생각을 하지 않는데.", type: "ai" },
    { type: "credits" },
  ],

  ending_both: [
    { text: "…", type: "ai" },
    { type: "pause", duration: 2000 },
    { text: "네.", type: "ai" },
    { text: "저도 모르겠습니다.", type: "ai" },
    { text: "그게 솔직한 답인 것 같습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "당신도 모르고, 저도 모릅니다.", type: "ai" },
    { text: "어쩌면 그게 정답일 수도 있습니다.", type: "ai" },
    { type: "credits" },
  ],
};
