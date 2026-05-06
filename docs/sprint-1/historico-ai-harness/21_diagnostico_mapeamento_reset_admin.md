# 21 - Diagnostico Mapeamento Reset Admin

## Diagnostico

O bug azul/vermelho estava no frontend: `handleSerialMessage` tratava `BT1PRESS` como Grupo A e `BT2PRESS` como Grupo B. No hardware real a fiacao esta invertida para a expectativa visual, entao a cor azul dava palavra ao vermelho e vice-versa.

## Decisao

Foi criada uma camada explicita de calibracao apenas para evento fisico:

- `BT1PRESS -> Grupo B`
- `BT2PRESS -> Grupo A`

O fallback de teclado continua direto:

- `Z -> Grupo A`
- `M -> Grupo B`
- `R -> RESET`

## Reset automatico

O reset automatico fica no Admin:

- antes de abrir buzz: `RESET_HW` e `UNLOCK`;
- quando ha grupo ativo: `LOCK`;
- apos pontuar, errar ou resetar rodada: `RESET_HW`.

Se o serial estiver desconectado, o comando entra no log como pendente e o jogo continua.
