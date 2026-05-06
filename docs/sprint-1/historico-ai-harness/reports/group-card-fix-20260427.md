# GroupCard Fix - 2026-04-27

## Diagnostico

Os cards A/B mudaram porque a migracao React recriou o visual por CSS aproximado, em vez de manter a estrategia do legado baseada em camadas PNG cropadas. Isso alterou moldura, textura, brasao, header e proporcoes internas.

## Correcao aplicada

- `src/components/GroupCard/GroupCard.tsx` agora renderiza as camadas equivalentes ao legado: textura, header, brasao, frame, slots, status e logo.
- `src/components/GroupCard/GroupCard.module.css` foi adaptado do CSS legado para CSS Modules.
- Assets usados via paths estaveis:
  - `/img/01.png`
  - `/img/02.png`
  - `/img/03(header).png`
  - `/img/04(brasao).png`
  - `/img/brasao dc.png`
- `BUZZ` segue fora do card.
- Estado dinamico preservado: `AGUARDANDO`, `COM A PALAVRA`, `BLOQUEADO`.

## Validacao

- `rtk npm run typecheck`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test -- --run`: passou.
- `rtk npm run test:e2e`: passou, 5 testes.
- `rtk npm run lint`: passou.
- Screenshot manual pos-correcao: `docs/ai-harness/screenshots/group-card-fix-1920x1080.png`.

## Resultado

Os cards React voltaram a usar a mesma base visual do legado, sem reintroduzir custom element e sem mexer em scorebar, Web Serial ou fluxo da tela.
