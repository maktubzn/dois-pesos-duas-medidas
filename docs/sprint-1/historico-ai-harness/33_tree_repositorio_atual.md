# 33 - Árvore Atual do Repositório

## Árvore resumida

Pastas ignoradas nesta árvore: `node_modules/`, `dist/`, `test-results/`, `coverage/` e conteudo profundo de `backup/`.

```txt
.
├── AGENTS.md
├── README.md
├── 00_PROMPT_START_CHAT.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── playwright.config.ts
├── eslint.config.js
├── background-ended-check.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── App.css
│   ├── components/
│   │   ├── Admin/
│   │   ├── BackgroundStage/
│   │   ├── GroupCard/
│   │   ├── HourglassTimer/
│   │   ├── IntroScreen/
│   │   ├── QuestionPanel/
│   │   ├── QuizStage/
│   │   └── ScoreBar/
│   ├── hooks/
│   ├── realtime/
│   ├── store/
│   ├── types/
│   └── utils/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── img/
├── img/
├── hardware/
│   └── arduino_quiz_controller_v2/
├── tests/
│   └── e2e/
├── docs/
│   ├── GSD_BACKGROUND_STAGE.md
│   ├── GSD_STAGE_02_INTRO_AND_LAYOUT.md
│   └── ai-harness/
├── prompts/
├── components/
└── backup/
    └── legacy-html-20260427-192742/
```

## Pastas ignoradas

- `node_modules/`: dependencias instaladas.
- `dist/`: build gerado.
- `test-results/`: saida do Playwright.
- `coverage/`: nao apareceu como pasta ativa, mas deve ser ignorada se surgir.
- `backup/legacy-html-20260427-192742/`: backup legado; nao carregar inteiro sem necessidade.

## Descrição de cada pasta

- `src/`: app React + TypeScript atual.
- `src/components/`: componentes de tela e UI.
- `src/components/Admin/`: login local, mesa de controle, comandos Arduino e log.
- `src/components/QuizStage/`: stage/telao que renderiza o estado recebido.
- `src/components/ScoreBar/`: barra de pontos superior.
- `src/components/GroupCard/`: cards A/B baseados em camadas PNG do legado.
- `src/hooks/`: Web Serial, realtime local e cue de video.
- `src/store/`: Zustand store do jogo.
- `src/realtime/`: helpers de BroadcastChannel e mensagens tipadas.
- `src/utils/`: score, parser serial e calibracao A/B.
- `src/types/`: contratos TypeScript de jogo, serial e realtime.
- `public/img/`: assets usados pelo app Vite em runtime.
- `img/`: assets originais preservados.
- `hardware/`: sketch Arduino v2.
- `tests/`: Playwright E2E.
- `docs/`: GSDs e documentação do harness.
- `docs/ai-harness/`: relatórios, checkpoints, screenshots, logs e novos documentos de auditoria.
- `prompts/`: prompts do harness Admin/realtime/rounds.
- `components/`: componentes HTML/CSS/JS legados.
- `backup/`: backup anterior à migração Vite.

## Arquivos principais

- `src/App.tsx`: roteamento simples `/stage` e `/admin`.
- `src/main.tsx`: entrada React.
- `src/store/gameStore.ts`: estado central do quiz.
- `src/components/Admin/AdminPage.tsx`: Admin e Web Serial.
- `src/components/QuizStage/QuizStage.tsx`: telao.
- `src/hooks/useArduinoSerial.ts`: ponte Web Serial.
- `src/hooks/useRealtimeBridge.ts`: BroadcastChannel Admin/Stage.
- `src/realtime/broadcastChannel.ts`: criação de mensagens.
- `src/utils/serialParser.ts`: parser do protocolo serial.
- `src/utils/serialEventToGroup.ts`: calibracao A/B.
- `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`: sketch atual.
- `tests/e2e/quiz-stage.spec.ts`: E2E principal.

## Arquivos legados

- `components/group-card.js`
- `components/group-card.css`
- `components/barra.html`
- `components/page-shell.css`
- `img/` como fonte original preservada.
- `backup/legacy-html-20260427-192742/`
- GSDs iniciais de HTML puro em `docs/GSD_BACKGROUND_STAGE.md` e `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`.

## Arquivos que parecem sobras

- `src/assets/vite.svg` e `src/assets/react.svg`: sobras do scaffold Vite.
- `src/assets/hero.png`: nao apareceu como asset usado no app atual.
- `src/test/`: pasta presente, aparentemente vazia no mapeamento por arquivos.
- `.tmp/` e `.playwright-mcp/`: artefatos locais de tooling.
- `background-ended-check.json`: artefato legado.
- Alguns docs antigos duplicam indices/relatorios curtos e estao historicos.

## Arquivos que não devem ser mexidos sem motivo

- `hardware/arduino_quiz_controller_v2/arduino_quiz_controller_v2.ino`: so alterar com bug hard comprovado.
- `backup/legacy-html-20260427-192742/`: backup, nao editar.
- `img/`: fonte original dos assets.
- `public/img/`: assets runtime do Vite; alterar aqui muda o app.
- `docs/GSD_BACKGROUND_STAGE.md` e `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`: GSDs historicos preservados.
- `package-lock.json`: so mudar junto de instalacao/dependencias justificadas.
