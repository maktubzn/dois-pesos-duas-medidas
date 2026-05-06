# Harness 4.6 - Diagnostico de estabilizacao

## Contratos lidos

- Harness 4.2: pre-show interativo isolado em `intro`, teste da mesa sem iniciar quiz.
- Harness 4.3: audio publico somente na Stage, Admin controla mute/volume e ajuda operacional.
- Harness 4.4: pontuacao competitiva e Desafio do Tribunal preservados.
- Harness 4.5: `game_over` com `finalShowStatus` e Final Show publico.

## Problemas reais encontrados

1. Timers eram dirigidos por decremento/incremento via `setInterval`.
   - `timerRemaining`, `preShowElapsedMs` e `roundIntroRemainingMs` dependiam da estabilidade do intervalo.
   - Se a aba travasse, o texto podia pular ou atrasar.

2. Countdown automatico usava `setInterval` e `setTimeout` separados.
   - O timeout de fim podia divergir do valor mostrado se o navegador atrasasse ticks.

3. Pre-show explicativo estava verboso para TV.
   - A cena `how_to_play` tinha sete linhas, com altura alta e risco visual em 1366x768.
   - A barra de progresso animava `width`, gerando mais trabalho de layout.

4. Admin estava denso demais para operacao ao vivo.
   - Muitos botoes tinham o mesmo peso visual.
   - Faltava uma acao primaria contextual no topo.

5. Final Show funcionava, mas podia ter mais impacto.
   - Sentenca longa e brasao menor reduziam presenca de encerramento.

6. Playwright validava existencia, mas nao criava evidencia visual dedicada por fluxo.

## Causa provavel

- O sistema evoluiu por harnesses incrementais e manteve timers simples como fonte de verdade.
- A tela do Admin acumulou paineis funcionais sem hierarquia operacional.
- A validacao visual estava misturada com E2E funcional.
