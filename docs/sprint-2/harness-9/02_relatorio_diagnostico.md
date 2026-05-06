# Harness 9 - Diagnostico Inicial

## Mapa dos estados

Fluxo herdado do Harness 8: `round_countdown -> round_preparing -> input_ready -> question_reveal -> buzz_open`. O store tambem usa `team_answering`, `time_up`, `tribunal_challenge`, `answer_locked`, `scoring`, `round_end` e `game_over`.

## Mapa do input A/B

O pipeline principal e `receiveInput(group, source)`, que aceita apenas em `buzz_open` quando `inputReady`, `buzzLocked=false` e timer rodando. Input cedo gera `INPUT_REJECTED`. No pre-show, `receiveInput` aceita quando `preShowInputCheckStatus` nao esta `idle`.

## Mapa do serial/Arduino

O `.ino` declara eventos `BT1PRESS`, `BT2PRESS`, `RESET`, `LOCKED`, `UNLOCKED`, `PONG` e comandos `PING`, `STATUS`, `LOCK`, `UNLOCK`, `RESET_HW`. `useArduinoSerial` envia comandos somente no Admin. Mensagens BT1/BT2 entram em `handleSerialMessage -> receiveHardwareBuzz`.

## Mapa dos botoes invertidos

`src/utils/serialEventToGroup.ts` calibra serial como `BT1PRESS -> B` e `BT2PRESS -> A`. O fallback/teclado virtual usa direto: `BT1PRESS -> A` e `BT2PRESS -> B`. O Arduino virtual tambem documenta `1/a -> BT1PRESS`, `2/b -> BT2PRESS`. Diagnostico inicial: a inversao provavelmente esta na calibracao de software para compensar ligacao fisica anterior, mas precisa de prova com hardware real/log bruto antes de mexer no `.ino`.

## Mapa do botao Proxima rodada

No Admin, `handleNextRound` limpa timers e chama `nextRound()`. Ele nao chama `RESET_HW`, `prepareRoundInput`, `LOCK` ou `UNLOCK` neste momento. A preparacao real ocorre depois, ao iniciar rodada/countdown.

## Mapa do countdown

`startRoundSequence` entra em `round_countdown`. Um intervalo no Admin chama `tickRoundCountdown()` a cada 100ms e, quando `roundIntroRemainingMs <= 0`, chama `revealAfterCountdown()`. A UI do countdown sempre mostra no minimo 1, entao qualquer falha de transicao aparece como travamento em 1s.

## Mapa da pontuacao

`markCorrect` usa `activeGroup` e chama `awardPoints(activeGroup, NORMAL_CORRECT_POINTS)`. `NORMAL_CORRECT_POINTS = 10`. Erro normal concede `WRONG_OPPONENT_BONUS_POINTS = 5` ao adversario. Timeout depois de activeGroup hoje entra em `time_up` sem punicao -10/+10.

## Mapa do pre-show

Timeline total de 80s: titulo, quatro cenas de ensino, teste da mesa aos 58s e pronto aos 70s. O teste A/B usa `preShowInputCheckStatus` e nao pontua. O componente segura `button_check` caso a timeline chegue em `ready_to_start` sem A/B completo.

## Hipoteses principais

1. Botoes invertidos: a origem mais provavel e calibracao `BT1PRESS -> B` no app, nao o `.ino`; precisa confirmar com log bruto do Arduino fisico.
2. Countdown em 1s: display tem minimo de 1 e depende de transicao do intervalo Admin; precisa guarda por deadline/token para finalizar sem ACK e sem dupla chamada.
3. Pontuacao round 1: bug pode estar no caminho operacional inicial, em `activeGroup` nao definido ou feedback/timer encerrando antes de `markCorrect`.
4. Proxima rodada nao prepara mesa cedo porque `handleNextRound` apenas avanca estado de pergunta.
5. Silencio apos pegar vez nao tem regra de pontuacao implementada.

## Evidencias ainda necessarias

- Log bruto de Arduino fisico: qual botao fisico gera `BT1PRESS` e `BT2PRESS`.
- E2E de Proxima rodada verificando comando/preparacao imediata.
- Teste de countdown ate zero sem serial conectado.
- Teste de round 1 com acerto real pelo Admin.
- Teste de timeout apos `team_answering` aplicando -10/+10.

# Mapa tecnico completo - Prompt 02

