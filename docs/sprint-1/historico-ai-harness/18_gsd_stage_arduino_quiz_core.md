# 18 - GSD Stage Arduino Quiz Core

## Nome da etapa

Stage + Arduino v2 + Quiz Core minimo.

## Objetivo

Corrigir blockers da stage React/Vite, aplicar firmware Arduino v2, integrar protocolo serial ampliado e preparar o fluxo minimo Passa/Repassa sem criar admin completo.

## Estado congelado

- App principal: React + TypeScript + Vite.
- Assets de runtime: `public/img`.
- Legado: preservado em `components/`, `img/` e `backup/legacy-html-20260427-192742`.
- Arduino: sketch v2 compilado e enviado para Uno em `COM6`.
- Web Serial: pronto no frontend, com validacao de suporte e bloqueio documentado para chooser nativo.
- Quiz core: estado minimo no Zustand e pontuacao debug validada.

## Criterios aprovados

- Sem admin completo.
- Sem backend realtime.
- Sem remocao do legado.
- Sem recriacao dos cards.
- Sem dependencia nova.
- Fallback teclado mantido.
- Build, lint, unit tests e E2E aprovados.

## Pendencias

- Teste manual no browser selecionando `COM6` no chooser Web Serial.
- Validar fisicamente os botoes A/B/reset com o hardware montado.
- Resolver `DFPLAYER:ERROR` se audio do DFPlayer for requisito para apresentacao.

