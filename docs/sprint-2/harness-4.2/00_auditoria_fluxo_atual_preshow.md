# Auditoria do Fluxo Atual do Pré-show

## 1. Resumo do estado atual

O pré-show atual já é um fluxo controlado pelo Admin e exibido pela Stage. A Stage começa em `phase: "intro"` com `preShowStatus: "idle"` e mostra a cena `waiting_logo`. O Admin é quem inicia, pausa, retoma, pula, reinicia, avança para pronto e finalmente inicia o quiz.

O fluxo do pré-show não inicia o quiz automaticamente. Mesmo quando `preShowStatus` chega a `finished`, o `phase` continua `intro`; o quiz só começa quando o operador aciona `Iniciar quiz`, que chama `startQuiz()` e troca a fase para `round_prepare`.

A animação principal existente está em `src/components/PreShowScreen/PreShowScreen.tsx` e `src/components/PreShowScreen/PreShowScreen.module.css`. Ela usa o vídeo otimizado `/img-optimized/video1.mp4`, título renderizado por código e fallback visual. Esta parte deve ser preservada no Harness 4.2 real.

## 2. Fluxo atual mapeado

Estados principais:

- `QuizPhase`: `intro`, `idle`, `round_countdown`, `round_prepare`, `question_reveal`, `buzz_open`, `team_answering`, `pass_decision`, `repass_decision`, `answer_locked`, `scoring`, `auto_next_round_delay`, `round_end`, `time_up`, `game_over`, `error`.
- `PreShowStatus`: `idle`, `playing`, `paused`, `skipped`, `finished`.
- Cenas do pré-show: `waiting_logo`, `blackout_to_video`, `cinematic_video`, `title_over_video`, `how_to_play`, `ready_to_start`.

Ordem atual:

1. Estado inicial: `phase = "intro"`, `preShowStatus = "idle"`, `preShowElapsedMs = 0`.
2. Stage mostra `waiting_logo`: logo INFO, texto `Aguardando inicio`, barra zerada.
3. Admin clica `Iniciar pre-show`: `playPreShow()` define `preShowStatus = "playing"` e zera `preShowElapsedMs`.
4. Admin incrementa a timeline a cada 250 ms via `tickPreShow(250)`.
5. `0-1100 ms`: `blackout_to_video`.
6. `1100-5600 ms`: `cinematic_video`.
7. `5600-10200 ms`: `title_over_video`, com `DOIS PESOS, DUAS MEDIDAS` renderizado por código.
8. `10200-31000 ms`: `how_to_play`, com texto explicativo do jogo.
9. `31000-34000 ms`: `ready_to_start`.
10. Ao atingir `34000 ms`, `tickPreShow()` muda `preShowStatus` para `finished`, mantendo `phase = "intro"`.
11. Quiz começa apenas no clique `Iniciar quiz`, que chama `startQuiz()` e muda para `round_prepare`.

Controles do Admin:

- `Iniciar pre-show`: começa do zero.
- `Pausar pre-show`: congela o status se estiver tocando.
- `Continuar`: retoma se estava pausado.
- `Pular abertura`: vai para `PRE_SHOW_HOW_TO_PLAY_START_MS`.
- `Reiniciar pre-show`: volta ao início.
- `Reiniciar Como funciona`: volta ao briefing.
- `Avancar para pronto`: força `finished` e `PRE_SHOW_TOTAL_MS`.
- `Iniciar quiz`: cria sessão, perguntas, histórico e entra em `round_prepare`.

## 3. Arquivos e responsabilidades