## Fluxo Proxima Rodada

### Arquivos envolvidos

- `src/components/Admin/AdminPage.tsx`
- `src/store/gameStore.ts`
- `src/hooks/useArduinoSerial.ts`
- `src/hooks/useRealtimeBridge.ts`

### Funcao/event handler principal

`AdminPage.handleNextRound()` limpa timers locais e chama `nextRound()`.

### Estados alterados

`nextRound()` altera `currentRound`, `activeSlot`, `currentQuestion`, `currentRoundQuestion`, `phase: round_prepare`, feedback, grupo ativo e campos de rodada. Se ja era a rodada final, entra em desempate ou `game_over`.

### Comandos enviados ao Arduino

No fluxo atual de `Proxima rodada`, nenhum comando serial e enviado. `LOCK`, `UNLOCK` e `RESET_HW` ficam em outros handlers.

### Momento em que countdown comeca

Countdown comeca em `startRoundSequence() -> enterRoundCountdown()`, acionado ao clicar `Iniciar rodada`, nao no clique de `Proxima rodada`.

### Momento em que hardware/input reseta

Input logico e limpo por `resetRoundFields()` dentro de `nextRound()`. Hardware fisico nao recebe `RESET_HW` nesse momento. Preparacao explicita `prepareRoundInput()` ocorre somente depois do countdown em `revealAfterCountdown()`.

### Momento em que input e liberado

`revealAfterCountdown()` executa `prepareRoundInput()`, `UNLOCK`, `markInputReady()`, `revealQuestion()` e `openBuzz()`.

### Risco identificado

O operador clica `Proxima rodada`, mas a mesa fisica ainda nao foi preparada/resetada. O reset/preparacao real fica tarde demais, depois do countdown ou em manutencao tecnica, o que pode deixar evento antigo/estado fisico chegando fora da janela correta.

## Fluxo de Input A/B

| Origem | Evento bruto | Funcao que recebe | Grupo resultante | Observacao |
|---|---|---|---|---|
| Serial real | `BT1PRESS` | `handleSerialMessage -> receiveHardwareBuzz -> serialEventToGroup` | B | Calibracao atual troca BT1 para B. |
| Serial real | `BT2PRESS` | `handleSerialMessage -> receiveHardwareBuzz -> serialEventToGroup` | A | Calibracao atual troca BT2 para A. |
| Fallback Admin | clique `Mesa A` | `handleMesaInput -> receiveInput('A','keyboard')` | A | Usa pipeline unico, sem serial bruto. |
| Fallback Admin | clique `Mesa B` | `handleMesaInput -> receiveInput('B','keyboard')` | B | Usa pipeline unico, sem serial bruto. |
| Teclado | `z` simula `BT1PRESS` | `useArduinoSerial.simulate -> receiveInput('A','virtual')` | A | Direto para A, nao usa calibracao serial. |
| Teclado | `m` simula `BT2PRESS` | `useArduinoSerial.simulate -> receiveInput('B','virtual')` | B | Direto para B, nao usa calibracao serial. |
| Pre-show teste | serial ou fallback | `receiveInput` ou `receiveHardwareBuzz` em fase `intro` | conforme origem | Nao pontua e nao inicia quiz. |

Respostas objetivas: BT1 vira B no serial real e A no fallback virtual; BT2 vira A no serial real e B no fallback virtual. O fallback Mesa A/B usa pipeline real `receiveInput`. O teste A/B usa o mesmo pipeline, mas com caminho especial de pre-show.

## Fluxo do Countdown

### Estado inicial

`startRoundSequence()` marca `autoSequenceStatus: running` e chama `enterRoundCountdown()`, que define `phase: round_countdown`, `roundIntroStatus: counting`, deadline e token.

### Funcoes que decrementam

`AdminPage` roda `tickRoundCountdown()` em intervalo de 100ms. A Stage nao decrementa countdown do store; ela exibe snapshot e relogio local para render.

### Timers usados

- setInterval: Admin para countdown a cada 100ms.
- setTimeout: feedback e alguns fluxos auxiliares.
- requestAnimationFrame: Stage apenas para relogio/render.
- deadline: `roundIntroStartedAtMs`, `roundIntroEndsAtMs`, `roundIntroDelayMs`, `roundIntroLastTickAtMs`.

### Condicao de fim

