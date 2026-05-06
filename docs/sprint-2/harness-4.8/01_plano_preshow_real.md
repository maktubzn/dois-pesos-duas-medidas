# Harness 4.8 - Plano Pre-show Real

## Objetivo

Corrigir somente o pre-show: abertura escura, video persistente, ensino curto, teste de mesa A/B e pronto manual. Fora do escopo: timers da partida, pontuacao, Tribunal, Final Show, backend e Arduino `.ino`.

## Plano aplicado

- Timeline fixa de 42s, com video entre blackout e titulo, depois frame final segurado como base visual.
- Ensino dividido em quatro telas curtas: apertar primeiro, acerto +10, erro +5 para rival e Tribunal.
- Teste da mesa segurado na Stage ate A/B serem reconhecidos ou o Admin avancar manualmente.
- Admin ajustado apenas nos controles de pre-show para reduzir duplicacao visivel.
- Musica do pre-show guiada pela cena da timeline, com ducking em ensino/teste e fade ao sair da intro.

## Validacao esperada

- Video completo do pre-show.
- Frames a cada 1s.
- JSON com `video.currentTime`, `data-video-state`, cena, fase e assets carregados.
- Mesa A/B reconhecida sem pontuar, sem iniciar quiz e sem alterar rodada.
- Quiz nao inicia sozinho.
