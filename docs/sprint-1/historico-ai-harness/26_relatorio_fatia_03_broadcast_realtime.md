# 26 - Relatorio Fatia 03 Broadcast Realtime

## Arquivos criados

- `src/realtime/broadcastChannel.ts`
- `src/hooks/useRealtimeBridge.ts`

## Implementado

- Canal `dois-pesos-game-channel`.
- Mensagens tipadas com `originId`, `source`, `sentAt` e payload.
- Admin publica `GAME_STATE_SYNC` em toda mudanca da store.
- Stage assina o canal e aplica snapshots via `applySnapshot`.
- O Stage ignora mensagens do proprio `originId`.

## Validacao

Playwright abre duas paginas no mesmo contexto, loga no Admin, inicia quiz, abre buzz, pontua e verifica o Stage atualizado.