- `src/utils/preShowTimeline.ts`: define tempos, cenas e `getPreShowScene()`.
- `src/store/gameStore.ts`: guarda `phase`, `preShowStatus`, `preShowElapsedMs` e ações do pré-show/quiz.
- `src/types/game.types.ts`: define fases, status de pré-show, tipos de serial, mensagens realtime e snapshot.
- `src/components/PreShowScreen/`: renderiza espera, blackout, vídeo, título, explicação e pronto.
- `src/components/BackgroundStage/`: fundo da Stage fora do pré-show, com imagem idle, imagem game e vídeo de cue.
- `src/components/IntroScreen/`: componente legado/alternativo de intro, não é o fluxo ativo no `QuizStage`.
- `src/components/Admin/`: login, painel operacional, controles de pré-show, áudio, serial, partida e histórico.
- `src/components/QuizStage/`: Stage pública; assina BroadcastChannel, oculta UI do quiz durante `phase === "intro"` e renderiza `PreShowScreen`.
- `src/audio/`: `AudioManager`, manifest mínimo e `GameAudioController`.
- `src/realtime/`: BroadcastChannel Admin -> Stage.
- `src/hooks/useArduinoSerial.ts`: Web Serial real, fallback de teclado e comandos `LOCK`, `UNLOCK`, `RESET_HW`, `STOP_AUDIO`, `VOLUME`.
- `tools/arduino-virtual/`: simulador externo por COM virtual, sem mock no frontend.
- `tests/e2e/quiz-stage.spec.ts`: cobre Stage, Admin, pré-show, BroadcastChannel, áudio mínimo, sequência automática e screenshots.

## 4. Pontos que não podem ser alterados

Devem ser preservados:

- A animação existente de `PreShowScreen`, incluindo `videoArrival`, `logoDrift`, `briefingItem`, blackout, grid, shade e título por código.
- O vídeo de pré-show `/img-optimized/video1.mp4` e o poster `/img-optimized/video1-poster.webp`.
- A regra de que o pré-show não inicia o quiz sozinho.
- A Stage como leitora de snapshot, sem comandar o estado global do pré-show.
- O Admin como fonte operacional de pré-show, quiz, áudio e serial.
- Web Serial real em `useArduinoSerial.ts`.
- BroadcastChannel em `useRealtimeBridge.ts` e `broadcastChannel.ts`.
- Arduino virtual externo em `tools/arduino-virtual/`, sem mock dentro do app.
- Firmware `.ino`, que ficou fora desta auditoria.
- Linguagem pública `botao de vez`, sem reintroduzir `buzz` para o público.

Testes que já protegem isso:

- Unitários de `gameStore.test.ts` para pré-show sem auto-start, pause/resume/skip/restart, timer, botão de vez e fim de jogo.
- Unitários de `AudioManager.test.ts` e `audioEvents.test.ts` para fallback silencioso, mute, volume, loop e limpeza.
- E2E `admin broadcasts game state to the stage`.
- E2E `pre-show 2.1 screenshots and ready state do not auto-start quiz`.
- E2E de ausência do termo público antigo.
- E2E de sequência automática e bloqueio de input antes da janela de resposta.

## 5. Como o áudio funciona hoje

O áudio é centralizado em `src/audio/AudioManager.ts`. O manager:

- cria `HTMLAudioElement` só dentro do engine;
- exige `unlock()` antes de tocar qualquer som;
- faz `preload()` dos itens marcados no manifest após unlock;
- tem `muted`, `masterVolume` e volumes por categoria;
- limita simultâneos com `maxSimultaneous = 6`;
- controla loops em `loops`;
- remove loops com `stop()`, `stopAll()` e `fadeOut()`;
- não quebra se arquivo faltar; em dev apenas registra warning.

O botão `Ativar áudio` está no Admin. Ele chama:

- `audioManager.unlock()`;
- `audioManager.setMuted(audioMuted)`;
- `audioManager.setMasterVolume(audioMasterVolume)`;
- `setAudioEnabled(true)`.

Depois disso, um `useEffect` no Admin sincroniza estado do jogo com `GameAudioController.sync()`.

Hoje não há música ambiente no manifest. O manifest só tem `voice`, `sfx`, `stinger` e `ui`; não existe categoria `music` ou `ambience`.

