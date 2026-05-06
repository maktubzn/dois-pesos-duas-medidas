# Harness 3.1 - Plano e decisoes

## Escopo executado

Harness 3.1 adiciona conteudo real estruturado ao motor do Harness 3:

- banco de personagens com imagens em `/img das perguntas`;
- banco de perguntas A/B;
- banco de perguntas de desempate;
- algoritmo deterministico por seed para montar 10 rounds;
- Veredito Final em morte subita quando o round 10 termina empatado;
- historico local e exportacao CSV;
- preview read-only da TV dentro do Admin;
- card operacional de resposta A/B no Admin.

Foram preservados: Arduino `.ino`, Web Serial estrutural, BroadcastChannel estrutural, mapeamento A/B, reset automatico, backend e sistema completo de audio.

## Pesquisa tecnica

Achados usados:

- Vite serve arquivos em `public` pela raiz do app; por isso as imagens entram como `/img das perguntas/<arquivo>.png`.
- Como a pasta publica tem espaco no nome, o helper `makeQuestionImageSrc()` aplica `encodeURI()` no path completo.
- React: efeitos com timer/intervalo seguem cleanup no retorno de `useEffect`.
- Zustand: estado e acoes ficam centralizados no store; persistencia do historico foi isolada em utilitario para nao misturar UI e storage.
- Web Storage/localStorage: usado apenas para historico local da maquina do operador.
- CSV: gerado no browser com `Blob`, `URL.createObjectURL`, atributo `download` e `URL.revokeObjectURL`.
- Playwright: usado para screenshots, validacao visual, fluxo Admin/Stage e download de CSV.
- Shuffle: Fisher-Yates seeded; nao foi usado `sort(() => Math.random() - 0.5)`.

Context7 foi consultado para React, Zustand, Vite e Playwright. Pesquisa web atualizada foi usada nas fontes oficiais de Vite/React/Playwright/MDN quando necessario. GSD nao estava disponivel como ferramenta local ou comando reconhecido via `rtk`; o estado foi registrado manualmente neste pacote.

## Decisoes de modelagem

- `QuizQuestion` tem tres formatos: `character_image`, `text_choice` e `tie_breaker`.
- Rounds 1 a 8 usam `character_image`.
- Rounds 9 e 10 usam `text_choice`.
- O quiz principal sempre tem 10 rounds.
- O `activeSlot` continua ciclando entre 1 e 5 para preservar a UI dos cards existentes.
- O Veredito Final usa perguntas A/B, nao soma pontos e so termina quando um grupo acerta.
- Se os dois grupos erram ou o tempo acaba no Veredito Final, outra pergunta de desempate e carregada.
- A Stage nunca mostra resposta correta, alias ou metadado de correcao.
- O Admin mostra resposta correta e alias apenas na area operacional.

## Auditoria de imagens

Foram encontrados 25 PNGs em `public/img das perguntas`. Todos foram mantidos sem edicao. A maioria esta em retrato, adequada ao card com `object-fit: contain`.

Alerta registrado: `senhor-destino.png` tem dimensoes grandes, aproximadamente 2632x2390 e mais de 5 MB. O asset foi aceito por estar dentro da pasta fornecida, mas pode ser otimizado em uma fatia futura.

## Riscos tratados

- Espaco no path publico tratado por `encodeURI`.
- Card da TV usa dimensoes fixas e `overflow: hidden`.
- Historico local tem limite de 500 eventos persistidos.
- CSV escapa aspas, virgulas e quebras de linha.
- Admin separa fluxo manual de imagem e fluxo automatico A/B.
