# 24 - Relatorio Fatia 01 Mapping Reset

## Arquivos alterados

- `src/types/game.types.ts`
- `src/utils/serialEventToGroup.ts`
- `src/utils/serialEventToGroup.test.ts`
- `src/store/gameStore.ts`
- `src/hooks/useArduinoSerial.ts`
- `src/store/gameStore.test.ts`

## Implementado

- Calibracao real do Arduino: `BT1PRESS -> B`, `BT2PRESS -> A`.
- Fallback teclado direto: `Z -> A`, `M -> B`, `R -> reset`.
- Store ganhou `receiveHardwareBuzz` e `receiveKeyboardBuzz`.
- Reset automatico preparado para ser chamado pelo Admin.
- Testes unitarios cobrem mapeamento fisico e teclado direto.

## Validacao

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou.
