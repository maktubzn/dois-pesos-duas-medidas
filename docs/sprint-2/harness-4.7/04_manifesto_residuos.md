# Harness 4.7 - Manifesto de Residuos

## Politica

Somente residuos confirmados foram movidos. `dist/` foi preservado.

## Movidos para `_residuos/harness-4.7/public/`

- `_residuos/harness-4.7/public/img/logoinfo.png` - substituido em runtime por `public/img-optimized/logoinfo.webp`.
- `_residuos/harness-4.7/public/img/projeto.png` - referencia historica, sem uso de runtime.
- `_residuos/harness-4.7/public/img/bg-FNL2.png` - substituido em runtime por `public/img-optimized/bg-FNL2.webp`.
- `_residuos/harness-4.7/public/img/video1.mp4` - substituido em runtime por `public/img-optimized/video1.mp4`.
- `_residuos/harness-4.7/public/img das perguntas/senhor-destino.png` - substituido em runtime por `public/img das perguntas-optimized/senhor-destino.webp`.

## Nao movidos

- `public/img/barraMoldura.png`, usado por `ScoreBar`.
- `public/img/01.png`, `03(header).png`, `04(brasao).png` e `brasao dc.png`, usados por `GroupCard`/intro legado.
- `dist/`, por decisao explicita de nao limpar build artifact neste harness.

## Observacao

Os manifests de otimizacao ainda citam os arquivos brutos como origem historica. Isso nao afeta runtime do app.
