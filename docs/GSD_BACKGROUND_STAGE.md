# GSD — Etapa 01: Fundo Animado Base do Tribunal

## 1. Nome da etapa

Etapa 01 — Fundo animado base do tribunal.

## 2. Objetivo

Criar o fundo estatico e a camada de video ativavel por eventos, sem montar a UI completa do quiz.

Esta etapa prepara a base visual para o momento futuro em que o martelo bater e a pergunta surgir, mas ainda nao implementa esses elementos.

## 3. Assets usados

- `img/01-background.png`: imagem estatica principal do fundo.
- `img/BGVIDEO.mp4`: video principal do fundo, usado como animacao especial.
- `img/BGVIDEO.gif`: referencia visual, nao usado como fonte principal.
- `img/projeto.png`: planta visual de referencia para posicionamento.

## 4. O que foi implementado no `index.html`

- Stage fullscreen em `<main class="stage" aria-label="Cena base do quiz">`.
- Imagem base cobrindo a viewport inteira.
- Video MP4 cobrindo a viewport inteira, mutado, `playsinline`, sem loop e controlado por JavaScript.
- Placeholder verde, sem texto, acima do fundo para marcar a futura area da pergunta.
- API global `window.GameBackground` com:
  - `playIntro()`
  - `playQuestionTransition()`
  - `resetBackground()`
  - `pauseBackground()`
  - `getState()`
- Eventos customizados para simulacao futura:
  - `quiz:new`
  - `quiz:question-change`

## 5. O que NAO foi implementado ainda

- Cards dos grupos.
- Barra de pontos.
- Martelo real.
- Ampulheta.
- Pergunta real.
- Botoes de resposta.
- Logica completa de quiz.
- Integracao Arduino.
- React ou Vite.

## 6. Hierarquia de camadas

- `z-index: 1`: imagem estatica `01-background.png`.
- `z-index: 2`: video `BGVIDEO.mp4`.
- `z-index: 10+`: overlays futuros da interface.
- `z-index: 20`: placeholder verde temporario da pergunta.

## 7. Como testar manualmente

1. Abrir `index.html` no navegador.
2. Verificar se o fundo dark do tribunal aparece imediatamente pela imagem estatica.
3. Abrir o console do navegador.
4. Rodar `GameBackground.playIntro()`.
5. Rodar `GameBackground.playQuestionTransition()`.
6. Rodar `window.dispatchEvent(new CustomEvent("quiz:new"))`.
7. Rodar `window.dispatchEvent(new CustomEvent("quiz:question-change"))`.
8. Rodar `GameBackground.pauseBackground()`.
9. Rodar `GameBackground.resetBackground()`.
10. Rodar `GameBackground.getState()` para verificar o estado atual.

## 8. Criterios de aceite

- A pagina nao cria overflow horizontal ou vertical.
- A imagem aparece como base visual permanente.
- O video ocupa a viewport inteira com `object-fit: cover`.
- O video nao fica em loop.
- O video toca quando `playIntro()` e chamado.
- O video toca quando `playQuestionTransition()` e chamado.
- O video toca quando os eventos `quiz:new` e `quiz:question-change` sao disparados.
- Ao terminar, o video para, volta para o inicio e a imagem estatica volta a ser a camada visivel.
- O placeholder verde fica visivel, centralizado e sem texto.
- O codigo tem comentarios tecnicos claros.
- Nenhum outro elemento de UI foi criado nesta etapa.

## 9. Plano futuro para React + Vite

- Transformar a stage em um componente `BackgroundStage.tsx`.
- Transformar `window.GameBackground` em um hook `useBackgroundCue`.
- Controlar as transicoes por estado global do quiz.
- Ligar `playIntro()` ao inicio de quiz.
- Ligar `playQuestionTransition()` ao momento de troca de pergunta.
- Remover o placeholder verde quando a UI real da pergunta for implementada.
