# Harness 1 - Pesquisa Visual e Assets

## Fontes consultadas

- Context7: Vite, React e Playwright.
- MDN: `prefers-reduced-motion`.
- Skills: `gs-premium-ui-suite`, `gs-ui-craft-orchestrator`, `gs-dark-first-design-system`, `gs-visual-validation-loop`, `app-builder`, `accessibility-compliance-accessibility-audit`, `awt-e2e-testing`.

## Decisões aplicáveis

- Assets em `public/img` devem ser referenciados por caminho absoluto de raiz, como `/img/bg-FNL1.png`.
- O Harness 1 deve usar CSS declarativo e transições por `opacity`, sem Motion/GSAP.
- A troca de fundo deve ser derivada do estado já existente da Stage, sem criar nova lógica de jogo.
- `prefers-reduced-motion: reduce` deve reduzir a transição, mas não impedir a troca de fundo.
- Playwright deve validar estrutura antes de screenshots: rota, ausência de overflow, ausência de texto técnico e assets carregados.

## Contrato visual

- Fundo 1: espera, idle e abertura.
- Fundo 2: jogo, pergunta, botões de vez liberados, grupo com a vez, tempo esgotado, rodada encerrada e game over.
- Fundo 2 segue como placeholder estrutural até a arte final ser entregue.
