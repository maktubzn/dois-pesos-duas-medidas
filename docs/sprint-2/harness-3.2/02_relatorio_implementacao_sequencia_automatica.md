# Harness 3.2 - Relatorio de implementacao

## Sequencia automatica

O store recebeu acoes para a automacao:

- `startRoundSequence`;
- `pauseRoundSequence`;
- `resumeRoundSequence`;
- `endRoundSequence`;
- `enterRoundCountdown`;
- `tickRoundCountdown`;
- `skipRoundCountdown`;
- `finishRoundCountdown`;
- `scheduleAutoNextRound`;
- `forceNextRoundTechnical`;
- `completeAutoSequence`.

O fluxo automatico e:

1. `Iniciar quiz` monta a sessao e o schedule por seed.
2. `Iniciar rodadas` entra em `round_countdown`.
3. Countdown termina ou e pulado.
4. Pergunta aparece.
5. Timer abre a janela do botao de vez.
6. Operador valida a resposta.
7. Feedback aparece.
8. Sistema agenda `auto_next_round_delay`.
9. Proximo round entra em novo countdown.

## Countdown variavel

Foi criado `src/utils/roundSequence.ts` com:

- `buildRoundIntroSchedule(seed, totalRounds)`;
- `getRoundIntroDelay(...)`;
- `getPostFeedbackDelay(...)`;
- `formatCountdown(ms)`.

Os delays de countdown variam entre 1s e 5s por seed. O delay pos-feedback varia entre 2s e 3s. O schedule nao fica invisivel: valores de delay entram no estado e no historico.

## Stage

Foi criado `src/components/RoundIntroCountdown/`.

Visual:

- fundo preto;
- relogio central `00:03`;
- label `RODADA 01 / 10`;
- label `VEREDITO FINAL` no desempate;
- glow frio controlado;
- `prefers-reduced-motion` reduz animacao.

Durante countdown:

- pergunta nao aparece;
- resposta correta nao aparece;
- timer da resposta nao inicia;
- input fica bloqueado;
- overlay nao gera overflow.

## Admin

O painel de partida foi atualizado:

- antes: `Iniciar rodadas`;
- rodando: `Pausar sequencia`;
- pausado: `Continuar sequencia`;
- tecnicos: `Pular countdown`, `Forcar proximo round`, `Encerrar sequencia`, `Resetar partida`.

O Admin mostra:

- status da sequencia;
- estado do countdown;
- countdown restante;
- delay atual;
- delay de auto avanco;
- timer da resposta;
- grupo com a vez.

## Historico

Eventos novos:

- `auto_sequence_started`;
- `auto_sequence_paused`;
- `auto_sequence_resumed`;
- `auto_sequence_completed`;
- `round_countdown_started`;
- `round_countdown_skipped`;
- `round_countdown_finished`;
- `auto_next_round_scheduled`.

O CSV agora inclui:

- `roundIntroDelayMs`;
- `roundIntroRemainingMs`;
- `postFeedbackDelayMs`;
- `automationToken`.

## Veredito Final

Quando o round 10 termina empatado, o store entra no modo `tie_breaker` como antes, mas agora a pergunta de desempate tambem passa por `round_countdown`. Se um grupo erra e o outro ainda pode responder, a sequencia reabre a vez. Se houver vencedor, a automacao conclui em `completed`.

## Escopo preservado

Nao houve alteracao em Arduino `.ino`, Web Serial estrutural, BroadcastChannel estrutural, mapeamento A/B, banco de perguntas salvo integracao minima, pre-show 2.1, audio completo ou backend.
