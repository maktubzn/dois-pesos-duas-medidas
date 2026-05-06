# Harness 1 - Diagnostico Stage e Assets

## Arquivos lidos

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
- `src/components/IntroScreen/IntroScreen.tsx`
- `src/components/IntroScreen/IntroScreen.module.css`
- `src/components/ScoreBar/ScoreBar.tsx`
- `src/components/GroupCard/GroupCard.tsx`
- `src/components/QuestionPanel/QuestionPanel.tsx`
- `src/types/game.types.ts`
- `tests/e2e/quiz-stage.spec.ts`

## Estrutura atual da Stage

A rota `/stage` renderiza `QuizStage`, que lê estado do `useGameStore` e aplica:

- `BackgroundStage` para fundo estático e vídeo legado do martelo.
- `ScoreBar`, `GroupCard`, `QuestionPanel` e `HourglassTimer` como UI pública.
- `IntroScreen` sobre a Stage enquanto `phase === "intro"`.
- `useStageRealtime` apenas para receber snapshots do Admin.

## Assets encontrados

- `public/img/bg-FNL1.png`: presente, fundo oficial de espera/idle/pré-show.
- `public/img/bg-FNL2.png`: presente, fundo temporário de jogo e placeholder estrutural do Fundo 2.
- O fundo legado atual ainda usa `/img/01-background.png`.
- O vídeo legado atual ainda usa `/img/BGVIDEO.mp4` como cue visual.

## Riscos

- A intro antiga tinha fundo escuro próprio e escondia qualquer fundo oficial atrás dela.
- A Stage não tinha mapeamento visual por fase para escolher Fundo 1 ou Fundo 2.
- Em 1366x768, a pergunta, os cards e a barra competem por espaço no centro.
- O termo antigo `buzz` não aparece como texto visível na Stage, mas permanece em código interno e testes negativos.

## Decisão

Usar `BackgroundStage` como diretor visual, sem criar sistema paralelo. O Fundo 1 será exibido nas fases de espera/intro/idle. O Fundo 2 será exibido nas fases de jogo e documentado como placeholder estrutural temporário.
