# Harness 5 FINAL - Relatorio de polimento de producao

Data: 2026-05-05

## Problemas reais confirmados

- A validacao visual reproduziu timer preso em `buzz_open` quando a medicao ficava na Stage e o motor ainda dependia de `requestAnimationFrame` no Admin.
- O teste visual Harness 5 antigo media countdown tarde demais e confundia metade do timer de 20s com abertura do Tribunal.
- O Final Show exibia o card vencedor, mas os slots apareciam truncados como `JOGADOR...` e o status do card ficava `COM A PALAVRA`.
- O placar do Final Show quebrava linha em ordem ruim quando virou card completo.

## Correcoes aplicadas

- Admin agora usa `setInterval` com timestamps reais para timers operacionais em vez de depender de `requestAnimationFrame`.
- Stage ganhou watchdog local de timer: quando uma transicao de timer acontece na Stage visivel, ela publica snapshot para o Admin via BroadcastChannel.
- Admin aceita `GAME_STATE_SYNC` vindo da Stage para sincronizar transicoes de expiracao.
- Stage em aba oculta exibe aviso: `Stage em aba oculta. Abra em janela separada/fullscreen.`
- `GroupCard` recebeu `statusOverride`; no Final Show o card vencedor mostra `VENCEDOR`.
- Slots do card foram ajustados para exibir `Jogador 1` a `Jogador 5` sem truncar.
- Final Show usa card inteiro, placar separado e frase de encerramento curta.
- CSV de partida/sessao foi implementado em `historyStorage`, com protecao contra CSV injection.
- Teste visual Harness 5 foi corrigido para esperar tempo real e fase real.
- QA Final apontou risco de duplicar `winner_declared` via proximo round tecnico apos `game_over`; `nextRound()` agora ignora chamadas depois da partida encerrada e ha teste unitario cobrindo isso.

## Admin final

- Login com fundo branco, formulario a esquerda e painel preto com INFO a direita.
- Operacao em fundo branco, cards simples, botao principal preto e dados separados das acoes.
- Mesa/Arduino desconectada aparece como alerta insistente.
- Tecnico/Avancado fica recolhido por padrao.
- `RESET_HW` permanece em area tecnica com confirmacao e debounce.

## Stage final

- Timers visuais derivam de timestamp local.
- Stage envia heartbeat com visibilidade, fase, clock e audio.
- Tribunal usa `public/img/mesa-tribunal.png`.
- Cards de grupo tem leve perspectiva 3D e slots legiveis.
- Final Show centraliza o vencedor com card completo.

## Arquivos principais alterados

- `src/components/Admin/AdminPage.tsx`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`
- `src/components/GroupCard/GroupCard.tsx`
- `src/components/GroupCard/GroupCard.module.css`
- `src/hooks/useRealtimeBridge.ts`
- `src/utils/historyStorage.ts`
- `tests/e2e/visual/harness-5-final-production.spec.ts`
- `playwright.visual.config.ts`

## Riscos residuais

- Em navegadores, abas ocultas podem sofrer throttling. A operacao recomendada e Stage em janela separada/fullscreen.
- Web Serial real depende de permissao do navegador e cabo/porta fisica. A validacao automatizada cobre Arduino virtual e fallback de teclado.
- `dist/` e `test-results/` sao gerados por validacao; devem ser tratados como artefatos, nao fonte.
- Arduino fisico nao foi conectado nesta sessao; validacao foi por codigo, fallback e Arduino virtual.
