# 30 - Proxima Fatia Recomendada

## Fatia recomendada

Validacao fisica assistida do Admin com Arduino real.

## Passos

1. Abrir `/admin`.
2. Login com `admin123` / `121212`.
3. Clicar em `Conectar Arduino`.
4. Selecionar COM6 no chooser nativo.
5. Enviar `PING` e confirmar `PONG`.
6. Iniciar quiz.
7. Abrir buzz e pressionar botao azul: deve dar palavra ao Grupo A.
8. Resetar, abrir buzz e pressionar botao vermelho: deve dar palavra ao Grupo B.
9. Pontuar/errar e confirmar `RESET_HW` automatico no log.

## Depois

Se a validacao fisica passar, a proxima fatia tecnica pode ser:
- backend realtime local com persistencia;
- editor de perguntas no Admin;
- configuracao visual dos jogadores por rodada;
- telemetria serial mais detalhada.
