# Harness 3.4 - Plano de execucao

Data: 2026-04-30

## Contrato

- Arduino virtual deve ser ferramenta externa em `tools/arduino-virtual/`.
- O frontend continua usando Web Serial real por `navigator.serial.requestPort()`.
- Nenhum mock foi criado no app.
- O firmware `.ino` nao deve ser alterado.
- Assets originais em `public/img` e `public/img das perguntas` nao devem ser sobrescritos.
- Residuos confirmados devem ser movidos para `_residuos/harness-3.4/`, nunca apagados direto.

## Estado medido

- Protocolo real confirmado no `.ino`: `PING`, `STATUS`, `LOCK`, `UNLOCK`, `RESET_HW`, `BT1PRESS`, `BT2PRESS`, `RESET`.
- App ja possuia parser serial, Web Serial e BroadcastChannel funcionais.
- Maiores custos de runtime estavam em assets: `logoinfo.png`, `senhor-destino.png`, backgrounds PNG e MP4s.
- Nao havia porta COM disponivel na maquina durante a validacao (`No serial ports found`).

## Estrategia

- Criar simulador serial externo com Node `serialport`.
- Validar protocolo com self-test sem porta fisica.
- Documentar fluxo COM7/COM8 para com0com/VSPE.
- Gerar assets derivados em `public/img-optimized/` usando FFmpeg, preservando originais.
- Atualizar somente as referencias seguras: pre-show e background Stage.
- Reduzir render continuo no pre-show durante video/titulo.
- Usar Playwright para validar fluxo completo e screenshots.

