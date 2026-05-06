# Prompt 04 — Áudio do Botão de Vez / Clique para Falar

## Objetivo

Corrigir ausência de áudio quando jogador aperta botão de vez.

## Diagnóstico

Mapear:
- onde sons existentes são disparados;
- como áudio é desbloqueado;
- AudioManager/soundMap/useGameAudio;
- evento de input aceito;
- se falha é evento, arquivo ausente, bloqueio do browser, volume, render duplicado ou divergência Stage/Admin.

## Requisitos

- Tocar uma vez por botão de vez aceito.
- Não tocar em input rejeitado.
- Não duplicar por re-render.
- Não quebrar modo sem áudio.
- Registrar aviso se áudio bloqueado.

## Contrato recomendado

`INPUT_ACCEPTED` ou `ANSWER_WINDOW_STARTED` dispara som de clique.

## Testes

- Unitário de mapa de áudio.
- Teste sem duplicidade.
- E2E/manual com áudio ativado.

## Saída

Causa, evento escolhido, arquivos, anti-duplicidade e testes.
