# 19 - Plano Admin Realtime

## Proxima fatia recomendada

Criar arquitetura `/stage` e `/admin` com comunicacao realtime local, sem alterar a stage atual antes de definir contrato.

## Escopo sugerido

- Rotas `/stage` e `/admin`.
- Painel operador para iniciar quiz, abrir pergunta, passar/repassar, marcar correto/errado e resetar rodada.
- Centralizar conexao Arduino em uma unica tela/processo.
- Log de eventos de rodada e serial.
- Canal realtime local via WebSocket ou Socket.IO.

## Decisoes pendentes

- Escolher WebSocket nativo ou Socket.IO.
- Definir se Arduino fica conectado no `/admin` ou em um processo bridge local.
- Definir formato de perguntas e persistencia local.

## Nao implementar ainda

- Backend de producao.
- Banco remoto.
- Autenticacao.
- Ranking completo.
