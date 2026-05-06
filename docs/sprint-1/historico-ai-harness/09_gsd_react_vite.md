# GSD - React TypeScript Vite Migration

## 1. Nome da etapa

Migracao React + TypeScript + Vite - Fatias 01 e 02.

## 2. Objetivo

Transformar a raiz do projeto em app Vite React TS preservando o legado em backup.

## 3. Estado anterior

Projeto rodava como HTML/CSS/JS puro em `index.html`, `components/` e `img/`.

## 4. Estado atual

Projeto roda como Vite React TS na raiz com componentes base em `src/`.

## 5. Backup criado

- `backup/legacy-html-20260427-192742/`

## 6. Estrutura React/Vite criada

- `src/components/`
- `src/hooks/`
- `src/store/`
- `src/types/`
- `src/utils/`
- `public/img/`
- `tests/e2e/`

## 7. Assets usados

Assets locais copiados para `public/img/` e referenciados por `/img/...`.

## 8. Componentes criados

- `BackgroundStage`
- `IntroScreen`
- `ScoreBar`
- `GroupCard`
- `QuestionPanel`
- `HourglassTimer`
- `QuizStage`

## 9. Hooks criados

- `useBackgroundCue`
- `useArduinoSerial`

## 10. Store criada

- `useGameStore` com Zustand.

## 11. Web Serial API

Preparada em hook opcional. Sem Arduino fisico nesta etapa. Fallback teclado `Z`, `M`, `R` validado.

## 12. Testes rodados

- Typecheck.
- Build.
- Unit tests.
- Playwright E2E.
- Lint.

## 13. Bugs encontrados

- Config faltante do ESLint.
- Vitest coletando Playwright.
- Aviso TypeScript 6 sobre `baseUrl`.

## 14. Bugs corrigidos

- Criado `eslint.config.js`.
- Script `test` limitado a `src`.
- `ignoreDeprecations` adicionado.

## 15. Bugs pendentes

- Nenhum bloqueador tecnico conhecido.
- Teste fisico com Arduino segue pendente por escopo.

## 16. Como rodar

```powershell
rtk npm run dev
```

## 17. Como voltar ao legado

Usar os arquivos preservados em `backup/legacy-html-20260427-192742/`, especialmente `index.html`, `components/` e `img/`.

## 18. Proxima fatia recomendada

Fatia 03: sequencia de quiz real, timer funcional, regras de pontuacao e refinamento visual por comparacao com `projeto.png`.

