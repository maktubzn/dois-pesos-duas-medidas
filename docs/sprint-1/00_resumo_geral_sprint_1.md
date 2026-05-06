# Sprint 1 - Resumo Geral

## 1. Resumo executivo

- O Sprint 1 esta funcional? Sim, com ressalvas. Confirmado por arquivos e por testes registrados em `docs/ai-harness/28_validacao_admin_realtime_rounds.md`: typecheck, unit tests, lint, build e E2E passaram naquele checkpoint. Nao rodei testes nesta consolidacao porque nao houve alteracao de codigo.
- O que foi entregue? React + TypeScript + Vite, `/stage`, `/admin`, login local, BroadcastChannel realtime local, Web Serial no Admin, protocolo Arduino v2, mapeamento A/B calibrado, reset automatico, timer, 5 rounds, `game_over`, ScoreBar, cards A/B, assets em `public/img` e testes.
- O que ainda e fragil? Operacao fisica com Arduino/Web Serial, UX do Admin, experiencia visual da Stage, conteudo real do quiz, tela final/vencedor e checklist de apresentacao.
- Qual e o maior risco tecnico? Web Serial + Arduino real: depende de navegador compativel, contexto seguro/localhost, selecao manual da porta, COM correta e porta livre.
- Qual e o maior risco visual/UX? A Stage ainda tem pergunta, timer, animacoes e game over em nivel MVP; o Admin e funcional, mas ainda pouco guiado para operador de feira.
- Estamos prontos para Sprint 2? Sim, aprovado para avancar com ressalvas. O Sprint 2 deve preservar a logica validada e comecar por refinamento visual/UX e checklist operacional.

Evidencias separadas:

- Confirmado por arquivo: estrutura React/Vite, rotas, Admin, Stage, store, hooks, protocolo, testes e sketch.
- Confirmado por teste registrado: `28_validacao_admin_realtime_rounds.md` registra typecheck, unit, lint, build e E2E passando.
- Informado pelo usuario: Sprint 1 esta funcionando.
- Inferencia tecnica: a arquitetura atual e suficiente para MVP local de feira, mas nao para multiplas maquinas ou internet.
- Pendencia nao validada aqui: teste fisico atual com Arduino real e TV/resolucao alvo.

## 2. Linha do tempo do Sprint 1

### Fundo e video

- Objetivo: criar base visual fullscreen do tribunal com imagem estatica e video sem loop.
- Arquivos importantes: `docs/GSD_BACKGROUND_STAGE.md`, `img/01-background.png`, `img/BGVIDEO.mp4`.
- Resultado: fundo, video e API global documentados no legado.
- Status atual: historico; a ideia virou `BackgroundStage` e `useBackgroundCue` no React.

### Cards e barra

- Objetivo: montar layout visual com ScoreBar, cards A/B, pergunta, intro e placeholders.
- Arquivos importantes: `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`, `components/group-card.js`, `components/group-card.css`, `img/barraMoldura.png`.
- Resultado: base visual em HTML/CSS/JS puro.
- Status atual: historico; os elementos foram migrados para componentes React.

### React/Vite

- Objetivo: migrar a raiz para React + TypeScript + Vite com backup do legado.
- Arquivos importantes: `package.json`, `vite.config.ts`, `src/`, `public/img/`, `backup/legacy-html-20260427-192742/`.
- Resultado: app Vite funcional, scripts de build/teste, alias `@`, assets em `public/img`.
- Status atual: atual.

### Arduino v2

- Objetivo: consolidar firmware v2 e protocolo serial para o quiz.
- Arquivos importantes: `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`, `docs/ai-harness/14_arduino_v2_protocolo.md`.
- Resultado: protocolo com `PING`, `STATUS`, `LOCK`, `UNLOCK`, `RESET_HW`, `BT1PRESS`, `BT2PRESS`, `RESET`, LEDs, buzzer fallback e DFPlayer.
- Status atual: atual; nao foi alterado nesta consolidacao.

### Web Serial

