# Harness 9 - Spec SDD

## 1. Objetivo

Corrigir problemas criticos de operacao para uso publico do jogo, preservando as garantias do Harness 8: Admin controla Arduino, Stage nao usa Web Serial, input passa por pipeline unico, fallback Mesa A/B permanece operacional, input cedo e rejeitado com motivo e pre-show A/B nao pontua nem inicia quiz.

## 2. Problemas confirmados ou relatados

- Relatado: botoes fisicos estao invertidos.
- Confirmado por leitura: `.ino` emite `BT1PRESS` e `BT2PRESS`; o app calibra serial como `BT1PRESS -> B` e `BT2PRESS -> A`, enquanto fallback virtual/teclado usa `BT1PRESS -> A` e `BT2PRESS -> B`.
- Confirmado por leitura: `Proxima rodada` prepara apenas a proxima pergunta; reset/preparacao de hardware fica no fluxo de iniciar rodada/countdown.
- Confirmado por leitura: countdown e controlado por intervalo no Admin e transiciona quando `roundIntroRemainingMs <= 0`; precisa endurecer contra ficar visualmente em 1s e contra transicao dupla.
- Relatado: pontuacao do round 1 falha; precisa ser reproduzida em teste porque o fluxo inicial reseta placar e pergunta no `startQuiz`.
- Confirmado por leitura: resposta apos pegar a vez usa `ANSWER_RESPONSE_SECONDS = 10`; janela inicial de buzz ja usa 20s.
- Relatado: texto antes do teste das mesas e pulado.
- Requisitado: melhorar textos do pre-show sem refazer timeline ou UI.

## 3. Comportamento esperado por problema

### 3.1 Botoes invertidos
- Estado atual observado: Arduino declara BT1/BT2, app serial troca BT1 para Grupo B e BT2 para Grupo A.
- Comportamento esperado: a origem da inversao deve ser provada antes de alterar `.ino`; ajuste preferencial deve ficar em camada de calibracao do app se o `.ino` estiver apenas emitindo o botao fisico correto.
- Criterios de aceite: serial, fallback Mesa A/B, Stage e teste A/B concordam sobre Grupo A/B; logs mostram evento bruto e grupo calibrado.
- Testes: unitario de calibracao serial; e2e do teste A/B; e2e de input valido A/B.

### 3.2 Reset na Proxima Rodada
- Estado atual observado: `handleNextRound` chama `nextRound()` sem preparar hardware/input imediatamente.
- Comportamento esperado: ao clicar em `Proxima rodada`, Admin deve resetar/preparar mesa/input imediatamente, sem zerar placar nem reiniciar partida.
- Criterios de aceite: placar preservado; fase preparada; log registra preparacao/reset; ausencia de dependencia de ACK para seguir countdown depois.
- Testes: e2e apos round_end clicando Proxima rodada; unitario de preservacao de placar.

### 3.3 Countdown travando em 1s
- Estado atual observado: UI calcula `Math.ceil((remainingMs + 250) / 1000)` com minimo 1; se a transicao nao roda, a tela fica em 1.
- Comportamento esperado: countdown deve finalizar por relogio, sem ACK Arduino, sem transicao dupla e sem ficar preso no display 1s.
- Criterios de aceite: `round_countdown -> round_preparing/input_ready/question_reveal/buzz_open` ocorre mesmo sem serial conectado; logs mostram finalizacao unica.
- Testes: e2e deixando countdown acabar; e2e pulando countdown; unitario/idempotencia do estado.

### 3.4 Pontuacao no round 1
- Estado atual observado: acerto chama `markCorrect -> awardPoints(activeGroup, 10)`, mas o bug relatado exige reproducao no round inicial real.
- Comportamento esperado: primeiro acerto da primeira rodada altera placar imediatamente, registra historico e aparece em Admin/Stage.
- Criterios de aceite: round 1 com Grupo A ou B acertando soma +10; sem depender de rodada anterior.
- Testes: unitario de `startQuiz -> fluxo round 1 -> input -> markCorrect`; e2e Admin/Stage.

### 3.5 Texto pulado do pre-show
- Estado atual observado: timeline vai de tribunal direto para `button_check` aos 58s, e o componente segura `button_check` se as mesas ainda nao foram reconhecidas.
- Comportamento esperado: texto explicativo antes do teste das mesas deve permanecer visivel tempo suficiente, sem recriar pre-show.
- Criterios de aceite: cena anterior ao teste aparece; teste A/B continua dinamico; timing total/controlavel preservado.
- Testes: visual/e2e coletando cenas e garantindo ordem `how_to_play_tribunal -> button_check`.

### 3.6 Tempo de resposta 20s
- Estado atual observado: `ANSWER_RESPONSE_SECONDS = 10`.
- Comportamento esperado: depois que um grupo pega a vez, o timer de resposta deve ser 20s via constante nomeada.
- Criterios de aceite: Stage mostra 20/19 ao entrar em `team_answering`; Admin mostra 20s; sem numero magico espalhado.
- Testes: unitario de input aceito; e2e de timer de resposta.

### 3.7 Penalidade por silencio -10/+10
- Estado atual observado: se um grupo pegou a vez e o timer zera, o fluxo vai para `time_up` sem pontuar.
- Comportamento esperado: quem pegou a vez e silenciou perde 10; adversario ganha 10; uma unica vez; com log/historico; nao dispara sem activeGroup, pre-show, teste A/B ou countdown.
- Criterios de aceite: placar e feedback refletem penalidade; re-ticks nao duplicam; ausencia de activeGroup continua indo ao Tribunal sem punicao.
- Testes: unitario de timeout em `team_answering`; e2e com espera do timer; teste de idempotencia.

### 3.8 Melhorar textos do pre-show
- Estado atual observado: textos explicam regra antiga de 10s e silencio apenas de forma generica.
- Comportamento esperado: explicar botao de vez, 20s de resposta, penalidade por silencio, teste das mesas e clima do tribunal, preservando controle do operador.
- Criterios de aceite: sem redesign, sem alterar assets, sem quebrar cenas/timing/teste A/B.
- Testes: unitario ou e2e de textos-chave e ordem de cenas.

## 4. Fora de escopo

- Refazer Admin ou Stage.
- Trocar BroadcastChannel.
- Criar backend.
- Remover fallback Mesa A/B.
- Alterar assets.
- Alterar Arduino `.ino` sem prova conclusiva.

## 5. Riscos tecnicos

- Arduino fisico pode estar ligado invertido mesmo que o software esteja calibrado.
- Web Serial real nao e portavel no Playwright; validacao fisica ainda sera necessaria.
- Countdown depende do Admin como operador ativo; Stage e espelho de estado.
- Mudar timeout de resposta altera duracao dos testes longos.

## 6. Plano de rollback

Restaurar arquivos do backup `_backups/harness-9/20260505-180526/` e reexecutar a suite do Harness 8.

## 7. Definition of Done

- Diagnostico de botoes com origem provavel documentada.
- Proxima rodada prepara/reset de mesa sem zerar placar.
- Countdown nao trava em 1s e nao duplica transicao.
- Round 1 pontua corretamente.
- Resposta apos vez tem 20s.
- Silencio apos vez aplica -10/+10 uma vez.
- Pre-show explica novas regras e nao pula texto antes do teste.
- Testes obrigatorios e especificos rodados.
- Relatorio final e checklist fisico criados.
