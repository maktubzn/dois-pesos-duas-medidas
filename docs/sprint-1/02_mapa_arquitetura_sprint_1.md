# Sprint 1 - Mapa de Arquitetura

## 1. Visao geral

A arquitetura atual e uma SPA React + TypeScript + Vite. `index.html` carrega `src/main.tsx`, que monta `src/App.tsx`. O roteamento e simples: `/stage` mostra o telao, `/admin` mostra login e mesa de controle, `/` cai para `/stage`.

O estado do jogo fica em Zustand (`src/store/gameStore.ts`). O Admin e a fonte operacional: autentica localmente, conecta Web Serial, envia comandos ao Arduino, controla rodada/timer/pontos e publica snapshots via BroadcastChannel. A Stage recebe snapshots e renderiza a experiencia publica, sem acessar Arduino.

Assets principais ficam em `public/img` e sao referenciados por `/img/...`. Testes unitarios cobrem score, parser, calibracao A/B e store. Playwright cobre rotas, login, overflow, realtime e game over, mas nao automatiza o chooser nativo do Web Serial.

## 2. Diagrama

```txt
/admin
  - conecta Arduino via Web Serial
  - resolve evento serial bruto para grupo A/B
  - controla rodada, timer e pontos
  - publica snapshot via BroadcastChannel

/stage
  - recebe snapshot
  - renderiza fundo, cards, barra, pergunta e timer
  - nao acessa Arduino diretamente

Arduino
  - envia BT1PRESS, BT2PRESS, RESET
  - recebe PING, STATUS, LOCK, UNLOCK, RESET_HW
  - controla LEDs/audio/fallback fisico
```

Detalhe do fluxo de dados:

```txt
Arduino -> Web Serial -> useArduinoSerial -> serialParser
  -> gameStore.handleSerialMessage
  -> serialEventToGroup
  -> AdminPage efeitos automaticos
  -> useAdminRealtime
  -> BroadcastChannel
  -> useStageRealtime
  -> gameStore.applySnapshot
  -> QuizStage renderiza
```

## 3. Fluxo real do jogo

1. Abrir `/stage` no navegador/telao.
2. Abrir `/admin` em outra aba/janela na mesma origem.
3. Fazer login com `admin123` / `121212`.
4. Conectar Arduino pelo Admin e selecionar a porta no chooser nativo.
5. Iniciar quiz.
6. Liberar botões de vez: Admin envia `RESET_HW`, depois `UNLOCK`, revela pergunta e inicia timer.
7. Receber botao fisico: Arduino envia `BT1PRESS` ou `BT2PRESS`.
8. Resolver grupo calibrado: `BT1PRESS -> B`, `BT2PRESS -> A`; teclado segue `Z -> A`, `M -> B`.
9. Publicar snapshot via BroadcastChannel.
10. Stage renderiza rodada, jogador ativo, pergunta, timer, status dos cards e placar.
11. Operador pontua ou marca errado no Admin.
12. Admin envia `RESET_HW` automatico.
13. Operador avanca para o proximo round; Admin tambem envia `RESET_HW`.
14. Apos a rodada 5, o proximo avanco define `phase = game_over`.

## 4. Riscos de arquitetura

- Admin e Stage em origens diferentes quebram BroadcastChannel.
- Web Serial pode estar indisponivel no navegador.
- Arduino pode estar na porta errada ou ocupada.
- BroadcastChannel pode nao sincronizar se as abas estiverem em contextos/origens diferentes.
- Operador pode usar fluxo errado por falta de UX/checklist.
- Dev server pode cair durante apresentacao.
- Nao ha persistencia de partida.
- Timer roda no Admin; se o Admin fechar, os ticks param.
- Login local nao deve ser tratado como seguranca real.
- Chooser do Web Serial exige acao humana e nao e coberto por E2E.
- DFPlayer ja apareceu como risco; o jogo precisa fallback visual/sonoro se audio fisico falhar.
