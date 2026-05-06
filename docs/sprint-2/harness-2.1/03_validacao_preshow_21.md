# Harness 2.1 - Validacao

## 1. Testes rodados

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou, 5 arquivos e 16 testes.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: passou, 11 testes.

## 2. Screenshots gerados

- `docs/sprint-2/harness-2.1/screenshots/logo-waiting-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/cinematic-video-title-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/how-to-play-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/ready-to-start-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/preshow-1366x768.png`
- `docs/sprint-2/harness-2.1/screenshots/admin-preshow-controls.png`
- `docs/sprint-2/harness-2.1/screenshots/stage-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/stage-1600x900.png`
- `docs/sprint-2/harness-2.1/screenshots/stage-1366x768.png`
- `docs/sprint-2/harness-2.1/screenshots/stage-900x900.png`
- `docs/sprint-2/harness-2.1/screenshots/manual-stage-waiting-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/manual-how-to-play-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/manual-ready-to-start-1920x1080.png`
- `docs/sprint-2/harness-2.1/screenshots/manual-ready-to-start-1366x768.png`
- `docs/sprint-2/harness-2.1/screenshots/manual-admin-1366x768.png`
- `docs/sprint-2/harness-2.1/screenshots/manual-admin-1920x1080.png`

## 3. Bugs encontrados

- Typecheck inicial falhou por nulabilidade da referencia do video dentro dos event listeners.
- Lint inicial falhou por `setState` sincronico em um efeito de `prefers-reduced-motion`.
- E2E inicial falhou porque o locator `Iniciar pre-show` tambem encontrava `Reiniciar pre-show`.
- Screenshot inicial do briefing foi capturado antes do fim do fade-in dos itens.
- QA visual apontou observacao menor: o PNG original da logo contem fundo quadriculado embutido.

## 4. Correcoes feitas

- Event listeners do video passaram a usar uma referencia local nao nula.
- O estado de `prefers-reduced-motion` passou para inicializador preguiçoso.
- Locators Playwright passaram a usar `exact: true` onde havia ambiguidade.
- Screenshot do briefing passou a aguardar estabilizacao visual antes da captura.
- O asset original da logo foi preservado sem edicao; a observacao visual fica registrada como pendencia de asset, nao bug de implementacao.

## 5. Confirmacoes de escopo preservado

- `/img/logoinfo.png` foi usado.
- `/img/video1.mp4` foi usado.
- Logo aparece na espera.
- Video aparece no pre-show.
- Titulo entra por codigo.
- "Como funciona" aparece.
- Admin controla o pre-show.
- Quiz nao inicia sozinho.
- Arduino e `.ino` nao foram alterados.
- Web Serial nao foi alterado.
- BroadcastChannel estrutural nao foi alterado.
- Fluxo de 5 rounds foi preservado.
- Nao foram criados docs em `docs/ai-harness`.
- Foram criados exatamente 3 arquivos `.md` neste harness.

## 6. Pendencias

- Validacao em TV/projetor real ainda deve ser feita antes da apresentacao.
- O arquivo original da logo contem fundo visual embutido; nao foi editado para preservar o asset.
- Sistema completo de audio fica fora deste harness.
- Subagente QA Visual + Bug Hunter aceitou o fluxo sem bug bloqueante.

## 7. Proxima fatia recomendada

Harness 3: ensaio operacional completo com Admin + Stage + Arduino real, incluindo checklist de apresentacao, audio definitivo e refinamento dos estados de pergunta/resposta.
