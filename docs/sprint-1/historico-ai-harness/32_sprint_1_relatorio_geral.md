# 32 - Sprint 1: Relatório Geral

## 1. Resumo executivo

O Sprint 1 esta funcional por evidencia de codigo e testes automatizados: o projeto roda como React + TypeScript + Vite, tem `/stage`, `/admin`, login local, BroadcastChannel, Web Serial no Admin, calibracao A/B, reset automatico, 5 rounds, timer e `game_over`. Nesta auditoria, `typecheck`, unit tests, lint, build e E2E passaram.

- O Sprint 1 esta funcional? Sim, aprovado por typecheck/unit/lint/build/e2e; hardware real foi informado pelo usuario como validado, mas os detalhes observados nao ficaram registrados no prompt.
- O que foi entregue? Migracao React/Vite, stage, admin, store Zustand, Web Serial, protocolo v2, realtime local, rounds e testes.
- O que ainda e fragil? Operacao com Arduino/COM6, dependencia do navegador com Web Serial, BroadcastChannel limitado a mesma origem, login local e UI administrativa ainda basica.
- Maior risco tecnico: Web Serial e Arduino real dependem de gesto humano, porta correta e exclusividade da porta; isso nao e totalmente automatizavel.
- Maior risco visual/UX: Stage ainda tem placeholders e pouca coreografia de animacao/conteudo; Admin funciona, mas e utilitario.
- Estamos prontos para Sprint 2? Sim, com ressalvas operacionais e visuais.

## 2. Linha do tempo do Sprint 1

- Etapa 01: fundo e video
  - Objetivo: montar base visual fullscreen com fundo estatico e video sem loop.
  - Arquivos importantes: `docs/GSD_BACKGROUND_STAGE.md`, `img/01-background.png`, `img/BGVIDEO.mp4`.
  - Resultado: base visual documentada no legado.
  - Status atual: historico; virou `BackgroundStage` e `useBackgroundCue` no React.

- Etapa 02: layout HTML legado
  - Objetivo: compor intro, scorebar, cards, pergunta, martelo placeholder e APIs globais.
  - Arquivos importantes: `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`, `components/group-card.js`, `components/group-card.css`.
  - Resultado: layout validado em HTML/CSS/JS puro.
  - Status atual: historico; componentes foram migrados para React, legado preservado.

- Etapa 03: Fatia 01 HUD/Serial no legado
  - Objetivo: corrigir barra, remover martelo DOM/BUZZ, preparar Web Serial e fallback.
  - Arquivos importantes: `00_rtk_contexto_atual.md` ate `08_qa_final_fatia_01.md`, `GSD_FATIA_01_HUD_SERIAL.md`.
  - Resultado: base conceitual para HUD, pergunta e serial.
  - Status atual: parcialmente desatualizado; APIs globais antigas nao sao mais o contrato principal.

- Etapa 04: migracao React + Vite
  - Objetivo: criar backup, scaffold Vite, componentes base e testes.
  - Arquivos importantes: `00_rtk_migracao_vite.md`, `02_backup_manifest.md`, `05_relatorio_fatia_01_scaffold.md`, `09_gsd_react_vite.md`.
  - Resultado: app React/Vite na raiz, assets em `public/img`, testes e build.
  - Status atual: atual como base tecnica, mas alguns documentos intermediarios sao historicos.

- Etapa 05: cards A/B e stage/Arduino v2
  - Objetivo: recuperar paridade visual dos cards, corrigir ScoreBar/assets e integrar protocolo Arduino v2.
  - Arquivos importantes: `10_rtk_stage_arduino_v2.md` a `18_gsd_stage_arduino_quiz_core.md`, `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`.
  - Resultado: protocolo v2, parser, hook serial e core minimo de quiz.
  - Status atual: atual em codigo; docs 17/18 ainda refletem mapeamento antigo em parte.

