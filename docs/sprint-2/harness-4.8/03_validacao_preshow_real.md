# Harness 4.8 - Validacao Pre-show Real

## Comandos rodados

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 75 testes.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e -- --grep "pre-show"` - passou, 1 teste.
- `rtk npx playwright test -c playwright.visual.config.ts --grep @visual:preshow-4.8` - passou, 1 teste visual com video e frames.

## Observacao

`rtk npm run test:e2e` completo foi executado durante a correcao e ficou com 21/22 passando; a falha restante foi no teste antigo de countdown automatico, fora do escopo do Harness 4.8 e sem relacao com o pre-show.

## Evidencias

Destino: `docs/sprint-2/harness-4.8/evidencias/`.

- Video completo do pre-show.
- Frames `preshow-00s.png` ate `preshow-42s.png`.
- Screenshot de espera e mesa A/B reconhecida.
- JSON `preshow-real-metrics.json`.
- Trace/video do Playwright em `playwright-output` quando aplicavel.
- A metrica do titulo registrou `entering -> full -> leaving`, seguida por `how_to_play_first`, mantendo `data-video-state="held-final-frame"`.
- O JSON separa `sampleElapsedMs` do teste e `stageElapsedMs` real da Stage. Na ultima captura, o titulo apareceu em `stageElapsedMs` ~9851ms e o ensino entrou em ~12458ms.

## Criterios

- `video.currentTime` avanca durante a fase de video.
- `data-video-state` vira `held-final-frame` apos o video.
- O video nao desmonta durante ensino/teste/pronto.
- Assets de quiz nao carregam durante intro.
- Mesa A e Mesa B sao reconhecidas sem pontuar e sem iniciar quiz.
- Quiz permanece em `phase="intro"` ate clique explicito do Admin.
