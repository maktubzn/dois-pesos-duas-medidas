# Harness 4.2 - Relatorio de Implementacao

## Implementado

- Timeline do pre-show ampliada para 64s em `src/utils/preShowTimeline.ts`.
- Nova cena publica `button_check`, com visual dark e feedback para Mesa A/B.
- Novo estado de teste da mesa no snapshot compartilhado por BroadcastChannel:
  - `preShowInputCheckStatus`
  - `preShowInputCheckReceivedGroups`
  - `preShowInputCheckLastGroup`
- Novas acoes no store:
  - `startPreShowInputCheck`
  - `requestNextPreShowInputCheck`
  - `resetPreShowInputCheck`
  - `receivePreShowInputCheck`
- Protecao em `phase === "intro"` para impedir que `BT1PRESS`, `BT2PRESS` ou teclado mudem rodada, placar, timer ou grupo ativo fora do modo de teste.
- Controles de teste da mesa no Admin.
- Categoria `music` no `AudioManager` e asset `preshow_theme` no manifest.
- Controle de trilha no `GameAudioController`, com volumes por cena:
  - espera baixa;
  - abertura/titulo em volume medio;
  - briefing com ducking;
  - teste da mesa quase mudo;
  - fade-out ao ficar pronto ou iniciar quiz.
- Registro do risco de licenca do MP3 local em `public/audio/CREDITS_AUDIO.md`.

## Preservado

- Arduino `.ino` intocado.
- Web Serial preservado.
- BroadcastChannel preservado.
- Stage sem controles tecnicos.
- Admin como fonte operacional.
- Regras do quiz, 10 rounds, Veredito Final, historico e CSV preservados.

## Observacoes

O teste de botao usa a mesma entrada real/virtual do jogo, mas com isolamento de estado durante `intro`. Fora do modo de teste, sinais de mesa no pre-show sao registrados como ignorados e nao entram na regra do quiz.
