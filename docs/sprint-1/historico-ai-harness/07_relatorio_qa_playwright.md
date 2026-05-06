# Relatorio QA Playwright

## Status

Aprovado.

## Testes executados

- `npm run test:e2e`
- 5 testes passaram em Chromium.

## Viewports testadas

- 1920x1080
- 1600x900
- 1366x768
- 900x900

## Validacoes

- Sem overflow horizontal.
- Sem overflow vertical.
- Video existe e `loop === false`.
- ScoreBar mostra texto em pontos.
- Nao existe martelo DOM extra.
- Fallback teclado sem Arduino funciona com `Z`, `M`, `R`.

## Screenshots

- `docs/ai-harness/screenshots/react-vite-1920x1080.png`
- `docs/ai-harness/screenshots/react-vite-1600x900.png`
- `docs/ai-harness/screenshots/react-vite-1366x768.png`
- `docs/ai-harness/screenshots/react-vite-900x900.png`

## Bugs encontrados e corrigidos

- Vitest coletava spec do Playwright; corrigido limitando `test` a `src`.
- ESLint 10 sem config flat; corrigido com `eslint.config.js`.
- TypeScript 6 alertou `baseUrl`; corrigido com `ignoreDeprecations: "6.0"` no `tsconfig.app.json`.

