# Harness 2.1 - Plano e Decisoes do Pre-show Cinematografico

## 1. Objetivo

Evoluir o Harness 2 sem refazer a arquitetura: a Stage permanece em `phase === "intro"` enquanto o Admin conduz uma abertura escura, imersiva e controlada com logo, video 1, titulo por codigo, briefing e estado pronto.

## 2. Base herdada do Harness 2

- O estado operacional continua em `preShowStatus` e `preShowElapsedMs`.
- O Admin continua sendo a fonte de controle e incrementa o tempo do pre-show.
- A Stage continua apenas lendo o snapshot via BroadcastChannel e ocultando a UI do quiz durante a intro.
- O quiz nao inicia ao fim do pre-show; apenas o botao do Admin inicia a rodada.

## 3. Assets obrigatorios

- Logo: `/img/logoinfo.png`, existente em `public/img/logoinfo.png`.
- Video 1: `/img/video1.mp4`, existente em `public/img/video1.mp4`.
- Os arquivos originais foram preservados no caminho original.

## 4. Pesquisa tecnica resumida

- Context7: React `/reactjs/react.dev`; Vite `/vitejs/vite`; GSAP React `/greensock/react`; Playwright `/microsoft/playwright`.
- Vite confirma que assets em `public` devem ser referenciados por caminho absoluto de raiz, como `/img/video1.mp4`.
- React recomenda `ref` + `useEffect` para sincronizar APIs imperativas de media como `play()` e `pause()`.
- MDN registra `play()`, `pause()`, `currentTime`, `duration`, `ended` e `error` como a base de controle de `HTMLMediaElement`.
- GSAP/useGSAP foi consultado; como `gsap` e `@gsap/react` nao existem no projeto, a dependencia nova foi evitada.
- Playwright foi mantido para screenshots, viewports e asserts de fluxo.

## 5. Decisao: GSAP/useGSAP ou CSS/React

Decisao: CSS/React.

Motivo: o stack atual ja cobre a necessidade com menos risco. A abertura usa classes por cena, CSS para movimento visual, `useEffect` para o video e `prefers-reduced-motion` para reduzir animacoes. GSAP ficaria reservado para uma fatia futura com coreografia mais complexa.

## 6. Timeline cinematografica proposta

1. `waiting_logo`: tela preta com `/img/logoinfo.png`, indefinida ate o Admin iniciar.
2. `blackout_to_video`: blackout curto para preparar a entrada.
3. `cinematic_video`: `/img/video1.mp4` em tela cheia, sem controles nativos.
4. `title_over_video`: titulo `DOIS PESOS, DUAS MEDIDAS` renderizado por codigo sobre o video.
5. `how_to_play`: briefing curto com regras publicas, sem texto antigo de "buzz".
6. `ready_to_start`: pre-show concluido, aguardando o Admin iniciar o quiz.

## 7. Arquivos previstos

- `src/utils/preShowTimeline.ts`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/components/PreShowScreen/PreShowScreen.tsx`
- `src/components/PreShowScreen/PreShowScreen.module.css`
- `src/components/Admin/AdminPage.tsx`
- `src/components/Admin/AdminPage.module.css`
- `tests/e2e/quiz-stage.spec.ts`
- Docs e screenshots em `docs/sprint-2/harness-2.1/`

## 8. Riscos e mitigacao

- Risco: Stage comandar o estado global. Mitigacao: Stage continua passiva; video `ended` afeta apenas fallback visual local.
- Risco: `play()` rejeitar. Mitigacao: fallback visual com logo/titulo e fluxo por tempo do Admin.
- Risco: imagem de logo ter fundo embutido. Mitigacao: asset original foi mantido e usado sem edicao, com enquadramento escuro.
- Risco: criar dependencia nova. Mitigacao: sem GSAP nesta fatia.

## 9. Criterios de aceite

- Logo aparece na espera.
- Video 1 e referenciado e toca no pre-show.
- Titulo entra por codigo, fora do arquivo de video.
- Admin controla iniciar, pausar, continuar, pular abertura, reiniciar, reiniciar briefing, avancar para pronto e iniciar quiz.
- Stage nao exibe controles tecnicos.
- Quiz nao inicia sozinho.
- Sem overflow em 1920x1080 e 1366x768.
- Arduino, Web Serial, BroadcastChannel, 5 rounds, timer do jogo e pontuacao preservados.

## 10. O que nao sera alterado

Arduino `.ino`, Web Serial, mapeamento A/B, reset automatico, fluxo de 5 rounds, timer automatico do jogo, logica de pontuacao, conteudo real das perguntas, backend, Sprint 1, Harness 1 e assets originais do usuario.
