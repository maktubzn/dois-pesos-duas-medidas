# Harness 4.6 - Validacao e evidencias

## Comandos rodados

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 74 testes.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 22 testes.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk npm run visual:preshow` - passou.
- `rtk npm run visual:admin` - passou.
- `rtk npm run visual:timers` - passou.
- `rtk npm run visual:full-match` - passou.
- `rtk npm run visual:tribunal` - passou.
- `rtk npm run visual:final-show` - passou.
- `rtk npm run visual:all` - passou, 6 testes.

## Evidencias geradas

- Screenshots:
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-preshow-video-1366x768.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-preshow-how-to-play-1366x768.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-admin-1920x1080.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-admin-1366x768.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-timers-answer-start.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-timers-timeout-tribunal.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-tribunal-1920x1080.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-final-show-1920x1080.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-full-match-tribunal.png`
  - `docs/sprint-2/harness-4.6/evidencias/screenshots/visual-full-match-final.png`
- Videos:
  - `docs/sprint-2/harness-4.6/evidencias/videos/`
- Traces e videos Playwright:
  - `docs/sprint-2/harness-4.6/evidencias/playwright-output/`
- Frames extraidos com ffmpeg:
  - `docs/sprint-2/harness-4.6/evidencias/frames/`
- Resumo JSON:
  - `docs/sprint-2/harness-4.6/evidencias/visual-summary.json`

## Resultado

- Pre-show: briefing visivel sem overflow em 1366x768.
- Admin: painel com acao principal sem overflow em 1920x1080 e 1366x768.
- Timers: timeout leva ao Tribunal sem travar layout.
- Tribunal: overlay contido e legivel em 1920x1080.
- Final Show: vencedor, brasao, placar e sentenca visiveis.
- Full match visual: Tribunal e Final Show capturados no mesmo fluxo.

## Pendencias

- A reorganizacao completa em gavetas fechadas pode ficar para um harness dedicado, porque os controles 4.3/4.4/4.5 ainda dependem de visibilidade direta em E2E e operacao.
- A simulacao completa com operador, TV e mesa fisica ainda deve validar comportamento em hardware real.