Hoje a Stage não toca áudio. A Stage só renderiza vídeo mutado e UI. O áudio mínimo do jogo é disparado pelo Admin. Isso reduz risco de som duplicado quando Admin e Stage estão abertos no mesmo navegador, mas significa que o PC/saída de áudio deve estar ligado ao navegador do Admin.

## 6. Onde a música de fundo poderia entrar depois

O ponto tecnicamente correto é estender o sistema central, não tocar música direto em componente:

- adicionar categoria explícita `music` ou `ambience` em `audioTypes.ts`;
- registrar um asset de música local no manifest ou em manifest separado de pré-show;
- criar métodos de cama musical no `AudioManager` ou em controlador específico de pré-show;
- sincronizar a música pelo estado `phase`, `preShowStatus` e cena atual;
- manter tudo condicionado a `audioEnabled/unlocked`.

Plano sem implementar:

- Em `waiting_logo`: tocar a música em loop ou trecho contínuo com volume muito baixo, por exemplo 3% a 8% do master, somente depois do clique `Ativar áudio`.
- Ao sair da espera para `blackout_to_video`/`cinematic_video`: fazer fade-in para volume de apresentação, por exemplo 25% a 40%, evitando subir no mesmo frame do play do vídeo.
- Em `how_to_play`: fazer ducking forte, por exemplo 6% a 12%, para não competir com leitura nem fala do técnico.
- Em `ready_to_start`: manter baixo ou fazer fade-out curto, conforme decisão operacional.
- Ao clicar `Iniciar quiz`: cortar com fade-out obrigatório e `stop()`, para impedir vazamento no quiz.
- Se a música for maior que o pré-show: usar loop controlado ou tocar do início e cortar em `startQuiz`.
- Se a música for menor: preferir loop suave com crossfade simples, mas só se a emenda não chamar atenção.
- Registrar no `public/audio/CREDITS_AUDIO.md` que o arquivo foi fornecido pelo usuário e tem risco de copyright/licença.

Arquivo informado pelo usuário e existente localmente:

- `public/audio/Batman Theme (from Batman A Greenway Production in association with Twentieth Century-Fox... - Neal Hefti & his Orchestra and Chorus (youtube).mp3`
- Tamanho observado: 2247299 bytes.

Licença: a auditoria apenas registra que é arquivo fornecido pelo usuário para uso local e que há risco de copyright/licença. Não baixar, redistribuir, substituir, publicar ou decidir legalmente. Planejar alternativa futura royalty-free/original.

## 7. Riscos de autoplay e unlock

Risco principal: áudio audível iniciado por script antes de interação do usuário tende a ser bloqueado pelo navegador. A documentação MDN de autoplay indica que áudio audível normalmente só é permitido se estiver mutado/volume zero, se o usuário interagiu com o site, se o site foi allowlisted ou se há política específica. `play()` retorna `Promise` e pode rejeitar.

Estado atual:

- O vídeo do pré-show é mutado, então é compatível com autoplay mais permissivo.
- O `AudioManager` não toca se `unlocked` for falso.
- O unlock atual depende do clique do operador no Admin.
- A Stage não tem botão de unlock e não toca áudio.

Conclusões:

- Música não deve tocar antes de `Ativar áudio`.
- Música baixinha na tela de espera é possível depois do unlock.
- Música antes de clique do operador não é tecnicamente segura.
- Se o Admin for aberto, mas o operador esquecer `Ativar áudio`, o pré-show visual funciona e o áudio fica silencioso.
- Se no futuro a música for movida para Stage, será necessário um gesto de usuário na Stage ou uma decisão operacional clara de abrir/clicar a Stage antes.

Referências consultadas:

- MDN Autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- React/Context7: efeitos devem limpar integrações externas.

## 8. Riscos de performance em PC/TV/HDMI/espelhamento

