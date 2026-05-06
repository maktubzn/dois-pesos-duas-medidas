# Harness 4.9 - Plano Admin, Sequencia, Countdown e RESET

## Escopo

Este harness corrige somente Admin, sequencia operacional do quiz, countdown, timers da partida, Tribunal/Julgamento visual-operacional e loop de RESET/RESET_HW.

Fora do escopo: pre-show 4.8, pontuacao 4.4, regra de pontuacao do Tribunal, Final Show, backend, banco de perguntas e Arduino `.ino`.

## Contrato de operacao

- Operador inicia cada rodada.
- Sistema executa countdown, revela pergunta e abre botao de vez.
- Janela para botao de vez: 20s.
- Depois do buzz: 10s para o grupo responder.
- Correto/errado permanece manual.
- Feedback publico: 3s.
- Depois do feedback: `round_end`, aguardando operador clicar Proxima rodada.
- Tribunal: 10s para Arriscar/Passar; expiracao conta como Passar.
- Dois passes: silencio nos autos, feedback de 3s e `round_end`.

## RESET / RESET_HW

- `RESET` recebido do Arduino e tratado como ACK/evento fisico, sem mudar fase.
- `RESET_HW` foi removido do fluxo automatico normal.
- `RESET_HW` fica restrito ao painel Tecnico, com confirmacao e debounce de 2s.
- Logs repetidos de RESET/ACK sao deduplicados em janela curta.
- Nao existe envio de `RESET_HW` em resposta a `RESET`.

## Admin

- Admin branco/preto como padrao visual.
- Operacao e o modo principal.
- Tecnico/Logs ficam recolhidos em `<details>`.
- CTA principal contextual por fase.
- Dados da partida ficam separados dos botoes.
- Acoes perigosas ficam no painel tecnico ou com confirmacao.

## Validacao planejada

- Unitarios de store para countdown, timers, feedback, Tribunal e RESET.
- E2E real com Admin e Stage.
- Visual 4.9 com evidencias em `docs/sprint-2/harness-4.9/evidencias/`.
- Arduino virtual self-test.
