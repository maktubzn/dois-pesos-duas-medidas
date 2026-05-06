# 03 - Validacao de Testes - Harness 9.1

## Comandos obrigatorios

| Comando | Resultado |
|---|---|
| `rtk npm run typecheck` | passou |
| `rtk npm run test -- --run` | passou: 10 arquivos, 89 testes |
| `rtk npm run lint` | passou |
| `rtk npm run build` | passou |
| `rtk npm run test:e2e` | passou: 24 testes |
| `rtk npm run arduino:virtual:self-test` | passou |

## Automacao separada

Comando rodado:

```bash
rtk npx playwright test -c automacao/playwright.config.ts --project=chromium
```

Resultado: falhou.

Falhas reais:

- `harness 8 simula 3 partidas completas como operador humano`: estourou timeout de 900000ms.
- `operador profissional executa 4 jogos variaveis com Admin e Stage reais`: travou no clique de `Encerrar feedback` em uma partida longa.

Decisao: nao mascarado. A suite principal de E2E passou, mas a automacao profissional completa continua pendente por duracao/flakiness operacional.

## Evidencias

- `docs/sprint-2/harness-9.1/evidencias/assets-contact-sheet.jpg`
- `docs/sprint-2/harness-9.1/evidencias/automacao/playwright-output/`
- `test-results/.last-run.json`

## Matriz Harness 9.1

| Item | Validacao |
|---|---|
| Pre-show Mesa A/B | store + E2E principal; validar fisico no ensaio |
| Reset/preparo apos Mesa A | implementado no Admin com log `PRESHOW_TABLE_TEST_HARDWARE_PREPARE_*` |
| Round 1 botao azul | unitario `BT2PRESS` pontua Grupo B no round 1 |
| Reset manual Admin | botao visivel `Resetar mesa fisica` |
| Audio botao de vez | manifest aponta asset existente e teste anti-duplicidade passou |
| Brasoes A/B | GroupCard usa `brasao-groupA.png` e `brasao-groupB.png` |
| Banco de imagens | 17 imagens mapeadas e testadas no banco |
| Admin referencia correta | `correct-reference` no Admin |
| Tribunal full-screen | E2E principal passou com dialog |
| Ajuda Admin | E2E de busca/fechamento passou |
| `.bat` | validacao estatica e build sem impacto |

## Risco restante

Arduino fisico ainda precisa de ensaio real. A automacao separada completa deve ser tratada como pendencia de robustez, nao como bloqueio do build principal.
