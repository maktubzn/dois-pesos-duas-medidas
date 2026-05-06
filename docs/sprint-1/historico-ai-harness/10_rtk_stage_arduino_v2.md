# 10 - RTK Stage Arduino v2

## Estado de partida

- Projeto principal: React + TypeScript + Vite na raiz.
- Entrada: `index.html` -> `src/main.tsx` -> `src/App.tsx` -> `QuizStage`.
- Sketch v2 real: `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`.
- Placa escolhida: Arduino Uno.
- Porta alvo: `COM6`.
- FQBN: `arduino:avr:uno`.

## Blockers confirmados

- `ScoreBar` mostrava apenas numeros e quebrava o contrato `PTS`.
- `public/img/` estava vazio, apesar do codigo usar `/img/...`.
- `index.html` mantinha titulo `-vite-scaffold-tmp`.
- Web Serial real depende do chooser nativo do navegador.

## Arquivos de implementacao tocados

- `index.html`
- `src/components/ScoreBar/ScoreBar.tsx`
- `src/components/ScoreBar/ScoreBar.module.css`
- `src/components/ScoreBar/ScoreBar.test.tsx`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`
- `src/hooks/useArduinoSerial.ts`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/types/game.types.ts`
- `src/utils/serialParser.ts`
- `src/utils/serialParser.test.ts`
- `tests/e2e/quiz-stage.spec.ts`
- `public/img/*`

## Ferramentas

- `rtk`: usado em comandos shell.
- `arduino-cli`: disponivel.
- `gstack*`: nao encontrado no PATH; alternativa usada foi validacao automatizada local.

