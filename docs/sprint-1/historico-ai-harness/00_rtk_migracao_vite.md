# RTK Migracao Vite

Data: 2026-04-27

## Objetivo

Migrar a raiz atual do projeto "Dois Pesos, Duas Medidas" de HTML/CSS/JS legado para React + TypeScript + Vite, com backup integral antes de substituir o `index.html`.

## Estado inicial

- Nao havia `package.json`, `src/`, `public/` ou `vite.config.ts`.
- A tela funcional estava concentrada em `index.html`, `components/` e `img/`.
- GSDs existentes preservados em `docs/`.

## Regras da execucao

- Comandos shell sempre via `rtk`.
- Backup criado antes de qualquer substituicao.
- Sem apagar `img/`, `docs/`, `prompts/` ou `backup/`.
- Sem assets externos.
- Sem Arduino fisico.

## Backup da execucao

- `backup/legacy-html-20260427-192742/`

