# 02 - Relatorio de Diagnostico Inicial - Harness 9.1

## Estado do Prompt 01

Diagnostico inicial feito sem alteracao funcional. Backup criado em:

```txt
_backups/harness-9.1/20260505-215308/
```

## Estrutura relevante

| Area | Arquivos principais | Observacao |
|---|---|---|
| Rotas | `src/App.tsx` | `/admin` usa Admin; demais rotas usam Stage |
| Admin | `src/components/Admin/AdminPage.tsx` e `.module.css` | concentra controle, pre-show, partida, Tribunal, historico e tecnico |
| Stage | `src/components/QuizStage/QuizStage.tsx` e `.module.css` | telão, cards, pre-show, perguntas e Tribunal |
| Store | `src/store/gameStore.ts` | fluxo de jogo, buzz, pontuacao, pre-show e telemetria |
| Serial | `src/hooks/useArduinoSerial.ts` | Web Serial somente no Admin |
| Audio | `src/audio/*`, `src/hooks/useStageAudioController.ts` | eventos e manifest de audio |
| Cards | `src/components/GroupCard/GroupCard.tsx` | ainda usa brasoes genericos para A/B |
| Banco | `src/data/questionBank.ts` | imagens de personagens derivadas de lista local |
| Assets | `public/img/` | novos brasoes A/B ja existem |
| Arduino virtual | `tools/arduino-virtual/` | self-test disponivel |

## Achados iniciais

### Admin e reset Arduino

- Ja existe reset tecnico em `AdminPage`, ligado a `runResetHardware`.
- O botao atual fica na area tecnica, portanto nao atende plenamente ao requisito de reset bem visivel para operacao.
- `useArduinoSerial` expoe `resetHardware` com comando `RESET_HW`.
- Proxima fase deve confirmar se reset/preparo ocorre depois do clique no botao A durante pre-show/round 1.

### Pre-show Mesa A/B

- O Admin possui handlers para teste de entrada do pre-show.
- O store possui `startPreShowInputCheck` e `tickPreShow`.
- Risco: o caminho de teste pode aceitar evento visual mas nao restaurar estado/lock/reset corretamente para o round 1.
- Proxima fase precisa provar com fluxo BT1/BT2 e fallback.

### Round 1 e botao azul

- O store centraliza `receiveHardwareBuzz` e `handleSerialMessage`.
- O Harness 9 ja mudou pontuacao inicial e regra de silencio.
- Sintoma real indica que o evento pode ser reconhecido, mas barrado por fase/estado ou nao ligado a decisao/pontuacao.
- Proxima fase deve rastrear fase, `activeResponder`, logs e decisao no primeiro round.

### Audio do botao de vez

- Manifest inclui audio de "grupo pegou vez" em `src/audio/audioManifest.ts`.
- Eventos de audio ficam em `src/audio/audioEvents.ts`.
- Hipoteses: evento nao emitido no buzz valido, stage audio nao sincroniza esse tipo de evento, ou navegador ainda sem permissao/autoplay.
- Proxima fase deve validar emit/log antes de alterar.

### Brasoes dos cards

- `GroupCard` ainda aponta os dois grupos para imagens genericas:
  - `/img/04(brasao).png`
  - `/img/brasao dc.png`
- Novos arquivos existem:
  - `public/img/brasao-groupA.png`
  - `public/img/brasao-groupB.png`
- Alteracao futura deve ser pontual no mapa de tema dos grupos.

### Banco de imagens/personagens

- `questionBank.ts` possui lista de arquivos de personagem.
- A regra de Harness 9.1 exige curadoria antes de entrada no banco ativo.
- Nenhuma imagem foi movida ou quarentenada no Prompt 01.

### Tribunal

- Stage possui overlay de Tribunal no `QuizStage`.
- Requisito novo pede modal full-screen com fundo preto.
- Deve ser alteracao visual restrita ao evento, sem recriar Stage.

### Admin visual e ajuda

- Admin tem modal de ajuda e seções operacionais.
- Limpeza CSS deve focar areas brancas/ruidos sem redesenho.
- Admin ja mostra resposta correta em area de decisao, mas precisa reforcar nome do personagem exibido e referencia correta.

### Infra `.bat`

- `package.json` tem scripts npm.
- Existe `package-lock.json`.
- Nao foi encontrado `yarn.lock`.
- O requisito menciona `yarn dev`; a implementacao segura deve diagnosticar instalacao/uso de Yarn sem quebrar repo npm.

## Pendencias para Prompt 02

- Rastrear fluxo BT1/BT2 no pre-show e round 1.
- Confirmar se `RESET_HW`/preparo ocorre no momento certo.
- Validar se o botao azul reconhecido morre por fase, lock, active responder ou decisao.
- Registrar se `.ino` precisa ou nao de mudanca. Ate aqui: nao ha prova para mexer.

## Sem alteracoes funcionais nesta fase

Foram criados apenas documentos e manifesto de backup. Codigo, assets, Arduino e scripts de execucao permanecem sem mudanca funcional no Prompt 01.

## Diagnostico Arduino/Pre-show/Round 1

### Causa provavel

- Pre-show Mesa A/B: o Admin liberava a mesa ao entrar no teste, mas nao repetia reset/preparo fisico depois que a Mesa A era reconhecida. Em hardware real, isso combina com a falha relatada de A funcionar e B falhar ou ficar em estado preso.
- Round 1 com botao azul: o store processa `BT2PRESS` como Grupo B quando a fase esta em `buzz_open`. O risco real era o evento chegar fora da janela correta e ser visto como "reconhecido" no serial, mas rejeitado pelo pipeline por fase/timer/input.
- Audio do botao de vez: o manifest apontava `grupo_pegou_vez` para `/audio/sfx/grupo_pegou_vez.mp3`, arquivo inexistente. Havia asset local de buzzer em `public/audio/Buzzer sound effect - Sound Meme (youtube).mp3`.
- Imagens de perguntas: o banco ativo apontava arquivos `*-removebg-preview.png` ausentes. A pasta real continha 17 JPEGs de WhatsApp.

### Camada responsavel

| Sintoma | Camada | Decisao |
|---|---|---|
| Mesa A reconhece e fluxo falha depois | Admin + protocolo serial | reset/preparo no inicio e a cada mudanca do teste A/B |
| Botao azul reconhecido sem computar | Store/logs | manter pipeline, enriquecer logs com fase, timer, lock e inputReady |
| Audio ausente ao pegar a vez | Audio manifest/controller | apontar para asset existente e evitar duplicidade por re-render |
| Brasoes genericos | GroupCard | mapear asset por grupo |
| Banco de imagens ausente | questionBank | mapear apenas imagens identificadas e compativeis |

### Arduino `.ino`

Nao foi alterado. O diagnostico nao provou erro no firmware. O arquivo em `hardware/` continua preservado pelo backup.

### Validacao prevista

- Unitario: `BT2PRESS` no round 1 entra como Grupo B e pontua.
- Unitario: logs de input incluem `inputReady`, `buzzLocked`, `timerStatus` e `preShowInputCheckStatus`.
- Manual fisico: conectar Arduino no Admin, clicar `Testar mesa`, pressionar Mesa A, confirmar log de reset/preparo, pressionar Mesa B.
- Manual fisico: iniciar round 1, pressionar botao azul, confirmar `INPUT_ACCEPTED` e pontuacao no Admin/Stage.
