# Harness 3.4 - Relatorio de implementacao

## Arduino virtual externo

Criado em `tools/arduino-virtual/`:

- `protocol.mjs`: protocolo/estado canonico.
- `cli.mjs`: console externo que abre uma COM real/virtual via `serialport`.
- `self-test.mjs`: validacao sem COM fisica.
- `README.md`: guia de uso.
- `package.json`: scripts locais.

Scripts raiz:

- `rtk npm run arduino:virtual:self-test`
- `rtk npm run arduino:virtual -- --list`
- `rtk npm run arduino:virtual -- --port COM8`

O app nao recebeu mock. O Admin continua conectando pela Web Serial real.

## Assets e fluidez

Criado `tools/harness-3.4/optimize-media.mjs` e script `assets:optimize:h34`.

Assets derivados gerados em `public/img-optimized/`:

- `bg-FNL1.webp`: 1.83 MB -> 61 KB.
- `bg-FNL2.webp`: 3.59 MB -> 76 KB.
- `logoinfo.webp`: 5.64 MB -> 108 KB.
- `02.webp`: 3.35 MB -> 430 KB.
- `senhor-destino.webp`: 5.30 MB -> 56 KB.
- `video1.mp4`: 2.86 MB -> 572 KB.
- `BGVIDEO.mp4`: 2.79 MB -> 552 KB.
- `video1-poster.webp`: 52 KB.
- `manifest.json`.

Referencias atualizadas:

- `src/utils/mediaAssets.ts` centraliza assets otimizados.
- `PreShowScreen` usa logo/video/poster otimizados.
- `BackgroundStage` usa backgrounds/video otimizados.
- `GroupCard` usa a textura `02.webp` otimizada.
- `questionBank` usa `senhor-destino.webp` otimizado para a carta pesada do Senhor Destino.

Melhorias de fluidez:

- `PreShowScreen` deixou de depender de rerender em cada `timeupdate`; o titulo troca apenas entre faixas.
- Imagens usam `decoding` e `fetchPriority` onde faz sentido.
- Video de pre-show usa poster otimizado e preload contextual.
- Camadas animadas usam `opacity`/`transform`, `will-change` e `backface-visibility`.

## Residuos

Residuos confirmados foram movidos para `_residuos/harness-3.4/`. O manifesto detalha origem, destino, motivo e risco.
