# Harness 3.1 - Relatorio de implementacao

## Banco de perguntas

Foi criado `src/data/questionBank.ts` com:

- `characterImageQuestions`: personagens vinculados a imagens reais de `public/img das perguntas`;
- `textChoiceQuestions`: perguntas A/B para rounds 9 e 10;
- `tieBreakerQuestions`: perguntas A/B de morte subita;
- `makeQuestionImageSrc()`: helper que monta `/img das perguntas/<arquivo>` com `encodeURI`.

O conteudo foi estruturado com id, tipo, prompt, dificuldade, tags, resposta correta e pontuacao quando aplicavel.

## Algoritmo do quiz

Foi criado `src/utils/quizAlgorithm.ts` com:

- seed da partida;
- PRNG simples a partir de hash da seed;
- Fisher-Yates seeded;
- selecao de 8 perguntas de imagem;
- selecao de 2 perguntas textuais A/B;
- ciclo de perguntas de desempate;
- validacao basica do banco.

O store cria uma `QuizSession` no `startQuiz()`, guarda `matchId`, `quizSeed`, round atual, pergunta atual e modo (`main` ou `tie_breaker`).

## Store e fluxo

O `gameStore` agora controla:

- 10 rounds principais;
- pergunta atual estruturada;
- selecao A/B no Admin;
- confirmacao A/B com correcao automatica;
- Veredito Final quando o placar empata apos o round 10;
- vencedor por pontos ou por desempate;
- historico de eventos;
- limpeza de historico local.

O timer do Harness 3 foi preservado. No Veredito Final, tempo esgotado carrega outra pergunta de desempate em vez de encerrar empatado.

## Stage

Foi criado `src/components/QuestionCard/QuestionCard.tsx`.

O card e volatil por dentro e fixo por fora:

- modo imagem: mostra prompt publico e imagem do personagem;
- modo A/B: mostra prompt e alternativas;
- modo Veredito Final: mostra prompt e alternativas;
- nunca mostra resposta correta na TV.

`QuestionPanel` passou a receber `currentRoundQuestion` e renderizar o `QuestionCard`. `QuizStage` mostra vencedor real vindo do store, inclusive no Veredito Final.

## Admin

`AdminPage` recebeu:

- preview read-only da TV;
- painel de resposta contextual;
- resposta correta visivel apenas para operador;
- alias de personagem no modo imagem;
- escolha A/B com botao de confirmacao;
- historico local;
- exportacao CSV;
- limpeza de historico com `window.confirm`.

O fluxo manual correto/errado fica para perguntas de imagem. O fluxo A/B exige grupo com a vez, escolha do operador e confirmacao.

## Historico e CSV

Foi criado `src/utils/historyStorage.ts` com:

- load/save/clear em localStorage;
- limite de 500 eventos persistidos;
- conversao para CSV;
- download via Blob;
- revoke do object URL.

Eventos registrados incluem inicio de partida, inicio de round, acerto, erro, tempo esgotado, inicio de desempate e vencedor.

## Testes adicionados

Foram adicionados testes unitarios para:

- algoritmo de quiz;
- validacao do banco;
- CSV e escaping;
- 10 rounds;
- A/B automatico;
- Veredito Final sem empate.

E2E foi atualizado para Harness 3.1 e gera screenshots em `docs/sprint-2/harness-3.1/screenshots/`.
