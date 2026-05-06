# Prompt 03 — Botão Manual Visível de Reset do Arduino no Admin

## Objetivo

Adicionar botão de reset do Arduino bem visível na tela principal do Admin.

## Requisitos

O botão deve:
- ficar em área principal;
- ter texto claro: `Resetar Arduino` ou `Resetar mesa física`;
- chamar comando correto de reset/preparo físico;
- não zerar placar;
- não reiniciar partida;
- não avançar rodada;
- não abrir input indevidamente;
- registrar log claro;
- funcionar como recuperação operacional.

## Comportamento

Ao clicar:
1. `MANUAL_ARDUINO_RESET_REQUESTED`
2. Enviar `RESET_HW`, se este for o protocolo real.
3. Enviar `LOCK`, se o estado não permitir input.
4. Enviar `STATUS`, se seguro.
5. Registrar `OK`, `WARN` ou `ERROR`.

## Segurança

- Se serial ausente, mostrar aviso e manter fallback.
- Debounce curto contra spam serial.
- Sem alert bloqueante desnecessário.
- Botão visível, não escondido no técnico.

## Testes

- E2E botão aparece.
- Clique registra log.
- Não zera placar.
- Mantém fallback Mesa A/B.

## Saída

Arquivos, comando usado, proteções, testes e validação física.
