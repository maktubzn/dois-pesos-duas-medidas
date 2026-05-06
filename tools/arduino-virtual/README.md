# Arduino virtual externo

Ferramenta externa para simular o Arduino real por uma porta COM virtual. Ela nao altera o frontend, nao cria mock no app e nao substitui Web Serial.

## Instalar dependencias

```powershell
rtk npm --prefix tools/arduino-virtual install
```

## Self-test sem COM

```powershell
rtk npm --prefix tools/arduino-virtual run self-test
```

## Uso com com0com

Exemplo de par:

- COM7: escolhida no Chrome/Admin pelo Web Serial real.
- COM8: aberta pelo simulador.

```powershell
rtk npm run arduino:virtual -- --port COM8
```

No Admin, clique em conectar Arduino e selecione COM7.

## Protocolo

Comandos recebidos:

- `PING` -> `PONG`
- `STATUS` -> `STATUS:LOCKED` ou `STATUS:UNLOCKED`
- `LOCK` -> `LOCKED`
- `UNLOCK` -> `UNLOCKED`
- `RESET_HW` -> `RESET`

Comandos locais:

- `1` ou `a` -> envia `BT1PRESS`
- `2` ou `b` -> envia `BT2PRESS`
- `r` ou `reset` -> envia `RESET`
- `status`, `lock`, `unlock`, `ping`, `reset_hw`