Riscos relevantes:

- Decodificação de vídeo e áudio no mesmo momento crítico, especialmente no início do pré-show.
- PC escolar fraco com GPU integrada, navegador com aceleração desativada ou espelhamento sem taxa estável.
- TV limitada a 30/60 Hz e possível latência por HDMI/espelhamento.
- Filtros visuais caros (`filter`, `drop-shadow`, `mask-image`, sombras grandes) em telas 1080p.
- `will-change` permanente em muitas camadas pode consumir memória de GPU se crescer no futuro.
- `progressFill` muda `width` a cada 250 ms; é pequeno, mas `transform: scaleX()` seria mais barato se virar gargalo.
- O `AudioManager.preload()` cria elementos e chama `load()` de muitos arquivos no momento do unlock; se isso ocorrer junto com início de vídeo pode causar pico.

Pontos positivos atuais:

- Assets principais foram otimizados em `public/img-optimized`.
- `video1.mp4` tem cerca de 586 KB e `BGVIDEO.mp4` cerca de 565 KB.
- O pré-show usa `opacity` e `transform` para as animações principais.
- Existe fallback se vídeo falhar.
- Existe `prefers-reduced-motion` em `PreShowScreen`, `BackgroundStage` e `QuizStage`.
- O vídeo de Stage e o vídeo de pré-show são mutados e sem loop.

Recomendações para Harness 4.2:

- Não iniciar decode de música no mesmo frame de `playPreShow()`.
- Fazer prewarm de áudio no clique `Ativar áudio`, antes da abertura.
- Evitar analisar waveform, canvas ou filtros de áudio em tempo real.
- Usar fade por intervalos curtos ou Web Audio leve, não animação por React state a cada frame.
- Testar 1920x1080 e 1366x768.
- Testar `prefers-reduced-motion: reduce`.
- Medir recursos carregados e tempo de first play no Playwright/trace.

Referências consultadas:

- web.dev Animations and performance: https://web.dev/articles/animations-and-performance
- web.dev High-performance CSS animations: https://web.dev/articles/animations-guide
- MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

## 9. Problemas encontrados nos textos/fontes/animações

Não há fonte custom pesada declarada. `src/index.css` usa stack de sistema, o que reduz risco de travamento por download de webfont.

Pontos de atenção:

- `PreShowScreen.module.css` usa `filter: drop-shadow(...)` na logo e `filter: saturate(...)` no estado pausado. Em PC fraco, filtros podem pesar mais que `opacity/transform`.
- `depthGrid` usa `mask-image` e `transform: perspective(...)`. É visualmente útil, mas deve ser monitorado em TV/PC fraco.
- A tela `how_to_play` anima cada item com delay. Se o usuário percebe texto "travando", o suspeito mais provável é composição/decodificação simultânea ou frame drop, não fonte.
- O título grande usa `text-shadow` e `will-change`. Em 1080p deve ser aceitável, mas precisa validação real.
- O briefing tem leitura boa à distância, mas o texto todo em caixa alta e `line-height: 1.05` pode ficar apertado em 1366x768 se o conteúdo aumentar.
- `IntroScreen` legado não tem `prefers-reduced-motion`; se voltar a ser usado, precisa ajuste. No fluxo atual do `QuizStage`, ele não é renderizado.

Correção futura sem refazer o pré-show:

- Manter timeline e componentes.
- Reduzir filtros sob `prefers-reduced-motion` ou em modo "PC fraco".
- Trocar `progressFill width` por `transform`.
- Pré-carregar a música no unlock e adiar fade até vídeo estar estável.
- Não aumentar texto do briefing; se houver mais conteúdo, paginar ou reduzir linhas.

## 10. Viabilidade do teste interativo dos botões

É viável criar depois um teste de reconhecimento de mesa no pré-show sem pontuar e sem iniciar rodada, desde que seja isolado do fluxo do quiz.

