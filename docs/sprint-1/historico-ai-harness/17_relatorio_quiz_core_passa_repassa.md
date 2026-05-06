# 17 - Relatorio Quiz Core Passa Repassa

## Implementado

Store Zustand com estados:

- `intro`
- `idle`
- `round_prepare`
- `question_reveal`
- `buzz_open`
- `team_answering`
- `pass_decision`
- `repass_decision`
- `answer_locked`
- `scoring`
- `round_end`
- `error`

## Acoes criadas

- `startQuiz`
- `startNewQuiz`
- `nextQuestion`
- `startNewQuestion`
- `revealQuestion`
- `openBuzz`
- `receiveBuzz`
- `passQuestion`
- `repassQuestion`
- `markCorrect`
- `markWrong`
- `addPoints`
- `resetRound`

## Integracao Arduino

- `BT1PRESS`: trava Grupo A.
- `BT2PRESS`: trava Grupo B.
- `RESET`: limpa rodada.
- `LOCKED`, `UNLOCKED`, `STATUS:*`, `DFPLAYER:*`, `PONG`, `ERROR:*`: atualizam telemetria serial.

## Validacao

- Testes unitarios da store criados.
- E2E cobre fluxo de debug: A pontua, reset, B pontua.

