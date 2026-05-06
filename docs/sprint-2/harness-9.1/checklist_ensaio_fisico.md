# Checklist de Ensaio Fisico - Harness 9.1

## Antes de abrir

- [ ] Rodar `iniciar-jogo.bat` na raiz.
- [ ] Abrir `/admin`.
- [ ] Abrir `/stage` na TV.
- [ ] Clicar `Ativar audio da TV` na Stage.
- [ ] Conferir volume publico no Admin.

## Arduino e mesa

- [ ] Conectar Arduino pelo Admin.
- [ ] Confirmar status `Arduino conectado`.
- [ ] Clicar `Resetar mesa fisica`.
- [ ] Confirmar log `MANUAL_ARDUINO_RESET_REQUESTED`.
- [ ] Confirmar `RESET_HW`, `LOCK` quando aplicavel e `STATUS`.

## Pre-show

- [ ] Iniciar pre-show.
- [ ] Chegar na explicacao antes do teste das mesas.
- [ ] Clicar `Testar mesa`.
- [ ] Pressionar Mesa A.
- [ ] Confirmar Mesa A reconhecida.
- [ ] Confirmar log de reset/preparo depois da Mesa A.
- [ ] Pressionar Mesa B.
- [ ] Confirmar Mesa B reconhecida.
- [ ] Confirmar que placar continua `0 x 0`.
- [ ] Confirmar que quiz nao iniciou sozinho.

## Primeira rodada

- [ ] Avancar para pronto.
- [ ] Iniciar quiz.
- [ ] Iniciar rodada 1.
- [ ] Aguardar countdown ou pular countdown.
- [ ] Pressionar botao azul.
- [ ] Confirmar grupo correto no Admin e Stage.
- [ ] Marcar correto.
- [ ] Confirmar pontuacao desde round 1.

## Audio

- [ ] Com Stage desbloqueada, pressionar botao de vez.
- [ ] Confirmar som curto de buzzer.
- [ ] Confirmar que input rejeitado nao toca som.
- [ ] Confirmar que o som nao duplica.

## Visual

- [ ] Cards mostram brasao novo do Grupo A.
- [ ] Cards mostram brasao novo do Grupo B.
- [ ] Perguntas mostram personagens do banco novo.
- [ ] Admin mostra nome do personagem e referencia correta.
- [ ] Stage nao mostra gabarito.

## Tribunal

- [ ] Entrar em Desafio do Tribunal.
- [ ] Confirmar modal full-screen preto.
- [ ] Confirmar grupo chamado claro.
- [ ] Confirmar tempo grande visivel.
- [ ] Confirmar ausencia de gabarito na Stage.

## Contingencia

- [ ] Se Arduino travar, clicar `Resetar mesa fisica`.
- [ ] Se continuar falhando, operar por fallback Mesa A/B no Admin.
- [ ] Registrar falha no log e seguir sem reiniciar partida.

## Fechamento

- [ ] Jogar uma partida completa.
- [ ] Exportar CSV da partida.
- [ ] Exportar CSV de eventos.
- [ ] Conferir Final Show.
