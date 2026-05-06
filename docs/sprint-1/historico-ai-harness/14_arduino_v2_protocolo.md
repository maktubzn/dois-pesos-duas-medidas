# 14 - Arduino v2 Protocolo

## Sketch

Arquivo usado:

```txt
hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino
```

## Pinos

- LED Grupo A: 8
- LED Grupo B: 9
- Botao Grupo A: 3
- Botao Grupo B: 4
- Botao RESET: 5
- Buzzer fallback: 10
- DFPlayer Mini via SoftwareSerial: RX=6, TX=7

## Arduino -> Front

- `ARDUINO_READY`
- `DFPLAYER_READY`
- `DFPLAYER_ERROR`
- `BT1PRESS`
- `BT2PRESS`
- `RESET`
- `LOCKED`
- `UNLOCKED`
- `PONG`
- `STATUS:LOCKED`
- `STATUS:UNLOCKED`
- `DFPLAYER:READY`
- `DFPLAYER:ERROR`
- `ERROR:*`

## Front -> Arduino

- `PING`
- `STATUS`
- `LOCK`
- `UNLOCK`
- `RESET_HW`
- `LED1_ON`
- `LED2_ON`
- `LEDS_OFF`
- `PLAY_BUZZ`
- `STOP_AUDIO`
- `VOLUME:0..30`

## Arduino CLI

```powershell
rtk powershell -NoProfile -Command "arduino-cli compile --fqbn arduino:avr:uno 'hardware/arduino_quiz_controller_v2'"
rtk powershell -NoProfile -Command "arduino-cli upload -p COM6 --fqbn arduino:avr:uno 'hardware/arduino_quiz_controller_v2'"
```

Resultado:

- Compile: passou.
- Upload COM6: passou.

