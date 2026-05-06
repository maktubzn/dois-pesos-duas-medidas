# Harness 5 FINAL - Manifesto de residuos

Data: 2026-05-05

## Politica

Nada foi apagado diretamente. Artefatos gerados por validacao podem ser movidos para `_residuos/harness-5-final/` apos a bateria final, preservando origem e restaurabilidade.

## Movidos

| Origem | Destino | Motivo | Evidencia de nao uso runtime | Risco |
| --- | --- | --- | --- | --- |
| `dist/` | `_residuos/harness-5-final/dist/dist-pos-validacao/` | Build Vite gerado por `rtk npm run build`. | `dist/` e saida regeneravel; app fonte roda por `src/` e build recria. | Baixo |
| `test-results/` | `_residuos/harness-5-final/evidencias-temporarias/test-results-final/` | Saida temporaria do Playwright apos e2e. | Evidencias canonicas ficam em `docs/sprint-2/harness-5-final/evidencias/`. | Baixo |
| `dist/` | `_residuos/harness-5-final/dist/dist-final-pos-e2e/` | Build Vite recriado pela validacao final. | `dist/` e saida regeneravel; app fonte roda por `src/` e build recria. | Baixo |
| `test-results/` | `_residuos/harness-5-final/evidencias-temporarias/test-results-final-pos-e2e/` | Saida temporaria recriada pela ultima rodada e2e/visual. | Evidencias canonicas ficam em `docs/sprint-2/harness-5-final/evidencias/`. | Baixo |

## Candidatos preservados

- `docs/sprint-2/harness-5-final/evidencias/`: evidencias canonicas do Harness 5.
- `public/img*` e `public/audio/`: assets protegidos e potencialmente usados por public path.

## Risco de restauracao

Baixo. `dist/` pode ser regenerado por `rtk npm run build`; `test-results/` e diagnostico temporario de teste.
