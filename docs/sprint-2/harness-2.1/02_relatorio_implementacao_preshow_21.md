# Harness 2.1 - Relatorio de Implementacao

## 1. Arquivos alterados

- `src/utils/preShowTimeline.ts`
- `src/store/gameStore.ts`
- `src/store/gameStore.test.ts`
- `src/components/PreShowScreen/PreShowScreen.tsx`
- `src/components/PreShowScreen/PreShowScreen.module.css`
- `src/components/Admin/AdminPage.tsx`
- `src/components/Admin/AdminPage.module.css`
- `tests/e2e/quiz-stage.spec.ts`

## 2. Assets usados

- Logo: `/img/logoinfo.png`
- Video: `/img/video1.mp4`

Os assets foram usados pelos caminhos Vite de `public` e nao foram movidos, renomeados ou sobrescritos.

## 3. Como a tela de logo funciona

`waiting_logo` renderiza a logo central em fundo preto, com movimento discreto e texto curto de espera. Se a imagem falhar, a Stage mostra fallback textual `INFO`.

## 4. Como o video funciona

`PreShowScreen` renderiza `<video muted playsInline preload="auto">` com `/img/video1.mp4`, sem loop e sem controles nativos. O componente sincroniza `play()` e `pause()` com `preShowStatus`, trata rejeicao de `play()`, escuta `loadedmetadata`, `timeupdate`, `ended` e `error`, e usa fallback visual quando necessario.

## 5. Como o titulo por codigo funciona

O titulo nao esta dentro do video. Ele e renderizado em `PreShowScreen.tsx` dentro de um overlay com `data-title-source="code"`:

- `DOIS PESOS,`
- `DUAS MEDIDAS`

A entrada visual usa a duracao real do video quando disponivel e fallback de 8s quando metadata ainda nao existe.

## 6. Como o "Como funciona" foi implementado

`how_to_play` mostra um briefing curto, em blocos grandes:

- Dois grupos entram em confronto.
- O botao de vez define quem responde primeiro.
- O operador controla o andamento.
- No fim, vence quem julgar melhor.

O texto publico antigo `buzz` nao foi introduzido.

## 7. Como o fallback funciona

- Falha da logo: mostra `INFO`.
- Falha/rejeicao do video: mostra fundo escuro com logo, mantem o titulo por codigo e deixa a timeline seguir pelo Admin.
- `prefers-reduced-motion`: reduz animacoes e evita depender de movimento para operar.

## 8. O que foi preservado

- Arduino e `.ino`.
- Web Serial e comandos seriais.
- BroadcastChannel existente.
- Mapeamento A/B.
- Reset automatico.
- Fluxo de 5 rounds.
- Timer automatico do jogo.
- Pontuacao.
- Conteudo real das perguntas.
- Backend.

## 9. Limites

Nao foi implementado sistema completo de audio, conteudo real, game over novo, backend, nem revisao do firmware. A logo foi usada como fornecida; o arquivo original contem fundo visual embutido e nao foi editado.
