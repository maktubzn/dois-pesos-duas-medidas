# Harness 8 - Plano de Input, Countdown e Simulacao

## Escopo
- Corrigir o fluxo funcional do quiz sem alterar pontuacao, regra central do Tribunal, Arduino `.ino`, backend ou Final Show.
- Preservar o pre-show aprovado, alterando apenas a rotina dinamica de teste A/B quando necessario.
- Usar Admin e Stage reais; `QuizStageDebug` nao e caminho principal da validacao.

## Backup
- Backup criado antes das alteracoes em `_backups/harness-8/20260505-090501/`.
- Manifestos:
  - `_backups/harness-8/20260505-090501/MANIFESTO_BACKUP.md`
  - `docs/sprint-2/harness-8/04_manifesto_backup.md`

## Problemas confirmados
- A pergunta era revelada antes de `UNLOCK/openBuzz`, deixando uma janela em que a TV mostrava pergunta competitiva mas os botoes ainda nao estavam prontos.
- O store aceitava input em fases amplas demais, incluindo `question_reveal`, o que misturava input antes de pronto com input valido.
- A sidebar do Admin era visual: os itens eram `span`, sem navegacao, estado clicavel ou efeito operacional.
- O fallback por teclado funcionava em casos simples, mas ficou fragil em simulacoes longas. Foi necessario expor botoes operacionais Mesa A/B no Admin, usando o mesmo pipeline de input.
- O lint varria `_backups/` e `_residuos/`, o que quebrava o comando apos criar backup.

## Estrategia
- Tornar a ordem explicita: `round_countdown` -> `round_preparing` -> `input_ready` -> `question_reveal` -> `buzz_open`.
- Centralizar input em `receiveInput(group, source)`.
- Rejeitar input fora de `buzz_open` com telemetria `INPUT_REJECTED` e motivo.
- Aceitar input valido uma vez com telemetria `INPUT_ACCEPTED`, grupo, fonte, fase e timestamp.
- Fazer o teste A/B do pre-show usar o mesmo pipeline (`receiveInput`) sem pontuar e sem iniciar quiz.
- Tornar a sidebar do Admin navegavel, com `aria-current`, log `SIDEBAR_NAV` e abertura do tecnico apenas quando selecionado.
- Criar automacao removivel `automacao/harness-8-human-match.spec.ts` para 3 partidas completas.