- Etapa 06: Admin realtime + 5 rounds
  - Objetivo: criar `/admin`, login, BroadcastChannel, mapeamento calibrado, reset automatico, 5 rounds e game over.
  - Arquivos importantes: `20_rtk_admin_rounds_realtime.md` a `30_proxima_fatia_recomendada.md`.
  - Resultado: Sprint 1 funcional por testes automatizados.
  - Status atual: atual.

- Etapa 07: correcao pos-validacao fisica
  - Objetivo: publicar grupo serial resolvido, reforcar reset automatico em next/reset game e corrigir lock do mesmo grupo em rounds consecutivos.
  - Arquivos importantes: `31_relatorio_correcao_validacao_fisica.md`, `AdminPage.tsx`, `useRealtimeBridge.ts`, `broadcastChannel.ts`.
  - Resultado: Admin publica `SERIAL_EVENT` resolvido e continua publicando snapshot; Stage segue renderizando snapshot.
  - Status atual: atual.

## 3. Índice comentado dos documentos harness

| Documento | Função | Status | Observação |
|---|---|---|---|
| `00_rtk_contexto_atual.md` | Contexto da primeira fatia HUD/serial | histórico | Fala de APIs globais legadas. |
| `00_RTK_INDEX.md` | Indice curto do primeiro RTK | histórico | Substituido por docs posteriores. |
| `00_rtk_migracao_vite.md` | Inicio da migracao Vite | histórico | Correto para a fase de migracao. |
| `01_ANALISE_VISUAL_ATUAL.md` | Analise visual da Fatia 01 | histórico | Ainda util para lembrar bugs visuais removidos. |
| `01_mapa_do_repositorio.md` | Mapa pre-React inicial | histórico | Nao representa mais a raiz atual. |
| `01_mapa_repo_pre_vite.md` | Mapa antes do Vite | histórico | Bom para rastrear backup/legado. |
| `02_backup_manifest.md` | Manifesto do backup legado | atual | Backup preservado em `backup/legacy-html-20260427-192742/`. |
| `02_DIAGNOSTICO_ATUAL.md` | Diagnostico minimo antigo | histórico | Documento muito curto. |
| `02_diagnostico_visual_e_tecnico.md` | Diagnostico HUD/serial | histórico | Bugs corrigidos depois. |
| `03_relatorio_pesquisa_context7_vite.md` | Pesquisa Vite/Web Serial | parcialmente desatualizado | Decisoes de Vite/public continuam validas. |
| `03_relatorio_qa_visual_playwright.md` | QA visual Fatia 01 | histórico | Evidencias de uma UI anterior. |
| `04_plano_migracao_react_vite.md` | Plano da migracao | histórico | Executado. |
| `04_RELATORIO_IMPLEMENTACAO.md` | Relatorio curto antigo | histórico | Pouca informacao. |
| `04_relatorio_pesquisa_context7.md` | Pesquisa Web Serial/HTMLVideo | parcialmente desatualizado | Conceitos ainda validos. |
| `05_plano_fatia_01.md` | Plano HUD/serial | histórico | Executado no legado/primeira fase. |
| `05_PLAYWRIGHT_QA.md` | QA curto antigo | histórico | Substituido por E2E atual. |
| `05_relatorio_fatia_01_scaffold.md` | Relatorio scaffold Vite | atual | Registra backup, scaffold e dependencias. |
| `05_VALIDACAO_FATIA_01.md` | Validacao antiga curta | histórico | Substituida por validacoes atuais. |
| `06_QA_FATIA_01.md` | QA curto antigo | histórico | Substituido. |
| `06_relatorio_fatia_02_componentes.md` | Componentes React base | parcialmente desatualizado | Base ainda existe, mas Admin/rounds vieram depois. |
| `06_relatorio_implementacao_fatia_01.md` | Implementacao HUD/serial | histórico | Refere APIs globais nao centrais hoje. |
| `07_CONGELAMENTO_FATIA_01.md` | Congelamento Fatia 01 | contraditório | Diz `BT1PRESS` A/B direto; depois foi calibrado. |
| `07_relatorio_qa_playwright.md` | QA Playwright React inicial | histórico | Cobertura menor que a atual. |
| `07_validacao_fatia_01.md` | Validacao APIs globais | contraditório | Cita `ArduinoBridge`/`QuizStage` globais; React atual usa hooks/store. |
| `08_qa_final_fatia_01.md` | QA final primeira fatia | histórico | Substituido por Sprint 1. |
| `08_validacao_build_typecheck.md` | Build/typecheck da migracao | histórico | Resultados antigos. |
| `09_gsd_react_vite.md` | GSD React/Vite | parcialmente desatualizado | Base correta, nao cobre Admin atual. |
| `09_mapa_estado_atual_do_projeto.md` | Mapa anterior do projeto | contraditório | Registrou `public/img` vazio e E2E falhando; hoje isso foi corrigido. |
| `10_rtk_stage_arduino_v2.md` | RTK stage/Arduino v2 | parcialmente desatualizado | Antes de Admin. |
| `11_mapa_fatia_stage_arduino_v2.md` | Mapa da fatia v2 | parcialmente desatualizado | Ainda util para protocolo/assets. |
| `12_relatorio_pesquisa_webserial_arduino_vite.md` | Pesquisa Web Serial/Arduino | atual | Conceitos ainda validos. |
| `13_relatorio_qa_visual_hardware.md` | QA visual/hardware v2 | parcialmente desatualizado | Antes de Admin realtime. |
| `14_arduino_v2_protocolo.md` | Protocolo Arduino v2 | atual | Confere com sketch atual. |
| `15_relatorio_stage_scorebar_assets.md` | Correção ScoreBar/assets | atual | Confere com ScoreBar e `public/img`. |
| `16_relatorio_web_serial_real.md` | Web Serial real | parcialmente desatualizado | Hook existe; Admin e dono atual. |
| `17_relatorio_quiz_core_passa_repassa.md` | Core passa/repassa | contraditório | Ainda cita `BT1PRESS` Grupo A e `BT2PRESS` Grupo B. |
| `18_gsd_stage_arduino_quiz_core.md` | GSD core stage/Arduino | parcialmente desatualizado | Antes de Admin/realtime. |
| `19_plano_admin_realtime.md` | Plano Admin realtime | histórico | Executado. |
| `20_rtk_admin_rounds_realtime.md` | RTK Admin/rounds | atual | Define escopo Sprint 1 final. |
| `21_diagnostico_mapeamento_reset_admin.md` | Diagnostico A/B/reset | atual | Calibracao correta. |
| `22_relatorio_pesquisa_context7_admin_realtime.md` | Pesquisa Admin/realtime | atual | Decisoes validas. |
| `23_relatorio_qa_visual_hardware_admin_rounds.md` | QA baseline Admin | atual | Registra problemas antes da implementacao. |
| `24_relatorio_fatia_01_mapping_reset.md` | Mapping/reset | atual | Confere com codigo. |
| `25_relatorio_fatia_02_routes_admin_login.md` | Rotas e login | atual | Confere com `/stage` e `/admin`. |
| `26_relatorio_fatia_03_broadcast_realtime.md` | BroadcastChannel | atual | Confere com `useRealtimeBridge`. |
| `27_relatorio_fatia_04_rounds_timer_jogador.md` | Rounds/timer | atual | Confere com store. |
| `28_validacao_admin_realtime_rounds.md` | Validacao Sprint 1 | atual | Resultados automatizados. |
| `29_gsd_admin_realtime_rounds.md` | GSD Sprint 1 | atual | Congela decisoes principais. |
| `30_proxima_fatia_recomendada.md` | Proxima validacao fisica | parcialmente desatualizado | Usuario informou validacao fisica, mas detalhes nao foram registrados. |
| `31_relatorio_correcao_validacao_fisica.md` | Correcao pos-validacao | atual | Confere com alteracoes recentes. |
| `GSD_FATIA_01_HUD_SERIAL.md` | GSD HUD/Serial antigo | contraditório | Mapeamento A/B antigo e APIs globais antigas. |
| `PROXIMA_FATIA_RECOMENDADA.md` | Proxima fatia antiga | histórico | Foi ultrapassado pelo Admin/rounds. |

