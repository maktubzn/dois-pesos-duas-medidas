# Harness 3.2 - Plano e decisoes

## Objetivo

Automatizar o ritmo dos rounds depois do Harness 3.1:

- Admin clica `Iniciar quiz`;
- Admin clica `Iniciar rodadas`;
- sistema conduz countdown, pergunta, timer, botao de vez, feedback e avanco automatico;
- Veredito Final tambem passa pelo countdown;
- operador continua responsavel apenas pela decisao humana de certo/errado ou A/B.

## Estado herdado

Harness 3.1 ja entregou:

- banco de perguntas;
- 10 rounds principais;
- Veredito Final;
- card volatil sem overflow;
- preview da TV no Admin;
- historico local e CSV;
- BroadcastChannel Admin -> Stage;
- timer automatico da resposta.

## Pesquisa e decisoes tecnicas

Consultas feitas:

- React/Context7: timers e efeitos devem limpar `setTimeout`/`setInterval` no cleanup do `useEffect`, evitando callbacks antigos.
- Zustand/Context7: transicoes centralizadas no store com acoes colocadas junto do estado.
- Playwright/Context7: validacao com web-first assertions e screenshots.
- MDN/web: `clearTimeout`, `BroadcastChannel`, `prefers-reduced-motion` e `matchMedia`.
- Referencias visuais atuais de relogio digital/LED: adotado painel tecnico central, fundo preto, glow frio discreto, sem estetica de casino/neon.

GSD: havia docs GSD de base em `docs/GSD_BACKGROUND_STAGE.md` e `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`. Nao havia ferramenta GSD executavel local para salvar um novo estado; o estado do Harness 3.2 foi registrado nestes docs.

## Decisoes de arquitetura

- O store segue como fonte unica de estado.
- Stage continua passiva e apenas renderiza o snapshot.
- Admin controla os timeouts reais, com refs e cleanup.
- Timeouts usam token/estado para ignorar execucao atrasada.
- Countdown fica no store para sincronizar Admin e Stage.
- `BroadcastChannel` estrutural nao foi alterado.
- Input de teclado/serial fica bloqueado no `round_countdown`.
- Pausa congela countdown e timer de resposta.
- Reset e game over cancelam automacao.

## Estado modelado

Novos campos:

- `autoSequenceStatus`: `idle`, `running`, `paused`, `completed`;
- `roundIntroStatus`: `idle`, `counting`, `skipped`, `finished`;
- `roundIntroDelayMs`;
- `roundIntroRemainingMs`;
- `roundIntroSchedule`;
- `postFeedbackDelayMs`;
- `autoAdvanceEnabled`;
- `pendingAutomationToken`.

Novas fases:

- `round_countdown`;
- `auto_next_round_delay`.

## Riscos tratados

- Timer fantasma: refs e cleanup em Admin.
- Duplo clique: `startRoundSequence` ignora novo start quando ja esta rodando.
- Divergencia Admin/Stage: snapshot inclui todos os campos novos.
- Input cedo: `buzzStateForGroup` ignora input durante `round_countdown`.
- Feedback atropelado: auto avanco agenda delay pos-feedback antes do proximo countdown.
- Veredito Final: usa countdown e mantem regra sem empate final.

## Arquivo de prompt ausente

O README cita `00_PROMPT_START_CHAT.md`, mas esse arquivo nao existe no diretitorio `prompts`. A execucao seguiu `AGENTS.md`, `README.md` e os prompts `01` a `08` disponiveis do Harness 3.2.
