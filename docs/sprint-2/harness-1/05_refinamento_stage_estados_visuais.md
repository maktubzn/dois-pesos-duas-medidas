# Harness 1 - Refinamento da Stage e Estados Visuais

## Hierarquia visual

- O Fundo 1 agora aparece como base de abertura e espera.
- O Fundo 2 aparece quando o jogo entra nas fases operacionais.
- A `IntroScreen` teve o fundo próprio reduzido para permitir leitura do Fundo 1.
- O placar voltou a renderizar `PTS`, preservando o contrato visual e os testes.

## Estados preparados

- Aguardando abertura: Fundo 1.
- Rodada preparada: Fundo 2.
- Pergunta revelada: Fundo 2.
- Botões de vez liberados: Fundo 2.
- Grupo com a vez: Fundo 2.
- Tempo esgotado: Fundo 2.
- Game over: Fundo 2.

## Fundo 2 estrutural

`bg-FNL2.png` continua documentado como placeholder estrutural temporário. O layout não depende de detalhes internos dessa imagem, então a troca pelo Fundo 2 final deve ser localizada.

## Linguagem

A Stage não deve exibir `buzz` como texto público. O E2E mantém assertiva negativa para o corpo da página.

## Limites preservados

Não houve alteração de Arduino, Web Serial, BroadcastChannel, Admin, timer, rounds, reset automático ou mapeamento A/B.
