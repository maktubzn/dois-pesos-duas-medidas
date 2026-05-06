# Harness 4.4 - Validacao

## Comandos executados

- `rtk ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,channels,sample_rate,bit_rate -of default=noprint_wrappers=1 "public/audio/fundo tribunal.mp3"` - passou.
- `rtk powershell -NoProfile -Command "ffmpeg ..."` - passou e gerou a trilha do tribunal.
- `rtk ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,channels,sample_rate,bit_rate -of default=noprint_wrappers=1 "public/audio/music/desafio_tribunal_theme.mp3"` - passou: MP3, mono, 44.1kHz, 96kbps, 30s.
- `rtk npm run test -- --run` - passou, 10 arquivos e 72 testes.
- `rtk npm run lint` - passou.
- `rtk npm run typecheck` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 21 testes.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk powershell -NoProfile -Command "Get-CimInstance Win32_SerialPort | Select-Object DeviceID,Name | Format-Table -AutoSize"` - detectou COM7 e COM8 por com0com.

## Cobertura validada ate aqui

- Acerto normal +10.
- Erro normal com +5 ao adversario.
- Entrada no Desafio do Tribunal por timeout sem grupo ativo.
- Sorteio deterministico do tribunal.
- Arriscar correto +20.
- Arriscar errado -10.
- Passar transfere chamada.
- Dois passes encerram com silencio nos autos.
- Botoes de vez bloqueados durante tribunal.
- CSV exporta campos novos preservando protecao contra injection.
- Audio do tribunal inicia e para pelo controlador da Stage.
- ScoreBar mostra placar negativo sem quebrar percentuais.
- E2E validou fluxos normais, tribunal, audio do tribunal, pre-show 4.2, audio publico 4.3 e BroadcastChannel.
- Unitario validou `BT2PRESS` via `handleSerialMessage` durante tribunal sem sequestrar `activeGroup`.
- Arduino virtual validou eventos basicos, lock, unlock, reset e comandos de controle.

## Pendente nesta validacao

- Validacao fisica assistida pelo seletor Web Serial do navegador, caso a mesa real esteja conectada.
