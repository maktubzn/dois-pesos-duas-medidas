# Plano Fatia 01

## Escopo

- Corrigir scorebar sem trocar `img/barraMoldura.png`.
- Remover martelo HTML/CSS visivel.
- Ocultar `BUZZ` HTML.
- Manter card de pergunta escondido no inicio e expor helpers publicos.
- Implementar `ArduinoBridge` com Web Serial e fallback por teclado.
- Validar com Playwright/browser.

## Fora de escopo

- Banco de perguntas.
- Pontuacao final.
- Framework React/Vite.
- Download de assets.
- Audio real.
- Hardware obrigatorio para rodar a tela.

## Aceite

- Sem overflow em 1920x1080, 1600x900 e 1366x768.
- `ScoreBar`, `QuizStage` e `ArduinoBridge` funcionam no console.
- `Z`, `M`, `R` funcionam como fallback.
- Pergunta nao aparece antes do cue.
- Fundo, video e cards preservados.

