# Harness 4.7 - Plano de Correcao Real

## Objetivo

Corrigir a experiencia real do jogo, nao apenas fazer testes passarem. O alvo do Harness 4.7 e validar operador, Stage publica, Grupo A, Grupo B, Tribunal, Final Show, timers por tempo real e pre-show com video persistente.

## Decisoes

- Pre-show alvo: 42s, dentro da faixa definida de 35-45s.
- Setup principal: Admin e Stage em janelas separadas.
- Limpeza: mover somente residuos confirmados; `dist/` nao entra na limpeza.
- Automacao: pasta removivel `automacao/`, sem mock do app e sem depender de `window.QuizStageDebug` como caminho de operacao.

## Implementacao planejada

- Pre-show: manter `video1.mp4` como base visual ate o fim da intro; depois do fim do arquivo, segurar o ultimo frame e renderizar titulo, regra, teste de mesa e pronto como overlays.
- Stage: desmontar UI pesada do quiz enquanto `phase === "intro"` para evitar carregamento de cards, perguntas e fundos de quiz durante o pre-show.
- Timers: usar `Date.now()` no clock do store para ser comparavel entre janelas e fazer a Stage derivar exibicao de pre-show, countdown e timer de resposta localmente.
- Admin: manter Operacao como tela principal, com CTA contextual e timeline operacional; recolher blocos de tecnico, Arduino, historico, preview e logs.
- Final Show: transformar a tela final em sequencia de evento com blackout, entrada de brasao, placar, sentenca e repouso; esconder gate de audio durante a cena final.
- Testes: substituir checks de presenca por validacoes de video, assets por fase, timer real, Admin operavel e Final Show em tres momentos.

## Aceite

- Automacao unica gera JSON, screenshots e trace.
- Quatro jogos variaveis chegam a `game_over`.
- Pre-show tem `video.currentTime` avancando e depois `data-video-state="held-final-frame"`.
- Stage nao carrega assets de quiz durante intro.
- Timer cai por tempo real sem `expireTimer()`.
- Admin em 1366x768 nao apresenta cockpit.
- Final Show nao exibe gate de audio e tem captura de entrada, pico e repouso.