No Admin, apos `tickRoundCountdown()`, se `roundIntroRemainingMs <= 0`, limpa intervalo e chama `revealAfterCountdown()`.

### Transicao final

`finishRoundCountdown() -> prepareRoundInput() -> UNLOCK -> markInputReady() -> revealQuestion() -> openBuzz()`.

### Protecoes contra disparo duplo

Ha token `pendingAutomationToken` e `clearCountdownTimers()`. `finishRoundCountdown()` aceita `counting` ou `skipped`, mas nao ha um token dedicado para impedir duas chamadas paralelas de `revealAfterCountdown()`.

### Possivel causa do travamento em 1s

`RoundIntroCountdown` renderiza minimo 1s. Se o intervalo Admin para, se `revealAfterCountdown()` fica aguardando promise serial, ou se o efeito e limpo antes de chamar a transicao, a UI permanece em 1. O fluxo atual usa `await runUnlock()` antes de marcar input pronto/revelar, entao uma promise serial lenta pode atrasar a transicao final.

## Fluxo de Pontuacao

### Funcao que aplica acerto

`markCorrect()` exige `activeGroup` e chama `awardPoints(activeGroup, NORMAL_CORRECT_POINTS)`.

### Funcao que aplica erro

`markWrong()` concede `WRONG_OPPONENT_BONUS_POINTS = 5` ao adversario no modo principal.

### Funcao que aplica timeout

`tickTimer()` trata zero. Sem `activeGroup`, abre Tribunal. Com `activeGroup`, hoje entra em `time_up`, limpa `activeGroup` e nao pontua.

### Estado inicial do placar

`startQuiz()` define `scoreA: 0`, `scoreB: 0`, `currentRound: 1`, `phase: round_prepare` e carrega a pergunta da rodada 1.

### Como round atual e identificado

`currentRound` inicia em 1 e `activeSlot = ((round - 1) % 5) + 1`.

### Diferenca round 1 versus demais rounds

Round 1 nasce em `startQuiz()`. Demais rounds passam por `nextRound()` e registram `round_started`. O bug pode estar no caminho operacional inicial, porque a primeira rodada vem de `startQuiz` e nao de `nextRound`.

### Possivel causa da falha no round 1

Hipoteses: `activeGroup` nao definido por input invertido/rejeitado; operador tenta pontuar antes de `team_answering`; divergencia Admin/Stage por snapshot; historico de `round_started` duplicado ou ausente nao deve impedir score, mas pode mascarar evidencias.

## Fluxo do Pre-show

### Lista de cenas/textos

`blackout_to_video`, `cinematic_video`, `title_over_video`, `how_to_play_first`, `how_to_play_score`, `how_to_play_wrong`, `how_to_play_tribunal`, `button_check`, `ready_to_start`.

### Ordem atual

Titulo ate 16s; ensino 16-58s; teste A/B 58-70s; pronto 70-80s.

### Cena antes do teste A/B

`how_to_play_tribunal`, de 46s a 58s, com texto atual `Arrisque ou passe.` e `O silencio tambem entra nos autos.`

### Onde o texto esta sendo pulado

O relato aponta o texto imediatamente antes do teste das mesas. Pelo array real, esse texto so pode estar em `how_to_play_tribunal` ou na entrada de `button_check`. Acoes manuais `startPreShowInputCheck()` pulam diretamente para `PRE_SHOW_INPUT_CHECK_START_MS`, ignorando a cena de tribunal se acionadas antes.

### Controle de skip/pause/restart

`skipPreShow()` pula abertura para `PRE_SHOW_HOW_TO_PLAY_START_MS`. `restartPreShowBriefing()` volta para a explicacao. `startPreShowInputCheck()` avanca direto para `PRE_SHOW_INPUT_CHECK_START_MS`.

### Como teste A/B e iniciado

Automaticamente quando `tickPreShow` chega em `PRE_SHOW_INPUT_CHECK_START_MS`, ou manualmente no Admin por `handleStartPreShowInputCheck()`, que chama `startPreShowInputCheck()`, `UNLOCK` e `STATUS`.

## BroadcastChannel Admin Stage

Admin publica snapshot em cada mudanca do store. Stage aplica `GAME_STATE_SYNC` e publica heartbeat/audio. Stage nao acessa Web Serial. Serial events calibrados podem ser publicados pelo Admin, mas o estado publico vem principalmente do snapshot.

