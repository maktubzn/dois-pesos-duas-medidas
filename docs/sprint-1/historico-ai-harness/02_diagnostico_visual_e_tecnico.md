# Diagnostico Visual e Tecnico

## Bugs confirmados

- BUG-001: `.gavel-zone` renderizava um martelo CSS indevido no centro inferior.
- BUG-002: `BUZZ` era texto HTML visivel nos dois cards.
- BUG-003: estados iniciais dos cards vinham como A "COM A PALAVRA" e B "BLOQUEADO".
- BUG-004: `ArduinoBridge` inexistente.
- BUG-005: `QuizStage` nao expunha `showQuestionCard()` e `hideQuestionCard()` com os nomes pedidos.

## Riscos

- Web Serial depende de Chrome desktop, localhost/HTTPS e gesto do usuario.
- Video pode ter `play()` rejeitado pelo navegador; o codigo existente ja trata a promessa.
- Sem Git no diretorio, rastreabilidade precisa ficar em `docs/ai-harness`.

## Ordem segura

1. Corrigir visual do HUD.
2. Atualizar estados dos cards.
3. Adicionar ArduinoBridge sem depender de hardware.
4. Validar por console, teclado e Playwright.
5. Registrar GSD/relatorios.

