# 05 - Relatorio Final - Harness 9.1

## Resumo

Harness 9.1 aplicado com foco operacional: reset visivel do Arduino, preparo fisico no pre-show, logs melhores para input real, audio de botao de vez corrigido, cards com novos brasoes, banco de personagens mapeado, Admin mais util para operador, Tribunal full-screen e `.bat` seguro.

## Correcoes

- Pre-show Mesa A/B agora solicita `RESET_HW`, `UNLOCK` e `STATUS` no inicio do teste e a cada mudanca relevante, inclusive apos Mesa A.
- Logs de input agora incluem fase, `inputReady`, `buzzLocked`, `timerStatus`, `preShowInputCheckStatus` e grupo ativo.
- Round 1 com `BT2PRESS` foi coberto por teste unitario e pontua Grupo B.
- Botao `Resetar mesa fisica` ficou visivel na area principal do Admin.
- Audio `grupo_pegou_vez` agora usa asset existente de buzzer e tem protecao contra duplicidade.
- Cards usam `public/img/brasao-groupA.png` e `public/img/brasao-groupB.png`.
- Banco ativo usa 17 imagens reais em `public/img das perguntas/`.
- Admin mostra referencia correta com personagem/arquivo.
- Tribunal virou `role="dialog"` full-screen, fundo preto, grupo e tempo grandes.
- Ajuda do Admin foi reescrita para operacao real.
- `iniciar-jogo.bat` criado.

## Arquivos principais alterados

- `src/store/gameStore.ts`
- `src/components/Admin/AdminPage.tsx`
- `src/components/Admin/AdminPage.module.css`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`
- `src/components/GroupCard/GroupCard.tsx`
- `src/data/questionBank.ts`
- `src/audio/audioManifest.ts`
- `src/audio/audioEvents.ts`
- `src/audio/audioEvents.test.ts`
- `src/store/gameStore.test.ts`
- `src/utils/quizAlgorithm.test.ts`
- `tests/e2e/visual/harness-6-direcao-arte-operacional.spec.ts`
- `automacao/playwright.config.ts`
- `automacao/operador-profissional.spec.ts`
- `iniciar-jogo.bat`

## Testes

Passaram:

- `rtk npm run typecheck`
- `rtk npm run test -- --run`
- `rtk npm run lint`
- `rtk npm run build`
- `rtk npm run test:e2e`
- `rtk npm run arduino:virtual:self-test`

Falhou:

- `rtk npx playwright test -c automacao/playwright.config.ts --project=chromium`

Motivo: automacoes profissionais completas excederam timeout/travaram em clique longo de feedback. Resultado documentado em `03_validacao_testes.md`.

## Assets

- 17 imagens aprovadas.
- 0 quarentenadas.
- Nenhum `anal_` criado.
- Evidencia: `docs/sprint-2/harness-9.1/evidencias/assets-contact-sheet.jpg`.

## Pendencias reais

- Validar Arduino fisico com Mesa A e Mesa B no ensaio.
- Confirmar se o botao azul fisico corresponde ao grupo esperado no evento real.
- Confirmar audio em navegador/TV real apos desbloqueio manual da Stage.
- Resolver flakiness/duracao da automacao separada de partidas completas.

## Instrucao operacional

1. Rodar `iniciar-jogo.bat`.
2. Abrir Stage na TV e ativar audio.
3. Conectar Arduino no Admin.
4. Clicar `Resetar mesa fisica`.
5. Rodar `Testar mesa` no pre-show.
6. Validar Mesa A e Mesa B.
7. Iniciar quiz e testar round 1 com botao azul.
8. Usar fallback Mesa A/B se o Arduino falhar durante apresentacao.
