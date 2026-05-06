# 34 - Sprint 2: Backlog de Refinamento e Animações

## 1. Objetivo do Sprint 2

Refinar experiência, animações, UX, conteúdo e estabilidade operacional.

## 2. O que NÃO fazer no Sprint 2

- Não trocar arquitetura inteira.
- Não recomeçar layout.
- Não mexer no Arduino sem bug.
- Não criar backend se BroadcastChannel ainda resolve.
- Não poluir visual.
- Não quebrar stage/admin.
- Não remover o legado ou backup.
- Não instalar dependências sem motivo concreto.
- Não alterar mapeamento A/B sem nova validação física.
- Não transformar login local em promessa de segurança real.

## 3. Épicos do Sprint 2

### Épico 1 - Refinamento visual da Stage

- pergunta central;
- hierarquia;
- contraste;
- animações de entrada;
- polimento dos cards;
- barra de pontos;
- ampulheta;
- game_over.

### Épico 2 - Animações do fluxo

- intro;
- início de round;
- martelo no vídeo;
- pergunta aparecendo após cue;
- buzz recebido;
- lock do adversário;
- pontuação;
- reset de round;
- transição round 1 para 5;
- tela final.

### Épico 3 - Admin UX

- botões mais claros;
- modo operação;
- logs filtráveis;
- estado atual mais legível;
- bloqueios contra clique errado;
- confirmação para reset jogo.

### Épico 4 - Conteúdo real do quiz

- banco local de perguntas/personagens;
- 5 perguntas;
- respostas;
- opções;
- dificuldade;
- imagem/personagem, se existir;
- modo fallback se faltar asset.

### Épico 5 - Áudio e feedback físico

- DFPlayer pendente;
- sons web;
- volume;
- som de acerto/erro;
- teste com buzzer fallback;
- feedback visual quando áudio físico falhar.

### Épico 6 - Robustez de feira

- checklist de operação;
- modo tela cheia;
- reconexão Arduino;
- aviso de COM errada;
- fallback teclado;
- reset seguro;
- teste antes da apresentação.

## 4. Fatias recomendadas do Sprint 2

1. Revisar visual da Stage sem mexer em lógica.
   - Objetivo: melhorar pergunta, HUD de rodada, timer, game_over e contraste.
   - Arquivos prováveis: `QuizStage`, `QuestionPanel`, `HourglassTimer`, `ScoreBar`, CSS modules.
   - Critérios de aceite: sem mudança de store/protocolo; screenshots 1920x1080, 1600x900, 1366x768, 900x900 sem overflow.
   - Testes: typecheck, lint, build, e2e.

2. Refinar animação pergunta/timer/buzz.
   - Objetivo: tornar cue visual coerente com martelo/video e buzz.
   - Arquivos prováveis: `useBackgroundCue`, `QuizStage`, `QuestionPanel`, `GroupCard`, CSS modules.
   - Critérios de aceite: pergunta aparece no momento certo; status dos cards muda com transição clara; respeita reduced motion.
   - Testes: unit se houver helpers, e2e visual e screenshots.

3. Melhorar Admin UX.
   - Objetivo: reduzir erro operacional.
   - Arquivos prováveis: `AdminPage.tsx`, `AdminPage.module.css`.
   - Critérios de aceite: controles agrupados por fluxo, reset jogo com confirmação, status serial mais legível.
   - Testes: e2e login, controles principais e realtime.

4. Criar banco local de perguntas.
   - Objetivo: substituir placeholder por dados reais locais.
   - Arquivos prováveis: `src/data/questions.ts`, `game.types.ts`, `gameStore.ts`.
   - Critérios de aceite: 5 perguntas versionadas, sem depender de rede, fallback se asset faltar.
   - Testes: unit para seleção por round e build.

5. Integrar conteúdo real de 5 rounds.
   - Objetivo: cada round mostrar pergunta/conteúdo correto.
   - Arquivos prováveis: store, QuestionPanel, AdminPage, testes.
   - Critérios de aceite: round 1 a 5 exibem perguntas diferentes e terminam em game_over.
   - Testes: unit store e e2e fluxo completo.

6. Refinar game over/vencedor.
   - Objetivo: mostrar vencedor e placar final com clareza.
   - Arquivos prováveis: QuizStage, ScoreBar, store.
   - Critérios de aceite: empate tratado, vencedor destacado, sem quebrar Stage.
   - Testes: unit de cálculo e e2e.

7. Checklist de apresentação.
   - Objetivo: documentar operação real da feira.
   - Arquivos prováveis: `docs/ai-harness/*`.
   - Critérios de aceite: passos de ligar, conectar COM6, testar PING, fallback e contingência.
   - Testes: manual assistido.

8. QA final em TV/resolução real.
   - Objetivo: validar ambiente físico final.
   - Arquivos prováveis: docs e screenshots.
   - Critérios de aceite: TV alvo sem overflow, Arduino real confirmado, operador consegue executar.
   - Testes: Playwright + teste físico.

## 5. Prioridade recomendada

- P0 obrigatório:
  - Revisar visual da Stage sem mexer em lógica.
  - Checklist de apresentação.
  - Validar Arduino real com resultados escritos.
  - Conteúdo real das 5 perguntas.

- P1 importante:
  - Refinar animações de pergunta/timer/buzz.
  - Melhorar Admin UX.
  - Refinar game_over/vencedor.
  - Feedback de falha do áudio/DFPlayer.

- P2 desejável:
  - Logs filtráveis.
  - Modo tela cheia assistido.
  - Persistência local de sessão.
  - Backend ou realtime multi-dispositivo.

## 6. Veredito

A primeira fatia deve ser **Revisar visual da Stage sem mexer em lógica**.

Motivo: a lógica do Sprint 1 está testada e deve ficar congelada. O maior risco percebido para Sprint 2 é visual/UX: pergunta, animações, timer e game_over ainda parecem MVP. Refinar a Stage primeiro melhora a apresentação sem tocar em Arduino, store ou realtime, reduzindo risco de regressão.