## Contrato Serial Real Encontrado

| Evento/Comando | Direcao | Significado no codigo | Arquivo | Observacao |
|---|---|---|---|---|
| `BT1PRESS` | Arduino -> App | Botao 1 pressionado quando Arduino esta destravado | `arduino_quiz_controller_v2.ino`, `useArduinoSerial.ts`, `serialEventToGroup.ts` | `.ino` emite BT1 em `handleBuzzA`; app atual calibra para Grupo B. |
| `BT2PRESS` | Arduino -> App | Botao 2 pressionado quando Arduino esta destravado | `arduino_quiz_controller_v2.ino`, `useArduinoSerial.ts`, `serialEventToGroup.ts` | `.ino` emite BT2 em `handleBuzzB`; app atual calibra para Grupo A. |
| `RESET` | Arduino -> App | ACK/evento de reset fisico ou resposta de `RESET_HW`/`RESET` | `.ino`, `gameStore.ts`, `tools/arduino-virtual/protocol.mjs` | Store trata como ACK e nao troca fase. |
| `RESET_HW` | App -> Arduino | Reset/preparacao fisica, destrava hardware, limpa LEDs/audio | `.ino`, `useArduinoSerial.ts`, `AdminPage.tsx` | Hoje aparece no tecnico/manual; nao e automatico no `Proxima rodada`. |
| `LOCK` | App -> Arduino | Trava botoes fisicos | `.ino`, `useArduinoSerial.ts`, `AdminPage.tsx` | Usado antes/inicio de sequencia e quando grupo pega a vez. |
| `UNLOCK` | App -> Arduino | Libera botoes fisicos | `.ino`, `useArduinoSerial.ts`, `AdminPage.tsx` | Usado antes de abrir input e no teste A/B. |
| `PING` | App -> Arduino | Diagnostico de conexao | `.ino`, `tools/arduino-virtual/protocol.mjs` | Responde `PONG`. |
| `STATUS` | App -> Arduino | Diagnostico de travamento/DFPlayer | `.ino`, `tools/arduino-virtual/protocol.mjs` | Responde `STATUS:*` e DFPlayer no `.ino`. |

## Matriz de Mapeamento A/B

| Caminho | Acao simulada | Evento bruto | Grupo esperado | Grupo obtido | Status |
|---|---|---|---|---|---|
| Fallback Admin | Mesa A | chamada direta `receiveInput('A','keyboard')` | A | A | ok |
| Fallback Admin | Mesa B | chamada direta `receiveInput('B','keyboard')` | B | B | ok |
| Teclado/virtual | tecla `z` | simula `BT1PRESS` mas chama `receiveInput('A','virtual')` | A | A | ok |
| Teclado/virtual | tecla `m` | simula `BT2PRESS` mas chama `receiveInput('B','virtual')` | B | B | ok |
| Serial virtual | `BT1PRESS` | `BT1PRESS` | A se BT1 for Mesa A; B pelo contrato atual | B | falha para expectativa fisica A |
| Serial virtual | `BT2PRESS` | `BT2PRESS` | B se BT2 for Mesa B; A pelo contrato atual | A | falha para expectativa fisica B |
| Pre-show teste fallback | Mesa A | chamada direta | A | A | ok |
| Pre-show teste fallback | Mesa B | chamada direta | B | B | ok |
| Pre-show teste serial | `BT1PRESS` | `BT1PRESS` | A se BT1 for Mesa A | B | falha provavel |
| Pre-show teste serial | `BT2PRESS` | `BT2PRESS` | B se BT2 for Mesa B | A | falha provavel |

## Validacoes exploratorias - Prompt 03

- `rtk npm run arduino:virtual:self-test` - passou. O protocolo virtual confirma `BT1PRESS` e `BT2PRESS` como eventos brutos distintos, sem trocar A/B no simulador.
- `rtk npx playwright test tests/e2e/harness-8-core.spec.ts --project=chromium` - passou. A suite confirma fallback Admin/Stage e pre-show A/B no contrato atual, mas nao prova hardware fisico real.

## Decisao Tecnica - Inversao A/B

### Origem da inversao

A origem mais provavel esta na camada de calibracao do frontend: `src/utils/serialEventToGroup.ts`.

### Prova encontrada

