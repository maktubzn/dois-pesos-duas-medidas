# Harness 1 - Background Director

## Onde os fundos ficam

- Fundo 1: `public/img/bg-FNL1.png`, referenciado como `/img/bg-FNL1.png`.
- Fundo 2: `public/img/bg-FNL2.png`, referenciado como `/img/bg-FNL2.png`.

## Uso do Fundo 1

`bg-FNL1.png` é a camada base da Stage. Ele aparece nos estados de espera, idle e abertura (`intro`/`idle`), inclusive atrás da `IntroScreen`.

## Uso do Fundo 2

`bg-FNL2.png` aparece nas fases de jogo. Ele é usado por enquanto como placeholder estrutural temporário do Fundo 2, não como arte final.

Fases que usam Fundo 2:

- `round_prepare`
- `question_reveal`
- `buzz_open`
- `team_answering`
- `pass_decision`
- `repass_decision`
- `answer_locked`
- `scoring`
- `round_end`
- `time_up`
- `game_over`
- `error`

## Transição

`BackgroundStage` usa duas imagens absolutas. O Fundo 2 fica acima do Fundo 1 e entra por `opacity`, com overlay escuro sutil para suavizar a troca. `pointer-events: none` impede qualquer interferência na UI.

O vídeo legado do martelo continua acima dos fundos e segue controlado por `useBackgroundCue`, sem alteração no hook.

## Acessibilidade de movimento

`prefers-reduced-motion: reduce` reduz a duração das transições para 1ms. A troca de fundo continua acontecendo, mas sem animação perceptível.

## Pendente

Quando a arte final do Fundo 2 estiver pronta, trocar apenas o arquivo `public/img/bg-FNL2.png` ou o caminho equivalente no `BackgroundStage`.
