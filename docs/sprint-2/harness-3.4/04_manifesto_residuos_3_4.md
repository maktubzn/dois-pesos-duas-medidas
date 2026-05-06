# Harness 3.4 - Manifesto de residuos

## Criterio

Foram movidos apenas itens confirmados como legado, temporarios, saidas geradas ou assets fora do grafo vivo do React/Vite atual. Arquivos com duvida funcional permaneceram no lugar.

## Legado movido

- `backup/legacy-html-20260427-192742/` -> `_residuos/harness-3.4/legacy/backup/legacy-html-20260427-192742/`
- `components/` -> `_residuos/harness-3.4/legacy/components/`
- `docs/ai-harness/` -> `_residuos/harness-3.4/legacy/docs/ai-harness/`

Motivo: snapshots e demos do HTML legado, sem import no app React/Vite.

Risco: quebra links historicos antigos, mas nao quebra runtime atual.

## Assets fora do grafo vivo movidos

- `src/assets/hero.png` -> `_residuos/harness-3.4/src/assets/hero.png`
- `src/assets/react.svg` -> `_residuos/harness-3.4/src/assets/react.svg`
- `src/assets/vite.svg` -> `_residuos/harness-3.4/src/assets/vite.svg`
- `img/01-background.png` -> `_residuos/harness-3.4/img/01-background.png`
- `img/BGVIDEO.gif` -> `_residuos/harness-3.4/img/BGVIDEO.gif`
- `img/05(placa do brasao).png` -> `_residuos/harness-3.4/img/05(placa do brasao).png`
- `img/08.png` -> `_residuos/harness-3.4/img/08.png`

Motivo: nao havia referencia viva em `src`/`tests` para estes caminhos raiz; os assets publicos usados pelo app permanecem em `public/`.

Risco: baixo para runtime; medio para consulta historica/manual.

## Saidas geradas movidas

- `dist/` antigo -> `_residuos/harness-3.4/generated/dist/`
- `.tmp/` -> `_residuos/harness-3.4/tooling/.tmp/`
- `.playwright-mcp/` -> `_residuos/harness-3.4/tooling/.playwright-mcp/`
- `test-results/` -> `_residuos/harness-3.4/tooling/test-results/`
- `background-ended-check.json` -> `_residuos/harness-3.4/root/background-ended-check.json`
- `stage-initial.png` -> `_residuos/harness-3.4/root/stage-initial.png`
- `stage-timeup.png` -> `_residuos/harness-3.4/root/stage-timeup.png`

Motivo: artefatos de build, Playwright ou checagens pontuais.

Risco: baixo; `dist/` foi regenerado por `rtk npm run build`.

## Nao movidos

- `dev-4173.err.log`
- `dev-4173.out.log`

Motivo: estavam abertos por processo ativo, e o movimento falhou por lock.

## Pos-validacao

Depois da movimentacao:

- `rtk npm run build`: passou.
- `rtk npm run lint`: passou.
- `rtk npm run test -- --run`: passou.
- `rtk npm run test:e2e`: passou, 16/16.