O `.ino` tem `handleBuzzA() -> Serial.println("BT1PRESS")` e `handleBuzzB() -> Serial.println("BT2PRESS")`. O app, porem, mapeia `BT1PRESS` para Grupo B e `BT2PRESS` para Grupo A. O fallback Mesa A/B continua direto e correto.

### Arquivo que deve ser corrigido

`src/utils/serialEventToGroup.ts`, junto com testes unitarios e e2e que documentem o contrato final.

### Arquivo que NAO deve ser corrigido

`hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`, salvo se o ensaio fisico provar que a fiacao/pinos exigem mudanca embarcada. Para vespera de apresentacao, a correcao mais segura e software calibrado e documentado.

### Risco da correcao

Se a fiacao fisica realmente estiver cruzada e o codigo atual ja compensava isso, inverter a calibracao pode recriar o problema. Mitigacao: expor checklist fisico para apertar Mesa A/Mesa B e conferir evento bruto + grupo calibrado antes da apresentacao.

### Teste que provara a correcao

Unitario de `serialEventToGroup`: `BT1PRESS -> A`, `BT2PRESS -> B`, caso a decisao final confirme que BT1 e Mesa A fisica. E2E de pre-show A/B e input serial/fallback devem continuar coerentes.

## Correcao A/B aplicada

### Arquivo alterado

- `src/utils/serialEventToGroup.ts`
- `src/utils/serialEventToGroup.test.ts`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `vite.config.ts`

### Antes

Serial real era calibrado como `BT1PRESS -> B` e `BT2PRESS -> A`. Logs de input aceitavam/rejeitavam sem mostrar evento bruto/fase de forma clara. O comando `npm run test -- --run` tambem varria `_backups`, fazendo testes preservados quebrarem apos mudanca de contrato.

### Depois

Serial real passa a ser `BT1PRESS -> A` e `BT2PRESS -> B`, alinhado ao `.ino`, fallback Admin e teclado/virtual. Logs de input passaram a incluir `raw`, `source`, `resolvedGroup`, `phase` e `reason`. Vitest ignora `_backups` e `_residuos`.

### Por que essa camada foi escolhida

O `.ino` ja emitia eventos distintos por botao (`handleBuzzA -> BT1PRESS`, `handleBuzzB -> BT2PRESS`). A inversao estava concentrada na camada de calibracao do frontend, entao corrigir ali evita mexer em hardware/firmware em vespera de apresentacao.

### Como evita inversao dupla

Somente `SERIAL_EVENT_TO_GROUP` foi alterado para serial real. O fallback Admin e teclado/virtual continuam chamando `receiveInput` diretamente com Grupo A/B, sem passar por calibracao serial.

### Testes de prova

