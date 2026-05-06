# 22 - Relatorio Pesquisa Context7 Admin Realtime

## Context7

Consulta Zustand:
- `getState`, `setState` e `subscribe` sao APIs documentadas para acesso fora de componentes React.
- A ponte realtime usa `subscribe` no Admin para publicar snapshots e `setState` controlado via `applySnapshot` no Stage.

Consulta Vite:
- Assets em `public/` devem ser referenciados por caminho absoluto de raiz, como `/img/01-background.png`.
- Essa estrategia foi preservada.

## Web

Referencias praticas:
- MDN Web Serial API: Web Serial exige contexto seguro e permissao por gesto do usuario para `requestPort`.
- MDN BroadcastChannel: adequado para comunicacao entre contextos de mesma origem, como abas Admin e Stage.

## Decisoes

- Sem React Router nesta fatia: roteamento por `location.pathname` atende `/stage` e `/admin`.
- BroadcastChannel e suficiente para MVP local de feira.
- Web Serial fica apenas no Admin, para evitar chooser/permissao no telão Stage.
