# 15 - Relatorio Stage ScoreBar Assets

## Corrigido

- `ScoreBar` voltou a exibir pontos com `PTS 0` e `0 PTS`.
- Gradientes internos da barra azul/vermelha foram enriquecidos sem trocar a moldura.
- Assets de `img/` foram copiados para `public/img/`.
- Build passou a copiar assets para `dist/img/`.
- Titulo do app virou `Dois Pesos, Duas Medidas`.
- Teste unitario do `ScoreBar` foi criado.

## Preservado

- Fundo e video.
- Cards A/B.
- Pergunta central.
- Ampulheta placeholder.
- Ausencia de martelo DOM extra.
- Ausencia de `BUZZ` nos cards.

## Validacao

- `rtk npm run typecheck`: passou.
- `rtk npm run test -- --run`: passou.
- `rtk npm run lint`: passou.
- `rtk npm run build`: passou.
- `rtk npm run test:e2e`: passou.

