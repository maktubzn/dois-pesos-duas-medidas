# Analise Visual Atual

## Antes da Fatia 01

- Scorebar tinha moldura boa, mas texto estava assimetrico e o interior precisava de textura mais rica.
- Existia martelo DOM extra em `.gavel-zone`, apesar do martelo ja estar no video/fundo.
- `BUZZ` era HTML dentro dos cards e nao fazia sentido nesta etapa.
- Card de pergunta existia, mas precisava de API publica de show/hide e validacao de reveal.
- Ampulheta real nao existe nos assets locais; placeholder CSS foi mantido.
- Arduino/Web Serial ainda nao existia.

## Depois da Fatia 01

- Scorebar usa fill clipado, textura CSS e labels centralizados.
- Martelo DOM extra foi removido da arvore visivel.
- `BUZZ` HTML foi ocultado.
- Card de pergunta fica oculto no inicio e aparece via `QuizStage.showQuestionCard()` ou apos `QuizStage.startNewQuestion()`.
- `ArduinoBridge` foi criado com fallback por teclado.

