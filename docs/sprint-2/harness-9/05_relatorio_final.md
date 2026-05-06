# Harness 9 - Relatorio Final

## 1. Resumo executivo

O Harness 9 corrigiu os pontos criticos para operacao publica: mapeamento A/B do serial, preparo imediato de hardware ao avancar rodada, countdown sem dependencia de ACK, pontuacao do round 1, timer de resposta em 20s, penalidade por silencio e pre-show com texto preservado antes do teste das mesas.

O Arduino `.ino` nao foi alterado. A validacao fisica ainda precisa ser feita com os botoes reais antes da apresentacao.

## 2. Correcoes aplicadas

### 2.1 Botoes invertidos

- Causa: calibracao no frontend mapeava `BT1PRESS -> B` e `BT2PRESS -> A`, apesar do `.ino` emitir `BT1PRESS` no handler A e `BT2PRESS` no handler B.
- Correcao: `BT1PRESS -> A`, `BT2PRESS -> B`; logs passaram a mostrar raw/resolvedGroup.
- Arquivos: `src/utils/serialEventToGroup.ts`, `src/utils/serialEventToGroup.test.ts`, `src/store/gameStore.ts`, `src/store/gameStore.test.ts`.
- Prova: unitarios, Arduino virtual e E2E principal passaram.

### 2.2 Reset na Proxima Rodada

- Causa: `handleNextRound()` avancava estado logico, mas nao preparava hardware/input imediatamente.
- Correcao: clique em `Proxima rodada` registra `ROUND_NEXT_CLICKED`, dispara preparo/reset/lock como melhor esforco e preserva placar.
- Arquivos: `src/components/Admin/AdminPage.tsx`, `tests/e2e/harness-9-operation.spec.ts`.
- Prova: E2E Harness 9 validou log de preparo e placar preservado.

### 2.3 Countdown travando em 1s

- Causa: UI exibia minimo 1s e transicao aguardava `UNLOCK`; qualquer serial lenta parecia travamento.
- Correcao: transicao final idempotente por token, `UNLOCK` sem bloqueio e display permitindo 0.
- Arquivos: `src/components/Admin/AdminPage.tsx`, `src/components/RoundIntroCountdown/RoundIntroCountdown.tsx`.
- Prova: E2E validou `round_countdown -> buzz_open` sem serial.

### 2.4 Pontuacao do Round 1

- Causa: store pontuava corretamente se `activeGroup` existia; falha operacional vinha de input invertido/rejeitado ou confirmacao sem grupo ativo.
- Correcao: testes explicitos de Mesa A/B no round 1 e log `SCORE_UPDATED`.
- Arquivos: `src/store/gameStore.ts`, `src/store/gameStore.test.ts`, `tests/e2e/harness-9-operation.spec.ts`.
- Prova: unitarios e E2E validaram round 1 no Admin e Stage.

### 2.5 Tempo de resposta 20s

- Causa: janela apos pegar a vez usava 10s.
- Correcao: `ANSWER_RESPONSE_SECONDS = 20`.
- Arquivos: `src/store/gameStore.ts`, `src/store/gameStore.test.ts`.
- Prova: unitarios e E2E existentes validam `Tempo de resposta` em 20/19s.

### 2.6 Penalidade por silencio -10/+10

- Regra: quem pega a vez e nao responde perde 10; adversario ganha 10.
- Correcao: timeout em `team_answering` aplica `roundFeedback: silence_penalty`, historico `no_answer_penalty` e log `NO_ANSWER_PENALTY_APPLIED`.
- Arquivos: `src/store/gameStore.ts`, `src/types/game.types.ts`, `src/components/Admin/AdminPage.tsx`, `src/components/QuizStage/QuizStage.tsx`, `src/components/QuestionPanel/QuestionPanel.tsx`, `src/audio/audioEvents.ts`.
- Prova: unitarios cobrem A, B, ausencia de grupo, pre-show/teste A/B, resposta antes do timeout e idempotencia.

### 2.7 Pre-show

- Causa: clique manual em `Testar mesa` pulava direto para `button_check`, ignorando `how_to_play_tribunal`.
- Correcao: caminho manual agora mostra primeiro a explicacao antes do teste; teste A/B comeca so na janela correta. Textos atualizados para tribunal, botao de vez, 20s, erro, silencio e teste das mesas.
- Arquivos: `src/utils/preShowTimeline.ts`, `src/store/gameStore.ts`, `src/components/PreShowScreen/PreShowScreen.tsx`, `src/components/Admin/AdminPage.tsx`, `tests/e2e/quiz-stage.spec.ts`, `tests/e2e/harness-8-core.spec.ts`.
- Prova: E2E de pre-show e E2E completo passaram.

### 2.8 Logs/telemetria

