# Plano Migracao React Vite

## Fatia 01 - Backup + Scaffold

- Criar backup integral do legado.
- Criar scaffold Vite React TS via pasta temporaria.
- Copiar scaffold para a raiz.
- Copiar assets para `public/img/`.
- Instalar dependencias e validar `typecheck`, `build` e testes.

## Fatia 02 - Componentes Base

- Criar componentes de stage, fundo, intro, scorebar, cards, pergunta e ampulheta.
- Criar Zustand store, hooks de video e serial, utils de score/parser.
- Preservar a composicao visual atual sem quiz completo.

## Fatia 03 futura

- Sequencia de jogo real, timer e pontuacao.

## Criterios de aceite da execucao atual

- Backup existe.
- Vite roda na raiz.
- Componentes base compilam.
- Sem overflow principal.
- Sem martelo DOM extra.
- Fallback sem Arduino por teclado.

