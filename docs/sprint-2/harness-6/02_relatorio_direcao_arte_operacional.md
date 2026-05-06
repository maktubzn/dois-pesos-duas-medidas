# Harness 6 - Relatorio de direcao de arte operacional

Data: 2026-05-05

## O que foi confirmado

- O Admin ainda precisava de mudanca estrutural: estava branco, mas seguia parecendo blocos empilhados com acoes e dados misturados.
- O Tribunal ainda usava contrato de 10 segundos no store, no texto publico e em testes.
- Os slots dos cards mostravam numero grande e tambem `Jogador 1`, gerando duplicacao visual.
- O pre-show estava fluido, mas a leitura das regras ainda era curta para plateia e TV com ruido.
- O Final Show tinha o card vencedor, mas ainda carregava frase de encerramento fraca.

## Admin redesenhado

- Criada a estrutura visual com `AdminShell`, `AdminSidebar`, `AdminTopStatusBar`, `AdminMainAction`, `AdminStagePreview`, `AdminOperationPanel`, `AdminDecisionPanel` e `AdminTechnicalDrawer`.
- Sidebar esquerda grafite com modos: Operacao, Pre-show, Partida, Tribunal, Historico e Tecnico.
- Topbar clara com estado, proxima acao, audio e Stage.
- Area central com acao principal e painel operacional.
- Coluna lateral com preview Stage, dados da partida e decisao/gabarito.
- Tecnico/Avancado continua recolhido por padrao; `RESET_HW` nao aparece na operacao principal.
- Duplicacoes de alvos de teste/labels foram removidas: preview pesado nao e renderizado duas vezes e labels operacionais ficam unicos.

## Login Admin

- Mantido no contrato das referencias: fundo claro, formulario a esquerda, painel preto a direita e logo INFO no painel preto.
- Sem botoes sociais, sem video pesado e sem assets extras.

## Pre-show

- Timeline ajustada para leitura mais lenta: total passou para 55s.
- Ensino ficou com blocos maiores: primeira regra, pontuacao, erro, tribunal, teste da mesa e pronto.
- Volume da introducao/impacto subiu.
- Ducking da explicacao foi preservado em volume baixo.
- Nao houve alteracao na base de video persistente nem no fluxo aprovado do Harness 4.8.

## Tribunal

- Tempo oficial de decisao alterado para 20 segundos.
- Store, Stage, testes unitarios e testes visuais foram atualizados.
- Texto publico agora informa 20 segundos.
- `public/img/mesa-tribunal.png` continua sendo usado.

## Stage e cards

- Cards A/B receberam perspectiva mais sutil, sombra lateral e glow leve quando ativos.
- Slots mantem numero grande e agora o texto visual e apenas `JOGADOR`.
- O `aria-label` preserva o numero do jogador para acessibilidade.
- Tribunal teve ajustes de tamanho/linha para evitar overflow.

## Final Show

- Card vencedor ficou maior e mais protagonista.
- Texto reduzido e frase final trocada para: `Veredito registrado. A vitoria tem peso. O julgamento esta encerrado.`
- Placar e diferenca continuam visiveis.

## Bugs encontrados e corrigidos durante a validacao

- CSS do Admin tinha uma chave extra, gerando pagina branca no Playwright e falha de build.
- O novo Admin duplicou `aria-label="Operacao"`; corrigido para deixar apenas o painel operacional como alvo acessivel.
- O preview principal e o tecnico renderizavam `QuestionCard` duplicado; o tecnico agora mostra placeholder leve.
- Testes antigos ainda esperavam `Encerramento registrado` e Tribunal 10s; atualizados para o novo contrato.
- O teste de Final Show precisou de timeout maior porque agora a tela tem mais validacoes visuais.

## Arquivos principais alterados

- `src/components/Admin/AdminPage.tsx`
- `src/components/Admin/AdminPage.module.css`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`
- `src/components/GroupCard/GroupCard.tsx`
- `src/components/GroupCard/GroupCard.module.css`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/utils/preShowTimeline.ts`
- `src/audio/audioEvents.ts`
- `src/audio/audioEvents.test.ts`
- `tests/e2e/quiz-stage.spec.ts`
- `tests/e2e/visual/harness-4.9-admin-sequencia-countdown.spec.ts`
- `tests/e2e/visual/harness-6-direcao-arte-operacional.spec.ts`
- `playwright.visual.config.ts`

