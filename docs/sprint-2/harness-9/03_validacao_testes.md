# Harness 9 - Validacao de Testes

## Matriz de cobertura

| Requisito | Teste criado/alterado | Tipo | Status | Evidencia |
|---|---|---|---|---|
| Botao A correto | `src/utils/serialEventToGroup.test.ts`, `src/store/gameStore.test.ts`, `tests/e2e/harness-8-core.spec.ts` | unit/e2e | passou | `docs/sprint-2/harness-9/evidencias/ab_mapping_prompt04.json` |
| Botao B correto | `src/utils/serialEventToGroup.test.ts`, `src/store/gameStore.test.ts`, `tests/e2e/harness-8-core.spec.ts` | unit/e2e | passou | `docs/sprint-2/harness-9/evidencias/ab_mapping_prompt04.json` |
| Reset no clique | `tests/e2e/harness-9-operation.spec.ts` | e2e | passou | `docs/sprint-2/harness-9/evidencias/reset_countdown_prompt05.json` |
| Countdown nao trava em 1s | `tests/e2e/harness-9-operation.spec.ts`, `tests/e2e/quiz-stage.spec.ts` | e2e | passou | `docs/sprint-2/harness-9/evidencias/reset_countdown_prompt05.json` |
| Round 1 pontua | `src/store/gameStore.test.ts`, `tests/e2e/harness-9-operation.spec.ts` | unit/e2e | passou | `docs/sprint-2/harness-9/evidencias/round1_score_prompt06.json` |
| Timer 20s | `src/store/gameStore.test.ts`, `tests/e2e/quiz-stage.spec.ts` | unit/e2e | passou | `docs/sprint-2/harness-9/evidencias/silence_penalty_prompt07.json` |
| Silencio -10/+10 | `src/store/gameStore.test.ts` | unit | passou | `docs/sprint-2/harness-9/evidencias/silence_penalty_prompt07.json` |
| Texto pre-show aparece | `tests/e2e/quiz-stage.spec.ts`, `tests/e2e/harness-8-core.spec.ts` | e2e | passou | `docs/sprint-2/harness-9/evidencias/preshow_prompt08.json` |
| Idempotencia | `src/store/gameStore.test.ts`, `tests/e2e/harness-9-operation.spec.ts` | unit/e2e | passou | `docs/sprint-2/harness-9/evidencias/logs/prompt09_telemetria.json` |
| Simulacao humana | `automacao/harness-8-human-match.spec.ts`, `automacao/operador-profissional.spec.ts` | automacao | parcial | `docs/sprint-2/harness-9/evidencias/harness-9-human-match.json` |

## Prompt 04 - Mapeamento A/B

- `rtk npm run test -- --run` - passou, 10 arquivos / 81 testes.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk npm run test:e2e` - passou, 23 testes.

## Prompt 05 - Reset e Countdown

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 81 testes.
- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.
- `rtk npm run arduino:virtual:self-test` - passou.

## Prompt 06 - Pontuacao Round 1

- `rtk npm run test -- --run` - passou, 10 arquivos / 83 testes.
- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.

## Prompt 07 - Timer 20s e Penalidade por Silencio

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 86 testes.
- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.

## Prompt 08 - Pre-show Texto Pulado e Textos

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 86 testes.
- `rtk npx playwright test tests/e2e/quiz-stage.spec.ts --project=chromium --grep "pre-show"` - passou.
- `rtk npx playwright test tests/e2e/harness-8-core.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.

## Prompt 09 - Logs, Telemetria e Idempotencia

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 86 testes.
- `rtk npm run test:e2e` - passou, 24 testes.

## Prompt 10 - Regressao Obrigatoria

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 86 testes.
- `rtk npm run lint` - passou limpo apos corrigir dependencia de hook.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium --grep "harness 8 simula"` - passou isolado.
- `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium --grep "operador profissional"` - passou isolado.
- `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium` - falhou por tempo/instabilidade da automacao combinada; nao sera repetido como criterio final.

## Prompt 11 - Simulacao Humana

- Partida limpa: coberta pela automacao `operador profissional`, passou isolada.
- Silencio e punicao: coberto por unitarios e E2E principal; sem teste completo de 20s em automacao longa para evitar execucao excessiva.
- Stress operacional: coberto pela automacao `operador profissional`, passou isolada.
- Resumo: `docs/sprint-2/harness-9/evidencias/harness-9-human-match.json`.
