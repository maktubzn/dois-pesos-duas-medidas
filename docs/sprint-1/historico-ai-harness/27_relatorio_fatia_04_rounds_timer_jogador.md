# 27 - Relatorio Fatia 04 Rounds Timer Jogador

## Implementado

Store minima com:
- `currentRound`
- `totalRounds = 5`
- `activeSlot`
- `answerTimeSeconds = 20`
- `timerRemaining`
- `timerStatus`
- `gameLog`

Acoes adicionadas:
- `startQuiz`
- `nextRound`
- `revealQuestion`
- `openBuzz`
- `receiveHardwareBuzz`
- `receiveKeyboardBuzz`
- `lockBuzz`
- `resetRound`
- `resetGame`
- `awardPoints`
- `markWrong`
- `startTimer`
- `pauseTimer`
- `resumeTimer`
- `resetTimer`
- `tickTimer`
- `finishRound`

## Regra de rounds

- Round 1 ativa slot 1.
- Round 2 ativa slot 2.
- Round 3 ativa slot 3.
- Round 4 ativa slot 4.
- Round 5 ativa slot 5.
- Avancar depois do round 5 define `phase = game_over`.

## Timer

Timer de resposta com 20 segundos. Quando chega a zero:
- `timerStatus = time_up`
- `phase = time_up`
- `buzzLocked = true`