- Eventos: `INPUT_RECEIVED`, `INPUT_ACCEPTED`, `INPUT_REJECTED`, `ANSWER_WINDOW_STARTED`, `ANSWER_TIMEOUT`, `NO_ANSWER_PENALTY_APPLIED`, `SCORE_UPDATED`, `PRESHOW_SCENE_SHOWN`, `PRESHOW_TEST_STARTED`, `SERIAL_EVENT_RECEIVED`, `SERIAL_COMMAND_SENT`, `SERIAL_ERROR`, `COUNTDOWN_STARTED`, `HARDWARE_RESET_*`.
- Arquivos: `src/store/gameStore.ts`, `src/components/Admin/AdminPage.tsx`, `src/store/gameStore.test.ts`.
- Prova: unitarios e E2E principal passaram; matriz em `03_validacao_testes.md`.

## 3. Arquivos alterados

- `src/utils/serialEventToGroup.ts`
- `src/utils/serialEventToGroup.test.ts`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/types/game.types.ts`
- `src/components/Admin/AdminPage.tsx`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuestionPanel/QuestionPanel.tsx`
- `src/components/PreShowScreen/PreShowScreen.tsx`
- `src/components/RoundIntroCountdown/RoundIntroCountdown.tsx`
- `src/utils/preShowTimeline.ts`
- `src/audio/audioEvents.ts`
- `vite.config.ts`
- `tests/e2e/harness-8-core.spec.ts`
- `tests/e2e/harness-9-operation.spec.ts`
- `tests/e2e/quiz-stage.spec.ts`
- `tests/e2e/visual/harness-4.8-preshow-real.spec.ts`
- `automacao/playwright.config.ts`
- `automacao/harness-8-human-match.spec.ts`
- `automacao/operador-profissional.spec.ts`

## 4. Testes executados

| Comando | Resultado | Observacao |
|---|---|---|
| `rtk npm run typecheck` | passou | sem erros |
| `rtk npm run test -- --run` | passou | 10 arquivos / 86 testes |
| `rtk npm run lint` | passou | warning de hook corrigido |
| `rtk npm run build` | passou | build Vite gerado |
| `rtk npm run test:e2e` | passou | 24 testes |
| `rtk npm run arduino:virtual:self-test` | passou | protocolo virtual ok |
| `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium --grep "harness 8 simula"` | passou | automacao humana isolada |
| `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium --grep "operador profissional"` | passou | stress isolado |
| `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium` | falhou | comando combinado instavel por duracao/timeout; artefatos de falha movidos para `_residuos/harness-9` |

## 5. Simulacao humana

Automacoes humanas foram atualizadas para o fluxo atual e passaram isoladamente. O comando combinado nao sera usado como criterio de aceite final por instabilidade e duracao excessiva. Resumo: `docs/sprint-2/harness-9/evidencias/harness-9-human-match.json`.

## 6. Evidencias

- `docs/sprint-2/harness-9/evidencias/ab_mapping_prompt04.json`
- `docs/sprint-2/harness-9/evidencias/reset_countdown_prompt05.json`
- `docs/sprint-2/harness-9/evidencias/round1_score_prompt06.json`
- `docs/sprint-2/harness-9/evidencias/silence_penalty_prompt07.json`
- `docs/sprint-2/harness-9/evidencias/preshow_prompt08.json`
- `docs/sprint-2/harness-9/evidencias/logs/prompt09_telemetria.json`
- `docs/sprint-2/harness-9/evidencias/harness-9-human-match.json`
- `docs/sprint-2/harness-9/evidencias/automacao/operador-profissional/operador-profissional-report.json`

## 7. Decisoes tecnicas

- Nao alterar Arduino `.ino` sem prova fisica.
- Corrigir inversao na calibracao serial do frontend.
- Manter BroadcastChannel local.
- Manter Admin como unico ponto Web Serial.
- Manter fallback Mesa A/B como caminho operacional real.
- Nao transformar automacao combinada longa em bloqueador final depois de validacoes isoladas passarem.

## 8. O que NAO foi alterado

- Arduino `.ino`.
- Assets.
- Backend inexistente.
- BroadcastChannel.
- Arquitetura geral do Admin/Stage.
- Regra de erro normal `+5` para o adversario.

## 9. Pendencias reais

- Validar Arduino fisico com Mesa A e Mesa B reais.
- Confirmar se a fiacao fisica bate com `BT1PRESS -> A` e `BT2PRESS -> B`.
- Testar `RESET_HW`, `LOCK`, `UNLOCK` no equipamento real.
- Conferir audio/projetor no local.

## 10. Instrucao operacional para amanha

1. Abrir `/admin`.
2. Abrir `/stage` e colocar em tela cheia.
3. Conectar Arduino somente pelo Admin.
4. Rodar pre-show ate o teste das mesas.
5. Confirmar Mesa A e Mesa B fisicas.
6. Iniciar quiz pelo Admin.
7. Em cada rodada, usar `Iniciar rodada`; se necessario, `Pular countdown`.
8. Se Arduino falhar, usar fallback Mesa A/B no Admin.
9. Se Stage travar, recarregar `/stage`.
10. Se houver inversao fisica, operar pelo fallback e registrar evento bruto para ajuste posterior.
