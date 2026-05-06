# 28 - Validacao Admin Realtime Rounds

## Comandos executados

```powershell
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run lint
rtk npm run build
rtk npm run test:e2e
```

## Resultado

- Typecheck: passou.
- Unit tests: 5 arquivos, 14 testes, passou.
- Lint: passou.
- Build: passou.
- E2E Playwright: 7 testes, passou.

## Cobertura objetiva

- `/stage` abre sem login.
- `/admin` exige login.
- Login errado bloqueia.
- Login certo entra.
- Logout limpa sessao.
- Stage nao mostra painel Arduino.
- Admin publica estado para Stage via BroadcastChannel.
- Fallback teclado no Admin funciona sem serial.
- 5 rounds terminam em `game_over`.
- Score do Admin reflete no Stage.
- Sem overflow nos viewports exigidos.

## Hardware real

Teste manual com chooser Web Serial nao foi executado nesta rodada por exigir selecao humana da porta nativa no navegador. O sketch Arduino nao foi alterado.