- `rtk npm run test -- --run` - passou, 10 arquivos / 81 testes.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk npm run test:e2e` - passou, 23 testes.

## Reset na Proxima Rodada - Correcao

### Causa do reset tardio

`handleNextRound()` apenas chamava `nextRound()`. A limpeza logica da rodada acontecia, mas o Arduino/hardware nao recebia preparo imediato. `RESET_HW`, `LOCK` e `UNLOCK` ficavam em manutencao tecnica ou no fim do countdown.

### Correcao aplicada

`handleNextRound()` agora registra `ROUND_NEXT_CLICKED` e agenda preparo de hardware/input assim que a proxima rodada e carregada. O preparo envia `RESET_HW` e depois `LOCK` como melhor esforco, sem bloquear fallback e sem alterar placar. Se a serial estiver ausente, registra `ROUND_HARDWARE_PREPARE_WARN`.

### Arquivos alterados

- `src/components/Admin/AdminPage.tsx`
- `tests/e2e/harness-9-operation.spec.ts`

### Prova

- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.
- O teste verifica log `ROUND_NEXT_CLICKED`, `ROUND_HARDWARE_PREPARE_START`, `ROUND_HARDWARE_PREPARE_OK/WARN` e preservacao do placar `10 x 0`.

## Countdown 1s - Correcao

### Causa encontrada ou mitigada

O display do countdown tinha minimo visual de 1s, e a transicao final aguardava `runUnlock()`. Assim, qualquer atraso/pendencia serial ou dupla chamada podia deixar a UI parecendo travada em 1s.

### Correcao aplicada

`revealAfterCountdown()` virou transicao idempotente por token. Ela registra `COUNTDOWN_TRANSITION_REQUESTED`, finaliza countdown, prepara input, dispara `UNLOCK` sem aguardar ACK, marca input pronto, revela pergunta e abre `buzz_open`. O loop do countdown tambem considera deadline real (`roundIntroEndsAtMs`) alem de `remainingMs <= 0`.

### Protecao idempotente

`countdownTransitionTokenRef` impede duas transicoes para o mesmo token e registra `COUNTDOWN_TRANSITION_IGNORED_DUPLICATE` se acontecer chamada repetida. Ao iniciar/prosseguir nova rodada, o token local e limpo.

### Prova

- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou e verificou `round_countdown -> buzz_open` sem serial conectada.
- `rtk npm run test -- --run` - passou, 10 arquivos / 81 testes.
- `rtk npm run test:e2e` - passou, 24 testes.
- `rtk npm run arduino:virtual:self-test` - passou.

## Pontuacao do Round 1

### Estado inicial do placar

`startQuiz()` inicializa `scoreA: 0` e `scoreB: 0`.

### Estado inicial da rodada

`startQuiz()` coloca a partida em `phase: round_prepare`, `currentRound: 1`, `activeSlot: 1` e carrega `currentRoundQuestion`.

### Pergunta do round 1

Vem de `getCurrentRoundQuestion(quizSession, 1)` no proprio `startQuiz()`.

### Funcao de aplicar acerto

`markCorrect()` exige `activeGroup` e chama `awardPoints(activeGroup, NORMAL_CORRECT_POINTS)`, com `NORMAL_CORRECT_POINTS = 10`.

### Guardas que podem bloquear pontuacao

Se `activeGroup` estiver ausente, `markCorrect()` entra em erro operacional. Assim, qualquer input invertido/rejeitado antes de `team_answering` faz o operador parecer confirmar acerto sem grupo correto.

### Diferenca entre round 1 e round 2

Round 1 nasce por `startQuiz()`. Round 2 nasce por `nextRound()`. A funcao de score e a mesma, mas o caminho operacional ate `activeGroup` na primeira rodada dependia diretamente do primeiro input valido.

### Causa encontrada

O store pontuava round 1 corretamente quando `activeGroup` estava correto. A falha mais provavel era consequencia da inversao serial A/B ou tentativa de pontuar sem grupo ativo correto. A correcao A/B e os novos testes fecham esse caminho.

### Correcao aplicada

Foram adicionados testes explicitos de round 1 para Mesa A e Mesa B, teste de regressao de round 2 e log `SCORE_UPDATED` em mudancas de placar por acerto/erro.

### Prova

- `rtk npm run test -- --run` - passou, 10 arquivos / 83 testes.
- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou, validando Admin e Stage com placar `10 x 0` no round 1.
- `rtk npm run test:e2e` - passou, 24 testes.

## Penalidade por silencio - Prompt 07

### Tempo de resposta

`ANSWER_RESPONSE_SECONDS` foi alterado para 20 segundos. A constante nomeada segue centralizada no store e e usada ao entrar em `team_answering` para Mesa A ou Mesa B.

### Regra aplicada

Quando um grupo pega a vez (`activeGroup`) e o timer de resposta chega a zero sem resposta, o store aplica uma unica vez:

- grupo ativo: -10 pontos;
- adversario: +10 pontos;
- `roundFeedback: silence_penalty`;
- historico `no_answer_penalty`;
- log `NO_ANSWER_PENALTY_APPLIED`.

### Guardas preservadas

A penalidade nao dispara se ninguem pegou a vez, no pre-show, no teste A/B, no countdown, no tribunal ou depois que o grupo respondeu antes do timeout. A idempotencia vem do estado `timerStatus: time_up` e do fechamento em `answer_locked`.

### Arquivos alterados

- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/types/game.types.ts`
- `src/components/Admin/AdminPage.tsx`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuestionPanel/QuestionPanel.tsx`
- `src/audio/audioEvents.ts`

### Prova

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 86 testes.
- `rtk npx playwright test tests/e2e/harness-9-operation.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.

## Pre-show - Texto Pulado

### Texto/cena que era pulado

A cena `how_to_play_tribunal`, imediatamente antes de `button_check`, podia ser pulada quando o operador clicava manualmente em `Testar mesa` / `Liberar teste da mesa`.

### Causa encontrada

