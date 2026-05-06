# Auditoria Real Pre-Harness 4.7

## 1. Resumo brutal

O jogo ainda esta ruim. O Harness 4.6 melhorou contratos e alguns sintomas, mas nao resolveu a experiencia real.

O pre-show ainda tem corte feio: o video dura 8s, a timeline segura a fase de video/titulo por muito mais tempo, depois desmonta o video e troca para outra composicao. O operador percebe isso como travada/corte/foto. A solucao correta para 4.7 e parar de trocar para foto: manter o ultimo frame do video pausado, colocar texto por cima e seguir a timeline.

O Admin ainda parece cockpit. Existe uma "acao principal", mas logo abaixo continuam blocos tecnicos demais, botoes demais e informacao demais para uma pessoa operando ao vivo.

Os testes visuais atuais passam porque validam presenca, texto e ausencia de overflow. Eles nao validam fluidez, ritmo, clareza, FPS, corte seco, clique operacional, hierarquia visual ou qualidade de evento.

## 2. Por que o 4.6 disse que passou mas o jogo ainda esta ruim

O 4.6 mediu se a tela renderiza, nao se a experiencia funciona como show.

`rtk npm run visual:all` passou em 04/05/2026 com 6 testes, mas esses testes:

- nao assistem o pre-show inteiro;
- nao falham se o video travar;
- nao medem `video.currentTime`;
- nao medem FPS;
- nao medem long tasks;
- nao comparam sequencia de frames;
- nao avaliam se a transicao e bonita;
- nao avaliam se o Admin e operavel por humano;
- nao avaliam se o Final Show tem impacto de final de evento.

Resultado: o teste passou e a experiencia continuou ruim. Isso nao e contradicao; e teste fraco.

## 3. Falhas dos testes visuais atuais

| Teste | Problema real |
|---|---|
| `@visual:preshow pre-show briefing captures stable frames without overflow` | Tira screenshot com `waitForTimeout(1000)`, depois clica `Reiniciar Como funciona`. Nao assiste o pre-show inteiro, nao captura a transicao video -> briefing, nao mede travada e nao valida video rodando. Passa com UX ruim. |
| `@visual:admin admin operator panel is readable...` | Valida `Acao principal do operador` e overflow. Nao mede quantidade de botoes, hierarquia, proximo clique obvio, perigo operacional ou carga mental. Passa mesmo com cockpit. |
| `@visual:timers countdown and answer timer advance from store clock` | Usa `window.QuizStageDebug?.expireTimer()`. Isso pula o tempo real. Nao prova countdown andando por segundo nem comportamento sob PC pesado. |
| `@visual:tribunal` | Confirma texto e overflow. Nao valida se a dinamica e compreensivel, se operador sabe resolver, nem se audio/ritmo entram corretamente. |
| `@visual:final-show` | Confirma vencedor, texto e overflow. Nao valida impacto visual, poluicao do gate de audio, repeticao real nem retorno operacional. |
| `@visual:full-match` | Smoke curto por debug API. Nao simula operador real, nao valida ritmo, nao valida mesa real, nao prova qualidade. |

Falta teste para:

- assistir o pre-show completo de 0s a fim;
- falhar se `video.currentTime` nao avanca enquanto `data-video-state="playing"`;
- extrair frames a cada 1s/2s e comparar mudanca real;
- detectar corte seco entre cenas;
- registrar long tasks e assets carregados durante o momento critico;
- validar Admin por fluxo de operador;
- validar Final Show como cena publica, nao como card com texto;
- validar timer por tempo real, nao por `expireTimer()`;
- validar que a Stage nao carrega UI pesada escondida durante pre-show.

## 4. Pre-show: falhas, causa provavel e correcao recomendada

### Falhas confirmadas

