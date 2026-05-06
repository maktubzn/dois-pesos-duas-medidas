# Harness 3.1 - Validacao

## Comandos executados

- `rtk npm run typecheck`
- `rtk npm run test -- --run`
- `rtk npm run lint`
- `rtk npm run build`
- `rtk npm run test:e2e`

Resultado final: todos passaram.

## Evidencias Playwright

Screenshots gerados em `docs/sprint-2/harness-3.1/screenshots/`:

- `stage-1920x1080.png`
- `stage-1600x900.png`
- `stage-1366x768.png`
- `stage-900x900.png`
- `round_prepare-1366x768.png`
- `question_reveal-1366x768.png`
- `timer_running-1366x768.png`
- `turn_locked_A-1366x768.png`
- `feedback_correct-1366x768.png`
- `time_up-1366x768.png`
- `game_over-1366x768.png`
- `admin-preview-character.png`
- `admin-ab-history.png`
- `stage-veredito-final.png`
- screenshots herdados de regressao do pre-show em harness 3.1.

## Validacoes cobertas

- Stage sem overflow em 1920x1080, 1600x900, 1366x768 e 900x900.
- Texto publico nao contem `buzz`.
- TV nao mostra `Correta:`.
- Card de imagem renderiza com `object-fit: contain`.
- Rounds 1 a 8 sao de imagem.
- Rounds 9 e 10 sao A/B.
- Admin mostra preview read-only.
- Admin mostra resposta correta apenas na area operacional.
- Botao `Confirmar A/B` fica desabilitado sem grupo e escolha.
- Historico registra eventos.
- CSV baixa com nome `historico-dois-pesos-*.csv`.
- Limpeza do historico exige confirmacao.
- Empate apos round 10 entra no Veredito Final.
- Veredito Final declara vencedor por morte subita.
- Pre-show continua nao iniciando quiz sozinho.
- BroadcastChannel entre Admin e Stage continua funcionando.

## Bugs encontrados e corrigidos

- `revealQuestion()` referenciava `roundTime` antes da declaracao. Corrigido no store.
- `openBuzz()` ignorava o tempo reduzido do Veredito Final. Corrigido para usar 15s no desempate.
- `time_up` no Veredito Final poderia deixar a partida parada. Corrigido para carregar nova pergunta de desempate.
- Testes antigos esperavam 5 rounds. Atualizados para 10 rounds e Veredito Final.
- E2E tinha seletor ambiguo para `Eventos`. Corrigido para escopar no painel de Historico.
- Briefing ainda dizia cinco rodadas. Atualizado para dez rodadas.

## Pendencias

- O banco de perguntas textual e de desempate e inicial; recomenda-se revisao editorial antes de jogo publico.
- `senhor-destino.png` e pesado; recomenda-se otimizar uma copia futura do asset.
- Historico local e por navegador/maquina; se quiser historico centralizado, isso deve virar fatia de backend.

## Proxima fatia recomendada

Harness 3.2: revisao editorial do banco, balanceamento de dificuldade, seed visivel/exportavel no Admin e tela de resumo pos-partida com replay do historico.
