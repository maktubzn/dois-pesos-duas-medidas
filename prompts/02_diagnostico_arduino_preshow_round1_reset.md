# Prompt 02 — Diagnóstico Profundo: Arduino, Pré-show, Primeira Rodada e Reset

## Objetivo

Investigar:
1. Teste de mesa no pré-show falha.
2. Suspeita de ausência de reset após Mesa A.
3. Primeira rodada: botão azul reconhecido mas não computado.
4. Reset manual precisa virar ação visível no Admin.

## Hipóteses

- H1: pré-show aceita Mesa A, mas não reseta/prepara para Mesa B.
- H2: evento bruto chega, mas `receiveInput` rejeita por fase, inputReady, buzzLocked, timerStatus ou preShowInputCheckStatus.
- H3: round 1 tem caminho diferente porque nasce de `startQuiz`.
- H4: reset físico salva o fluxo, então precisa virar botão operacional.

## O que mapear

- `startPreShowInputCheck`.
- Reconhecimento Mesa A/B no pré-show.
- Logs antes/depois de Mesa A.
- Comandos enviados ao Arduino após Mesa A.
- Processamento do botão azul na primeira rodada.
- Diferença fallback Admin vs botão físico.
- Evento bruto, grupo resolvido e reason de rejeição.

## Instrumentação

Se necessário, adicionar logs com:
- raw event;
- source;
- resolvedGroup;
- phase;
- inputReady;
- buzzLocked;
- timerStatus;
- preShowInputCheckStatus;
- activeGroup;
- rejectionReason.

## Documento

Atualizar `02_relatorio_diagnostico.md` com seção `Diagnóstico Arduino/Pré-show/Round 1`.

## Saída

Causa provável, camada responsável, testes necessários e proposta segura para reset manual.
