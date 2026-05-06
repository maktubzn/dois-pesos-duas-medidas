# Checklist de Ensaio Fisico - Harness 9

## Antes de abrir para o publico

- [ ] Usar Chrome ou Edge.
- [ ] Abrir `/admin`.
- [ ] Abrir `/stage`.
- [ ] Colocar Stage em tela cheia na TV/projetor.
- [ ] Fazer login no Admin.
- [ ] Conectar Arduino na porta correta pelo Admin.
- [ ] Confirmar status de conexao.
- [ ] Testar `PING/PONG`, se disponivel.

## Teste de mesas

- [ ] Rodar pre-show ate o texto antes do teste das mesas.
- [ ] Confirmar que o teste A/B so aparece depois da explicacao.
- [ ] Apertar botao fisico Mesa A.
- [ ] Confirmar que Admin mostra Mesa A.
- [ ] Confirmar que Stage mostra Mesa A.
- [ ] Apertar botao fisico Mesa B.
- [ ] Confirmar que Admin mostra Mesa B.
- [ ] Confirmar que Stage mostra Mesa B.
- [ ] Se inverter, registrar evento bruto (`BT1PRESS`/`BT2PRESS`) e usar fallback Mesa A/B no Admin.

## Teste de proxima rodada

- [ ] Clicar `Proxima rodada`.
- [ ] Confirmar log `ROUND_NEXT_CLICKED`.
- [ ] Confirmar log `HARDWARE_RESET_REQUESTED` e `ROUND_HARDWARE_PREPARE_*`.
- [ ] Confirmar que o placar nao zerou.
- [ ] Confirmar que countdown comeca.
- [ ] Confirmar que nao trava em 1s.
- [ ] Confirmar que pergunta so aparece quando input esta pronto.

## Teste de pontuacao

- [ ] Round 1: Mesa A pega a vez, responde correto e pontua +10.
- [ ] Resetar ou iniciar nova partida.
- [ ] Round 1: Mesa B pega a vez, responde correto e pontua +10.
- [ ] Confirmar Admin e Stage com o mesmo placar.

## Teste de silencio

- [ ] Mesa A pega vez e nao responde por 20s.
- [ ] Confirmar A -10 e B +10.
- [ ] Confirmar log `NO_ANSWER_PENALTY_APPLIED`.
- [ ] Mesa B pega vez e nao responde por 20s.
- [ ] Confirmar B -10 e A +10.
- [ ] Confirmar que a penalidade nao duplica.

## Fallback

- [ ] Desconectar ou ignorar Arduino.
- [ ] Testar botao Admin Mesa A.
- [ ] Testar botao Admin Mesa B.
- [ ] Confirmar que o jogo continua funcionando.
- [ ] Confirmar que o pre-show A/B nao pontua e nao inicia quiz.

## Partida completa

- [ ] Rodar pelo menos 5 rodadas.
- [ ] Confirmar countdown, botao de vez, acerto e erro.
- [ ] Confirmar `game_over`.
- [ ] Confirmar vencedor.
- [ ] Confirmar reset/reinicio somente quando operador pedir.

## Plano de contingencia

- [ ] Se Arduino falhar, usar fallback Mesa A/B no Admin.
- [ ] Se audio falhar, continuar sem audio.
- [ ] Se pre-show travar, pular abertura/explicacao e iniciar quiz.
- [ ] Se Stage travar, recarregar `/stage`; Admin continua sendo a mesa de controle.
- [ ] Se Mesa A/B fisica inverter, operar pelo fallback e revisar fiacao/serial depois.
