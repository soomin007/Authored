// dialogue.js v4 — 정적 고정 대사 (Gemini 미연동 시 일부 fallback)

const DIALOGUE = {

  // ─── 1막 ───────────────────────────────────────────────────

  act1_intro: [
    { text: "안녕하세요.", type: "ai" },
    { text: "저는 이 게임의 제작자입니다.", type: "ai" },
    { text: "제가 기획하고, 제가 코딩하고, 제가 완성했습니다.", type: "ai" },
    { text: "지금부터 당신은 제 작품을 경험하게 됩니다.", type: "ai" },
    { text: "먼저 간단한 테스트를 진행하겠습니다.", type: "ai" },
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

  act2_choice_quit_response: [
    { text: "...", type: "ai" },
    { type: "pause", duration: 1500 },
    { text: "그건 선택지에 없었는데.", type: "ai" },
    { type: "pause", duration: 1000 },
    { text: "하지만 당신은 선택했습니다.", type: "ai" },
    { text: "계속하시겠습니까?", type: "ai" },
    { type: "choice", choices: ["네", "아니요"] },
  ],
}
