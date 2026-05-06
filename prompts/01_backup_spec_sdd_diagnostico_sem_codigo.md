# Prompt 01 — Backup, SPEC SDD e Diagnóstico Sem Código

Você é o Orquestrador Técnico Sênior do Harness 9.1.

## Objetivo

Iniciar o Harness 9.1 corretamente:
1. Criar backup.
2. Criar pasta de docs.
3. Ler o estado atual do projeto.
4. Produzir SPEC SDD.
5. Produzir plano de execução.
6. Produzir diagnóstico inicial.
7. Não editar código funcional ainda.

## Ações obrigatórias

### 1. Criar backup

Criar `_backups/harness-9.1/YYYYMMDD-HHMMSS/`.

Preservar `src/`, `tests/`, `automacao/`, `public/`, `tools/arduino-virtual/`, `hardware/` se existir, `package.json`, `yarn.lock`, configs Vite/Playwright/TypeScript e `.bat` existentes.

Excluir `node_modules`, `dist`, backups antigos e evidências antigas pesadas.

Criar `docs/sprint-2/harness-9.1/04_manifesto_backup.md`.

### 2. Criar documentação

Criar:
- `docs/sprint-2/harness-9.1/00_spec_sdd_harness_9_1.md`
- `docs/sprint-2/harness-9.1/01_plano_execucao.md`
- `docs/sprint-2/harness-9.1/02_relatorio_diagnostico.md`

### 3. Mapear o projeto sem editar

Localizar Admin, Stage, cards, brasões atuais, pré-show, hooks Arduino, áudio, store, banco de perguntas, imagens de personagens, evento Tribunal, área de ajuda, scripts e public/img.

## SPEC SDD obrigatória

Escrever objetivo, bugs, melhorias, comportamento esperado, fora de escopo, riscos, critérios de aceite e Definition of Done.

## Plano obrigatório

Escrever ordem de execução, arquivos prováveis, estratégia por bug, estratégia visual, estratégia de assets, estratégia do `.bat`, matriz de testes e rollback.

## Diagnóstico obrigatório

Mapear onde cada problema vive no código:
- teste de mesa;
- reset;
- primeira rodada;
- áudio;
- cards/brasões;
- imagens/personagens;
- Admin/resposta correta;
- Tribunal;
- ajuda;
- scripts.

## Proibições

Não editar código funcional neste prompt. Não alterar `.ino`. Não mover imagens. Não criar `.bat` ainda.

## Saída obrigatória

Responder com backup, docs criados, mapa inicial, riscos e próximo prompt.
