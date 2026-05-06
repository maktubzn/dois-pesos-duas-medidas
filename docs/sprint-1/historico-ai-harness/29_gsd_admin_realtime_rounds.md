# 29 - GSD Admin Realtime Rounds

## Estado congelado

Projeto em React + TypeScript + Vite com:
- Stage em `/stage`.
- Admin em `/admin`.
- Login local.
- Web Serial restrito ao Admin.
- BroadcastChannel local para sincronizar Stage.
- Core minimo de 5 rounds.
- Timer minimo de resposta.
- Calibracao serial fisica no frontend.

## Decisoes congeladas

- Nao usar React Router nesta fatia.
- Nao mexer no sketch Arduino.
- Nao instalar dependencias.
- Nao recriar cards.
- Nao criar backend realtime ainda.

## Riscos restantes

- BroadcastChannel so funciona na mesma origem/local.
- Login local nao deve ser tratado como seguranca real.
- Teste Web Serial real ainda exige selecao manual do COM6.
- Timer ainda roda no Admin; se o Admin fechar, o Stage para de receber ticks.