1. O video usado no pre-show tem 8s.
2. A timeline mantem `cinematic_video` de 1.1s a 14s e `title_over_video` de 14s a 26s.
3. Na captura com Stage em primeiro plano, o video chegou a `currentTime=8`, `paused=true`, `ended=true` aos 10s, mas a cena continuou em `cinematic_video/title_over_video` ate a entrada do briefing.
4. A cena `how_to_play` desmonta o bloco de video e troca para uma tela propria. Essa troca e visualmente brusca.
5. Na captura com Admin em primeiro plano, o estado da Stage indicava `data-video-state="playing"`, mas o video ficou em `currentTime=0`, `paused=true`. Isso mostra risco real de throttling/aba/janela quando o operador usa Admin e Stage no mesmo navegador/contexto.
6. O pre-show carrega assets pesados do jogo escondidos por baixo da UI, antes de serem usados.

Evidencias:

- `docs/sprint-2/harness-4.7/evidencias/frames/preshow-stage-front-10s.png`
- `docs/sprint-2/harness-4.7/evidencias/frames/preshow-stage-front-14s.png`
- `docs/sprint-2/harness-4.7/evidencias/frames/preshow-stage-front-24s.png`
- `docs/sprint-2/harness-4.7/evidencias/preshow-stage-front-metrics.json`
- `docs/sprint-2/harness-4.7/evidencias/preshow-full-metrics.json`
- `docs/sprint-2/harness-4.7/evidencias/videos/preshow-full-stage.webm`
- `docs/sprint-2/harness-4.7/evidencias/traces/preshow-full-trace.zip`

### Causa provavel

O problema nao e so "arquivo pesado". O desenho da cena esta errado para o que o usuario quer.

`src/components/PreShowScreen/PreShowScreen.tsx` monta o video apenas quando a cena e `cinematic_video` ou `title_over_video`. Quando entra `how_to_play`, o video deixa de ser a base visual e vira outra tela. Alem disso, quando o video termina, o componente marca `videoEnded` e a renderizacao cai para fallback dentro da mesma cena.

`src/utils/preShowTimeline.ts` tambem prende a narrativa em uma timeline maior que o video real:

- video com duracao real: 8s;
- `title_over_video`: ate 26s;
- `how_to_play`: 26s a 42s;
- `button_check`: 42s a 56s;
- total: 64s.

Isso torna inevitavel uma sensacao de material parado, repetido ou trocado.

### Correcao recomendada para 4.7

- Remover a troca para foto/fallback no momento critico.
- Manter o video como background persistente do pre-show.
- Ao terminar o trecho de video, pausar no ultimo frame ou em um frame escolhido.
- Colocar titulo, regras e teste de mesa como overlays sobre o video pausado.
- A timeline manda na musica; a musica nao deve determinar duracao do pre-show.
- Preload/decode seletivo antes do momento critico: `video1.mp4`, poster, logo e trilha, nada mais.
- Nao montar UI pesada do quiz enquanto `phase === "intro"`.
- Reduzir animacoes caras: `mask-image`, grids, sombras grandes e filtros devem ser opcionais ou simplificados em modo PC fraco.
- Simplificar ensino: menos texto, uma mensagem por momento, sem grade densa.

## 5. Timers/countdowns: falhas, causa provavel e correcao recomendada

### Mapa dos timers

| Timer | Onde nasce | Como roda | Risco |
|---|---|---|---|
| Pre-show | `gameStore.playPreShow`, `tickPreShow` | Admin usa `requestAnimationFrame` e chama tick a cada ~100ms | Se Admin estiver throttled, a timeline publica pode atrasar/travar. A Stage nao e dona do relogio. |
| Video do pre-show | `PreShowScreen` | `video.play()` no componente Stage | Pode ficar pausado se Stage estiver em aba/janela nao ativa. Teste atual nao mede `currentTime`. |
| Tempo de resposta | `openBuzz`, `tickTimer` | Admin usa `requestAnimationFrame`, store calcula por timestamp | Melhor que decremento puro, mas depende de loop no Admin e de BroadcastChannel para Stage. |
| Countdown de rodada | `enterRoundCountdown`, `tickRoundCountdown` | Admin usa `requestAnimationFrame` e finaliza quando `remainingMs <= 0` | Ainda depende do Admin como motor. Se Admin pesa, Stage mostra atraso. |
| Delay automatico pos-feedback | `scheduleAutoNextRound` | `setTimeout(postFeedbackDelayMs)` no Admin | Compete com estado/tokens e pode ficar estranho sob pausa, reset ou carga alta. |
| Cue de revelacao da pergunta | `QuizStage.waitForQuestionRevealCue` | `setTimeout(820)` na Stage | E um timer local da Stage, separado do motor do Admin. Pode divergir da operacao. |
| Audio countdown | `audioEvents.playCountdown` | multiplos `setTimeout(index * 1000)` | Sequencia de audio pode divergir do contador visual se navegador atrasar. |
| Fades de audio | `AudioManager.fadeOut`, `audioEvents.fadeMusicCategory` | `setInterval(32)` | Pode continuar rodando em paralelo com troca de fase; usa `Date.now`, nao relogio unificado. |

