# Harness 4.4 - Plano do Desafio do Tribunal e Pontuacao

## Objetivo

Implementar a nova regra competitiva do quiz sem alterar Final Show, Veredito Final, pre-show 4.2, audio publico 4.3, Web Serial, BroadcastChannel ou Arduino `.ino`.

## Regras

- Acerto normal: grupo com a vez recebe +10.
- Erro normal: adversario recebe +5; quem errou nao perde ponto.
- Tempo esgotado sem grupo com a vez: entra no Desafio do Tribunal sem pontuar automaticamente.
- Tribunal: grupo sorteado pode arriscar ou passar.
- Arriscar correto: +20.
- Arriscar errado: -10.
- Dois passes: encerra sem pontos com `O tribunal registra silêncio nos autos.`

## Implementacao planejada

- Criar `phase: "tribunal_challenge"` e campos de snapshot para status, grupo chamado, passes, tentativa, resultado e timestamps.
- Usar sorteio deterministico por seed, rodada e pergunta.
- Registrar eventos especificos de historico e CSV com ator, beneficiario, delta e dados do tribunal.
- Criar painel operacional no Admin somente no estado do tribunal.
- Criar overlay publico na Stage com suspense divertido, sem controles tecnicos.
- Tocar `desafio_tribunal_theme` apenas na Stage durante o desafio.
- Preservar o Veredito Final existente como `quizMode: "tie_breaker"`.

## Validacao planejada

- Unitarios para pontuacao normal, erro com bonus, tribunal, CSV, audio e score negativo.
- E2E para fluxos normais, tribunal, audio publico e overflow.
- Validacoes obrigatorias: typecheck, testes, lint, build, E2E e Arduino virtual self-test.
