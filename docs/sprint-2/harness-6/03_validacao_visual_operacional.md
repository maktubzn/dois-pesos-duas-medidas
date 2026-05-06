# Harness 6 - Validacao visual operacional

Data: 2026-05-05

## Comandos obrigatorios

| Comando | Resultado |
| --- | --- |
| `rtk npm run typecheck` | Passou |
| `rtk npm run test -- --run` | Passou: 10 arquivos, 79 testes |
| `rtk npm run lint` | Passou |
| `rtk npm run build` | Passou |
| `rtk npm run test:e2e` | Passou: 22 testes |
| `rtk npm run arduino:virtual:self-test` | Passou |
| `rtk npx playwright test -c playwright.visual.config.ts tests/e2e/visual/harness-6-direcao-arte-operacional.spec.ts` | Passou |

## Evidencias geradas

- `docs/sprint-2/harness-6/evidencias/screenshots/admin-login.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/admin-operacao-1366x768.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/admin-operacao-1920x1080.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/admin-decisao-correto-errado.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/admin-tribunal-20s.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/stage-cards-grupos-slots.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/stage-tribunal-20s-mesa.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/stage-final-show-vencedor.png`
- `docs/sprint-2/harness-6/evidencias/screenshots/stage-preshow-ensino-lento.png`
- `docs/sprint-2/harness-6/evidencias/validacao-visual-operacional.json`
- `docs/sprint-2/harness-6/evidencias/videos/`
- `docs/sprint-2/harness-6/evidencias/playwright-output/`

## Checks especificos

- Admin tem sidebar (`data-admin-sidebar="true"`).
- Tecnico/Avancado fica fechado por padrao.
- `RESET_HW` nao aparece no grid operacional.
- Login nao possui botoes Google, Apple ou Facebook.
- Stage mostra slots como `JOGADOR`, sem `Jogador 1` duplicado.
- Tribunal usa `mesa-tribunal.png` e exibe decisao em 20s.
- Final Show tem card vencedor central/protagonista.
- Pre-show entra no ensino com pacing mais lento.
- Console errors ficaram zerados.
- Requests abortados de video foram registrados como aborts nao bloqueantes do navegador.

## Observacoes

- A validacao visual permitiu apenas `net::ERR_ABORTED` de midia, que ocorreu quando o navegador abortou carregamento anterior de video ao trocar estado/pagina.
- A regra de pontuacao, regra central do Tribunal, Arduino `.ino` e banco de perguntas nao foram alterados.

