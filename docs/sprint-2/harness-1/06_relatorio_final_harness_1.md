# Harness 1 - Relatorio Final

## 1. Objetivo

Preparar a base visual da Stage para o Sprint 2 com dois fundos oficiais: Fundo 1 para espera/abertura e Fundo 2 para jogo, preservando a logica do Sprint 1.

## 2. Arquivos lidos

- `AGENTS.md`
- `README.md`
- `prompts/01_RTK_ASSET_MAP_STAGE.md`
- `prompts/02_PESQUISA_CONTEXT7_VISUAL_ASSETS.md`
- `prompts/03_QA_VISUAL_BASELINE.md`
- `prompts/04_IMPLEMENTAR_BACKGROUND_DIRECTOR.md`
- `prompts/05_REFINAR_STAGE_ESTADOS_VISUAIS.md`
- `prompts/06_VALIDAR_CONGELAR_HARNESS_1.md`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/BackgroundStage/BackgroundStage.tsx`
- `src/components/BackgroundStage/BackgroundStage.module.css`
- `src/components/IntroScreen/IntroScreen.module.css`
- `src/components/ScoreBar/ScoreBar.tsx`
- `tests/e2e/quiz-stage.spec.ts`

## 3. Arquivos alterados

- `src/components/BackgroundStage/BackgroundStage.tsx`
- `src/components/BackgroundStage/BackgroundStage.module.css`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/IntroScreen/IntroScreen.module.css`
- `src/components/ScoreBar/ScoreBar.tsx`
- `tests/e2e/quiz-stage.spec.ts`
- `docs/sprint-2/harness-1/01_diagnostico_stage_assets.md`
- `docs/sprint-2/harness-1/02_pesquisa_visual_assets.md`
- `docs/sprint-2/harness-1/03_qa_visual_baseline.md`
- `docs/sprint-2/harness-1/04_background_director.md`
- `docs/sprint-2/harness-1/05_refinamento_stage_estados_visuais.md`
- `docs/sprint-2/harness-1/06_relatorio_final_harness_1.md`

## 4. Decisoes visuais

- A Stage usa `BackgroundStage` como diretor visual por `phase`.
- A transicao entre fundos e feita com camadas absolutas e `opacity`.
- O blackout e sutil e nao captura eventos.
- `prefers-reduced-motion: reduce` reduz a transicao para 1ms.
- O video legado do martelo foi preservado como cue visual existente.

## 5. Uso do Fundo 1

`bg-FNL1.png` e usado como camada base da Stage nos estados `intro` e `idle`.

## 6. Uso do Fundo 2 placeholder

`bg-FNL2.png` e usado nas fases de jogo, incluindo rodada preparada, pergunta revelada, botao de vez liberado, grupo com a vez, tempo esgotado e game over.

Ele esta documentado como placeholder estrutural temporario, nao como arte final.

## 7. Screenshots gerados

- `docs/sprint-2/harness-1/screenshots/baseline-stage-1920x1080.png`
- `docs/sprint-2/harness-1/screenshots/baseline-stage-1366x768.png`
- `docs/sprint-2/harness-1/screenshots/final-idle-bg-fnl1-1920x1080.png`
- `docs/sprint-2/harness-1/screenshots/final-game-bg-fnl2-1920x1080.png`
- `docs/sprint-2/harness-1/screenshots/final-stage-1366x768.png`
- `docs/sprint-2/harness-1/screenshots/final-game-over-bg-fnl2-1920x1080.png`

## 8. Testes rodados

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou, 5 arquivos e 14 testes.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: passou, 10 testes.

## 9. Bugs encontrados

- `ScoreBar` renderizava apenas numeros, mas os testes e a Stage esperavam `PTS`. Corrigido em `ScoreBar.tsx`.
- O primeiro E2E do background lia a opacidade antes do fim do crossfade. Corrigido com espera explicita pela opacidade final.

## 10. Pendencias

- `bg-FNL2.png` deve ser substituido pela arte final do Fundo 2 em fatia futura.
- `gstack*` CLI nao apareceu no PATH durante a verificacao; validacao foi feita com RTK e Playwright.
- Refinamento fino de pergunta longa e cards em 1366x768 deve seguir em fatia propria, se o conteudo real trouxer textos maiores.

## 11. Proxima fatia recomendada

Harness 2: refinar estados visuais de pergunta, botao de vez, grupo com a vez e tempo esgotado usando conteudo real ou amostras representativas.
