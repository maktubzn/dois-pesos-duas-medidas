# Harness 2 - Plano e Decisoes do Pre-show

## 1. Objetivo

Criar uma abertura cinematografica antes do quiz, controlada pelo Admin, usando o Fundo 1 e terminando em estado pronto sem iniciar rodada automaticamente.

## 2. Estado atual usado como base

`/stage` renderiza `QuizStage`, recebe snapshots pelo BroadcastChannel e usa `BackgroundStage` por `phase`. `/admin` e a mesa operacional, publica snapshots do Zustand e mantem Web Serial restrito ao Admin. `phase === "intro"` ja usa Fundo 1.

## 3. Pesquisa tecnica resumida

Context7 confirmou que efeitos React com timers devem limpar `setTimeout`/`setInterval`, especialmente em StrictMode; assets de `public` no Vite devem ser referenciados por caminho absoluto; Playwright deve usar locators semanticos, asserts com auto-wait e viewports explicitos.

## 4. Decisao: GSAP/useGSAP ou CSS/React

Decisao: CSS/React. GSAP/useGSAP nao esta instalado e nao e necessario nesta fatia. O roteiro atual exige cenas temporizadas simples, progresso, pausa/retomada e `prefers-reduced-motion`, que CSS/React cobre com menos risco e sem nova dependencia.

## 5. Roteiro final do pre-show

1. Blackout / preparacao.
2. Apresentacao institucional da ETEC e turma.
3. Chamado do jogo com dois grupos, cinco rodadas e botao de vez.
4. Titulo "DOIS PESOS, DUAS MEDIDAS".
5. Estado pronto para o operador iniciar o quiz.

## 6. Arquivos provaveis

Store/tipos para estado do pre-show, `QuizStage` para trocar a intro por overlay, novo componente visual de pre-show, Admin para controles, CSS, testes E2E/unitarios e docs do harness.

## 7. Riscos

O principal risco e criar uma state machine paralela. A mitigacao e manter o pre-show dentro do snapshot existente, sem canal realtime novo e sem a Stage publicar comandos.

## 8. Criterios de aceite

Admin toca, pausa, retoma, pula, reinicia, finaliza e inicia quiz depois. Stage executa o pre-show com Fundo 1, sem controles publicos, sem iniciar quiz sozinha e sem texto publico com o termo antigo.

## 9. O que nao sera alterado

Arduino, `.ino`, BT1PRESS/BT2PRESS, Web Serial, mapeamento A/B, reset automatico, cinco rounds, conteudo real de perguntas, backend e timer automatico do jogo.
