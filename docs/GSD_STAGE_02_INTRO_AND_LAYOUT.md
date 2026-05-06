# GSD - Etapa 02: Intro, Layout Principal e Sequencia do Martelo

## 1. Nome da etapa

Etapa 02 - Intro, layout principal e sequencia do martelo.

## 2. Objetivo da etapa

Evoluir a tela base do quiz para uma composicao visual completa, ainda em HTML/CSS/JS puro, preparando:

- abertura antes do quiz;
- layout principal conforme `img/projeto.png`;
- placar por pontos;
- cards dos grupos;
- area central da pergunta;
- cue visual do martelo;
- placeholder de ampulheta/tempo;
- APIs globais para testes e futura migracao para React + Vite.

Esta etapa nao implementa regra final de jogo, banco de perguntas, Arduino, audio real, personagens oficiais ou framework.

## 3. Assets usados

- `img/01-background.png`: fundo estatico da cena.
- `img/BGVIDEO.mp4`: video principal de fundo, controlado por JavaScript.
- `img/projeto.png`: planta visual de referencia para posicoes e proporcoes.
- `img/barraMoldura.png`: moldura do placar superior.
- `img/brasao dc.png`: logo temporaria local da abertura.
- `img/01.png`, `img/02.png`, `img/03(header).png`, `img/04(brasao).png`: camadas usadas pelo componente local `<quiz-group-card>`.

`img/BGVIDEO.gif` segue apenas como referencia e nao foi usado como fonte principal.

## 4. Arquivos alterados

- `index.html`: reconstruido para conter intro, fundo, placar, cards, pergunta, martelo placeholder, ampulheta placeholder e controladores globais.
- `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`: novo GSD desta etapa.

O GSD anterior `docs/GSD_BACKGROUND_STAGE.md` foi preservado.

## 5. Estrutura de camadas

- `stage-bg-image`: imagem base, `z-index: 1`.
- `stage-bg-video`: video de fundo, `z-index: 2`.
- `quiz-stage-ui`: interface principal, `z-index: 10`.
- `score-zone`: placar superior.
- `card-zone-a`: card Grupo A.
- `card-zone-b`: card Grupo B.
- `question-zone`: area da pergunta, oculta ate o martelo terminar.
- `timer-zone`: placeholder de ampulheta/tempo.
- `gavel-zone`: placeholder CSS do martelo.
- `intro-screen`: abertura, `z-index: 80`.

## 6. Estados criados

### GameBackground

Mantido com:

- `playIntro()`
- `playQuestionTransition()`
- `resetBackground()`
- `pauseBackground()`
- `getState()`

O video continua mutado, `playsinline`, sem `loop`, com imagem estatica como fallback.

### GameIntro

Criado com:

- `play()`
- `skip()`
- `reset()`
- `getState()`

A intro dura no maximo 9 segundos e sempre pode ser pulada pelo botao ou evento.

### ScoreBar

Criado com:

- `setScore(a, b)`
- `addPoints(group, amount)`
- `reset()`
- `getState()`

O texto principal usa pontos. O preenchimento proporcional e apenas apoio visual.

### QuizStage

Criado com:

- `startNewQuiz()`
- `startNewQuestion()`
- `playGavelCue()`
- `revealQuestion()`
- `hideQuestion()`
- `startAnswerTimer()`
- `resetStage()`
- `getState()`

### QuizPhase

Criado com:

- `intro`
- `idle`
- `round_prepare`
- `gavel_hit`
- `question_reveal`
- `answer_timer`
- `locked`

## 7. Eventos criados

- `quiz:new`: ouvido apenas por `QuizStage`, chama `startNewQuiz()`.
- `quiz:question-change`: ouvido apenas por `QuizStage`, chama `startNewQuestion()`.
- `quiz:intro-play`: chama `GameIntro.play()`.
- `quiz:intro-skip`: chama `GameIntro.skip()`.
- `quiz:gavel-hit`: disparado ao fim do cue do martelo.
- `quiz:question-reveal`: disparado quando a pergunta aparece.

## 8. Como testar no console

```js
GameIntro.play()
GameIntro.skip()

QuizStage.startNewQuiz()
QuizStage.startNewQuestion()
QuizStage.playGavelCue()
QuizStage.revealQuestion()
QuizStage.resetStage()

ScoreBar.setScore(1250, 980)
ScoreBar.addPoints("A", 100)
ScoreBar.addPoints("B", 50)
ScoreBar.reset()
ScoreBar.getState()

GameBackground.playIntro()
GameBackground.playQuestionTransition()

window.dispatchEvent(new CustomEvent("quiz:intro-play"))
window.dispatchEvent(new CustomEvent("quiz:intro-skip"))
window.dispatchEvent(new CustomEvent("quiz:new"))
window.dispatchEvent(new CustomEvent("quiz:question-change"))
```

## 9. O que pode quebrar e como foi prevenido

- Autoplay do video: o video e mutado, `playsinline`, e `play()` e tratado com `try/catch`.
- Caminhos com espaco: todos os assets usam caminhos relativos a partir do `index.html`.
- Assets faltando: cards usam fallback visual se `<quiz-group-card>` nao estiver registrado.
- Overflow em telas menores: `html/body/stage` usam `overflow: hidden`, medidas com `clamp()` e `box-sizing: border-box`.
- Z-index cobrindo componentes: camadas foram separadas por funcao e documentadas.
- Video em loop por engano: nao ha atributo `loop`, e o JS define `video.loop = false` antes de tocar.
- Cards distorcidos: `<quiz-group-card>` preserva `aspect-ratio: 1024 / 1536`; fallback usa a mesma proporcao.
- Intro travando acesso: ha botao permanente de skip e timeout maximo de 9 segundos.
- Pergunta aparecendo cedo: `question-zone` fica oculta em `idle` e `round_prepare`; `startNewQuestion()` so chama `revealQuestion()` apos `playGavelCue()`.
- Placeholder cobrindo outros elementos: pergunta e timer ficam em zonas fixas e so recebem `pointer-events` quando visiveis.
- Animacoes pesadas: animacoes usam `opacity` e `transform`, e respeitam `prefers-reduced-motion`.
- Evento duplicado de fundo: `quiz:new` e `quiz:question-change` nao sao mais ouvidos por `GameBackground`; passam por `QuizStage`.

## 10. Plano futuro React + Vite

- `IntroScreen.tsx`
- `BackgroundStage.tsx`
- `ScoreBar.tsx`
- `PlayerCard.tsx`
- `QuestionPanel.tsx`
- `GavelCue.tsx`
- `HourglassTimer.tsx`
- `useQuizStage()`
- `useBackgroundCue()`
- store futuro com Zustand para fases, pontos, pergunta atual, timer e controle de rodada.

## 11. Pendencias

- Asset proprio/oficial autorizado do mascote Charada.
- Asset proprio/oficial autorizado do Coringa ou alternativa abstrata final.
- Asset real do martelo.
- Asset real da ampulheta ou video de timer.
- Audio real de intro, martelo e tempo.
- Integracao com banco/lista real de perguntas.
- Integracao Arduino.
- Migracao para React + Vite.

## 12. Fora de escopo nesta etapa

- React/Vite.
- Dependencias novas.
- Download de assets.
- Personagens oficiais copiados.
- Banco de perguntas.
- Logica final de resposta correta.
- Arduino.
- Audio real.
