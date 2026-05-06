# Harness 7 - Plano Admin e pre-show sem pulos

## Escopo

- Corrigir apenas o pacing do pre-show e a reconstrucao visual/operacional do Admin.
- Nao alterar regra do quiz, pontuacao, regra do Tribunal, Final Show, backend ou Arduino `.ino`.
- Usar Uiverse apenas como inspiracao de linguagem: painel escuro, botoes destacados, cards com profundidade e hierarquia clara.

## Pre-show

- Alongar as cenas de ensino para leitura confortavel.
- Contrato aplicado:
  - titulo: 8.8s a 16s;
  - "Aperte primeiro": 16s a 26s;
  - "Acertou +10": 26s a 36s;
  - "Errou +5 rival": 36s a 46s;
  - "Tribunal": 46s a 58s;
  - teste da mesa: 58s a 70s;
  - pronto: 70s a 80s.
- Impedir salto automatico quando o navegador atrasa ticks: cada tick automatico do Admin avanca no maximo 1.25s.
- Manter comandos manuais de teste de mesa e iniciar quiz sem mudar regra.

## Admin

- Trocar a superficie principal por painel escuro operacional.
- Manter sidebar, topbar de telemetria, acao principal, deck de operacao, preview, decisao e gaveta tecnica.
- Mostrar no maximo uma acao primaria dominante via `data-primary-action`.
- Manter tecnico fechado por padrao; RESET_HW nao aparece na area principal.
- Preservar nomes acessiveis usados pelos testes existentes, como "Marcar correto".

## Validacao

- Criar `tests/e2e/visual/harness-7-admin-preshow.spec.ts`.
- Gerar evidencias em `docs/sprint-2/harness-7/evidencias/`.
- Rodar suite obrigatoria via `rtk`.
