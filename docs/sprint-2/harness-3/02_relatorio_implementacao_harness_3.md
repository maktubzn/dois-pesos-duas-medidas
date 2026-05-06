# Harness 3 - Relatorio de implementacao

## Fluxo implementado

1. Admin finaliza ou pula o pre-show 2.1 e clica `Iniciar quiz`.
2. Admin clica `Iniciar rodada`.
3. A pergunta entra no Stage em `question_reveal`.
4. Apos a transicao, a janela de resposta abre em `buzz_open` e o timer automatico inicia.
5. Teclado/hardware de vez define o grupo ativo e pausa o timer em `team_answering`.
6. Admin marca `Marcar correto`, `Errada` ou `Reabrir botao de vez`.
7. `Marcar correto` pontua o grupo ativo e mostra feedback/pulso no placar.
8. `Errada` trava a resposta e permite reabrir a vez mantendo o tempo restante.
9. Se o timer chega a zero, o estado vira `time_up`, os botoes ficam travados e o feedback publico aparece.
10. `Proximo round` limpa grupo ativo, feedback, timer e pergunta.
11. Apos a rodada 5, `nextRound` entra em `game_over` e o Stage mostra tela final.

## Arquivos alterados

- `src/types/game.types.ts`: adicionou `RoundFeedback`, `roundFeedback`, `lastScoredGroup` e `lastScoreDelta`.
- `src/store/gameStore.ts`: adicionou feedback de rodada, reabertura de vez, timer automatico, guard contra pontuacao duplicada e guard contra `openBuzz` tardio depois de `game_over`.
- `src/components/Admin/AdminPage.tsx`: adicionou controle `Iniciar rodada`, pausa/retomada de rodada, reabertura de vez, feedback operacional e pontuacao correta do grupo ativo.
- `src/components/QuizStage/QuizStage.tsx`: conectou feedback, timer numerico, destaque de score e tela final `game_over`.
- `src/components/QuizStage/QuizStage.module.css`: estilos de feedback e tela final.
- `src/components/QuestionPanel/QuestionPanel.tsx`: label contextual por fase/feedback.
- `src/components/QuestionPanel/QuestionPanel.module.css`: contraste e reducao de movimento.
- `src/components/HourglassTimer/HourglassTimer.tsx`: leitura numerica e progresso visual.
- `src/components/HourglassTimer/HourglassTimer.module.css`: visual do timer, pausado e tempo esgotado.
- `src/components/ScoreBar/ScoreBar.tsx`: destaque do grupo pontuado.
- `src/components/ScoreBar/ScoreBar.module.css`: pulso de pontuacao.
- `src/components/GroupCard/GroupCard.tsx`: slots deixaram de ser botoes inertes.
- `src/components/GroupCard/GroupCard.module.css`: removeu cursor de controle dos slots.
- `src/store/gameStore.test.ts`: ampliou cobertura de timer, pausa, reabertura, anti-duplicacao e limpeza de round.
- `tests/e2e/quiz-stage.spec.ts`: screenshots do Harness 3, fluxo Admin/Stage, tempo esgotado e `game_over` visivel.

## Admin

O Admin controla a partida sem start manual de timer. `Iniciar rodada` chama reset/unlock de hardware, revela pergunta e abre a janela de resposta apos a transicao. O intervalo de timer vive no Admin e chama `tickTimer(1)` enquanto `timerStatus === 'running'`.

## Stage

O Stage nao mostra controles tecnicos. Ele exibe placar, grupos, pergunta, timer, feedback e tela final por snapshot. O termo publico `buzz` nao aparece na UI.

## Pre-show 2.1

Nao foi refeito. O Harness 3 preserva `/img/logoinfo.png`, `/img/video1.mp4`, titulo por codigo, briefing e estado pronto para iniciar quiz.

## Escopo preservado

Nao houve edicao em Arduino `.ino`, Web Serial estrutural, BroadcastChannel estrutural, backend, Sprint 1, Harness 1 ou Harness 2.1.