`startPreShowInputCheck()` fazia seek direto para `PRE_SHOW_INPUT_CHECK_START_MS` e marcava o teste A/B como ativo. Assim, a explicacao anterior nao era exibida nesse caminho manual, mesmo existindo no array de cenas.

### Arquivo responsavel

- `src/store/gameStore.ts`
- `src/components/Admin/AdminPage.tsx`
- `src/utils/preShowTimeline.ts`
- `src/components/PreShowScreen/PreShowScreen.tsx`

### Correcao aplicada

Quando o operador solicita teste antes da janela A/B, o store agora leva a timeline para `PRE_SHOW_TRIBUNAL_RULE_START_MS` e mantem `preShowInputCheckStatus: idle`. O teste comeca automaticamente apenas ao chegar em `PRE_SHOW_INPUT_CHECK_START_MS`. O Admin passou a enviar `UNLOCK/STATUS` somente quando o status real do teste entra em `waitingA`/`waitingB`, evitando hardware liberado cedo demais.

Os textos foram atualizados para explicar tribunal, botao de vez, 20 segundos, acerto, erro, silencio `-10/+10` e teste das mesas.

### Como validar

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos / 86 testes.
- `rtk npx playwright test tests/e2e/quiz-stage.spec.ts --project=chromium --grep "pre-show"` - passou.
- `rtk npx playwright test tests/e2e/harness-8-core.spec.ts --project=chromium` - passou.
- `rtk npm run test:e2e` - passou, 24 testes.

## Idempotencia e Telemetria

| Evento critico | Risco de duplicidade | Protecao aplicada | Teste |
|---|---|---|---|
| Transicao final do countdown | Duas chamadas abrirem a pergunta duas vezes | `countdownTransitionTokenRef` no Admin e logs `COUNTDOWN_TRANSITION_DONE` / `COUNTDOWN_TRANSITION_IGNORED_DUPLICATE` | `rtk npm run test:e2e`; `tests/e2e/harness-9-operation.spec.ts` |
| Reset/preparacao no clique | `RESET_HW` repetido por duplo clique/StrictMode | debounce de 2s em `runResetHardware`, logs `HARDWARE_RESET_REQUESTED/OK/WARN` e preparo agendado uma vez no clique | `rtk npm run test:e2e`; visual harness 4.9 existente |
| Input aceito duas vezes | Dois sinais A/B alterarem a vez | `buzzLocked`, `phase`, `timerStatus` e `inputReady` em `getInputRejectionReason`; logs `INPUT_RECEIVED`, `INPUT_ACCEPTED`, `INPUT_REJECTED` com reason | `rtk npm run test -- --run` |
| Timeout de resposta | Tick extra reaplicar timeout | `timerStatus: time_up` e fechamento em `answer_locked` | `rtk npm run test -- --run` |
| Penalidade por silencio | Aplicar -10/+10 mais de uma vez | historico `no_answer_penalty`, `timerStatus: time_up` e log unico `NO_ANSWER_PENALTY_APPLIED` | `rtk npm run test -- --run` |
| Score update | Acerto/erro pontuar duas vezes | `roundFeedback` impede repeticao em `markCorrect`/`markWrong`; logs `SCORE_UPDATED` | `rtk npm run test -- --run` |
| Cena do pre-show | Avanco manual pular texto ou duplicar teste | `startPreShowInputCheck` vai antes para `how_to_play_tribunal`; `tickPreShow` inicia A/B so na janela e loga `PRESHOW_SCENE_SHOWN` / `PRESHOW_TEST_STARTED` | `rtk npm run test:e2e` |

### Eventos adicionados ou ajustados

- `INPUT_RECEIVED`
- `INPUT_ACCEPTED`
- `INPUT_REJECTED`
- `ANSWER_WINDOW_STARTED`
- `ANSWER_TIMEOUT`
- `NO_ANSWER_PENALTY_APPLIED`
- `SCORE_UPDATED`
- `PRESHOW_SCENE_SHOWN`
- `PRESHOW_TEST_STARTED`
- `PRESHOW_TEST_INPUT_ACCEPTED`
- `SERIAL_EVENT_RECEIVED`
- `SERIAL_COMMAND_SENT`
- `SERIAL_ERROR`
- `COUNTDOWN_STARTED`
- `COUNTDOWN_TRANSITION_DONE`
- `HARDWARE_RESET_REQUESTED`
- `HARDWARE_RESET_OK`
- `HARDWARE_RESET_WARN`
