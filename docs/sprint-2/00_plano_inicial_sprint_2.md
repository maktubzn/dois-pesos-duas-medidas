# Sprint 2 - Plano Inicial

## 1. Objetivo do Sprint 2

Refinar experiencia, animacoes, UX, conteudo real do quiz e estabilidade operacional, sem reabrir arquitetura que ja funciona no Sprint 1.

## 2. O que NAO fazer no Sprint 2

- Nao trocar arquitetura inteira.
- Nao recomecar layout.
- Nao mexer no Arduino sem bug real.
- Nao criar backend se BroadcastChannel ainda resolve.
- Nao poluir visual.
- Nao quebrar Stage/Admin.
- Nao implementar coisa fora do fluxo do quiz.
- Nao instalar dependencia sem motivo tecnico concreto.
- Nao alterar mapeamento A/B sem nova validacao fisica.
- Nao vender login local como seguranca real.

## 3. Escopo do Sprint 2

O Sprint 2 sera focado em:

- refinamento visual da Stage;
- animacoes;
- card/painel de pergunta real;
- feedback de botão de vez;
- timer/ampulheta;
- tela de game over/vencedor;
- UX do Admin;
- conteudo real de 5 rounds;
- pequenas logicas necessarias para operacao;
- checklist de apresentacao.

## 4. Epicos do Sprint 2

### Epico 1 - Refinamento visual da Stage

- pergunta central;
- hierarquia;
- contraste;
- polimento de cards;
- barra de pontos;
- ampulheta;
- `game_over`.

### Epico 2 - Animacoes do fluxo

- intro;
- inicio de round;
- martelo no video;
- pergunta aparecendo apos cue;
- botão de vez acionado;
- lock do adversario;
- pontuacao;
- reset de round;
- transicao round 1 para 5;
- tela final.

### Epico 3 - Admin UX

- botoes mais claros;
- modo operacao;
- logs filtraveis;
- estado atual mais legivel;
- bloqueios contra clique errado;
- confirmacao para reset jogo.

### Epico 4 - Conteudo real do quiz

- banco local de perguntas/personagens;
- 5 perguntas;
- respostas;
- opcoes;
- dificuldade;
- imagem/personagem, se existir;
- modo fallback se faltar asset.

### Epico 5 - Audio e feedback fisico

- DFPlayer pendente, se ainda estiver;
- sons web;
- volume;
- som de acerto/erro;
- feedback visual quando audio fisico falhar.

### Epico 6 - Robustez de feira

- checklist de operacao;
- modo tela cheia;
- reconexao Arduino;
- aviso de COM errada;
- fallback teclado;
- reset seguro;
- teste antes da apresentacao.

## 5. Fatias recomendadas

### 1. Revisar visual da Stage sem mexer em logica

- Objetivo: melhorar pergunta, hierarquia, contraste, timer, cards, ScoreBar e game over mantendo store/protocolo congelados.
- Arquivos provaveis: `src/components/QuizStage/*`, `src/components/QuestionPanel/*`, `src/components/HourglassTimer/*`, `src/components/ScoreBar/*`, CSS modules.
- Criterios de aceite: nenhuma mudanca de Web Serial, BroadcastChannel, Arduino ou mapeamento A/B; screenshots em viewports principais sem overflow.
- Testes: typecheck, lint, build e Playwright.

### 2. Refinar animacao pergunta/timer/botão de vez

- Objetivo: tornar cue do martelo, reveal da pergunta, botão de vez e bloqueio visualmente claros.
- Arquivos provaveis: `useBackgroundCue`, `QuizStage`, `QuestionPanel`, `GroupCard`, CSS modules.
- Criterios de aceite: pergunta aparece no momento correto; status de cards e timer nao ficam ambiguis; respeita reduced motion.
- Testes: unit se houver helper novo, E2E e screenshots.

### 3. Melhorar Admin UX

- Objetivo: reduzir erro operacional.
- Arquivos provaveis: `src/components/Admin/AdminPage.tsx`, `AdminPage.module.css`.
- Criterios de aceite: controles agrupados por fluxo, reset jogo com confirmacao, status serial mais legivel, botoes perigosos protegidos.
- Testes: E2E login, controles principais e realtime.

### 4. Criar banco local de perguntas

- Objetivo: substituir placeholder por dados reais versionados localmente.
- Arquivos provaveis: `src/data/questions.ts`, `src/types/game.types.ts`, `src/store/gameStore.ts`.
- Criterios de aceite: 5 perguntas reais, sem rede, fallback se asset faltar.
- Testes: unit para selecao por round e build.

### 5. Integrar conteudo real de 5 rounds

- Objetivo: cada round exibir conteudo correto.
- Arquivos provaveis: store, `QuestionPanel`, `AdminPage`, testes.
- Criterios de aceite: rounds 1 a 5 exibem perguntas diferentes e terminam em `game_over`.
- Testes: unit store e E2E fluxo completo.

### 6. Refinar game over/vencedor

- Objetivo: mostrar vencedor, empate e placar final com clareza.
- Arquivos provaveis: `QuizStage`, `ScoreBar`, store se necessario.
- Criterios de aceite: vencedor destacado, empate tratado, sem quebrar fluxo Admin/Stage.
- Testes: unit de calculo e E2E.

### 7. Checklist de apresentacao

- Objetivo: documentar operacao real da feira.
- Arquivos provaveis: `docs/sprint-2/*`.
- Criterios de aceite: passos de ligar, abrir Stage/Admin, conectar COM, testar PING, testar botoes, fallback e contingencia.
- Testes: manual assistido.

### 8. QA final em TV/resolucao real

- Objetivo: validar ambiente fisico final.
- Arquivos provaveis: docs, screenshots e relatorio QA.
- Criterios de aceite: TV alvo sem overflow, Arduino real confirmado, operador consegue executar o fluxo.
- Testes: Playwright + teste fisico.

## 6. Primeira fatia recomendada

A primeira fatia deve ser: Revisar visual da Stage sem mexer em logica.

Motivo: a logica central do Sprint 1 ja esta documentada e testada. O maior risco imediato para apresentacao e visual/UX: pergunta, timer, animacoes, status de botão de vez e game over ainda parecem MVP. Comecar pela Stage melhora a experiencia publica sem tocar em Arduino, store, realtime ou mapeamento A/B.
