# 09 - Mapa do Estado Atual do Projeto

## 1. Resumo executivo

O projeto esta atualmente migrado para React + TypeScript + Vite na raiz. O ponto de entrada principal e `index.html` com `src/main.tsx`, que renderiza `src/App.tsx` e a tela `QuizStage`.

Ainda existe uma mistura controlada: o app principal e React/Vite, mas os arquivos HTML/CSS/JS legados permanecem na raiz em `card_A.html`, `card_B.html` e `components/`, alem do backup completo em `backup/legacy-html-20260427-192742/`.

A tela principal atual e o HUD do quiz com fundo/video, intro, scorebar, cards A/B, painel de pergunta, ampulheta placeholder e preparacao de Web Serial por hook React.

O maior risco agora e divergencia entre documentacao/estado real: `docs/ai-harness/09_gsd_react_vite.md` diz que os assets foram copiados para `public/img/`, mas `public/img/` esta vazio; os assets reais continuam em `img/`. Tambem ha bug aberto no E2E atual: `ScoreBar` renderiza `0 0` em vez de texto com `PTS`, fazendo quatro testes Playwright falharem.

## 2. Estrutura atual de pastas

Arvore resumida, omitindo `node_modules`, `dist` detalhado e logs grandes:

```txt
.
|-- AGENTS.md
|-- README.md
|-- index.html
|-- package.json
|-- vite.config.ts
|-- tsconfig*.json
|-- playwright.config.ts
|-- eslint.config.js
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- index.css
|   |-- components/
|   |   |-- BackgroundStage/
|   |   |-- GroupCard/
|   |   |-- HourglassTimer/
|   |   |-- IntroScreen/
|   |   |-- QuestionPanel/
|   |   |-- QuizStage/
|   |   `-- ScoreBar/
|   |-- hooks/
|   |-- store/
|   |-- types/
|   `-- utils/
|-- img/
|-- public/
|   |-- favicon.svg
|   |-- icons.svg
|   `-- img/                # existe, mas esta vazia
|-- components/             # legado HTML/CSS/JS ainda presente
|-- card_A.html             # demo legada isolada
|-- card_B.html             # demo legada isolada
|-- docs/
|   |-- GSD_BACKGROUND_STAGE.md
|   |-- GSD_STAGE_02_INTRO_AND_LAYOUT.md
|   `-- ai-harness/
|-- prompts/                # existe, mas esta vazia na raiz
|-- backup/
|   `-- legacy-html-20260427-192742/
|-- tests/
|   `-- e2e/
|-- dist/
`-- test-results/
```

## 3. Arquivos principais lidos

- `AGENTS.md`: define o harness React/Vite, subagentes simulados, uso de `docs/ai-harness`, backup e regra de nao apagar sem backup.
- `README.md`: descreve a migracao para React + TypeScript + Vite e preservacao do legado.
- `package.json`: confirma app Vite privado com scripts `dev`, `build`, `preview`, `typecheck`, `test`, `test:e2e`, `test:e2e:ui` e `lint`.
- `vite.config.ts`: usa `@vitejs/plugin-react` e alias `@` para `src`.
- `tsconfig*.json`: TypeScript em modo bundler, JSX React, `paths` para `@/*`.
- `index.html`: entrada Vite com `#root` e `/src/main.tsx`; titulo ainda esta como `-vite-scaffold-tmp`.
- `src/main.tsx`: usa `createRoot` e `StrictMode`.
- `src/App.tsx`: renderiza apenas `QuizStage`.
- GSDs e relatorios de `docs/ai-harness`: confirmam fatias de fundo, HUD/Web Serial, migracao Vite e correcao recente dos cards.

## 4. Estado React + Vite atual

O app React esta estruturado em componentes pequenos:

- `BackgroundStage`: renderiza `/img/01-background.png` e video `/img/BGVIDEO.mp4`, sem loop, controlado por `useBackgroundCue`.
- `IntroScreen`: tela de abertura com texto da ETEC, botao `Pular intro` e logo local `/img/brasao dc.png`.
- `ScoreBar`: renderiza a moldura `/img/barraMoldura.png` e segmentos A/B calculados por pontos.
- `GroupCard`: renderiza os cards A/B com a estrategia do legado: camadas PNG cropadas (`01.png`, `02.png`, `03(header).png`, `04(brasao).png`, `brasao dc.png`) e textos dinamicos por cima.
- `QuestionPanel`: painel central temporario com `Pergunta preparada` e `Aguardando impacto do martelo`.
- `HourglassTimer`: ampulheta placeholder em CSS.
- `QuizStage`: compoe toda a tela, expoe controles de quiz, painel Arduino e debug em `window.QuizStageDebug`.

Hooks e estado:

- `useBackgroundCue`: controla playback do video de fundo.
- `useArduinoSerial`: prepara Web Serial, parseia eventos e fornece fallback de teclado `Z`, `M`, `R`.
- `useGameStore`: Zustand com `phase`, pontuacao, status serial, grupo travado, pergunta e timer.
- `serialParser`: aceita `BT1PRESS`, `BT2PRESS`, `RESET`.
- `score`: normaliza pontos e calcula divisao percentual da barra.

## 5. O que ainda esta em HTML/CSS/JS legado

Arquivos legados ainda presentes na raiz:

- `card_A.html`: demo isolada do card A usando `<quiz-group-card>`.
- `card_B.html`: demo isolada do card B usando `<quiz-group-card>`.
- `components/group-card.js`: custom element legado `<quiz-group-card>`.
- `components/group-card.css`: CSS legado dos cards A/B.
- `components/page-shell.css`: shell visual das demos legadas.
- `components/barra.html`: experimento HTML legado da barra e logica de perguntas teste.

Esses arquivos nao sao o app principal atual. Eles funcionam como referencia/legado e tambem existem preservados no backup.

## 6. Assets existentes

Assets locais encontrados em `img/`:

- `01-background.png`: fundo principal.
- `BGVIDEO.mp4`: video/cue principal do fundo.
- `BGVIDEO.gif`: referencia visual.
- `projeto.png`: referencia visual do layout.
- `barraMoldura.png`: moldura do placar superior.
- `01.png`: frame/layer dos cards.
- `02.png`: textura/layer dos cards.
- `03(header).png`: header/layer dos cards.
- `04(brasao).png`: brasao/layer dos cards.
- `05(placa do brasao).png`: asset local ainda nao mapeado no React atual.
- `08.png`: asset local ainda nao mapeado no React atual.
- `brasao dc.png`: logo local usado na intro e cards.

Estado importante:

- `public/img/` existe, mas esta vazio.
- `dist/img/` existe/foi criado pelo build, mas esta vazio.
- O codigo React referencia assets por `/img/...`; isso funciona no ambiente atual de desenvolvimento, mas e risco para deploy se apenas `dist/` for servido sem copiar `img/`.

## 7. GSDs e documentos harness existentes

GSDs principais:

- `docs/GSD_BACKGROUND_STAGE.md`: etapa 01 do fundo animado base.
- `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`: etapa 02 do HTML legado com intro, layout, scorebar, cards, pergunta e martelo.
- `docs/ai-harness/GSD_FATIA_01_HUD_SERIAL.md`: congelamento da fatia HUD/Web Serial no legado.
- `docs/ai-harness/09_gsd_react_vite.md`: congelamento da migracao React/Vite fatias 01 e 02.

Relatorios relevantes:

- `docs/ai-harness/00_rtk_migracao_vite.md`
- `docs/ai-harness/01_mapa_repo_pre_vite.md`
- `docs/ai-harness/02_backup_manifest.md`
- `docs/ai-harness/03_relatorio_pesquisa_context7_vite.md`
- `docs/ai-harness/04_plano_migracao_react_vite.md`
- `docs/ai-harness/05_relatorio_fatia_01_scaffold.md`
- `docs/ai-harness/06_relatorio_fatia_02_componentes.md`
- `docs/ai-harness/07_relatorio_qa_playwright.md`
- `docs/ai-harness/08_validacao_build_typecheck.md`
- `docs/ai-harness/reports/group-card-fix-20260427.md`
- `docs/ai-harness/PROXIMA_FATIA_RECOMENDADA.md`

Observacao: alguns documentos antigos dizem que Playwright estava aprovado; isso era verdade no checkpoint anterior, mas a validacao E2E rodada agora falhou por causa do texto `PTS` ausente no `ScoreBar`.

## 8. Prompts harness existentes

Na raiz, a pasta `prompts/` existe, mas esta vazia no estado atual.

Os prompts anteriores existem dentro do backup:

- `backup/legacy-html-20260427-192742/prompts/00_PROMPT_START_CHAT.md`
- `backup/legacy-html-20260427-192742/prompts/01_SETUP_BACKUP_MAPEAMENTO.md`
- `backup/legacy-html-20260427-192742/prompts/02_PESQUISA_CONTEXT7_VITE.md`
- `backup/legacy-html-20260427-192742/prompts/03_PLANO_MIGRACAO_REACT_VITE.md`
- `backup/legacy-html-20260427-192742/prompts/04_IMPLEMENTACAO_FATIA_01_SCAFFOLD.md`
- `backup/legacy-html-20260427-192742/prompts/05_IMPLEMENTACAO_FATIA_02_COMPONENTES_BASE.md`
- `backup/legacy-html-20260427-192742/prompts/06_QA_PLAYWRIGHT_VALIDACAO.md`
- `backup/legacy-html-20260427-192742/prompts/07_CONGELAMENTO_GSD_CONTINUACAO.md`

Isso precisa confirmar: se a raiz deveria manter os prompts, eles nao estao mais presentes ali.

## 9. Testes, build e validacao atual

Comandos rodados nesta etapa de mapeamento:

```powershell
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run lint
rtk npm run build
rtk npm run test:e2e
```

Resultado atual:

- `typecheck`: passou.
- `test -- --run`: passou, 2 arquivos e 4 testes.
- `lint`: passou.
- `build`: passou.
- `test:e2e`: falhou em 4 de 5 testes.

Falha E2E atual:

- Arquivo: `tests/e2e/quiz-stage.spec.ts`.
- Testes afetados: viewports `1920x1080`, `1600x900`, `1366x768`, `900x900`.
- Motivo: o teste espera texto contendo `PTS` na scorebar, mas recebeu `" 0 0"`.
- O teste de fallback teclado sem Arduino passou.

## 10. O que esta funcionando

- App React/Vite compila.
- TypeScript passa.
- ESLint passa.
- Testes unitarios de `score` e `serialParser` passam.
- Build Vite passa.
- `QuizStage` renderiza a tela principal.
- `IntroScreen` existe e pode ser pulada.
- `BackgroundStage` usa imagem e video locais.
- `GroupCard` foi corrigido para voltar a usar as camadas PNG do legado.
- Web Serial esta preparado como hook opcional.
- Fallback sem Arduino por teclado funciona no E2E: `Z`, `M`, `R`.
- Nao ha `BrowserRouter` nem rotas ainda; a aplicacao e tela unica.

## 11. O que esta quebrado ou inconsistente

- `ScoreBar` nao mostra `PTS` no texto atual. O componente renderiza apenas numeros (`0` e `0`), contrariando o aceite anterior e quebrando Playwright.
- `public/img/` esta vazio, apesar de documentos da migracao indicarem assets copiados para `public/img/`.
- `dist/img/` esta vazio apos build. Se o app for servido somente a partir de `dist/`, os assets referenciados por `/img/...` podem faltar.
- `prompts/` esta vazio na raiz, apesar da estrutura do harness esperar prompts ali.
- `index.html` ainda tem `<title>-vite-scaffold-tmp</title>`, indicando resquicio do scaffold.
- `docs/ai-harness/09_gsd_react_vite.md` esta desatualizado em relacao ao E2E atual, pois declara nenhum bloqueador tecnico conhecido.
- `components/` legado continua na raiz. Isso e aceitavel como referencia, mas precisa ficar claro para nao confundir com o app React.
- `src/assets/react.svg`, `src/assets/vite.svg` e `src/assets/hero.png` existem; `react.svg`/`vite.svg` parecem sobras do scaffold.

## 12. Estado do Arduino e Web Serial

Nao houve teste com Arduino fisico nesta etapa.

Implementacao atual:

- `useArduinoSerial` checa suporte por `navigator.serial`.
- `connect()` chama `requestPort()` e abre em `baudRate: 9600`.
- O parser aceita `BT1PRESS`, `BT2PRESS`, `RESET`.
- Teclado:
  - `Z`: simula `BT1PRESS`.
  - `M`: simula `BT2PRESS`.
  - `R`: simula `RESET`.

Riscos:

- Web Serial real depende de Chrome/Edge, localhost ou HTTPS, gesto do usuario e hardware conectado.
- Nao existe `window.ArduinoBridge` global no React atual; existe hook e `window.QuizStageDebug.simulateSerial`. Isso e uma mudanca em relacao ao legado/fatia anterior.

## 13. Estado visual atual

Base visual existente:

- Fundo dark de tribunal por `01-background.png`.
- Video `BGVIDEO.mp4` como cue sem loop.
- Barra superior com `barraMoldura.png`.
- Cards A/B com camadas PNG do legado.
- Painel central de pergunta placeholder.
- Ampulheta placeholder em CSS.
- Sem martelo DOM extra detectado pelo teste.
- Sem `BUZZ` visivel nos cards.

Precisa confirmar visualmente na proxima etapa:

- Paridade fina com `img/projeto.png`.
- Posicao e escala dos cards em todos os viewports.
- Se a intro escurece demais a primeira validacao visual.
- Se a ampulheta placeholder atende ao projeto ou deve ser trocada por asset local.

## 14. Backup e recuperacao

Backup principal:

```txt
backup/legacy-html-20260427-192742/
```

Conteudo relevante do backup:

- `index.html` legado.
- `card_A.html`, `card_B.html`.
- `components/` legado.
- `img/` legado.
- `docs/` e `docs/ai-harness/` anteriores.
- `prompts/` anteriores.
- `AGENTS.md`, `README.md`.

Como voltar ao legado: usar esse backup como fonte, especialmente `index.html`, `components/` e `img/`. Nao fazer isso sem uma decisao explicita, porque a raiz atual ja e React/Vite.

## 15. Proximas etapas que fazem sentido

Ordem recomendada antes de criar area admin ou novas features:

1. Corrigir o bug aberto da `ScoreBar`: voltar a exibir `PTS 0` / `0 PTS` ou o formato aprovado pelo GSD, e atualizar/rodar Playwright.
2. Resolver estrategia de assets Vite: copiar `img/` para `public/img/` ou ajustar imports/paths para garantir build deployavel.
3. Restaurar ou recriar prompts harness na raiz, se eles ainda forem fonte operacional obrigatoria.
4. Atualizar `index.html` com titulo correto do projeto.
5. Rodar nova QA visual contra `img/projeto.png` apos corrigir os pontos acima.
6. Depois disso, seguir para Fatia 03: fluxo real de quiz, lista/banco de perguntas local, timer funcional, travamento por buzz e pontuacao.

## 16. Comandos uteis atuais

```powershell
rtk npm run dev
rtk npm run typecheck
rtk npm run build
rtk npm run test -- --run
rtk npm run lint
rtk npm run test:e2e
```

Estado conhecido dos comandos em 2026-04-28:

- Todos passam exceto `rtk npm run test:e2e`.
- `rtk npm run test:e2e` falha por ausencia de `PTS` na `ScoreBar`.