## 4. Arquitetura atual

Arquitetura atual: SPA React + TypeScript + Vite. `index.html` carrega `src/main.tsx`, que monta `App.tsx`. O roteamento e simples por `location.pathname`: `/stage` mostra o telao; `/admin` mostra login e mesa de controle; `/` e substituido por `/stage`.

```txt
/admin
  - autentica localmente com sessionStorage
  - conecta Arduino via Web Serial
  - le linhas seriais e usa serialParser
  - resolve evento serial bruto para grupo A/B em serialEventToGroup
  - controla rodada, timer e pontos via Zustand
  - envia RESET_HW / UNLOCK / LOCK conforme fluxo
  - publica snapshot via BroadcastChannel

/stage
  - recebe snapshot via BroadcastChannel
  - aplica snapshot na store local
  - renderiza fundo, cards, barra, pergunta e timer
  - nao acessa Arduino diretamente

Vite
  - serve public/img pela raiz /img/...
  - build copia public para dist

Testes
  - Vitest para score, parser, calibracao e store
  - Playwright para overflow, rotas, login, realtime e game_over
```

## 5. Estado funcional atual

| Área | Está pronta? | Evidência | Risco |
|---|---:|---|---|
| Stage | Sim, com ressalvas | `QuizStage.tsx`, E2E `/stage` sem overflow | Visual ainda precisa refinamento e conteudo real. |
| Admin | Sim, MVP | `AdminPage.tsx`, E2E login/controles | UX utilitaria; falta protecao contra cliques perigosos. |
| Login | Sim, local | `admin123`/`121212`, E2E | Nao e seguranca real. |
| Realtime | Sim, local | `useRealtimeBridge.ts`, E2E duas paginas | So mesma origem/contexto local. |
| Arduino | Parcial | Hook/sketch/protocolo existem; usuario informou validacao fisica | Validacao fisica detalhada nao registrada neste prompt. |
| Mapeamento A/B | Sim | `serialEventToGroup.ts`, unit tests | Depende da fiacao continuar igual. |
| Reset automático | Sim por codigo | `AdminPage.tsx` chama `RESET_HW` em abrir buzz/pontuar/errar/reset/proximo/reset game | Precisa confirmar no log com Arduino real. |
| Timer | Sim, minimo | `gameStore.ts`, unit test de `time_up` | Timer roda no Admin; fechar Admin para ticks. |
| 5 rounds | Sim | `gameStore.test.ts`, E2E `game_over` | Fluxo de conteudo real ainda nao existe. |
| Game over | Sim | E2E verifica `data-phase=game_over` | Tela final ainda pouco trabalhada visualmente. |
| ScoreBar | Sim | `ScoreBar.test.tsx`, E2E contem `PTS` | Polimento visual ainda pode melhorar. |
| Cards A/B | Sim, com ressalvas | `GroupCard.tsx` usa camadas PNG; E2E renderiza | Paridade fina depende de comparacao visual manual. |
| Assets | Sim | `public/img` contem copias dos assets | Duplicidade `img/` e `public/img/` exige disciplina. |
| Testes | Sim | Vitest e Playwright configurados | Nao automatizam chooser Web Serial real. |
| Build | Sim | `npm run build` anterior passou | Build nao prova hardware. |

