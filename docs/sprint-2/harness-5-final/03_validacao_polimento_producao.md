# Harness 5 FINAL - Validacao de producao

Data: 2026-05-05

## Validacoes rodadas

| Comando | Resultado |
| --- | --- |
| `rtk npm run typecheck` | Passou |
| `rtk npm run test -- --run` | Passou: 10 arquivos, 79 testes |
| `rtk npm run lint` | Passou |
| `rtk npm run build` | Passou |
| `rtk npm run test:e2e` | Passou: 22 testes |
| `rtk npm run arduino:virtual:self-test` | Passou |
| `rtk npx playwright test -c playwright.visual.config.ts tests/e2e/visual/harness-5-final-production.spec.ts` | Passou |

## Evidencias geradas

- `docs/sprint-2/harness-5-final/evidencias/screenshots/admin-login-1366x768.png`
- `docs/sprint-2/harness-5-final/evidencias/screenshots/admin-operacao-desconectado-1366x768.png`
- `docs/sprint-2/harness-5-final/evidencias/screenshots/stage-countdown-realtime-sem-alternar-foco.png`
- `docs/sprint-2/harness-5-final/evidencias/screenshots/stage-pergunta-timer-20s.png`
- `docs/sprint-2/harness-5-final/evidencias/screenshots/stage-tribunal-mesa-tribunal.png`
- `docs/sprint-2/harness-5-final/evidencias/screenshots/stage-final-show-card-vencedor.png`
- `docs/sprint-2/harness-5-final/evidencias/stage-realtime-sessao-smoke.json`
- `docs/sprint-2/harness-5-final/evidencias/partida-exemplo.csv`
- `docs/sprint-2/harness-5-final/evidencias/videos/`
- `docs/sprint-2/harness-5-final/evidencias/playwright-output/`

## Checks especificos

- Stage atualiza countdown e timer por timestamp real.
- Stage publica transicao de expiracao para Admin quando necessario.
- Admin recebe heartbeat da Stage e mostra alerta quando ausente/atrasado/oculto.
- Mesa/Arduino desconectada aparece como alerta no Admin.
- Fallback `z`/`m` continua funcional em teste sem serial.
- Tribunal entra apos tempo esgotado e usa `mesa-tribunal.png`.
- Final Show mostra card vencedor completo, slots Jogador 1..5 e placar final.
- CSV de partida gera `matchId`, horario, duracao, vencedor, placar, diferenca, resumo e eventos importantes.
- Console errors e requests falhos foram coletados no JSON visual.

## Observacao operacional

A Stage em aba escondida pode ser limitada pelo navegador. Para ensaio e apresentacao, abrir a Stage em janela propria/fullscreen na TV ou em outro monitor.

## QA Final de Producao

Resultado final: aprovado. A ressalva inicial do QA era duplicacao possivel de `winner_declared` apos `game_over` pelo botao tecnico de proximo round; foi corrigida e coberta por teste unitario.
