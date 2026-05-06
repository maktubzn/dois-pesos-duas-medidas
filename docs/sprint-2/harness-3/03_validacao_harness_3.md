# Harness 3 - Validacao

## Testes executados

Todos os comandos foram executados via `rtk`:

- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 5 arquivos e 20 testes.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 12 testes Playwright.

Observacao: `rtk` avisou que nao ha hook instalado (`rtk init -g`), mas os comandos rodaram normalmente.

## Screenshots gerados

Diretorio: `docs/sprint-2/harness-3/screenshots/`

- `admin-preshow-controls.png`
- `cinematic-video-title-1920x1080.png`
- `feedback_correct-1366x768.png`
- `game_over-1366x768.png`
- `how-to-play-1920x1080.png`
- `logo-waiting-1920x1080.png`
- `preshow-1366x768.png`
- `question_reveal-1366x768.png`
- `ready-to-start-1920x1080.png`
- `round_prepare-1366x768.png`
- `stage-1366x768.png`
- `stage-1600x900.png`
- `stage-1920x1080.png`
- `stage-900x900.png`
- `time_up-1366x768.png`
- `timer_running-1366x768.png`
- `turn_locked_A-1366x768.png`

## Bugs encontrados e corrigidos

- Pontuacao podia ser aplicada duas vezes para a mesma resposta ativa. Corrigido com guard em `markCorrect`.
- Timer/painel estavam pouco legiveis nos screenshots 1366px. Corrigido com contraste maior e reposicionamento do timer.
- Timeout pendente de abertura podia reabrir uma janela de resposta depois de avancar/resetar rapidamente. Corrigido limpando timeout no Admin e protegendo `openBuzz` contra `game_over`.
- Stage tinha slots renderizados como botoes inertes. Corrigido para elementos nao interativos.
- `game_over` existia como estado, mas precisava de tela publica explicita. Corrigido com overlay final e teste de visibilidade.

## Confirmacoes

- Logo `/img/logoinfo.png` continua validado no pre-show 2.1.
- Video `/img/video1.mp4` continua validado no pre-show 2.1.
- Titulo do pre-show continua por codigo.
- Admin controla o pre-show e a partida.
- Stage executa sem controles tecnicos visiveis.
- Quiz nao inicia sozinho ao final do pre-show.
- Texto publico `buzz` nao aparece.
- Sem overflow nos viewports 1920x1080, 1600x900, 1366x768 e 900x900.
- Web Serial e BroadcastChannel estrutural nao foram alterados.
- Arduino `.ino` nao foi alterado.
- Fluxo de 5 rodadas termina em `game_over`.

## Pendencias

- Validacao com Arduino fisico real nao foi executada nesta sessao.
- Conteudo final das perguntas segue fora do escopo.
- Audio completo segue fora do escopo.

## Proxima fatia recomendada

Harness seguinte: integrar conteudo real de pergunta/resposta e uma camada de operacao para revisao/ensaio do roteiro, mantendo o mesmo contrato de estados do Harness 3.
