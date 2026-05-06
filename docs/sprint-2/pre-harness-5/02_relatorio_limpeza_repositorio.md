# Pre-Harness 5 - Relatorio de limpeza do repositorio

Data: 2026-05-04

## 1. O que foi encontrado

- `dist/` estava presente na raiz como build gerado por Vite, com 42.67 MB.
- `img/` na raiz tinha 8 arquivos e 17.89 MB, duplicando assets vivos em `public/img`.
- `docs/sprint-2/` tinha 835.91 MB, principalmente traces e videos antigos de Playwright.
- `_residuos/` ja tinha 224.64 MB de residuos antigos em `harness-3.4` e `harness-4.7`.
- `public/` tinha 46.84 MB de assets vivos e foi preservado.
- `tools/`, `automacao/`, `tests/` e scripts `.bat` estavam pequenos e funcionais.

## 2. O que foi movido

| Origem | Destino | Motivo |
| --- | --- | --- |
| `dist/` | `_residuos/pre-harness-5/dist/dist-pre-validacao/` | Build Vite gerado. |
| `dist/` pos-build | `_residuos/pre-harness-5/dist/dist-pos-validacao/` | Build recriado pela validacao. |
| `img/` | `_residuos/pre-harness-5/assets-duplicados/img-raiz/` | Duplicatas de assets publicos. |
| `docs/sprint-2/harness-4.6/evidencias/playwright-output/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.6/playwright-output/` | Traces antigos. |
| `docs/sprint-2/harness-4.7/evidencias/traces/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.7/traces/` | Trace antigo pesado. |
| `docs/sprint-2/harness-4.7/evidencias/visual/playwright-output/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.7/visual-playwright-output/` | Playwright output antigo. |
| `docs/sprint-2/harness-4.7/evidencias/operador-profissional/playwright-output/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.7/operador-profissional-playwright-output/` | Trace bruto antigo. |
| `docs/sprint-2/harness-4.7/evidencias/videos/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.7/videos/` | Videos antigos. |
| `docs/sprint-2/harness-4.7/evidencias/operador-profissional/videos/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.7/operador-profissional-videos/` | Videos antigos da automacao. |
| `docs/sprint-2/harness-4.8/evidencias/playwright-output/` | `_residuos/pre-harness-5/evidencias-antigas/harness-4.8/misplaced-playwright-output/` | Saidas 4.9 geradas em pasta 4.8. |
| `test-results/` | `_residuos/pre-harness-5/evidencias-antigas/test-results-pos-validacao/` | Saida temporaria de Playwright. |
| `test-results/` final | `_residuos/pre-harness-5/evidencias-antigas/test-results-final-validacao/` | Saida temporaria de Playwright da validacao final. |
| `_residuos/harness-3.4/` | `_residuos/pre-harness-5/outros/residuos-anteriores/harness-3.4/` | Consolidacao de residuos antigos. |
| `_residuos/harness-4.7/` | `_residuos/pre-harness-5/outros/residuos-anteriores/harness-4.7/` | Consolidacao de residuos antigos. |

## 3. O que foi preservado por seguranca

- `public/audio/`
- `public/img/`
- `public/img-optimized/`
- `public/img das perguntas/`
- `public/img das perguntas-optimized/`
- `public/img/mesa-tribunal.png`
- `tools/arduino-virtual/`
- `tools/windows/`
- `automacao/`
- `tests/e2e/visual/`
- docs finais dos Harnesses 4.8 e 4.9
- evidencias canonicas recentes de 4.8 e 4.9

## 4. Arquivos grandes restantes

| Caminho | Tamanho | Motivo para preservar |
| --- | ---: | --- |
| `public/img/mesa-tribunal.png` | 4.54 MB | Asset explicitamente protegido. |
| `public/audio/fundo tribunal.mp3` | 4.48 MB | `public/audio/` protegido. |
| `docs/sprint-2/harness-4.8/evidencias/videos/*.webm` | ate 4.35 MB | Evidencia canonica recente. |
| `public/img/02.png` | 3.27 MB | Fonte publica ainda preservada por seguranca. |
| `docs/sprint-2/harness-4.9/evidencias/videos/*.webm` | ate 3.23 MB | Evidencia canonica recente. |
| `public/img/BGVIDEO.mp4` | 2.73 MB | Fonte publica preservada; runtime tambem usa otimizado. |

## 5. Duplicacoes restantes

- `public/img` ainda contem brutos que tambem possuem versoes em `public/img-optimized`.
- `public/audio` contem arquivos diretos e `_raw` para alguns sons.
- Essas duplicacoes foram preservadas porque a regra do pedido protege `public/audio/` e assets publicos usados ou potencialmente usados por caminhos literais.

## 6. Riscos

- Nao ha `.git` no diretorio atual; a restauracao depende dos arquivos movidos para `_residuos/pre-harness-5/`.
- `dist/` nao fica mais na raiz apos a limpeza. Para servir build pronto, rodar `rtk npm run build`.
- Se algum script externo fora do repo usava a pasta raiz `img/`, restaurar `_residuos/pre-harness-5/assets-duplicados/img-raiz/`.

## 7. Comandos rodados

- `rtk git status --short` - falhou porque o diretorio atual nao e um repositorio Git.
- `rtk npm run typecheck`
- `rtk npm run test -- --run`
- `rtk npm run lint`
- `rtk npm run build`
- `rtk npm run test:e2e`
- `rtk npm run arduino:virtual:self-test`

## 8. Resultado dos testes

| Comando | Resultado |
| --- | --- |
| `rtk npm run typecheck` | Passou. |
| `rtk npm run test -- --run` | Passou: 10 arquivos, 78 testes. |
| `rtk npm run lint` | Passou. |
| `rtk npm run build` | Passou. |
| `rtk npm run test:e2e` | Passou: 22 testes. |
| `rtk npm run arduino:virtual:self-test` | Passou. |

Depois de mover o `dist/` regenerado e a saida temporaria de Playwright, foram repetidos `typecheck`, `test -- --run`, `lint`, `test:e2e` e `arduino:virtual:self-test`; todos passaram novamente.

## 9. Recomendacoes para Harness 5

- Manter `dist/` fora do fluxo de trabalho normal e gerar somente quando necessario.
- Antes de nova rodada visual, ajustar `playwright.visual.config.ts` para nao gravar evidencias 4.9 dentro de pasta 4.8.
- Criar uma politica separada para brutos em `public/img` versus `public/img-optimized`; nao mover nessa limpeza sem uma decisao especifica de runtime.
- Revisar `public/audio/_raw` em um harness proprio de audio, porque esta pasta foi preservada por regra explicita.
