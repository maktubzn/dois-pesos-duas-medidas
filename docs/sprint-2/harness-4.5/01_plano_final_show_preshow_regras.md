# Harness 4.5 - Plano Final Show e Pre-show

## Objetivo

Criar o Final Show publico na Stage e atualizar o briefing do pre-show com a regra competitiva estabilizada no Harness 4.4.

## Decisoes

- Manter `phase: "game_over"` como estado principal de fim de jogo.
- Adicionar apenas `finalShowStatus` para abrir, repetir e fechar a apresentacao final.
- Nao criar nova musica, backend, API ou alteracao no Arduino `.ino`.
- Preservar Veredito Final, Desafio do Tribunal, BroadcastChannel e audio publico Stage-only.

## Implementacao planejada

- Stage exibe vencedor, brasao original, placar final, diferenca de pontos e sentenca final.
- Admin ganha painel Final Show com abrir, repetir, encerrar e reiniciar partida.
- Pre-show atualiza somente a cena `how_to_play`, com cards curtos sobre +10, bonus +5, Tribunal +20/-10 e silencio nos autos.
- Testes cobrem estado, UI publica, controles Admin, regressao 4.4 e overflow.
