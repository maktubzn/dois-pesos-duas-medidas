# Harness 6 - Manifesto de residuos

Data: 2026-05-05

## Movidos

| Origem | Destino | Motivo | Evidencia de nao uso | Risco |
| --- | --- | --- | --- | --- |
| `dist/` | `_residuos/harness-6/dist/dist-validacao-2026-05-05/` | Build gerado por validacao | `dist/` foi recriado por `npm run build`; nao e fonte | Baixo, build recria |
| `test-results/` | `_residuos/harness-6/test-results/test-results-validacao-2026-05-05/` | Artefatos de falhas/intermediarios Playwright | Gerado por execucao de teste | Baixo |
| `dist/` | `_residuos/harness-6/dist/dist-validacao-final-2026-05-05/` | Build final gerado por validacao obrigatoria | `dist/` foi recriado por `npm run build`; nao e fonte | Baixo, build recria |
| `test-results/` | `_residuos/harness-6/test-results/test-results-validacao-final-2026-05-05/` | Artefatos finais Playwright | Gerado por `npm run test:e2e` | Baixo |

## Nao movidos

- Evidencias canonicas de `docs/sprint-2/harness-6/evidencias/`.
- Assets publicos em `public/`.
- Automacoes em `automacao/`.
- `tools/arduino-virtual/` e `tools/windows/`.

