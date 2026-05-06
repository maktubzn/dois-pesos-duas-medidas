# Harness 8 - Relatorio de Correcao

## Correcoes aplicadas
- `src/types/game.types.ts`
  - Adicionados `input_ready`, `InputSource`, `InputTelemetryEvent` e campos de snapshot para readiness e historico de input.
- `src/store/gameStore.ts`
  - Adicionados `prepareRoundInput`, `markInputReady` e `receiveInput`.
  - Input antes de pronto agora e rejeitado com motivo (`ignored_not_ready`, `input_not_ready`, `buzz_locked`, etc.).
  - Input valido em `buzz_open` inicia `team_answering` com timer de resposta de 10s.
  - `openBuzz` garante `inputReady=true` para compatibilidade controlada com caminhos diretos de teste, mas o fluxo Admin marca readiness antes de revelar pergunta.
  - Pre-show A/B registra `PRESHOW_TEST_INPUT_ACCEPTED` pelo mesmo pipeline, sem pontuar ou iniciar quiz.
  - RESET recebido segue como ACK, sem reiniciar fase.
- `src/components/Admin/AdminPage.tsx`
  - `revealAfterCountdown` agora faz: finalizar countdown, preparar input, `UNLOCK`, marcar input pronto, revelar pergunta e abrir buzz.
  - Sidebar virou navegacao real por botoes, com estado ativo e abertura do tecnico.
  - Adicionados botoes reais `Mesa A` e `Mesa B` no Admin para fallback operacional quando Web Serial nao puder ser automatizado/disponivel.
- `src/hooks/useArduinoSerial.ts`
  - Simulacao virtual BT1/BT2 usa `receiveInput(..., 'virtual')`, preservando telemetria de fonte.
- `eslint.config.js`
  - `_backups` e `_residuos` ignorados pelo lint para nao tratar backups como projetos TypeScript ativos.
- `tests/e2e/harness-8-core.spec.ts`
  - Cobre sidebar, teste A/B, input antes da hora, countdown e input aceito via Admin/Stage reais.
- `automacao/harness-8-human-match.spec.ts`
  - Simula 3 partidas completas sem `QuizStageDebug` como caminho principal.

## Bugs reproduzidos durante validacao
- E2E falhou quando esperava texto duplicado de "Mesa A reconhecida"; teste foi endurecido para heading especifico.
- A automacao longa falhou quando dependia apenas de teclado `z/m`. Corrigido com fallback operacional visivel `Mesa A/B`, usando o mesmo pipeline real de input.
- `test:e2e` antigo falhou por esperar teclado em fluxo ja migrado para input pronto/fallback UI; testes foram atualizados para o contrato Harness 8.

## Decisoes
- Web Serial nao foi automatizado diretamente no Playwright porque permissao/porta real nao sao garantidas no browser. A automacao registra fallback por teclado/UI real.
- A pergunta nao aparece na Stage durante `round_preparing` nem `input_ready`; ela so aparece depois de readiness.
- Nao houve mudanca em pontuacao, Tribunal central, Arduino `.ino`, backend ou Final Show.

## Residuos
- Nenhum residuo novo foi movido no Harness 8.
