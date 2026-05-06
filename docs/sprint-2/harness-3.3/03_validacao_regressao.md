# Harness 3.3 - Validacao e regressao

## Validacao final

Executado com `rtk`:

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: 8 arquivos, 35 testes, passou.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: 16 testes Playwright, passou.
- `rtk npm audit --audit-level=low`: `found 0 vulnerabilities`.

Build final:

- `dist/index.html`: 0.47 kB, gzip 0.31 kB.
- `dist/assets/index-HtlYTkVQ.css`: 35.72 kB, gzip 8.79 kB.
- `dist/assets/index-5C3PNVw9.js`: 264.94 kB, gzip 79.49 kB.
- Tempo de build: 461 ms.

## E2E coberto

Playwright validou:

- Stage sem overflow em 1920x1080, 1600x900, 1366x768 e 900x900.
- Login do Admin.
- Linguagem publica sem o termo tecnico antigo.
- Backgrounds oficiais.
- Timer e feedback.
- Broadcast Admin -> Stage.
- Sequencia automatica 3.2.
- Countdown no Veredito Final.
- Pre-show 2.1 sem iniciar quiz sozinho.
- Fallback teclado sem serial.
- Preview Admin, card A/B, historico, export e limpeza.
- Veredito Final sem vazamento publico da resposta correta.

## Screenshots

Gerados em:

`docs/sprint-2/harness-3.3/screenshots/`

Principais arquivos:

- `stage-1920x1080.png`
- `stage-1600x900.png`
- `stage-1366x768.png`
- `stage-900x900.png`
- `countdown-round-1920x1080.png`
- `countdown-veredito-final-1920x1080.png`
- `question_reveal-1366x768.png`
- `timer_running-1366x768.png`
- `turn_locked_A-1366x768.png`
- `feedback_correct-1366x768.png`
- `time_up-1366x768.png`
- `game_over-1366x768.png`
- `admin-ab-history.png`
- `admin-preview-character.png`

## Trace

Playwright esta configurado com `trace: 'on-first-retry'`. Como a suite final passou sem retry, nao houve trace de falha novo para anexar.

## Validacoes de escopo

- Arduino e `.ino`: nao tocados.
- Web Serial estrutural: nao alterado.
- BroadcastChannel estrutural: nao alterado.
- Mapeamento A/B: preservado.
- Reset automatico: preservado.
- 10 rounds e Veredito Final: preservados.
- Pre-show 2.1: preservado.
- Sequencia automatica 3.2: preservada.
- Backend: nao alterado.

