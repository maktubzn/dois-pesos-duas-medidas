# Relatorio Fatia 02 - Componentes Base

## Status

Aprovada.

## Componentes criados

- `BackgroundStage`
- `IntroScreen`
- `ScoreBar`
- `GroupCard`
- `QuestionPanel`
- `HourglassTimer`
- `QuizStage`

## Hooks, store e utils

- `useBackgroundCue`
- `useArduinoSerial`
- `gameStore`
- `game.types`
- `score`
- `serialParser`

## Migrado para React

- Stage fullscreen 16:9.
- Fundo estatico e video sem loop.
- ScoreBar por pontos.
- Cards A/B laterais como componentes base.
- Painel central de pergunta.
- Ampulheta placeholder.
- Web Serial preparada como hook opcional.
- Fallback teclado `Z`, `M`, `R`.

## Mantido fora do escopo

- Quiz completo.
- Banco de perguntas.
- Pontuacao final.
- Backend.
- Arduino fisico.
- Download de assets externos.

## Observacoes

- Nao ha martelo DOM extra.
- `BUZZ` nao foi recriado.
- Assets usam caminhos estaveis em `/img/...`.

