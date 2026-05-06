# Sprint 2 - Renomear Buzz para Botão de Vez

## 1. Objetivo

Substituir o termo antigo "buzz" por "botão de vez" na interface e nos logs operacionais, deixando a linguagem clara para jogadores e operador.

## 2. O que foi alterado

- Admin: o controle principal agora mostra "Liberar botões de vez".
- Admin: "Grupo ativo" virou "Grupo com a vez".
- Admin: fases internas como `buzz_open` agora aparecem como "Botões de vez liberados".
- Logs: mensagens operacionais agora usam "Botão de vez acionado", "Botões de vez liberados" e "Botões de vez bloqueados".
- Testes: o fluxo E2E usa o novo texto e valida que Admin e Stage não exibem "buzz" em texto visível.
- Documentação ativa: plano do Sprint 2 e resumos principais do Sprint 1 foram atualizados para a nova linguagem.

## 3. O que foi preservado

- O sketch Arduino não foi alterado.
- O protocolo serial foi preservado com `BT1PRESS`, `BT2PRESS`, `RESET`, `RESET_HW`, `LOCK`, `UNLOCK`, `PING`, `PONG` e `STATUS`.
- Os nomes internos de baixo risco, como `openBuzz`, `lastBuzz`, `buzzLocked`, `buzz_open`, `OPEN_BUZZ` e `PLAY_BUZZ`, foram mantidos para não mexer no contrato de store, snapshots e realtime.

## 4. Validação

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou, 5 arquivos e 14 testes.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: passou, 9 testes.
- `rtk rg "buzz|Buzz|BUZZ" src tests docs`: retornou apenas ocorrências técnicas, negativas ou históricas.

## 5. Pendências

- Código interno preservado: `openBuzz`, `receiveBuzz`, `receiveHardwareBuzz`, `receiveKeyboardBuzz`, `lockBuzz`, `lastBuzz`, `buzzLocked`, `buzz_open`, `OPEN_BUZZ`, `LOCK_BUZZ` e `PLAY_BUZZ`.
- Testes preservam `/buzz/i` apenas como asserção negativa para garantir que a interface não exibe o termo antigo.
- Documentos históricos em `docs/sprint-1/historico-ai-harness` ainda registram o termo antigo como histórico técnico.
- Ocorrências de `buzzer` foram mantidas porque indicam o componente físico/fallback de áudio do Arduino, não linguagem de UI.
