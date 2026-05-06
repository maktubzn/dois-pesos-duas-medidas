# Harness 4.7 - Relatorio de Correcao Real

## Problemas confirmados

- Pre-show desmontava o video e trocava para outra composicao nas cenas de briefing/teste.
- Stage montava UI pesada do quiz durante `phase === "intro"`, disparando assets que nao pertenciam ao pre-show.
- Timers eram baseados em timestamp, mas usavam `performance.now()`, que nao e comparavel entre janelas.
- Admin exibiva muitos blocos simultaneos no modo de operacao.
- Final Show era uma composicao estatica e o gate de audio poluia a cena.
- Nao havia automacao unica externa/removivel para operador profissional.

## O que foi refeito

- `PreShowScreen` agora mantem o video como base em todas as cenas de pre-show apos o blackout e segura o frame final.
- `preShowTimeline` foi reduzida para 42s, com mensagens mais curtas.
- `QuizStage` desmonta a interface de quiz durante intro e deriva exibicao local de pre-show/countdown/timer.
- `gameStore` usa `Date.now()` como clock comum entre Admin e Stage.
- `AdminPage` ganhou area Operacao focada e recolheu o grid tecnico em `Tecnico / Avancado`.
- `QuizStage` ganhou Final Show com blackout, entrada, placar e sentenca, escondendo o gate de audio durante a cena.
- `automacao/operador-profissional.spec.ts` foi criada como automacao removivel.
- `AdminPage` passou a oferecer avanco claro depois de resposta errada com bonus ao adversario, sem prender o operador em `answer_locked`.

## Arquivos principais

- `src/components/PreShowScreen/PreShowScreen.tsx`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/Admin/AdminPage.tsx`
- `src/store/gameStore.ts`
- `tests/e2e/visual/harness-4.6.visual.spec.ts`
- `automacao/operador-profissional.spec.ts`

## Resultado final

- Pre-show: video persistente durante intro, frame final segurado, overlays em cima do video e timeline de 42s.
- Timers: Stage deriva exibicao por `Date.now()` local e os testes visuais validam queda por tempo real.
- Admin: Operacao virou fluxo principal, Tecnico/Avancado ficou recolhido e respostas continuam manuais.
- Loading/assets: UI pesada do quiz nao monta na intro; assets de quiz entram apenas depois do quiz.
- Final Show: cena publica em sequencia com blackout, brasao, vencedor, placar, sentenca e repouso.
- Automacao: `rtk npm run automacao:operador` passou com quatro jogos reais usando Admin e Stage.