Base existente:

- `BT1PRESS` e `BT2PRESS` já chegam por Web Serial real.
- O Arduino virtual consegue emitir `BT1PRESS`/`BT2PRESS`.
- `receiveHardwareBuzz()` hoje mapeia eventos para grupo e usa `buzzStateForGroup()`.
- Em `phase === "round_countdown"`, `buzzStateForGroup()` ignora input.

Risco:

- Em `phase === "intro"`, `buzzStateForGroup()` hoje pode transformar `phase` em `answer_locked` ou `team_answering` dependendo de estado visível. Portanto não se deve simplesmente reaproveitar `receiveHardwareBuzz()` durante o pré-show sem uma guarda nova.

Modelo recomendado para futuro:

- Criar modo explícito de diagnóstico, por exemplo `preShowInputCheck`, controlado pelo Admin.
- Interceptar `BT1PRESS/BT2PRESS` nesse modo antes de chamar o fluxo de resposta.
- Mostrar feedback visual discreto na Stage: `Mesa A reconhecida` / `Mesa B reconhecida`, sem palavra "buzz".
- Não alterar pontuação, round, timer, `activeGroup` do quiz nem `phase` principal.
- Funcionar com Arduino real e virtual COM7/COM8.

## 11. Riscos de conflito entre pré-show, áudio e quiz

Conflitos identificados:

- Música de pré-show e loop `tempo_resposta_relogio_tenso`: se a música não parar em `startQuiz`, o quiz fica poluído.
- Música e countdown de voz: se o pré-show musical continuar no `round_countdown`, a voz do contador perde clareza.
- Admin como único emissor de áudio: se o som físico estiver conectado só na TV/Stage, o áudio disparado pelo Admin pode não sair no PA correto. Precisa decisão operacional.
- `AudioManager.stopAll()` no reset/game over pode matar música futura se ela compartilhar o mesmo manager sem categoria/ownership clara. Isso é bom para segurança no quiz, mas precisa desenho explícito.
- `setMuted(true)` para tudo é seguro, mas no futuro pode ser desejável mutar só música mantendo SFX. Isso exige decisão de mixer.
- Web Serial `STOP_AUDIO` e `VOLUME` existem para hardware/DFPlayer, mas o áudio do navegador não usa esses comandos. Não misturar os dois modelos sem arquitetura.
- Evento `BT1PRESS/BT2PRESS` em `intro` pode interferir se for usado como teste interativo sem guarda.

Conflito que exige decisão do usuário:

- Onde o áudio real deve sair no dia: pelo navegador Admin/PC, pela Stage/TV via HDMI, ou por outro sistema de som? A arquitetura atual toca áudio no Admin, não na Stage.

## 12. Plano recomendado para o Harness 4.2 real

Recomendação: implementar o Harness 4.2 depois, mas não como "colocar mp3 e dar play". O harness deve ser pequeno, com foco em mixer de pré-show e garantias de não vazamento para o quiz.

Plano sugerido:

1. Confirmar saída de áudio operacional: Admin, Stage/TV, ou ambos.
2. Registrar no GSD do harness a decisão de saída, unlock e licenciamento.
3. Estender tipos de áudio com categoria `music`/`ambience` sem quebrar manifest mínimo.
4. Criar controlador de música de pré-show separado do controlador de áudio do quiz, mas usando o `AudioManager` central.
5. Adicionar asset local fornecido pelo usuário apenas por referência de caminho local/public, sem baixar ou redistribuir.
6. Implementar estados musicais: espera baixa, abertura normal, explicação com ducking, pronto/quiz com fade-out.
7. Garantir `stop/fadeOut` em `startQuiz`, `resetGame`, `phase !== intro`, `audioMuted` e unmount.
8. Fazer fallback silencioso se arquivo ausente ou autoplay rejeitar.
9. Validar visual, áudio ausente/presente e não início automático do quiz.
10. Só depois considerar teste interativo de botões, em modo separado.

