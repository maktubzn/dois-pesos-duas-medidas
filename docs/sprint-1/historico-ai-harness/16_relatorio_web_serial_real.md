# 16 - Relatorio Web Serial Real

## Implementacao

- Parser aceita protocolo v2 estruturado.
- Hook `useArduinoSerial` expoe:
  - `connect`
  - `disconnect`
  - `send`
  - `ping`
  - `status`
  - `lock`
  - `unlock`
  - `resetHardware`
  - `playBuzz`
  - `stopAudio`
  - `setVolume`
  - `simulate`
- UI da stage mostra suporte, status, ultimo evento, ultimo comando, erro e DFPlayer.
- Fallback teclado `Z`, `M`, `R` foi preservado.

## Validacao feita

- `navigator.serial`: disponivel no Chrome automatizado.
- `window.isSecureContext`: `true` em `http://127.0.0.1:5173`.
- Protocolo fisico validado via COM6 por serial local.

## Respostas fisicas observadas

```txt
PONG
STATUS:UNLOCKED
DFPLAYER:ERROR
LOCKED
STATUS:LOCKED
DFPLAYER:ERROR
UNLOCKED
RESET
```

## Bloqueio honesto

O teste de conexao Web Serial pelo browser nao foi automatizado ate a selecao da porta, porque o chooser nativo de `requestPort()` exige acao/permissao do usuario. O app esta pronto para o teste manual: clicar em `Conectar Arduino`, selecionar `COM6` e usar os botoes `Ping`, `Status`, `Lock`, `Unlock`, `Reset HW`.

