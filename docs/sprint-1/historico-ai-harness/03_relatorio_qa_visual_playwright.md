# Relatorio QA Visual + Playwright

## Viewports testadas

- 1920x1080
- 1600x900
- 1366x768

## Bugs encontrados antes da correcao

### BUG-001
- Tipo: martelo extra.
- Severidade: alta.
- Localizacao visual: centro inferior, sobre a bancada.
- Seletor provavel: `.gavel-zone`.
- Correcao: remover DOM visivel e manter apenas cue logico.

### BUG-002
- Tipo: texto indevido.
- Severidade: media.
- Localizacao visual: rodape dos cards A/B.
- Seletor provavel: `.buzz-area`, `.buzz-text`.
- Correcao: ocultar HTML removivel.

### BUG-003
- Tipo: estado inicial incorreto.
- Severidade: media.
- Localizacao visual: painel STATUS dos cards.
- Seletor provavel: `.status-value`.
- Correcao: iniciar ambos como `AGUARDANDO`.

## Evidencias finais

- `docs/ai-harness/screenshots/fatia-01-1920x1080.png`
- `docs/ai-harness/screenshots/fatia-01-1600x900.png`
- `docs/ai-harness/screenshots/fatia-01-1366x768.png`

## O que passou

- Sem overflow nas tres viewports.
- Scorebar visivel e centralizada.
- Martelo DOM extra nao visivel.
- `BUZZ` nao visivel.
- Pergunta escondida no estado inicial.