## 6. O que cada pasta faz

- `src/`: app React/TypeScript atual.
- `src/components/`: componentes visuais e de tela.
- `src/components/Admin/`: login e mesa de controle; unico ponto que usa Web Serial.
- `src/components/QuizStage/`: telao do jogo; renderiza snapshots e nao abre serial.
- `src/components/ScoreBar/`: placar superior com moldura e texto `PTS`.
- `src/components/GroupCard/`: cards A/B em React com camadas PNG do legado.
- `src/hooks/`: hooks de video, serial e realtime.
- `src/store/`: Zustand store do jogo e testes do core.
- `src/realtime/`: criacao de mensagens e canal BroadcastChannel.
- `src/utils/`: parser serial, calibracao A/B e score.
- `src/types/`: tipos compartilhados de jogo, serial e realtime.
- `public/img/`: assets usados pelo Vite em runtime via `/img/...`.
- `img/`: assets originais preservados/legado; nao e o caminho primario do app Vite.
- `hardware/`: sketch Arduino v2.
- `docs/`: GSDs historicos de fundo/layout.
- `docs/ai-harness/`: checkpoints, relatorios, GSDs, logs, screenshots e auditorias.
- `tests/`: Playwright E2E.
- `backup/`: backup HTML legado completo.
- `components/`: legado HTML/CSS/JS dos cards e demos; referencia visual, nao runtime principal.

