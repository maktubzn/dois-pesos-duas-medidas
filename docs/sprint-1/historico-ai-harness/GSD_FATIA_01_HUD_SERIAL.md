# GSD - Fatia 01 HUD Serial

## Status

Aprovada com pendencia de teste fisico do Arduino.

## O que foi congelado

- `ScoreBar.setScore(a, b)`
- `ScoreBar.addPoints(group, amount)`
- `ScoreBar.reset()`
- `ScoreBar.getState()`
- `QuizStage.showQuestionCard()`
- `QuizStage.hideQuestionCard()`
- `ArduinoBridge.connect()`
- `ArduinoBridge.disconnect()`
- `ArduinoBridge.send(command)`
- `ArduinoBridge.getState()`
- `ArduinoBridge.simulate(eventName)`

## Contrato Arduino

- `BT1PRESS`: Grupo A assume resposta.
- `BT2PRESS`: Grupo B assume resposta.
- `RESET`: ambos os grupos voltam para `AGUARDANDO`.

## Fallback teclado

- `Z`: simula `BT1PRESS`.
- `M`: simula `BT2PRESS`.
- `R`: simula `RESET`.

## GSDs preservados

- `docs/GSD_BACKGROUND_STAGE.md`
- `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`

## Pendencias

- Teste fisico com Arduino real.
- Substituir placeholder CSS da ampulheta se surgir asset local autorizado.

