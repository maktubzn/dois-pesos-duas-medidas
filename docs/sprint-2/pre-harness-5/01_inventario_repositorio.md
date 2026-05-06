# Pre-Harness 5 - Inventario do repositorio

Data: 2026-05-04

## Escopo

Limpeza controlada antes do Harness 5. Nao houve alteracao de jogo, Admin, pre-show, Final Show, pontuacao, Arduino `.ino` ou backend.

## Pastas principais

| Pasta | Tamanho antes | Tamanho depois | Funcao provavel | Acao |
| --- | ---: | ---: | --- | --- |
| `src/` | 0.35 MB | 0.35 MB | Codigo da aplicacao React/Vite. | Preservada. |
| `public/` | 46.84 MB | 46.84 MB | Assets vivos servidos por caminhos publicos. | Preservada. |
| `img/` | 17.89 MB | removida da raiz | Duplicatas antigas de `public/img`. | Movida para residuos. |
| `dist/` | 42.67 MB | removida da raiz | Build gerado pelo Vite. | Movida antes e depois da validacao. |
| `docs/sprint-2/` | 835.91 MB | 267.86 MB | Documentacao e evidencias de harnesses. | Evidencias antigas pesadas movidas. |
| `_residuos/` | 224.64 MB | consolidado em `pre-harness-5` | Residuos antigos. | Consolidado. |
| `automacao/` | 0.01 MB | 0.01 MB | Automacao externa do operador. | Preservada. |
| `tests/` | 0.05 MB | 0.05 MB | Testes e2e/visuais. | Preservada. |
| `tools/` | 0.03 MB | 0.03 MB | Arduino virtual, scripts Windows e otimizacao. | Preservada. |
| `test-results/` | temporario | removida da raiz | Saida Playwright pos-validacao. | Movida para residuos. |

## Arquivos grandes encontrados

| Caminho | Tamanho | Classificacao | Acao |
| --- | ---: | --- | --- |
| `docs/sprint-2/harness-4.7/evidencias/operador-profissional/playwright-output/.../trace.zip` | 198.80 MB | Trace antigo pesado. | Movido. |
| `docs/sprint-2/harness-4.7/evidencias/traces/preshow-full-trace.zip` | 93.66 MB | Trace antigo pesado. | Movido. |
| `_residuos/harness-3.4/tooling/.playwright-mcp/...log` | 37.78 MB | Residuo ja classificado. | Consolidado. |
| `docs/sprint-2/harness-4.8/evidencias/playwright-output/harness-4.9.../trace.zip` | 21.61 MB / 16.67 MB | Playwright output mal posicionado. | Movido. |
| `public/img/mesa-tribunal.png` | 4.54 MB | Asset publico preservado. | Preservado. |
| `public/audio/fundo tribunal.mp3` | 4.48 MB | Audio publico preservado. | Preservado. |

## Assets duplicados

| Caminho | Tamanho | Duplicado de | Uso confirmado | Recomendacao | Acao tomada |
| --- | ---: | --- | --- | --- | --- |
| `img/01.png` | 2.03 MB | `public/img/01.png` | Runtime usa `/img/01.png` via `public/`, nao a pasta raiz. | Mover. | Movido. |
| `img/02.png` | 3.27 MB | `public/img/02.png` | `public/img-optimized/02.webp` e `public/img/02.png` preservados. | Mover raiz. | Movido. |
| `img/03(header).png` | 1.95 MB | `public/img/03(header).png` | Runtime usa `/img/03(header).png` via `public/`. | Mover raiz. | Movido. |
| `img/04(brasao).png` | 2.20 MB | `public/img/04(brasao).png` | Runtime usa `/img/04(brasao).png` via `public/`. | Mover raiz. | Movido. |
| `img/barraMoldura.png` | 2.30 MB | `public/img/barraMoldura.png` | Runtime usa `/img/barraMoldura.png` via `public/`. | Mover raiz. | Movido. |
| `img/BGVIDEO.mp4` | 2.73 MB | `public/img/BGVIDEO.mp4` | Runtime usa `public/img-optimized/BGVIDEO.mp4`. | Mover raiz. | Movido. |
| `img/brasao dc.png` | 2.07 MB | `public/img/brasao dc.png` | Runtime usa `/img/brasao dc.png` via `public/`. | Mover raiz. | Movido. |
| `img/projeto.png` | 1.33 MB | Copias historicas em residuos. | Sem referencia viva fora de docs/residuos. | Mover. | Movido. |

## Builds gerados

`dist/` foi confirmado como build Vite gerado por `rtk npm run build`. O comando de build recriou `dist/` durante a validacao, entao a pasta foi movida duas vezes:

- `dist-pre-validacao`
- `dist-pos-validacao`

## Evidencias antigas

Movidas evidencias antigas pesadas de:

- `docs/sprint-2/harness-4.6/evidencias/playwright-output`
- `docs/sprint-2/harness-4.7/evidencias/traces`
- `docs/sprint-2/harness-4.7/evidencias/visual/playwright-output`
- `docs/sprint-2/harness-4.7/evidencias/operador-profissional/playwright-output`
- `docs/sprint-2/harness-4.7/evidencias/videos`
- `docs/sprint-2/harness-4.7/evidencias/operador-profissional/videos`
- `docs/sprint-2/harness-4.8/evidencias/playwright-output`

Foram preservadas as evidencias canonicas recentes em `docs/sprint-2/harness-4.8/evidencias/` e `docs/sprint-2/harness-4.9/evidencias/`.

## Scripts e automacoes

Preservados:

- `automacao/operador-profissional.spec.ts`
- `automacao/playwright.config.ts`
- `tests/e2e/visual/*.spec.ts`
- `tools/arduino-virtual/`
- `tools/windows/*.bat`
- scripts `visual:*`, `test:e2e`, `arduino:virtual:self-test` e `automacao:operador` em `package.json`

## Riscos

| Grupo | Risco | Mitigacao |
| --- | --- | --- |
| `dist/` | Baixo: alguem pode querer abrir build pronto sem rodar build. | Restaurar de `_residuos/pre-harness-5/dist/` ou rodar `rtk npm run build`. |
| `img/` raiz | Medio-baixo: algum script externo fora do repo pode depender dela. | Runtime validado usa `public/`; restaurar pasta de residuos se necessario. |
| Evidencias 4.6/4.7 | Baixo para app, medio para auditoria historica. | Nada foi deletado; traces/videos continuam em residuos. |
| `_residuos/harness-*` | Baixo: ja eram residuos. | Estrutura preservada dentro de `outros/residuos-anteriores`. |
