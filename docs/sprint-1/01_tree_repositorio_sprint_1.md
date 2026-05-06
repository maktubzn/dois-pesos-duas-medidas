# Sprint 1 - Tree do Repositorio

## 1. Arvore resumida

Ignorados nesta arvore: `node_modules/`, `dist/`, `test-results/`, `coverage/` e conteudo profundo de backups.

```txt
.
|-- AGENTS.md
|-- README.md
|-- 00_PROMPT_START_CHAT.md
|-- index.html
|-- package.json
|-- package-lock.json
|-- vite.config.ts
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.node.json
|-- playwright.config.ts
|-- eslint.config.js
|-- background-ended-check.json
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- index.css
|   |-- App.css
|   |-- components/
|   |   |-- Admin/
|   |   |-- BackgroundStage/
|   |   |-- GroupCard/
|   |   |-- HourglassTimer/
|   |   |-- IntroScreen/
|   |   |-- QuestionPanel/
|   |   |-- QuizStage/
|   |   `-- ScoreBar/
|   |-- hooks/
|   |-- realtime/
|   |-- store/
|   |-- types/
|   `-- utils/
|-- public/
|   |-- favicon.svg
|   |-- icons.svg
|   `-- img/
|-- img/
|-- hardware/
|   `-- arduino_quiz_controller_v2/
|       `-- arduino_quiz_controller_v2.ino
|-- tests/
|   `-- e2e/
|-- docs/
|   |-- GSD_BACKGROUND_STAGE.md
|   |-- GSD_STAGE_02_INTRO_AND_LAYOUT.md
|   |-- ai-harness/
|   |   `-- README.md
|   |-- sprint-1/
|   |   |-- 00_resumo_geral_sprint_1.md
|   |   |-- 01_tree_repositorio_sprint_1.md
|   |   |-- 02_mapa_arquitetura_sprint_1.md
|   |   |-- 03_historico_documentos_harness.md
|   |   `-- historico-ai-harness/
|   `-- sprint-2/
|       `-- 00_plano_inicial_sprint_2.md
|-- prompts/
|-- components/
`-- backup/
    `-- legacy-html-20260427-192742/
```

## 2. O que cada pasta faz

- `src/`: app React + TypeScript atual.
- `src/components/`: componentes visuais e de tela.
- `src/components/Admin/`: login local, mesa de controle, controles de partida, timer, pontuacao, Arduino e log.
- `src/components/QuizStage/`: telao do jogo; renderiza o estado recebido e nao abre Web Serial.
- `src/components/ScoreBar/`: placar superior com moldura e texto `PTS`.
- `src/components/GroupCard/`: cards A/B em React usando camadas PNG do legado.
- `src/hooks/`: hooks de video, Web Serial e realtime local.
- `src/store/`: Zustand store do jogo, rounds, timer, pontos, serial e snapshots.
- `src/realtime/`: helpers de BroadcastChannel e mensagens tipadas.
- `src/utils/`: score, parser serial e calibracao A/B.
- `src/types/`: contratos TypeScript do jogo, serial e realtime.
- `public/img/`: assets servidos pelo Vite via `/img/...` e copiados para o build.
- `img/`: assets originais preservados do legado; nao e o caminho primario do app Vite.
- `hardware/`: sketch Arduino v2.
- `docs/`: GSDs historicos, consolidacao do Sprint 1 e plano do Sprint 2.
- `docs/sprint-1/`: resumo consolidado, tree, arquitetura e historico bruto do Sprint 1.
- `docs/sprint-2/`: plano inicial do Sprint 2.
- `tests/`: testes E2E Playwright.
- `backup/`: backup HTML legado completo.
- `components/`: componentes HTML/CSS/JS legados; referencia visual, nao runtime principal.

## 3. Arquivos principais

| Arquivo | Responsabilidade | Quem usa | Risco |
|---|---|---|---|
| `src/App.tsx` | Roteamento simples por `location.pathname`: `/stage`, `/admin` e `/` para Stage. | App inteiro. | Sem roteamento robusto/404; suficiente para MVP local. |
| `src/main.tsx` | Monta React no `#root`. | Vite/React. | Baixo. |
| `src/store/gameStore.ts` | Estado central do jogo: fases, rounds, timer, pontuacao, serial, snapshots e logs. | Admin, Stage, hooks e testes. | Pode crescer demais no Sprint 2. |
| `src/components/Admin/AdminPage.tsx` | Login, mesa de controle, serial, comandos automaticos, pontuacao, timer e logs. | Operador. | UX e protecoes contra clique errado ainda basicas. |
| `src/components/QuizStage/*` | Telao: fundo, cards, ScoreBar, pergunta, timer e HUD. | Publico/TV. | Visual e conteudo ainda precisam refinamento. |
| `src/hooks/useArduinoSerial.ts` | Web Serial, leitura, envio de comandos e fallback teclado. | Admin. | Chooser nativo nao e automatizavel; depende de navegador/porta. |
| `src/hooks/useRealtimeBridge.ts` | Admin publica snapshots; Stage aplica snapshots via BroadcastChannel. | Admin e Stage. | Limitado a mesma origem/contexto local. |
| `src/realtime/broadcastChannel.ts` | Canal, origin id e criacao de mensagens realtime. | Hooks realtime. | Tipos incluem comandos pouco usados; cuidar para nao criar caminhos mortos. |
| `src/utils/serialParser.ts` | Normaliza linhas do Arduino em mensagens estruturadas. | Hook serial e testes. | Parser simples, adequado ao protocolo atual. |
| `src/utils/serialEventToGroup.ts` | Calibra evento fisico A/B e fallback teclado. | Store/Admin/testes. | Se a fiacao mudar, esta camada precisa nova validacao. |
| `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino` | Firmware v2: botoes, LEDs, DFPlayer, buzzer fallback e comandos serial. | Arduino Uno. | DFPlayer pode falhar; nao mexer sem bug real. |
| `tests/e2e/*` | Playwright para Stage, Admin, login, realtime, overflow, score e game over. | QA. | Nao cobre chooser Web Serial real. |
| `package.json` | Scripts e dependencias do projeto. | Dev/build/test. | Alterar dependencias muda lockfile e escopo. |
| `vite.config.ts` | Plugin React e alias `@`. | Vite. | Baixo. |

## 4. Arquivos legados e sobras

- `components/group-card.js`, `components/group-card.css`, `components/barra.html`, `components/page-shell.css`: legado HTML/CSS/JS, referencia visual.
- `backup/legacy-html-20260427-192742/`: backup completo antes da migracao Vite; nao editar sem decisao explicita.
- `img/`: fonte original dos assets; preservada para rastreabilidade.
- `docs/GSD_BACKGROUND_STAGE.md` e `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`: GSDs historicos do legado.
- `src/assets/react.svg`, `src/assets/vite.svg`: sobras do scaffold Vite.
- `src/assets/hero.png`: asset sem uso confirmado no app atual.
- `background-ended-check.json`: artefato/check legado.
- `.tmp/` e `.playwright-mcp/`: artefatos locais de tooling.
- `docs/sprint-1/historico-ai-harness/`: historico bruto movido de `docs/ai-harness`.
