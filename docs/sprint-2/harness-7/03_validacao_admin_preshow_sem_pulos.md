# Harness 7 - Validacao

## Evidencias

- JSON: `docs/sprint-2/harness-7/evidencias/harness-7-admin-preshow.json`
- Screenshots:
  - `docs/sprint-2/harness-7/evidencias/screenshots/admin-login-dark.png`
  - `docs/sprint-2/harness-7/evidencias/screenshots/admin-dark-1366x768.png`
  - `docs/sprint-2/harness-7/evidencias/screenshots/admin-dark-1920x1080.png`
  - `docs/sprint-2/harness-7/evidencias/screenshots/admin-dark-decisao.png`
  - `docs/sprint-2/harness-7/evidencias/screenshots/preshow-mesa-ab-reconhecida.png`
- Frames do pre-show: `docs/sprint-2/harness-7/evidencias/frames/preshow-frame-01.png` a `preshow-frame-42.png`
- Videos Playwright: `docs/sprint-2/harness-7/evidencias/videos/`

## Duracoes observadas no pre-show

- `how_to_play_first`: 7 amostras, 8139ms observados.
- `how_to_play_score`: 7 amostras, 8453ms observados.
- `how_to_play_wrong`: 7 amostras, 8419ms observados.
- `how_to_play_tribunal`: 8 amostras, 10222ms observados.

As duracoes observadas sao menores que a janela configurada porque a primeira/ultima amostra raramente caem exatamente na borda da cena. O contrato configurado e de 10s, 10s, 10s e 12s.

## Comandos rodados

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - 10 arquivos / 79 testes passaram.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - 22 testes passaram.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk npx playwright test -c playwright.visual.config.ts --grep @visual:harness-7` - passou.

## Resultado

- Admin reconstruido como painel escuro operacional.
- Pre-show com ensino mais lento e validado contra pulo.
- Tecnico fechado por padrao.
- RESET_HW ausente da operacao principal.
- Sem erro de console ou request falho na validacao Harness 7.
