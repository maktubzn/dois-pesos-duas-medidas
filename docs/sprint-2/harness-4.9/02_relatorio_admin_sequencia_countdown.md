# Harness 4.9 - Relatorio de Correcao

## Problemas confirmados

- Testes antigos ainda esperavam fluxo automatico de proxima rodada e botao `Iniciar rodada manual`.
- O feedback podia ser sobrescrito por um timeout pendente de `openBuzz()` depois de `Pular countdown`.
- O Admin ainda rotulava um envio de `RESET_HW` como `Fluxo automatico`.
- `RESET` recebido do Arduino ainda tinha risco de ser interpretado como comando de reset.
- A Stage mantinha o painel do Tribunal montado e acessivel fora do Tribunal, mesmo invisivel por opacidade.
- O countdown podia perder o primeiro numero visual no ambiente Stage/Admin separado.

## O que foi refeito

- Sequencia de rodada manual-assistida:
  - `round_prepare` aguarda operador.
  - `round_countdown` usa countdown oficial.
  - `question_reveal` abre `buzz_open`.
  - `buzz_open` dura 20s.
  - `team_answering` dura 10s.
  - feedback dura 3s e cai em `round_end`.
- Guard do `openBuzz()` agora depende da fase real `question_reveal` e do feedback vazio.
- Decisoes correto/errado cancelam timeouts pendentes de automacao.
- `RESET_HW` automatico foi removido do fluxo normal.
- `RESET` do Arduino virou ACK idempotente, com `correlationId/source`.
- Tribunal ganhou timer de 10s, auto-pass e dois passes com silencio.
- Admin foi mantido branco/preto, com Operacao limpa e Tecnico recolhido.
- Countdown visual foi estabilizado para apresentar 4, 3, 2, 1 sem flicker e sem alterar a duracao real.
- Painel do Tribunal na Stage agora fica `display: none` quando nao esta em uso.

## Arquivos principais alterados

- `src/store/gameStore.ts`
- `src/types/game.types.ts`
- `src/utils/roundSequence.ts`
- `src/components/Admin/AdminPage.tsx`
- `src/components/RoundIntroCountdown/RoundIntroCountdown.tsx`
- `src/components/RoundIntroCountdown/RoundIntroCountdown.module.css`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`
- `tests/e2e/quiz-stage.spec.ts`
- `tests/e2e/visual/harness-4.9-admin-sequencia-countdown.spec.ts`

## Residuos

Nenhum residuo foi movido neste harness. Nao foi criado `04_manifesto_residuos.md`.
