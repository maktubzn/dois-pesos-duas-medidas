# Congelamento da Fatia 01

## Status

Aprovada com pendencias.

## O que foi congelado

- HUD scorebar corrigido.
- Card de pergunta com helpers publicos.
- Ausencia de martelo DOM extra visivel.
- `BUZZ` HTML oculto.
- Base `ArduinoBridge`.
- Fallback teclado `Z`, `M`, `R`.

## Comandos testados

- `ScoreBar.setScore(1250, 980)`
- `ScoreBar.addPoints("A", 100)`
- `ScoreBar.addPoints("B", 50)`
- `ScoreBar.reset()`
- `QuizStage.startNewQuestion()`
- `QuizStage.hideQuestionCard()`
- `QuizStage.showQuestionCard()`
- `ArduinoBridge.simulate("BT1PRESS")`
- `ArduinoBridge.simulate("BT2PRESS")`
- `ArduinoBridge.simulate("RESET")`
- `ArduinoBridge.getState()`

## Screenshots

- `docs/ai-harness/screenshots/fatia-01-1920x1080.png`
- `docs/ai-harness/screenshots/fatia-01-1600x900.png`
- `docs/ai-harness/screenshots/fatia-01-1366x768.png`

## Bugs corrigidos

- Martelo DOM extra.
- `BUZZ` HTML visivel.
- Estado inicial incorreto dos cards.
- Falta de `ArduinoBridge`.
- Falta de aliases `showQuestionCard` e `hideQuestionCard`.

## Pendencias

- Validacao com Arduino fisico.
- Asset real de ampulheta.

## Proxima fatia recomendada

Fatia 02: fluxo de pergunta real, timer de resposta, travamento de rodada e pontuacao.

## Ponto de retomada se o contexto acabar

Continuar a partir de `docs/ai-harness/08_qa_final_fatia_01.md`.

