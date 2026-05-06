# Harness 2 - Validacao do Pre-show

## 1. Testes rodados

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou, 5 arquivos e 16 testes.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: passou, 11 testes.

## 2. Screenshots gerados

- `docs/sprint-2/harness-2/screenshots/preshow-start-1920x1080.png`
- `docs/sprint-2/harness-2/screenshots/preshow-title-1920x1080.png`
- `docs/sprint-2/harness-2/screenshots/preshow-finished-1920x1080.png`
- `docs/sprint-2/harness-2/screenshots/preshow-1366x768.png`
- `docs/sprint-2/harness-2/screenshots/stage-1920x1080.png`
- `docs/sprint-2/harness-2/screenshots/stage-1600x900.png`
- `docs/sprint-2/harness-2/screenshots/stage-1366x768.png`
- `docs/sprint-2/harness-2/screenshots/stage-900x900.png`

## 3. Bugs encontrados

- O primeiro E2E do fluxo do pre-show esperava o titulo em um instante variavel da timeline. Corrigido para validar o estado em execucao e capturar a cena de titulo quando ela aparece.
- A primeira implementacao deixou dois botoes `Iniciar quiz` no Admin. Corrigido para manter uma acao unica e evitar ambiguidade operacional e nos testes.

## 4. Correcoes feitas

- Teste E2E ajustado para nao depender de texto de cena em tempo fragil.
- Screenshot dedicado da cena de titulo adicionado.
- Botao duplicado de iniciar quiz removido do painel de Partida; a acao permanece no painel de Pre-show.

## 5. Confirmacoes de escopo preservado

- Arduino e arquivos `.ino` nao foram alterados.
- Web Serial nao foi alterado.
- BroadcastChannel existente foi preservado; nenhum canal novo foi criado.
- Mapeamento A/B, BT1PRESS/BT2PRESS e reset automatico foram preservados.
- Fluxo de 5 rounds continuou coberto por unitario e E2E.
- O termo antigo nao aparece como texto publico na Stage/Admin; as ocorrencias restantes sao tecnicas ou asserts negativos.
- Foram criados exatamente 3 arquivos `.md` em `docs/sprint-2/harness-2`.

## 6. Pendencias

- Conteudo real de perguntas segue fora deste harness.
- Sistema completo de audio nao foi implementado.
- Validacao fisica com Arduino real e TV/resolucao final ainda deve ser feita em checklist de apresentacao.

## 7. Proxima fatia recomendada

Refinar a UX operacional do Admin para apresentacao: checklist de abertura, modo ensaio, confirmacoes para reset e validacao assistida com Arduino real.