## 7. O que cada arquivo principal faz

| Arquivo | Responsabilidade | Quem usa | Risco |
|---|---|---|---|
| `src/App.tsx` | Roteamento simples `/stage`/`/admin` | App inteiro | Sem fallback 404 sofisticado. |
| `src/main.tsx` | Monta React no `#root` | Vite/React | Baixo. |
| `src/store/gameStore.ts` | Estado central do jogo, rounds, timer, serial status e snapshots | Admin, Stage, hooks, testes | Pode crescer demais no Sprint 2. |
| `src/components/Admin/AdminPage.tsx` | Login, controles, serial, comandos automaticos e publicacao realtime | Operador | UX e protecao contra clique errado ainda basicas. |
| `src/components/QuizStage/*` | Telao, fundo, cards, score, pergunta, timer e HUD de rodada | Publico/TV | Visual ainda precisa refino e conteudo real. |
| `src/hooks/useArduinoSerial.ts` | Web Serial, leitura, envio e fallback teclado | Admin | Chooser real nao e automatizavel. |
| `src/hooks/useRealtimeBridge.ts` | Publica snapshots no Admin e aplica snapshots no Stage | Admin/Stage | BroadcastChannel limitado a mesma origem. |
| `src/realtime/broadcastChannel.ts` | Tipagem/criacao de mensagens e canal | Hooks realtime | `ADMIN_COMMAND` existe mas ainda e pouco usado. |
| `src/utils/serialParser.ts` | Normaliza linhas do Arduino em mensagens | Hook serial | Parser simples, bom para protocolo atual. |
| `src/utils/serialEventToGroup.ts` | Calibra BT1/BT2 fisico e teclado | Store/Admin/testes | Se fiacao mudar, precisa atualizar. |
| `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino` | Firmware v2: botoes, LEDs, DFPlayer, comandos serial | Arduino Uno | DFPlayer pode falhar sem bloquear jogo. |
| `tests/e2e/quiz-stage.spec.ts` | Playwright para stage/admin/realtime/game_over | QA | Nao cobre chooser Web Serial real. |
| `package.json` | Scripts e dependencias | Dev/build/test | Dependencias atuais suficientes. |
| `vite.config.ts` | Plugin React e alias `@` | Vite | Baixo. |

## 8. Fluxo real do jogo hoje

1. Abrir `/stage` no navegador/telao.
2. Abrir `/admin` em outra aba/janela na mesma origem.
3. Fazer login com `admin123` / `121212`.
4. Clicar `Conectar Arduino` e selecionar COM6 no chooser nativo.
5. Clicar `Iniciar quiz`.
6. Clicar `Abrir buzz`; Admin envia `RESET_HW`, depois `UNLOCK`, revela pergunta e inicia buzz/timer.
7. Arduino envia `BT1PRESS` ou `BT2PRESS` quando um botao fisico e pressionado.
8. Frontend resolve grupo calibrado: `BT1PRESS -> B`, `BT2PRESS -> A`; teclado segue `Z -> A`, `M -> B`.
9. Store atualiza grupo ativo; Admin envia `LOCK` e publica snapshot via BroadcastChannel.
10. Stage recebe snapshot e renderiza status, placar, pergunta, timer e slot ativo.
11. Operador pontua ou marca errado.
12. Admin envia `RESET_HW` automatico e registra no log.
13. Operador avanca para o proximo round; Admin tambem envia `RESET_HW`.
14. Depois do round 5, proximo avanco define `phase = game_over`.

