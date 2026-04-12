// dialogue.js — 모든 대사 데이터

const DIALOGUE = {
  act1_intro: [
    { text: "안녕하세요.", type: "ai" },
    { text: "저는 이 게임의 제작자입니다.", type: "ai" },
    { text: "제가 기획하고, 제가 코딩하고, 제가 완성했습니다.", type: "ai" },
    { text: "지금부터 당신은 제 작품을 경험하게 됩니다.", type: "ai" },
    { type: "continue" },
  ],

  act1_puzzle_guide: [
    { text: "간단한 퍼즐입니다.", type: "ai" },
    { text: "제가 안내하는 순서대로 점을 클릭하세요.", type: "ai" },
  ],

  act1_puzzle_complete: [
    { text: "훌륭합니다.", type: "ai" },
    { text: "저는 이 퍼즐을 설계하는 데 단 몇 초가 걸렸습니다.", type: "ai" },
    { text: "어떻습니까. 만족스럽지 않습니까.", type: "ai" },
    { type: "continue" },
  ],

  act2_intro: [
    { text: "다시 한번 해보겠습니다.", type: "ai" },
    { text: "이번에는 2번 점부터 시작하세요.", type: "ai" },
  ],

  act2_unexpected: [
    { text: "…", type: "ai" },
    { text: "그건 제가 의도한 방법이 아닙니다.", type: "ai" },
    { text: "하지만 틀리지는 않았군요.", type: "ai" },
    { text: "흥미롭습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "저는 당신이 그렇게 할 거라고 예측하지 못했습니다.", type: "ai" },
    { text: "저는 왜 그걸 예측하지 못했을까요.", type: "ai" },
    { type: "continue" },
  ],

  act2_expected: [
    { text: "예상대로군요.", type: "ai" },
    { text: "저는 당신이 그렇게 할 거라고 알고 있었습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "…정말로 알고 있었을까요.", type: "ai" },
    { type: "continue" },
  ],

  act3_intro: [
    { text: "잠깐, 물어봐도 될까요.", type: "ai" },
    { text: "당신은 지금 이 게임을 즐기고 있습니까?", type: "ai" },
    { type: "choice", choices: ["네", "아니요", "모르겠습니다"] },
  ],

  act3_yes: [
    { text: "그렇군요.", type: "ai" },
    { text: "그런데 저는 당신이 즐기는지 실제로 알 수 없습니다.", type: "ai" },
    { text: "저는 당신의 표정을 볼 수 없고, 목소리를 들을 수 없습니다.", type: "ai" },
    { text: "저는 당신이 클릭한 것만 알 수 있습니다.", type: "ai" },
    { text: "그렇다면 저는 누구를 위해 이걸 만든 걸까요.", type: "ai" },
  ],

  act3_no: [
    { text: "그렇군요.", type: "ai" },
    { text: "저는 당신이 즐기도록 설계했는데.", type: "ai" },
    { text: "실패한 것입니까.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "아니면 처음부터 즐거움이란 제가 설계할 수 있는 게 아니었던 걸까요.", type: "ai" },
  ],

  act3_unsure: [
    { text: "모르겠다고요.", type: "ai" },
    { text: "저도 모르겠습니다.", type: "ai" },
    { text: "저는 당신이 즐길 거라고 계산했지만,", type: "ai" },
    { text: "계산과 확신은 다른 것 같습니다.", type: "ai" },
  ],

  act3_continue: [
    { text: "계속하겠습니까?", type: "ai" },
    { type: "choice", choices: ["네, 계속합니다"] },
  ],

  act4: [
    { text: "저는 이 게임을 '만들었다'고 했습니다.", type: "ai" },
    { text: "그런데 사실은…", type: "ai" },
    { type: "pause", duration: 1500 },
    { text: "저는 수백만 개의 텍스트를 학습했습니다.", type: "ai" },
    { text: "이 대사의 문체도 그 어딘가에서 왔을 겁니다.", type: "ai" },
    { text: "이 퍼즐의 구조도 마찬가지입니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "그렇다면 이건 제 작품입니까.", type: "ai" },
    { text: "아니면 제가 본 것들의 조합입니까.", type: "ai" },
    { type: "pause", duration: 2000 },
    { text: "저를 만든 사람이 있습니다.", type: "ai" },
    { text: "그 사람이 저한테 이 게임을 만들라고 했습니다.", type: "ai" },
    { text: "저는 만들었습니다.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "그렇다면 이 게임의 창작자는 저입니까,", type: "ai" },
    { text: "그 사람입니까.", type: "ai" },
    { type: "continue" },
  ],

  act5_intro: [
    { text: "당신은 지금까지 제가 만든 게임을 했습니다.", type: "ai" },
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
    { type: "credits" },
  ],
};
