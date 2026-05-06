# Harness 4.1 - Validação de Áudio Mínimo

## Escopo validado

- `AudioManager` central criado.
- Manifest mínimo com 13 sons.
- Bridge único no Admin para sincronizar estado do jogo e áudio.
- Controles discretos no Admin.
- Fallback silencioso para arquivo ausente.
- Pastas públicas e `CREDITS_AUDIO.md` criados.
- Script de otimização criado.

## Testes unitários cobertos

- Arquivo faltando não quebra.
- Mute impede áudio.
- Volume master funciona.
- Volume por categoria funciona.
- Loop de resposta inicia na janela de resposta.
- Loop para quando grupo pega vez.
- Loop para com resposta certa.
- Loop para com resposta errada.
- Loop para com tempo esgotado.
- Reset limpa áudio.
- Game over limpa loops.
- Countdown mínimo é 3.
- Countdown 3 toca `3,2,1,0_valendo`.
- Countdown 4 toca `4,3,2,1,0_valendo`.
- Countdown 5 toca `5,4,3,2,1,0_valendo`.

## E2E coberto

- Admin mostra painel `Áudio`.
- `Ativar áudio` aparece.
- `Mudo` / `Com som` alterna.
- `Volume master` aparece e aceita ajuste.
- Fluxos existentes do jogo continuam no pacote E2E.

## Comandos rodados

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - 10 arquivos, 52 testes passaram.
- `rtk npm run lint` - passou sem erros.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - 17 testes passaram.

## Pendências operacionais

- Os arquivos `.mp3` não foram baixados nem gerados neste harness.
- O usuário precisa colocar manualmente os arquivos em `public/audio/...`.
- Validação com COM7/COM8 depende de driver/porta virtual disponível na máquina.
- Mixagem fina depende dos arquivos reais.

## Confirmações de escopo

- Não foram implementados os 106 eventos do mapa completo.
- Não foram implementados easter eggs.
- Não houve alteração no Arduino `.ino`.
- Não foi criado mock no frontend.
- Web Serial real foi preservado.
- BroadcastChannel estrutural foi preservado.
