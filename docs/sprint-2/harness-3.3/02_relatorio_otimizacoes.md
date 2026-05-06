# Harness 3.3 - Relatorio de otimizacoes

## Correcoes aplicadas

### CSV injection

Arquivo: `src/utils/historyStorage.ts`

O export CSV agora protege celulas cujo valor comeca com `=`, `+`, `-` ou `@`, inclusive apos espacos iniciais. A celula recebe prefixo de aspas simples antes do escape CSV normal.

Teste adicionado em `src/utils/historyStorage.test.ts` cobre:

- `=HYPERLINK(...)`
- `+1`
- `-1`
- `@cmd`

### Timer debug da Stage

Arquivo: `src/components/QuizStage/QuizStage.tsx`

O atraso de revelacao usado por `window.QuizStageDebug.startNewQuestion()` agora usa refs para armazenar timeout e resolver pendente. `hideQuestionCard` e cleanup de efeito cancelam o timeout, evitando revelacao tardia se a rodada for resetada ou a tela desmontar.

### Placar

Arquivos:

- `src/components/ScoreBar/ScoreBar.tsx`
- `src/components/ScoreBar/ScoreBar.module.css`

O placar voltou a expor `PTS 1250` e `980 PTS` no DOM, mantendo layout compacto e sem mudar pontuacao.

### Video de fundo

Arquivo: `src/components/BackgroundStage/BackgroundStage.tsx`

O video de fundo passou a usar `preload={videoVisible ? 'auto' : 'none'}`. A intencao e evitar preload antecipado do MP4 quando a Stage ainda mostra estado estatico.

### Asset morto

Removido:

- `public/img/BGVIDEO.gif`

Busca local confirmou que o GIF nao era usado pelo app vivo; aparecia apenas como referencia em documentacao antiga. O build final tambem nao contem `dist/img/BGVIDEO.gif`.

### Screenshots 3.3

Arquivo: `tests/e2e/quiz-stage.spec.ts`

O diretorio de screenshots E2E foi atualizado para:

`docs/sprint-2/harness-3.3/screenshots/`

## O que nao foi feito

- Nenhum `npm audit fix --force`.
- Nenhum upgrade major.
- Nenhuma mudanca de regra de jogo.
- Nenhuma mudanca estrutural em Web Serial ou BroadcastChannel.
- Nenhuma compressao destrutiva de asset original.

## Subagentes

Performance + Build + Assets:

- Mediu build e assets.
- Identificou `BGVIDEO.gif` como asset morto.
- Ajustou preload do video de fundo.

Seguranca + Bug Hunter + QA:

- Auditou XSS/storage/CSV.
- Corrigiu protecao de CSV injection.
- Validou build, lint e teste alvo.

