# Harness 3.3 - Auditoria baseline

Data: 2026-04-30

## Escopo

Auditoria de otimizacao, hardening, estabilidade e QA completo do fluxo:

pre-show -> iniciar quiz -> iniciar rodadas -> countdown -> perguntas -> botao de vez -> A/B -> Veredito Final -> game over -> historico -> CSV.

Nao foram alterados Arduino, arquivos `.ino`, Web Serial estrutural, BroadcastChannel estrutural, regra de 10 rounds, Veredito Final, pre-show 2.1, sequencia 3.2, audio completo ou backend.

## Skills e ferramentas

Disponiveis e usadas como direcao:

- GS Stack: `gs-premium-ui-suite`, `gs-ui-craft-orchestrator`, `gs-dark-first-design-system`, `gs-visual-validation-loop`.
- GStack: `gstack`, `gstack-qa`, `gstack-design-review`, `gstack-investigate`, `gstack-review`, `gstack-health`, `gstack-plan-eng-review`.
- Complementares: `app-builder`, `accessibility-compliance-accessibility-audit`, `awt-e2e-testing`, Build Web Apps.
- RTK: todos os comandos de shell foram executados com `rtk`.
- GSD: nao havia ferramenta MCP GSD callable disponivel neste ambiente; foram preservados e consultados os docs GSD existentes no repositorio.

## Context7 e pesquisa

Consultas usadas para validar decisoes:

- React/useEffect: cleanup de timers e efeitos.
- Vite: assets publicos e build de producao.
- OWASP CSV Injection: celulas iniciando com `=`, `+`, `-` ou `@`.
- OWASP DOM XSS: evitar sinks inseguros e tratar dado nao confiavel como texto.
- Playwright: screenshots e trace on-first-retry.

Fontes oficiais:

- https://react.dev/reference/react/useEffect
- https://vite.dev/guide/assets
- https://owasp.org/www-community/attacks/CSV_Injection
- https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
- https://playwright.dev/docs/trace-viewer

## Baseline

Comandos executados:

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou depois da correcao de regressao de placar.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm audit --audit-level=low`: `found 0 vulnerabilities`.
- `rtk npm outdated`: apontou `@types/node` major disponivel e `jsdom` patch disponivel; nenhum upgrade foi aplicado.

## Riscos encontrados

- CSV injection no export de historico: valores iniciando com formula podiam abrir como formula em planilha.
- Timeout debug em `QuizStage`: havia um `setTimeout` sem cancelamento explicito.
- Placar sem texto `PTS` no DOM: teste de acessibilidade/QA falhava.
- Asset morto `public/img/BGVIDEO.gif`: 9.42 MB, sem referencia no app vivo.
- Assets ainda pesados: custo principal esta em PNG/MP4, nao no bundle JS.

## Assets pesados apos correcao

- `public/img/logoinfo.png`: 5.51 MB.
- `public/img das perguntas/senhor-destino.png`: 5.18 MB.
- `public/img/projeto.png`: 3.93 MB.
- `public/img/bg-FNL2.png`: 3.51 MB.
- `public/img/02.png`: 3.27 MB.
- `public/img/video1.mp4`: 2.79 MB.

`dist` final: 50.24 MB.

