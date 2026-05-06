# Harness 4.5 - Validacao

## Comandos obrigatorios

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos e 74 testes.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 22 testes.
- `rtk npm run arduino:virtual:self-test` - passou.

## Cobertura esperada

- Final Show aparece apos `game_over`.
- Vencedor, placar e diferenca aparecem corretamente.
- Admin abre, repete, encerra e reinicia a partir do Final Show.
- Pre-show explica a regra 4.4 sem reconstruir a entrada.
- Veredito Final, Desafio do Tribunal, audio Stage-only, mute/volume e BroadcastChannel seguem preservados.
- Stage sem overflow em 1920x1080 e 1366x768.

## Resultado

- Final Show aparece apos `game_over`.
- Vencedor, placar e diferenca aparecem corretamente.
- Admin abre, repete, encerra e reinicia a partir do Final Show.
- Pre-show explica a regra 4.4 sem reconstruir a entrada.
- Veredito Final continua separado e resolve vencedor antes do Final Show.
- Desafio do Tribunal 4.4 continua funcionando.
- Audio Stage-only, mute/volume e BroadcastChannel seguem preservados.
- Stage foi validada sem overflow em 1920x1080 e 1366x768 dentro do E2E.
