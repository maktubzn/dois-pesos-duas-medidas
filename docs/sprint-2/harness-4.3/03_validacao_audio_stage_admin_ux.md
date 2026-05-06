# Harness 4.3 - Validacao

## Comandos
- `rtk npm run typecheck` - passou.
- `rtk npm run test -- --run` - passou, 10 arquivos e 61 testes.
- `rtk npm run lint` - passou.
- `rtk npm run build` - passou.
- `rtk npm run test:e2e` - passou, 19 testes.
- `rtk npm run arduino:virtual:self-test` - passou.

## Casos validados
- Stage tem `Ativar audio da TV`.
- Stage nao inicia audio publico antes de `unlock`.
- Admin nao instancia mais controlador de audio publico.
- Mudo/Com som altera estado publico e a Stage ressincroniza no desmute.
- Volume master publico entra no snapshot.
- `time-click.mp3` foi convertido para `tempo_resposta_relogio_tenso.mp3`.
- Loop do timer inicia com janela de resposta, para em pausa, vez tomada, correto, incorreto, tempo esgotado e reset.
- SFX reais foram mapeados para resposta certa, resposta errada e tempo esgotado.
- Ampulheta de rodape aparece com timer rodando e some quando o timer nao esta rodando.
- Admin tem toggles e Ajuda pesquisavel.
- Modal Ajuda abre, pesquisa, fecha com Esc e devolve foco ao botao.
- Stage/Admin continuam sem overflow nas viewports cobertas pelo E2E.

## Arduino
- COM7 e COM8 foram detectadas no ambiente.
- O self-test do Arduino virtual validou `BT1PRESS`, lock, unlock, reset e comandos basicos.
- A conexao fisica via seletor Web Serial do navegador fica como validacao operacional assistida.
- O caminho Web Serial e o teste de mesa do 4.2 foram preservados.

## Navegador
- O E2E Playwright validou Stage/Admin em navegador Chromium.
- A tentativa adicional pelo navegador MCP falhou porque a pagina alvo estava fechada; o dev server foi iniciado e `/stage` respondeu HTTP 200 em `http://127.0.0.1:5173/stage`.
