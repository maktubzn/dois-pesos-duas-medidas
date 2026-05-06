# RTK Contexto Atual - Fatia 01

Data: 2026-04-27

## Objetivo atual

Corrigir a tela principal do quiz "Dois Pesos, Duas Medidas" sem refatoracao global:
- scorebar/cabo de guerra;
- pergunta central;
- remocao do martelo DOM extra;
- ocultacao do BUZZ HTML;
- base segura de Web Serial API;
- fallback por teclado.

## Fonte da verdade

- `AGENTS.md`
- `README.md`
- `prompts/00_ANALISE_VISUAL_DO_PNG.md`
- `prompts/01_PROMPT_HARNESS_ORQUESTRADOR_SETUP.md`
- `prompts/02_PROMPT_HARNESS_QA_VISUAL_PLAYWRIGHT.md`
- `prompts/03_PROMPT_HARNESS_PESQUISA_CONTEXT7.md`
- `prompts/04_PROMPT_HARNESS_IMPLEMENTACAO_FATIA_01.md`
- `prompts/05_PROMPT_HARNESS_VALIDACAO_CONGELAMENTO.md`
- `docs/GSD_BACKGROUND_STAGE.md`
- `docs/GSD_STAGE_02_INTRO_AND_LAYOUT.md`
- `img/projeto.png`

## Arquivos diretamente afetados

- `index.html`
- `components/group-card.js`
- `components/group-card.css`
- `docs/ai-harness/**`

## APIs globais atuais

- `GameBackground`
- `GameIntro`
- `ScoreBar`
- `QuizStage`
- `QuizPhase`
- `CardGroups`
- `ArduinoBridge`

## Regras operacionais

- Comandos shell via `rtk`.
- Nao instalar dependencias.
- Nao fazer commit.
- Nao apagar arquivos.
- Validar com Playwright/browser antes de declarar concluido.

