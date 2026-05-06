# Harness 9 - Plano de Execucao

## Ordem de implementacao

1. Fechar mapa tecnico dos fluxos Arduino/Admin/Stage/store.
2. Provar origem dos botoes invertidos sem alterar `.ino`.
3. Ajustar calibracao somente depois da prova.
4. Preparar/resetar hardware/input no clique de `Proxima rodada`.
5. Endurecer countdown contra travar em 1s e transicao dupla.
6. Reproduzir e corrigir pontuacao no round 1.
7. Trocar tempo de resposta para 20s por constante nomeada.
8. Implementar penalidade de silencio apos pegar a vez.
9. Ajustar texto/timing do pre-show de forma controlada.
10. Adicionar logs, testes, simulacao e relatorios.

## Arquivos provaveis

- `src/store/gameStore.ts`
- `src/types/game.types.ts`
- `src/utils/serialEventToGroup.ts`
- `src/utils/preShowTimeline.ts`
- `src/components/PreShowScreen/PreShowScreen.tsx`
- `src/components/Admin/AdminPage.tsx`
- `src/components/RoundIntroCountdown/RoundIntroCountdown.tsx`
- `src/store/gameStore.test.ts`
- `tests/e2e/harness-8-core.spec.ts`
- novo teste Harness 9 em `tests/e2e/` ou `automacao/`
- `tools/arduino-virtual/` se for preciso ampliar protocolo/teste sem mexer no `.ino`

## Estrategia por bug

- Botoes invertidos: comparar `.ino`, protocolo virtual, parser, calibracao serial e fallback; alterar apenas a camada comprovadamente errada.
- Reset Proxima rodada: separar preparacao logica/hardware de reset de partida; preservar placar e round.
- Countdown 1s: garantir finalizacao por deadline e token, independente de serial.
- Pontuacao round 1: escrever teste que executa fluxo desde `startQuiz`.
- 20s: trocar `ANSWER_RESPONSE_SECONDS` por constante sem numero magico.
- Silencio: criar caminho de timeout com activeGroup, evento historico e guarda contra duplicidade.
- Pre-show: ajustar copy e possivelmente janelas existentes sem refazer UI.

## Gates de validacao

- Nenhum codigo antes de SPEC/PLANO/diagnostico.
- Nenhuma mudanca no `.ino` sem diagnostico conclusivo.
- Todos os comandos via `rtk`.
- Residuos movidos para `_residuos/` se surgirem.
- Teste quebrado deve ser reportado, nao escondido.

## Matriz de testes

- Unit: calibracao BT1/BT2.
- Unit: round 1 pontua +10.
- Unit: timeout com activeGroup aplica -10/+10 uma vez.
- Unit: timeout sem activeGroup chama Tribunal sem punicao.
- E2E: countdown finaliza sem travar em 1.
- E2E: Proxima rodada preserva placar e prepara mesa.
- E2E: pre-show exibe textos e teste A/B.
- Automacao: tres partidas com acerto, erro, silencio e Tribunal.

## Subagentes e responsabilidades

Nenhum subagente sera usado por padrao. O harness pede orquestracao principal, e a politica do ambiente so permite subagentes quando solicitados explicitamente.

## Riscos e mitigacao

- Hardware fisico nao validavel pelo Playwright: mitigar com checklist de ensaio fisico.
- Timers longos aumentam tempo de e2e: mitigar com testes unitarios de clock e e2e focado.
- Calibracao fisica pode variar: documentar mapa BT1/BT2 bruto e calibrado no Admin/logs.