Documentação atual consultada:

- Context7 React: `useEffect` para sincronizar sistemas externos e cleanup.
- Context7 Vite: `publicDir` copia assets como estão e serve por caminho absoluto.
- Context7 Playwright: screenshots, vídeo e trace via configuração.
- Playwright screenshots: https://playwright.dev/docs/screenshots
- Playwright videos: https://playwright.dev/docs/videos
- Playwright trace viewer: https://playwright.dev/docs/trace-viewer
- Playwright emulation/viewports/media: https://playwright.dev/docs/emulation

Observação GSD/RTK:

- Os documentos GSD locais `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md` e `docs/GSD_BACKGROUND_STAGE.md` foram lidos.
- O arquivo `RTK.md` referenciado por `AGENTS.md` não existe no diretório atual; os comandos ainda foram executados com prefixo `rtk`.

## 13. Testes recomendados

Para o Harness 4.2 real:

- Unitário: música não toca antes de unlock.
- Unitário: arquivo de música ausente não quebra.
- Unitário: `startQuiz` sempre para/faz fade-out da música.
- Unitário: ducking aplicado em `how_to_play`.
- Unitário: mute interrompe música e loops.
- Unitário: volume master afeta música.
- Unitário: volume de música separado não altera SFX.
- E2E visual: `waiting_logo`, `cinematic_video`, `title_over_video`, `how_to_play`, `ready_to_start`.
- E2E: pré-show concluído não inicia quiz.
- E2E: `Iniciar quiz` inicia apenas depois do clique.
- E2E: áudio ausente.
- E2E: música presente.
- E2E: fade/ducking por estado, preferencialmente via instrumentação/mocks de `HTMLAudioElement`.
- E2E: 1920x1080 e 1366x768.
- E2E: `prefers-reduced-motion: reduce`.
- E2E: sem Arduino.
- E2E/manual: Arduino virtual COM7/COM8.
- E2E/manual: Arduino real.
- Playwright: screenshots em estados-chave.
- Playwright: trace em pelo menos um fluxo completo.
- Playwright: vídeo somente quando necessário, porque artefatos podem pesar.
- Performance: observar decode de vídeo/música, recursos carregados e frame drops em PC fraco.

Validação desta auditoria:

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou, 10 arquivos e 52 testes.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou; Vite gerou `dist/index.html`, `dist/assets/index-BsUPPJx2.css` e `dist/assets/index-BjZcA80v.js`.
- Browser Use/Playwright MCP em `http://127.0.0.1:5173`: confirmou `waiting_logo` inicial, Admin logado, `cinematic_video` com `data-video-src="/img-optimized/video1.mp4"`, título com `data-title-source="code"`, briefing `how_to_play`, pronto em `phase="intro"` e quiz iniciando só após `Iniciar quiz` com `phase="round_prepare"`.
- `rtk npm run test:e2e` não é recomendado nesta auditoria porque o spec atual escreve screenshots em `docs/sprint-2/harness-3.4/screenshots`, e o pedido foi criar apenas um arquivo novo.

## 14. Perguntas de decisão para o usuário

1. No evento real, o som deve sair pelo navegador Admin, pela Stage/TV via HDMI, ou por uma saída de áudio separada?
2. A música fornecida pelo usuário pode ser usada localmente no ensaio/apresentação, ciente do risco de copyright/licença, ou prefere que o Harness 4.2 já deixe uma trilha alternativa royalty-free/original como padrão?
3. Na tela `ready_to_start`, a música deve ficar bem baixa aguardando o operador ou deve fazer fade-out total antes do quiz?
4. O teste interativo dos botões no pré-show deve entrar no Harness 4.2 ou ficar para um harness posterior separado?
5. O modo `prefers-reduced-motion` deve apenas reduzir animações ou também desativar o vídeo do pré-show sempre?
