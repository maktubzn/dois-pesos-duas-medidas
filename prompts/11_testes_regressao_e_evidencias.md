# Prompt 11 — Testes, Regressão e Evidências

## Objetivo

Validar Harness 9.1 completo.

## Comandos

```bash
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run lint
rtk npm run build
rtk npm run test:e2e
rtk npm run arduino:virtual:self-test
```

Se alterou automação:
```bash
rtk npx playwright test -c automacao/playwright.config.ts --project=chromium
```

## Matriz

- Pré-show Mesa A/B.
- Reset manual.
- Primeira rodada Grupo A/B.
- Áudio do botão de vez.
- Brasões A/B.
- Admin limpo.
- Tribunal modal.
- Ajuda.
- Assets aprovados vs `anal_`.
- `.bat`.

## Evidências

Salvar em `docs/sprint-2/harness-9.1/evidencias/`.

## Falhas

Não esconder. Corrigir ou documentar. Mover resíduos para `_residuos/harness-9.1`.

## Documento

Criar/atualizar `03_validacao_testes.md`.

## Saída

Comandos, resultados, evidências, falhas e risco restante.
