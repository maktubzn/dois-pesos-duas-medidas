# Harness 3.2 - Validacao

## Comandos obrigatorios

Executados:

- `rtk npm run typecheck`
- `rtk npm run test -- --run`
- `rtk npm run lint`
- `rtk npm run build`
- `rtk npm run test:e2e`

Resultado final: todos passaram.

## Testes unitarios

Resultado: 8 arquivos, 34 testes.

Cobertura adicionada:

- schedule seedado de 1 a 5s;
- delay de Veredito Final;
- formatacao `00:03`;
- delay pos-feedback;
- inicio da sequencia;
- bloqueio de input no countdown;
- pause/resume preservando restante;
- skip countdown;
- registro de delay no historico.

## E2E e screenshots

Resultado: 16 testes Playwright.

Screenshots principais em `docs/sprint-2/harness-3.2/screenshots/`:

- `countdown-round-1920x1080.png`
- `countdown-round-1366x768.png`
- `countdown-veredito-final-1920x1080.png`
- `auto-question-reveal-after-countdown.png`
- `stage-1920x1080.png`
- `stage-1600x900.png`
- `stage-1366x768.png`
- `stage-900x900.png`
- `feedback_correct-1366x768.png`
- `game_over-1366x768.png`
- `admin-preview-character.png`
- `admin-ab-history.png`

## Validacoes cobertas

- Countdown aparece ao iniciar sequencia.
- Z/M nao pegam vez durante countdown.
- Pausar sequencia congela countdown.
- Continuar sequencia retoma.
- Pular countdown mostra pergunta.
- Timer da resposta inicia depois da pergunta.
- Grupo pega a vez apenas na janela de resposta.
- Feedback aparece apos validacao.
- Proximo round entra automaticamente.
- Veredito Final tem countdown.
- Stage nao mostra resposta correta.
- Texto publico nao contem `buzz`.
- Stage sem overflow em viewports principais.
- Pre-show 2.1 continua sem iniciar quiz sozinho.
- Admin/Stage continuam sincronizados via BroadcastChannel.

## Bugs encontrados e corrigidos

- `PHASE_LABELS` nao cobria as novas fases `round_countdown` e `auto_next_round_delay`. Corrigido.
- E2E antiga usava seletores ambiguos para `Iniciar rodada` e `Proximo round`. Corrigido com labels exatos/manual.
- Primeiro teste E2E do fluxo automatico tinha race: Stage mostrava vez antes do Admin refletir o grupo ativo; o teste agora espera o Admin sincronizar antes de marcar correto.
- Timers do countdown e do delay pos-feedback foram separados em refs diferentes para evitar cancelamento cruzado.

## Subagentes

- Pesquisa + Context7 + GSD executado: retornou achados sobre cleanup, Zustand, BroadcastChannel, reduced motion e risco de timeout solto.
- QA Visual + Bug Hunter: indisponivel por erro de limite de uso/cota. Fallback usado: Playwright local + E2E completa.

## Pendencias

- `QuizStageDebug.startNewQuestion` ainda contem um timeout local usado apenas em caminho de debug/teste legado; nao afeta o fluxo automatico do Admin, mas pode ser removido numa limpeza futura.
- O visual do countdown esta funcional e validado; uma proxima fatia pode fazer refinamento fino de tipografia caso haja direcao de arte adicional.

## Proxima fatia recomendada

Harness 3.3: polimento operacional do Admin, painel compacto de status da sequencia, replay do historico e revisao de acessibilidade visual do countdown em projetor/TV real.
