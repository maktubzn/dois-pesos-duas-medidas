# Harness 8 - Validacao e Simulacao

## Comandos obrigatorios
- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 30 arquivos, 239 testes.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 23 testes.
- `rtk npm run arduino:virtual:self-test` - passou.

## Validacoes especificas
- `rtk npx playwright test tests/e2e/harness-8-core.spec.ts --project=chromium` - passou.
  - Admin e Stage reais.
  - Sidebar navega e marca `aria-current`.
  - Tecnico abre apenas quando selecionado.
  - `RESET_HW` nao aparece na operacao principal.
  - Pre-show teste A/B reconhece Mesa A e Mesa B.
  - Input antes de pronto nao muda para `team_answering`.
  - Countdown pulado transita para `buzz_open`.
  - Input valido muda para `team_answering`.
- `rtk npx playwright test -c automacao/playwright.config.ts automacao/harness-8-human-match.spec.ts --project=chromium` - passou.
  - 3 partidas completas simuladas.
  - Partida 1: Grupo A acerta fluxo normal.
  - Partida 2: Grupo A erra, favorecendo Grupo B.
  - Partida 3: stress com teste A/B, sidebar, timeout e Tribunal com dois passes.

## Evidencias
- JSON da automacao: `docs/sprint-2/harness-8/evidencias/harness-8-human-match.json`.
- Screenshots: `docs/sprint-2/harness-8/evidencias/screenshots/`.
- Videos Playwright: `docs/sprint-2/harness-8/evidencias/videos/`.
- Playwright output da automacao: `docs/sprint-2/harness-4.7/evidencias/operador-profissional/playwright-output/` por configuracao herdada de `automacao/playwright.config.ts`.

## Resultado
- Countdown nao ficou preso no zero nos testes rodados.
- Input antes de pronto e rejeitado e registrado.
- Input valido A/B e aceito por pipeline unico.
- Pergunta competitiva aparece depois de input pronto no fluxo Admin.
- Teste A/B do pre-show funciona sem pontuar e sem iniciar quiz.
- Sidebar Admin deixou de ser decorativa.

## Pendencias reais
- A automacao Playwright nao consegue conceder Web Serial real de forma portavel. Validacao final de mesa fisica ainda deve ser feita no ensaio com hardware, mas o fluxo de ACK/RESET e o arduino virtual passaram.