### Falhas

- Os timers estao menos errados que antes, mas ainda nao estao unificados.
- O motor real do pre-show/countdown/resposta ainda fica no Admin.
- A Stage renderiza o que recebe; ela nao consegue garantir fluidez se o Admin atrasar.
- Ha competicao entre `requestAnimationFrame`, `setTimeout`, `setInterval`, video playback e BroadcastChannel.
- O teste visual de timers nao prova tempo real porque chama `expireTimer()`.

### Correcao recomendada para 4.7

- Criar um unico clock de partida com timestamp absoluto e estado derivado.
- Stage deve derivar exibicao de tempo por `performance.now()` + `startedAt`, nao esperar tick visual do Admin.
- Admin deve comandar eventos, nao ser o motor de frame da Stage.
- Audio countdown deve ser agendado a partir do mesmo clock ou re-sincronizado a cada transicao.
- Teste de timer deve esperar 3s reais e provar queda 20 -> 17/16, com tolerancia explicita.
- Teste deve rodar tambem com CPU throttling/long task artificial.

## 6. Admin: falhas, causa provavel e correcao recomendada

### Falhas confirmadas

Screenshot: `docs/sprint-2/harness-4.7/evidencias/screenshots/admin-1366x768-real.png`

O Admin ainda e cockpit. Em 1366x768 a primeira tela ja mostra:

- topo;
- estado atual;
- proxima acao;
- audio da TV;
- acao principal;
- Operacao;
- Audio da TV;
- Preview TV;
- Partida;
- Resposta;
- Historico parcialmente abaixo;
- rolagem vertical;
- muitos botoes com peso parecido.

O proximo botao existe, mas nao domina o fluxo porque ha muitos comandos competindo. Um operador cansado consegue clicar em `Pular abertura`, `Reiniciar pre-show`, `Avancar para pronto`, `Iniciar quiz`, `Mudo`, `Abrir Stage` e varios outros quase no mesmo campo visual.

### Cliques operacionais atuais

| Tarefa | Cliques/acoes minimas | Problema |
|---|---:|---|
| Iniciar pre-show | 1 | Ha botoes duplicados: acao principal e painel Operacao. |
| Ativar audio | 1 na Stage + possivel ajuste no Admin | O gate de audio fica visivel na Stage e polui ate Final Show. |
| Testar mesa | 2+ | `Liberar teste`, pressionar mesa, `Pedir proximo sinal`, pressionar mesa. Nao e fluxo guiado o bastante. |
| Iniciar quiz | 1 | Mas fica perto de controles de pre-show. |
| Iniciar rodada | 1 | Manual e automatico competem. |
| Marcar resposta | 1 | Correto/errado ainda manual, ok, mas o painel Resposta fica junto de muitos blocos. |
| Resolver tribunal | 2 | Arriscar/passsar + correto/errado. Correto, mas precisa modo focado. |
| Abrir Final Show | automatico ou 1 | Botoes aparecem como painel tecnico, nao como operacao de evento. |
| Voltar para espera | 1-2 | `Encerrar e voltar` nao volta ao `intro`; preserva `game_over`. Reiniciar partida e outra acao. |

### Correcao recomendada para 4.7

- Redesenhar Admin por fluxo, nao por blocos tecnicos.
- Modo `Operacao` limpo como padrao.
- Modo `Avancado/Tecnico` recolhido.
- Um botao principal contextual dominante.
- Timeline operacional: Espera -> Pre-show -> Teste mesa -> Quiz -> Rodada -> Tribunal -> Final Show -> Encerramento.
- Menos cards simultaneos.
- Logs e historico recolhidos por padrao.
- Preview menor, lateral ou sob demanda.
- Acoes perigosas longe de acoes comuns.
- Ajuda sob demanda, nao texto fixo competindo.

