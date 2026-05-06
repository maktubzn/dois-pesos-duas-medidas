# Prompt 05 — Substituir Brasões dos Cards Grupo A/B

## Objetivo

Substituir brasões genéricos por:

- `public/img/brasao-groupA.png`
- `public/img/brasao-groupB.png`

## Requisitos

- Mesma posição visual.
- Tamanho/proporção equivalente.
- Sem redesenhar card.
- Sem alterar moldura.
- Sem trocar A/B.
- Fallback se asset faltar.

## Diagnóstico

Mapear componente dos cards, imagem atual, CSS de posição, diferença A/B e onde aparece.

## Implementação

Preferir constante por grupo, alt text e CSS preservando dimensão.

## Testes

- Stage carrega brasão A/B.
- Sem broken image.
- Build passa.

## Saída

Onde estava, onde foi aplicado, como preservou posição/tamanho, testes.
