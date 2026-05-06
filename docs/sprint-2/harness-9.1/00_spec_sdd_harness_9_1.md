# 00 - SPEC SDD Harness 9.1

## Escopo

Harness 9.1 cobre correcao operacional real do jogo "Dois Pesos, Duas Medidas", com foco em Admin, Stage, Arduino real/virtual, pre-show, audio, assets visuais e infraestrutura local de abertura.

O trabalho deve preservar as garantias do Harness 9:

- BroadcastChannel como realtime local.
- Arduino conectado apenas pelo Admin.
- Stage sem Web Serial.
- fallback Mesa A/B mantido.
- pipeline unico de input/buzz.
- countdown sem depender de ACK do Arduino.
- pontuacao funcional desde o round 1.
- regra de silencio `-10/+10`.
- pre-show sem pontuar nem iniciar quiz no teste A/B.

## Problemas a corrigir

1. Teste de mesa do pre-show ainda falha nos botoes.
2. Suspeita de falta de reset/preparo depois do clique no botao A.
3. Primeira rodada reconhece botao azul, mas nao processa/computa corretamente.
4. Falta botao manual de reset Arduino bem visivel no Admin.
5. Falta audio quando jogador aperta o botao de vez para falar.
6. Cards ainda usam brasoes genericos em vez de `brasao-groupA.png` e `brasao-groupB.png`.
7. Novo banco de imagens/personagens precisa ser mapeado com curadoria.
8. Imagens com fundo ruim devem ir para analise/quarentena e nao entrar no banco ativo.
9. Admin deve mostrar nome do personagem exibido e referencia da resposta correta.
10. Admin precisa de limpeza visual, especialmente ruido/areas brancas.
11. Evento Tribunal deve virar modal full-screen com fundo preto.
12. Area de ajuda do Admin deve melhorar.
13. Criar `.bat` seguro para dependencia, dev server e abertura de `/admin`.

## Fora de escopo

- Recriar jogo, Admin ou Stage do zero.
- Trocar BroadcastChannel.
- Criar backend.
- Alterar assets por palpite.
- Alterar `.ino` sem diagnostico real.
- Remover fallback Mesa A/B.
- Colocar imagem suspeita no banco ativo.
- Criar script `.bat` destrutivo ou que apague dados.

## Requisitos de asset

Somente imagens aprovadas entram no banco ativo. Se houver fundo problemático, recorte ruim, borda suja, preto chapado indesejado ou duvida de identificacao:

- nao adicionar ao banco de perguntas;
- copiar/renomear com prefixo `anal_`;
- registrar em `assets_para_analise.md`;
- usar ou criar `public/img/_analise/`;
- preservar original.

## Testes obrigatorios finais

```bash
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run lint
rtk npm run build
rtk npm run test:e2e
rtk npm run arduino:virtual:self-test
```

Se houver alteracao em automacao:

```bash
rtk npx playwright test -c automacao/playwright.config.ts --project=chromium
```

## Definicao de pronto

- Diagnostico documentado antes do codigo.
- Reset manual do Arduino acessivel no Admin.
- Pre-show Mesa A/B validado sem pontuar.
- Round 1 processa buzz e pontuacao corretamente.
- Audio de "pegou a vez" dispara no evento correto.
- Brasoes A/B substituidos nos cards.
- Banco de imagens atualizado somente com assets aprovados.
- Tribunal full-screen preto validado.
- Admin sem areas brancas incoerentes.
- `.bat` seguro criado se diagnostico aprovar.
- Testes e relatorio final documentados.

## Parecer Eng Manager

- risco principal: corrigir sintomas de operacao real mexendo demais no fluxo central ja estabilizado no Harness 9.
- arquivos sensiveis: `src/store/gameStore.ts`, `src/components/Admin/AdminPage.tsx`, `src/components/QuizStage/QuizStage.tsx`, `src/hooks/useArduinoSerial.ts`, `src/data/questionBank.ts`.
- o que nao pode mudar: ownership Admin/Stage, BroadcastChannel, fallback Mesa A/B, pipeline unico de buzz, regra de pre-show sem pontuacao.
- estrategia de rollback: usar backup `20260505-215308` e diffs pequenos por prompt.

## Parecer Hardware/Serial

- origem provavel das falhas: ainda indeterminada; precisa comparar fluxo de pre-show, reset/preparo e round 1 no store/Admin antes de culpar `.ino`.
- comandos existentes: `RESET_HW`, `LOCK`, `UNLOCK`, mensagens `BT1`/`BT2`, reset via hook Web Serial.
- alteracao no `.ino` e necessaria? nao nesta fase; falta prova.
- como validar com Arduino virtual: rodar self-test e simular BT1/BT2 em pre-show e round 1.
- como validar com Arduino fisico: conectar pelo Admin, acionar reset manual, testar botao A/B no pre-show, iniciar round 1 e comparar logs.

## Matriz QA inicial

| Bug | Teste | Tipo | Evidencia esperada |
|---|---|---|---|
| Pre-show Mesa A/B falha | acionar BT1/BT2 e fallback durante teste | unit/e2e/manual | ambos registram sem pontuar |
| Reset apos botao A | clicar A e observar preparo/reset | serial/manual | comando de preparo emitido sem zerar jogo |
| Round 1 nao computa | iniciar partida e buzz A/B no round 1 | unit/e2e | buzz aceito e decisao pontua |
| Audio ausente | buzz valido abre vez | runtime/e2e | evento audio `grupo_pegou_vez` disparado |
| Brasoes | renderizar cards A/B | visual | imagens novas usadas |
| Tribunal | abrir evento pelo Admin | e2e/visual | modal full-screen preto no Stage |
| `.bat` | executar em Windows limpo | manual | instala se faltar, sobe dev e abre `/admin` |

## Parecer UX/Operador

- texto atual problematico: ajuda e pre-show precisam explicar operacao real sem textao; Tribunal precisa foco visual.
- texto novo proposto: linguagem curta, orientada ao operador, com status do personagem, referencia correta e comando de recuperacao Arduino.
- risco de timing: alteracoes no pre-show nao podem recriar timeline nem mudar o controle do operador.
- como validar no pre-show: ensaio com Stage/Admin abertos, teste Mesa A/B, logs e ausencia de pontuacao.

## Checklist Reviewer inicial

- [x] backup existe
- [x] spec criada
- [x] plano sera criado antes do codigo
- [ ] testes passaram
- [ ] evidencias existem
- [ ] checklist fisico existe
- [ ] pendencias reais declaradas
