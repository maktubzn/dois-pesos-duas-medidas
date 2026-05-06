# Harness 4.6 - Relatorio de correcoes

## Timers

- Adicionado modelo por relogio real no snapshot:
  - `startedAtMs`
  - `durationMs`
  - `pausedAtMs`
  - `accumulatedPauseMs`
  - `lastTickAtMs`
- Aplicado em:
  - pre-show;
  - tempo de resposta;
  - countdown entre rodadas.
- O Admin agora usa `requestAnimationFrame` com tick controlado em torno de 100 ms.
- O fim do countdown agora deriva de `roundIntroRemainingMs <= 0`; nao ha mais timeout separado competindo com o valor visual.
- Testes que avancam tempo manualmente continuam suportados por `tickTimer(seconds)`, `tickPreShow(ms)` e `tickRoundCountdown(ms)`.

## Pre-show

- Briefing `how_to_play` encurtado para cards rapidos:
  - `Acertou: +10.`
  - `Errou: rival +5.`
  - `Silencio chama o Desafio do Tribunal.`
  - `Arriscar vale +20; errar custa -10.`
  - `Dois passes: silencio nos autos.`
  - `O operador conduz a decisao.`
- Cards passam a usar grade de 3 colunas em desktop e reduzem carga visual em 1366x768.
- Barra de progresso trocada de `width` para `transform: scaleX(...)`.

## Admin

- Criada faixa `Acao principal do operador`.
- Acoes perigosas continuam com confirmacao.
- A decisao correto/errado e o Tribunal continuam manuais.
- Os controles existentes de audio TV, mesa, historico, resposta e Final Show foram preservados.

## Final Show

- Brasao ampliado.
- Entrada com blackout/borda mais presente.
- Sentenca final reduzida para:
  - `Veredito registrado. A vitoria tem peso. O julgamento esta encerrado.`
- `prefers-reduced-motion` desativa replay/blackout animado.

## Scripts

- `tools/windows/start-dev.bat`
- `tools/windows/start-arduino-virtual.bat`
- `tools/windows/start-stage-admin.bat`
- `tools/windows/run-visual-qa.bat`

## Playwright visual

- Criado `playwright.visual.config.ts`.
- Criado `tests/e2e/visual/harness-4.6.visual.spec.ts`.
- Scripts:
  - `visual:preshow`
  - `visual:admin`
  - `visual:timers`
  - `visual:full-match`
  - `visual:tribunal`
  - `visual:final-show`
  - `visual:all`

## Contratos preservados

- Nao houve alteracao no Arduino `.ino`.
- Pontuacao 4.4 mantida.
- Desafio do Tribunal mantido.
- Audio publico permanece Stage-only.
- Pre-show continua isolado em `intro`.
- Final Show segue em `phase: "game_over"` com `finalShowStatus`.
