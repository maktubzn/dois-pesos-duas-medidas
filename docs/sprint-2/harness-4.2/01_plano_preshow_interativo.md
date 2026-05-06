# Harness 4.2 - Plano do Pre-show Interativo

## Resumo

Reorganizar o pre-show para uma experiencia dark, cinematografica e operacional, com duracao alvo de 64s. O quiz deve continuar protegido: sem inicio automatico, sem pontuacao durante o pre-show e com inicio apenas pelo clique do Admin em `Iniciar quiz`.

## Timeline

- `0-6s`: espera escura com logo INFO.
- `6-14s`: blackout e entrada cinematografica.
- `14-26s`: titulo `DOIS PESOS, DUAS MEDIDAS`.
- `26-42s`: explicacao curta do jogo.
- `42-56s`: teste interativo da mesa.
- `56-64s`: tela pronta para iniciar.

## Mudancas tecnicas

- Estender `preShowTimeline` para 64s e adicionar a cena `button_check`.
- Adicionar estado explicito de teste da mesa no snapshot: status, grupos reconhecidos e ultimo grupo.
- Tratar `BT1PRESS` e `BT2PRESS` em `phase === "intro"` como inertes, exceto quando o teste da mesa estiver ativo.
- Manter a Stage como leitora de snapshot e o Admin como fonte operacional.
- Adicionar musica de pre-show no `AudioManager`, com categoria `music`, fade, ducking e cleanup antes do quiz.
- Registrar o MP3 fornecido como arquivo local com risco de copyright/licenca.

## Testes planejados

- Unitarios para pre-show sem auto-start, teste da mesa sem pontuacao e audio sem tocar antes de unlock.
- E2E para Stage/Admin, BroadcastChannel, teste da mesa, ausencia do termo publico antigo, fluxo completo do quiz, Veredito Final, historico e CSV.
- Validacao manual ou com Arduino virtual em COM7/COM8 quando disponivel.

## Riscos

- O audio sai pelo navegador Admin, nao pela Stage/TV.
- O MP3 local tem risco de copyright/licenca e nao deve ser baixado, publicado ou redistribuido.
- Sinais de mesa em `intro` precisam ficar isolados da regra de resposta.