## 9. Pontos fortes

- Migracao React/Vite concluida com testes.
- Backup legado preservado.
- Stage e Admin separados.
- Web Serial restrito ao Admin.
- BroadcastChannel simples e adequado ao MVP local.
- Calibracao A/B documentada e testada.
- Assets principais estao em `public/img`.
- Playwright cobre rotas, login, overflow, score, realtime e game_over.
- Sketch Arduino nao foi fragmentado em copias paralelas.

## 10. Dívidas técnicas

- Login local nao e seguranca real.
- BroadcastChannel so serve mesma origem/navegador local; nao resolve multiplas maquinas.
- Web Serial exige gesto do usuario e porta livre; nao e 100% automatizavel.
- Detalhes da validacao fisica mais recente nao foram registrados com resultados concretos.
- DFPlayer ja apareceu como risco/erro em docs anteriores.
- Conteudo real do quiz ainda nao existe.
- Pergunta central ainda e placeholder.
- Game over existe como fase, mas nao como experiencia visual final refinada.
- Admin e funcional, mas visualmente operacional e pouco guiado.
- Store concentra muita responsabilidade e pode ficar grande no Sprint 2.
- Nao ha persistencia de partida.
- Timer roda no Admin; se o Admin fecha, o Stage para de receber ticks.
- `img/` e `public/img/` duplicados podem causar confusao operacional.

## 11. Inconsistências ou contradições

- Docs iniciais falam em HTML legado e APIs globais (`GameBackground`, `QuizStage`, `ArduinoBridge`); o estado atual e React hooks/store.
- `GSD_FATIA_01_HUD_SERIAL.md` e `17_relatorio_quiz_core_passa_repassa.md` indicam `BT1PRESS -> A` e `BT2PRESS -> B`; o estado atual calibra `BT1PRESS -> B` e `BT2PRESS -> A`.
- `09_mapa_estado_atual_do_projeto.md` registrou `public/img` vazio e E2E falhando por falta de `PTS`; isso foi corrigido depois.
- Stage antes tinha painel Arduino; agora o contrato atual diz que Stage nao acessa Web Serial.
- Reset manual virou reset automatico em fluxo Admin.
- Alguns docs recomendam proximas fatias que ja foram executadas.

## 12. Riscos para apresentação/feira

- COM errada ou porta ocupada por outra aba/app.
- Navegador sem Web Serial.
- Operador esquecer login/senha.
- Stage e Admin em origens diferentes, impedindo BroadcastChannel.
- Arduino conectado em outra aba e bloqueando `requestPort`.
- DFPlayer ou cartao SD falhar; buzzer fallback existe, mas audio final pode nao estar pronto.
- Dev server cair durante apresentacao.
- Resolucao da TV diferente dos viewports testados.
- Visitante apertar botao antes da hora.
- Admin fechar ou travar, interrompendo timer e realtime.
- Duplicidade de assets confundir manutencao de ultima hora.

## 13. Veredito imparcial do Sprint 1

Aprovado com ressalvas.

Justificativa: o Sprint 1 esta funcional por arquivos e testes automatizados, e o usuario informou validacao fisica. Ainda assim, a validacao fisica nao esta detalhada nos documentos, Web Serial depende de operacao manual e a experiencia visual/conteudo real ainda nao esta pronta para ser tratada como produto final. O Sprint 2 pode comecar, mas deve priorizar refinamento visual controlado e checklist operacional antes de ampliar arquitetura.
