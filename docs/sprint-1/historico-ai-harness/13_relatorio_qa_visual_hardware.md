# 13 - Relatorio QA Visual Hardware

## QA inicial

- Falha confirmada antes da correcao: E2E esperava `PTS` na scorebar e recebia `" 0 0"`.
- `public/img/` estava vazio antes da correcao.
- Sketch v2 estava em `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`.
- `arduino-cli board list` encontrou `COM6`, mas a placa apareceu como `Unknown`; FQBN definido pelo usuario: `arduino:avr:uno`.

## QA apos correcao

- ScoreBar passou a expor `PTS 0` e `0 PTS`.
- Assets foram copiados para `public/img` e passaram a entrar no build em `dist/img`.
- E2E passou em 1920x1080, 1600x900, 1366x768 e 900x900.
- Sem martelo DOM extra.
- Fallback teclado `Z/M/R` passou.
- Fluxo de pontuacao por debug passou.

## Hardware

- Sketch compilou para Arduino Uno.
- Upload para `COM6` concluiu.
- Protocolo serial local respondeu a comandos.
- DFPlayer reportou `DFPLAYER:ERROR`; fallback de buzzer permanece necessario.

