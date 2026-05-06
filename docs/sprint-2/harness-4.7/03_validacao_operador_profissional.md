# Harness 4.7 - Validacao Operador Profissional

## Automacao

- Arquivo: `automacao/operador-profissional.spec.ts`
- Config: `automacao/playwright.config.ts`
- Comando: `rtk npm run automacao:operador`
- Evidencias: `docs/sprint-2/harness-4.7/evidencias/operador-profissional/`

## Jogos cobertos

1. Vitoria limpa Grupo A.
2. Vitoria Grupo B por erros do A.
3. Tribunal com resolucao correta e caminho de desempate possivel.
4. Stress com mute, pass/pass, replay de Final Show e reinicio entre jogos.

## Metricas coletadas

- Duracao por jogo.
- Cliques do operador.
- Console errors e requests falhos.
- Assets carregados por fase.
- Estado final Admin/Stage inferido pela Stage.
- Audio Stage via `StageAudioDebug.getState()` apenas como leitura.
- `video.currentTime`, estado do video e frames do pre-show.
- Screenshots por fase e tres momentos do Final Show.
- Trace Playwright.

## Resultado da execucao

Executado e aprovado em `rtk npm run automacao:operador`.

| Jogo | Duracao | Vencedor | Placar final | Estado |
| --- | ---: | --- | --- | --- |
| `vitoria-limpa-grupo-a` | 33152ms | A | 100 x 0 | `game_over` |
| `vitoria-grupo-b-erros-a` | 34722ms | B | 0 x 50 | `game_over` |
| `tribunal-e-desempate-possivel` | 53218ms | B | 0 x 65 | `game_over` |
| `stress-pausa-mute-pass-reset-repetir` | 54229ms | B | 40 x 50 | `game_over` |

## Validacoes rodadas

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - 10 arquivos, 74 testes passaram.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - 22 testes passaram.
- `rtk npm run arduino:virtual:self-test` - passou.
- `rtk npm run visual:all` - 5 testes visuais passaram.
- `rtk npm run automacao:operador` - passou.

## Observacoes honestas

- Web Serial nao foi automatizado diretamente pelo Playwright; a automacao registrou o caminho UI/teclado real sem alterar producao.
- `StageAudioDebug` foi usado somente como leitura de metrica, nao como caminho de controle.
- O QA Profissional de Arena inicial reprovou os bloqueantes do harness; nesta continuacao nao foi possivel reabrir o mesmo subagente fechado para emitir aprovacao formal pos-correcao. A validacao objetiva pos-correcao ficou coberta pela automacao unica, E2E e visuais.
