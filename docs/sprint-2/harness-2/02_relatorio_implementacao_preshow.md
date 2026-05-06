# Harness 2 - Relatorio de Implementacao do Pre-show

## 1. Arquivos alterados

- `src/types/game.types.ts`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/utils/preShowTimeline.ts`
- `src/components/PreShowScreen/PreShowScreen.tsx`
- `src/components/PreShowScreen/PreShowScreen.module.css`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`
- `src/components/Admin/AdminPage.tsx`
- `tests/e2e/quiz-stage.spec.ts`

## 2. Comandos/acoes criadas

Foram criadas acoes de store para tocar, pausar, retomar, pular, reiniciar, finalizar e avançar o relogio interno do pre-show.

## 3. Como o Admin controla

O Admin tem um painel `Pre-show` com status, progresso e botoes dedicados. Enquanto o status esta `playing`, o Admin incrementa o progresso em intervalos limpos no cleanup do React.

## 4. Como a Stage executa

A Stage le `preShowStatus` e `preShowElapsedMs` do snapshot recebido. Ela mostra `PreShowScreen` quando `phase === "intro"` e oculta a UI do jogo, mantendo Fundo 1 pelo `BackgroundStage`.

## 5. Como o roteiro foi implementado

O roteiro fica em `preShowTimeline.ts`, com cenas temporizadas para preparacao, ETEC/turma, chamado do jogo, titulo e pronto para iniciar.

## 6. Como cleanup/motion foi tratado

Timers do Admin usam `useEffect` com `clearInterval`. A animacao visual e CSS, com `prefers-reduced-motion` desativando transicoes relevantes.

## 7. O que foi preservado

Arduino, Web Serial, BroadcastChannel existente, mapeamento A/B, reset automatico, fluxo de 5 rounds e cue visual legado do martelo.

## 8. Limites e pendencias

Nao foi criado sistema completo de audio, timer automatico do jogo, backend ou conteudo real de perguntas. O pre-show depende do Admin aberto para progressao automatica, mantendo o Admin como fonte operacional.
