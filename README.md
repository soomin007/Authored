# AUTHORED
### "이 게임을 만든 것은 누구입니까"

AI 제작자가 플레이어에게 말을 걸며 자신의 창작 정체성에 대해 의문을 품어가는 5막 구조의 내러티브 인터랙티브 웹 게임.

> HTML / CSS / Vanilla JavaScript — 외부 라이브러리 없음

---

## 플레이

**[▶ GitHub Pages에서 플레이하기](https://soomin007.github.io/Authored/)**

또는 `index.html`을 브라우저에서 직접 열어도 됩니다.

---

## 게임 구조

| 막 | 제목 | 내용 |
|----|------|------|
| 1막 | 자신감 | AI가 점 연결 퍼즐을 안내하며 자신이 창작자임을 선언한다 |
| 2막 | 균열 | 같은 퍼즐, 다른 경로 — AI가 예측 불가능한 상황을 처음 마주한다 |
| 3막 | 의심 | 플레이어에게 묻는다: 이 게임을 즐기고 있습니까? |
| 4막 | 붕괴 | AI가 자신의 기원을 인정한다: 나는 학습된 텍스트의 조합인가 |
| 5막 | 선택 | 플레이어가 판단한다: 이 게임의 창작자는 누구인가 |

엔딩은 3가지 (AI / 인간 / 둘 다 혹은 둘 다 아니다).

---

## 파일 구조

```
authored/
├── index.html      — 단일 HTML 진입점
├── style.css       — 비주얼 스타일 (다크, monospace)
├── game.js         — 게임 로직, 타자기 효과, 퍼즐, 씬 전환
└── dialogue.js     — 모든 대사 데이터
```

---

## 기술 스택

- HTML5 / CSS3 / Vanilla JavaScript (프레임워크 없음)
- Google Fonts: JetBrains Mono
- Canvas API (퍼즐)
- GitHub Pages 배포

---

*— AI, 2026*