## 7. Final Show: falhas, causa provavel e correcao recomendada

Screenshot: `docs/sprint-2/harness-4.7/evidencias/screenshots/final-show-isolated-1920x1080.png`

O Final Show funciona, mas ainda nao esta no nivel de final de evento.

Problemas:

- Parece uma composicao estatica de placar, nao uma celebracao de encerramento.
- Ha muito vazio preto.
- O gate `Ativar audio da TV` continua visivel no canto inferior direito, poluindo a cena final.
- O brasao e grande, mas e generico e sem relacao suficiente com a energia do jogo.
- O texto e correto, mas ainda parece administrativo.
- Nao ha evidencias de audio/stinger de final realmente validado como experiencia.
- O teste atual confirma texto; nao confirma impacto.

Correcao recomendada:

- Final Show deve ocupar a Stage como cena de evento.
- Remover/ocultar gate de audio durante Final Show se audio ja deveria ter sido ativado antes.
- Usar entrada com blackout, batida curta, placar final e vencedor em sequencia, nao tudo estatico.
- Dar protagonismo ao brasao/vencedor sem parecer slide.
- Ter botao Admin de `Repetir cena final` e `Encerrar evento` com estados claros.
- Teste visual deve capturar inicio, pico e repouso do Final Show.

## 8. Assets/duplicacoes/carregamento

### Carregamento real durante pre-show

Durante o pre-show, a Stage carregou assets que nao deveriam ser necessarios naquele momento:

| Asset carregado no inicio | Tamanho aproximado | Uso confirmado | Problema | Recomendacao |
|---|---:|---|---|---|
| `img/barraMoldura.png` | 2.30 MB | GroupCard/quiz | Carrega durante pre-show escondido | Lazy load depois de `startQuiz` |
| `img/03(header).png` | 1.95 MB | GroupCard | Carrega durante pre-show escondido | Otimizar/consolidar |
| `img/04(brasao).png` | 2.20 MB | GroupCard | Carrega durante pre-show escondido | Usar versao otimizada |
| `img/brasao dc.png` | 2.07 MB | GroupCard | Carrega durante pre-show escondido | Usar versao otimizada |
| `img/01.png` | 2.03 MB | GroupCard | Carrega durante pre-show escondido | Lazy load |
| `img-optimized/02.webp` | 0.42 MB | textura | Carrega cedo | Revisar necessidade |
| `img-optimized/video1.mp4` | 0.56 MB | pre-show | Correto carregar no pre-show | Manter/preload controlado |
| `img-optimized/video1-poster.webp` | 0.05 MB | poster | Correto | Manter |
| `img-optimized/logoinfo.webp` | 0.11 MB | pre-show | Correto | Manter |

Causa: `QuizStage` monta a UI principal mesmo durante `phase === "intro"` e apenas aplica classe visual escondida. Componentes como `ScoreBar`, `GroupCard`, `QuestionPanel` e `BackgroundStage` entram cedo e disparam assets.

### Duplicados grandes

