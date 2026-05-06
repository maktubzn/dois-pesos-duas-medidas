# Relatorio de Implementacao - Fatia 01

## Arquivos alterados

- `index.html`
- `components/group-card.js`
- `components/group-card.css`
- `docs/ai-harness/**`

## Implementado

- Scorebar com fill interno clipado, textura CSS e labels centralizados.
- Texto do placar normalizado para `PTS 0` e `0 PTS`.
- DOM do martelo extra removido da UI.
- `QuizStage.showQuestionCard()` e `QuizStage.hideQuestionCard()` adicionados.
- `ArduinoBridge.connect()`, `disconnect()`, `send()`, `getState()` e `simulate()` adicionados.
- Teclas `Z`, `M`, `R` mapeadas para `BT1PRESS`, `BT2PRESS`, `RESET`.
- Cards iniciam em `AGUARDANDO`.
- `BUZZ` HTML ocultado por CSS.

## Pendencias registradas

- Ampulheta real nao existe nos assets; placeholder CSS mantido.
- Web Serial real precisa de teste fisico com Arduino conectado.