- Objetivo: conectar o navegador ao Arduino e manter fallback sem hardware.
- Arquivos importantes: `src/hooks/useArduinoSerial.ts`, `src/utils/serialParser.ts`.
- Resultado: leitura por linhas, envio de comandos, parsing de protocolo v2 e fallback por teclado.
- Status atual: atual; Web Serial deve ser usado apenas no Admin.

### Admin

- Objetivo: criar mesa de controle separada do telao.
- Arquivos importantes: `src/App.tsx`, `src/components/Admin/AdminPage.tsx`.
- Resultado: `/admin`, login `admin123` / `121212`, controles de partida, pontuacao, timer, Arduino e log.
- Status atual: atual, mas UX ainda basica.

### Realtime

- Objetivo: sincronizar Admin e Stage localmente sem backend.
- Arquivos importantes: `src/realtime/broadcastChannel.ts`, `src/hooks/useRealtimeBridge.ts`.
- Resultado: BroadcastChannel `dois-pesos-game-channel`; Admin publica snapshots, Stage aplica snapshots.
- Status atual: atual, limitado a mesma origem/contexto local.

### 5 rounds

- Objetivo: controlar rodada, jogador ativo, timer e fim de jogo.
- Arquivos importantes: `src/store/gameStore.ts`, `src/store/gameStore.test.ts`, `tests/e2e/quiz-stage.spec.ts`.
- Resultado: `totalRounds = 5`, `activeSlot = currentRound`, timer de 20 segundos, `game_over` apos a rodada 5.
- Status atual: atual.

### Correcao fisica A/B

- Objetivo: corrigir inversao fisica azul/vermelho sem mexer no sketch.
- Arquivos importantes: `src/utils/serialEventToGroup.ts`, `src/utils/serialEventToGroup.test.ts`.
- Resultado: evento fisico `BT1PRESS -> B`, `BT2PRESS -> A`; fallback teclado continua direto (`Z -> A`, `M -> B`).
- Status atual: atual.

### Reset automatico

- Objetivo: deixar o Admin comandar reset do hardware no fluxo normal.
- Arquivos importantes: `src/components/Admin/AdminPage.tsx`, `docs/ai-harness/31_relatorio_correcao_validacao_fisica.md`.
- Resultado: `RESET_HW` antes de liberar botões de vez e depois de pontuar, errar, resetar rodada, avancar round e resetar jogo.
- Status atual: atual por codigo; precisa checklist fisico antes da apresentacao.

## 3. O que esta pronto

- Stage.
- Admin.
- Login.
- Realtime local.
- Arduino/Web Serial.
- Mapeamento A/B.
- Reset automatico.
- Timer.
- 5 rounds.
- Game over.
- ScoreBar.
- Cards A/B.
- Assets.
- Testes.
- Build.

## 4. O que ainda falta

- Conteudo real do quiz.
- Refinamento visual.
- Animacoes.
- UX do Admin.
- Tela final/vencedor.
- Robustez de apresentacao.
- Audio/DFPlayer, se for requisito final.
- Persistencia, se necessario.
- QA em TV/resolucao real.
- Checklist operacional com Arduino real.

## 5. Dividas tecnicas

- Login local nao e seguranca real.
- BroadcastChannel so vale para mesma origem/contexto local.
- Web Serial depende de navegador compativel e selecao manual da porta.
- Arduino real precisa checklist de operacao.
- Visual ainda tem placeholders.
- Conteudo real ainda nao existe.
- Admin funciona, mas ainda precisa refinamento.
- Store central concentra muitas responsabilidades.
- Timer depende do Admin aberto.
- `img/` e `public/img/` duplicam assets e exigem disciplina.
- DFPlayer ja apareceu como risco; o jogo tem fallback, mas audio final precisa validacao.
- Testes automatizados nao cobrem o chooser nativo do Web Serial.

## 6. Veredito do Sprint 1

Aprovado com ressalvas.

Justificativa: o Sprint 1 entrega o MVP tecnico local e os documentos registram testes automatizados passando. As ressalvas sao reais: hardware e Web Serial dependem de operacao manual, o login e apenas local, a UI ainda nao esta polida e o quiz ainda precisa de conteudo real. O Sprint 2 pode comecar, mas nao deve reabrir arquitetura sem necessidade.