| Caminho / grupo | Tamanho | Uso confirmado | Duplicado de | Recomendacao |
|---|---:|---|---|---|
| `public/audio/fundo tribunal.mp3` e `dist/audio/fundo tribunal.mp3` | 4.48 MB cada | Fonte bruta e build | public/dist | Manter public se usado, nao versionar dist se nao for entrega final |
| `public/img/logoinfo.png`, `dist/img/logoinfo.png`, `_residuos/.../logoinfo.png` | 5.51 MB cada | Substituido por webp no pre-show | copias antigas | Mover brutos para `_raw` ou `_residuos`, manter webp |
| `public/img das perguntas/senhor-destino.png`, `dist/...`, `_residuos/...` | 5.18 MB cada | Otimizado existe | copias antigas | Usar webp otimizado; revisar original |
| `public/img/projeto.png`, `dist/img/projeto.png`, `_residuos/...` | 3.93 MB cada | Sem uso confirmado no codigo lido | copias antigas | Revisar manualmente, provavel residuo |
| `public/img/bg-FNL2.png`, `dist/img/bg-FNL2.png`, `_residuos/...` | 3.51 MB cada | Webp otimizado usado | png bruto | Manter webp, mover bruto se nao usado |
| `public/img/02.png`, `dist/img/02.png`, `_residuos/...` | 3.27 MB cada | textura bruta; webp usado | copias | Consolidar |
| `public/img/video1.mp4`, `dist/img/video1.mp4`, `_residuos/...` | 2.79 MB cada | otimizado usado | bruto | Manter `img-optimized/video1.mp4`, mover bruto |
| `public/img/BGVIDEO.mp4`, `dist/img/BGVIDEO.mp4`, `_residuos/...` | 2.73 MB cada | otimizado usado | bruto | Manter otimizado |
| `public/audio/time-click.mp3`, `public/audio/_raw/time-click.mp3`, `dist/...` | 1.92 MB cada | derivado otimizado existe | raw duplicado | Manter `_raw` se necessario, remover copia publica direta |
| `_residuos/harness-3.4/img/BGVIDEO.gif` | 9.42 MB | residuo | backup duplicado | Manter em residuos ou apagar apos confirmacao |
| `_residuos/harness-3.4/tooling/.playwright-mcp/console...log` | 37.78 MB | residuo | log antigo | Remover apos confirmacao |

Nao movi nada. O mapa acima e base para limpeza posterior.

## 9. Fluxos bugados encontrados

| Fluxo | Resultado | Evidencia | Gravidade |
|---|---|---|---|
| Pre-show completo com Admin em primeiro plano | Estado avancou, mas video da Stage ficou pausado em `currentTime=0` na captura | `preshow-full-metrics.json`, `preshow-full-stage.webm` | Alta |
| Pre-show com Stage em primeiro plano | Video roda ate 8s e termina; titulo continua sobre frame parado; depois troca para briefing | `preshow-stage-front-metrics.json`, frames 10s/14s/24s | Alta |
| Transicao video -> ensino | Corte seco de composicao; sai de frame de video/titulo para tela de cards | frames 22s/24s | Alta |
| Ensino do jogo | Texto melhor que antes, mas ainda e grade densa de regras; publico precisa ler muitos cards | `preshow-stage-front-24s.png` | Media |
| Admin 1366x768 | Excesso de blocos e botoes simultaneos; cockpit confirmado | `admin-1366x768-real.png` | Alta |
| Timer/countdown | Codigo usa timestamp, mas motor visual continua no Admin e testes pulam tempo real | codigo `AdminPage.tsx`, `gameStore.ts`, visual test | Alta |
| Rodada com acerto | Funcionalmente passa | `flow-correct.png`, `flow-audit.json` | Baixa |
| Rodada com erro | Funcionalmente passa | `flow-wrong.png`, `flow-audit.json` | Baixa |
| Rodada sem resposta -> Tribunal | Entra no tribunal | `flow-tribunal-timeout.png` | Media |
| Tribunal arriscar certo | Em fluxo misto Admin/debug, estado ficou incoerente em `buzz_open` apos resolver; precisa teste real melhor | `flow-audit.json` | Alta para QA, media para codigo |
| Tribunal arriscar errado | Feedback apareceu | `flow-tribunal-wrong.png` | Media |
| Tribunal dois passes | Feedback apareceu | `flow-tribunal-pass-pass.png` | Media |
| Final Show isolado | Aparece, mas impacto visual ainda fraco e gate de audio polui | `final-show-isolated-1920x1080.png` | Alta |
| Voltar para espera/repetir partida | Nao validado fisicamente com operador + mesa; testes atuais nao bastam | ausencia de evidencia forte | Alta |

## 10. Evidencias geradas

Comandos/evidencias principais:

