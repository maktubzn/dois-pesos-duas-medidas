# Harness 3.3 - Checklist entrega lisa

## Seguranca

- [x] `npm audit` sem vulnerabilidades reportadas.
- [x] CSV protegido contra formula injection basica.
- [x] Busca por `dangerouslySetInnerHTML`, `innerHTML`, `eval` e `new Function` sem sink ativo no app React.
- [x] `localStorage` usado apenas para historico com fallback em erro.
- [x] `sessionStorage` usado apenas para sessao local do Admin.
- [x] Resposta correta segue sem vazamento publico na Stage validada por E2E.

## Estabilidade

- [x] Timeout debug da Stage com cleanup.
- [x] Timers principais do Admin mantidos e validados por E2E.
- [x] Sequencia automatica sem regressao.
- [x] Veredito Final sem regressao.
- [x] Historico/export/limpeza sem regressao.

## Performance

- [x] GIF morto de 9.42 MB removido.
- [x] Video de fundo sem preload antecipado quando invisivel.
- [x] Bundle JS final segue pequeno para o escopo: 264.94 kB, gzip 79.49 kB.
- [x] Custo restante documentado como assets grandes.

## Visual e UX

- [x] Stage sem overflow nas viewports testadas.
- [x] Screenshots gerados no pacote Harness 3.3.
- [x] Placar voltou a expor `PTS` no DOM.
- [x] Sem mudanca de visual cafona ou mecanica nova.

## Pendencias recomendadas

- Comprimir ou redimensionar `logoinfo.png`, `senhor-destino.png`, `projeto.png`, `bg-FNL2.png` e `02.png` em uma fatia propria de assets.
- Avaliar patch update de `jsdom` 29.1.0 -> 29.1.1 em janela separada.
- Manter `@types/node` em 24.x por enquanto; 25.x e major e nao foi autorizado.

