# Validacao Fatia 01

## Ambiente

- Servidor local: `http://127.0.0.1:8766/index.html`
- Browser automation: Playwright MCP.
- Dependencias novas: nenhuma.

## Console validado

```js
ScoreBar.setScore(1250, 980)
ScoreBar.addPoints("A", 100)
ScoreBar.addPoints("B", 50)
ScoreBar.reset()
QuizStage.startNewQuestion()
QuizStage.hideQuestionCard()
QuizStage.showQuestionCard()
ArduinoBridge.simulate("BT1PRESS")
ArduinoBridge.simulate("BT2PRESS")
ArduinoBridge.simulate("RESET")
ArduinoBridge.getState()
```

## Resultados

- `ScoreBar.setScore/addPoints/reset/getState`: aprovado.
- `QuizStage.startNewQuestion()`: pergunta escondida antes e visivel depois do cue; fase final `answer_timer`.
- `QuizStage.showQuestionCard()/hideQuestionCard()`: aprovado.
- `ArduinoBridge.simulate("BT1PRESS")`: A `COM A PALAVRA`, B `BLOQUEADO`.
- `ArduinoBridge.simulate("BT2PRESS")`: B `COM A PALAVRA`, A `BLOQUEADO`.
- `ArduinoBridge.simulate("RESET")`: ambos `AGUARDANDO`.
- Teclado `Z`, `M`, `R`: aprovado.
- Sem Arduino conectado: app permanece funcional; estado `disconnected`.

## Viewports

- 1920x1080: sem overflow.
- 1600x900: sem overflow.
- 1366x768: sem overflow.

## Screenshots

- `docs/ai-harness/screenshots/fatia-01-1920x1080.png`
- `docs/ai-harness/screenshots/fatia-01-1600x900.png`
- `docs/ai-harness/screenshots/fatia-01-1366x768.png`