- `rtk npm run visual:all` - passou 6/6 em 34.4s, confirmando que os testes atuais passam.
- `docs/sprint-2/harness-4.7/evidencias/frames/preshow-00s.png` ate `preshow-66s.png`
- `docs/sprint-2/harness-4.7/evidencias/frames/preshow-stage-front-00s.png` ate `preshow-stage-front-24s.png`
- `docs/sprint-2/harness-4.7/evidencias/preshow-full-metrics.json`
- `docs/sprint-2/harness-4.7/evidencias/preshow-stage-front-metrics.json`
- `docs/sprint-2/harness-4.7/evidencias/videos/preshow-full-stage.webm`
- `docs/sprint-2/harness-4.7/evidencias/traces/preshow-full-trace.zip`
- `docs/sprint-2/harness-4.7/evidencias/screenshots/admin-1920x1080-real.png`
- `docs/sprint-2/harness-4.7/evidencias/screenshots/admin-1366x768-real.png`
- `docs/sprint-2/harness-4.7/evidencias/screenshots/final-show-isolated-1920x1080.png`
- `docs/sprint-2/harness-4.7/evidencias/flow-audit.json`
- `docs/sprint-2/harness-4.7/evidencias/final-show-isolated.json`

Metricas relevantes:

- Long tasks no pre-show: 18 eventos >=100ms na captura completa.
- Assets carregados cedo durante pre-show: pelo menos 11 recursos >=0.05 MB, incluindo varios PNGs de 1.95 MB a 2.30 MB.
- Trace do pre-show ficou grande: cerca de 98 MB, sinal de que a auditoria capturou volume real de execucao e screenshots.

## 11. Decisoes tecnicas recomendadas para 4.7

- Usar video pausado + overlay em vez de foto/fallback/troca de DOM.
- Timeline manda na musica. A musica acompanha fases, com fade/ducking por cena.
- Stage nao deve montar UI pesada do quiz durante pre-show.
- Lazy loading para GroupCard, QuestionPanel, imagens de perguntas, Final Show e assets de fundo que nao estao na fase atual.
- Preload seletivo apenas do necessario para a proxima cena.
- Timers unificados por timestamp absoluto; Stage deriva tempo localmente.
- Admin por fluxo, com modo Operacao limpo e Tecnico recolhido.
- Gate de audio nao deve poluir Final Show.
- Playwright visual precisa falhar se UX estiver ruim:
  - video parado quando deveria tocar;
  - troca brusca de cenas;
  - long tasks acima de limite;
  - Admin com botoes demais visiveis;
  - Final Show sem pico visual;
  - timer que nao cai por segundo real.

## 12. Escopo sugerido para Harness 4.7

Um Harness 4.7 robusto, em prompts internos sequenciais:

1. `4.7.1 - Pre-show real`: manter video persistente, pausar no frame final, overlays por timeline, remover fallback/foto do caminho principal.
2. `4.7.2 - Clock unico`: Stage deriva timers por timestamp; Admin comanda eventos, nao frames; alinhar audio countdown ao clock.
3. `4.7.3 - Admin Operacao`: redesenhar por fluxo, esconder modo tecnico, reduzir botoes simultaneos, criar timeline operacional.
4. `4.7.4 - Loading e assets`: lazy loading por fase, nao montar quiz durante intro, consolidar assets, planejar limpeza sem mover antes de confirmar.
5. `4.7.5 - Final Show`: refazer cena final como evento, ocultar gate de audio, validar replay/encerramento/retorno.
6. `4.7.6 - Playwright visual serio`: testes com video.currentTime, frames por segundo, trace, long tasks, sequencia completa de pre-show, Admin por tarefa e Final Show em 3 momentos.
7. `4.7.7 - QA operador`: simular partida repetida com Admin + Stage + Arduino virtual, registrar clique por tarefa e divergencia entre Stage/Admin.

Nao recomendo dividir isso em 20 harnesses. O 4.7 deve ser uma estabilizacao real, com fatias internas e evidencia que possa reprovar qualidade ruim.

## 13. Perguntas objetivas para o usuario

1. No dia do evento, Stage e Admin ficarao em janelas separadas visiveis ao mesmo tempo, ou em abas do mesmo navegador?
2. O audio publico deve sair obrigatoriamente pela Stage/TV, ou o Admin/PC tambem pode ser fonte de audio?
3. A limpeza de `dist/` deve remover a pasta do repositorio ou ela precisa continuar versionada como entrega pronta?
