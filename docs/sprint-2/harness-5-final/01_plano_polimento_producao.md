# Harness 5 FINAL - Plano de polimento de producao

Data: 2026-05-05

## Escopo

Polimento final sem mudar regra de pontuacao, regra central do Tribunal, Arduino `.ino`, banco de perguntas ou limpeza pre-Harness 5.

## Ordem executada

1. Revalidar a limpeza pre-Harness 5 e preservar `public/img*`, `public/audio/`, `automacao/`, `tools/arduino-virtual/` e `tools/windows/`.
2. Corrigir Stage realtime para nao depender de foco constante do Admin.
3. Manter RESET/RESET_HW fora do fluxo automatico normal.
4. Ajustar Admin login e Operacao na direcao branco/preto minimalista das referencias.
5. Preservar pre-show 4.8 e aplicar somente ajuste fino de leitura/volume ja existente na timeline.
6. Corrigir overflow dos cards e deixar slots como Jogador 1..5.
7. Usar `public/img/mesa-tribunal.png` na cena do Tribunal.
8. Refazer Final Show em torno do card vencedor completo.
9. Exportar CSV de partida/sessao, mantendo CSV antigo de eventos.
10. Criar validacao visual Harness 5 com screenshots, video, JSON e CSV exemplo.

## Contratos mantidos

- Operador inicia rodada e proxima rodada.
- Sistema automatiza countdown, abertura de botao de vez, timers, expiracao e feedback.
- Correto/errado continua manual.
- `RESET` recebido do Arduino e tratado como ACK/evento fisico, nao como reset de fase.
- `RESET_HW` fica restrito ao painel Tecnico com confirmacao/debounce.
- Stage oficial para evento deve ficar em janela separada/fullscreen, nao em aba oculta.

