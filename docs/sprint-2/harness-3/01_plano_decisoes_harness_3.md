# Harness 3 - Plano e decisoes

## Escopo

Sprint 2 / Harness 3 evolui o jogo apos o pre-show 2.1. A fatia implementa:

- inicio de rodada pelo Admin;
- entrada da pergunta;
- timer automatico de 20s;
- liberacao de botao de vez;
- trava de timer quando um grupo pega a vez;
- feedback de correto, errado e tempo esgotado;
- pontuacao visivel e animada;
- proxima rodada limpando estado anterior;
- `game_over` ao fim da rodada 5.

Ficaram fora do escopo: Arduino `.ino`, Web Serial estrutural, BroadcastChannel estrutural, mapeamento A/B, reset automatico, conteudo final de perguntas, audio completo, backend, Sprint 1, Harness 1 e Harness 2.1.

## Decisoes tecnicas

- O Admin permanece como relogio autoritativo do timer. O Stage apenas reflete snapshots via BroadcastChannel.
- O timer comeca quando o Admin clica `Iniciar rodada`: primeiro a pergunta entra, depois a janela de resposta abre.
- Quando um grupo pega a vez por teclado/hardware, o timer muda para `paused`; se o Admin marcar erro, pode reabrir a vez mantendo o tempo restante.
- `markCorrect` bloqueia pontuacao duplicada para a mesma resposta.
- `openBuzz` foi protegido contra chamada tardia depois de `game_over`.
- O Stage deixou de expor slots como `<button>` porque eram controles inertes e podiam confundir QA/operacao.
- As animacoes seguem CSS/React existente, com suporte a `prefers-reduced-motion`.

## Pesquisa e referencias

- Context7 consultado para React, Zustand, Playwright e Motion. Motion nao foi usado porque CSS local era suficiente.
- Pesquisa web atualizada usada para confirmar decisoes com fontes oficiais:
  - Vite public assets por caminho absoluto: https://v2.vitejs.dev/guide/assets.html
  - React cleanup de efeitos/intervalos: https://react.dev/reference/react/useEffect
  - HTMLMediaElement `play`, `pause`, `currentTime`, `ended`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
  - Playwright screenshots: https://playwright.dev/docs/screenshots

## Ferramentas e skills

- `rtk` usado em todos os comandos shell.
- Playwright usado para E2E e screenshots.
- Context7 usado para validacao tecnica.
- GSD: ferramenta nao disponivel nesta sessao.
- GS stack solicitado (`gs-premium-ui-suite`, `gs-ui-craft-orchestrator`, `gs-dark-first-design-system`, `gs-visual-validation-loop`, etc.): skills nao estavam listadas/disponiveis; fallback foi analise manual + Build Web Apps + Playwright.
- Skill usada: `build-web-apps:frontend-app-builder`, como referencia de UI existente e validacao visual.

## Subagentes

- Subagente 1, Pesquisa + Context7 + GSD, modelo GPT 5.4 mini: validou docs e riscos do timer/store.
- Subagente 2, QA Visual + Bug Hunter, modelo GPT 5.4 mini: validou Stage/Admin com Playwright e reportou bugs corrigidos nesta fatia.
