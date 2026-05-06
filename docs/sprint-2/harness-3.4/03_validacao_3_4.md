# Harness 3.4 - Validacao

## Comandos finais

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou, 8 arquivos e 35 testes.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: passou, 16/16.
- `rtk npm audit --audit-level=low`: `found 0 vulnerabilities`.
- `rtk npm run arduino:virtual:self-test`: passou.
- `rtk npm run arduino:virtual -- --help`: passou.
- `rtk npm run arduino:virtual -- --list`: executou, mas retornou `No serial ports found`.

## Build final

- `dist/index.html`: 0.47 kB.
- `dist/assets/index-DOwBfTUu.css`: 35.92 kB, gzip 8.84 kB.
- `dist/assets/index-DkxYdRdY.js`: 265.92 kB, gzip 79.75 kB.
- `dist` total: 51.63 MB, incluindo originais public copiados e assets otimizados.

## Playwright

Screenshots gerados em `docs/sprint-2/harness-3.4/screenshots/`.

Cobertura E2E:

- Stage sem overflow nas viewports 1920x1080, 1600x900, 1366x768, 900x900.
- Admin login e controles.
- Backgrounds otimizados.
- Timer, feedback e botao de vez.
- Broadcast Admin -> Stage.
- Sequencia automatica 3.2.
- Veredito Final com countdown.
- Pre-show 2.1 com assets otimizados.
- Fallback teclado sem serial.
- Preview Admin, card A/B, historico, export CSV e limpeza.
- Veredito Final sem vazamento publico da resposta correta.

## COM virtual

Nao havia COM virtual instalada/disponivel no ambiente. A validacao COM7/COM8 fica pendente de instalar com0com/VSPE e criar o par:

- Chrome/Admin: COM7.
- Simulador: COM8.

Comando esperado:

`rtk npm run arduino:virtual -- --port COM8`

## Escopo preservado

- `.ino` intacto.
- Sem mock no frontend.
- Web Serial real preservado.
- BroadcastChannel estrutural preservado.
- Regra de 10 rounds preservada.
- Veredito Final preservado.
