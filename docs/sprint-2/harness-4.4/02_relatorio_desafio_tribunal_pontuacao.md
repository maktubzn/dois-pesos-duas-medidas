# Harness 4.4 - Relatorio de Implementacao

## Implementado

- Nova fase `tribunal_challenge` e estado completo do Desafio do Tribunal no snapshot.
- Acerto normal fixado em +10.
- Erro normal agora concede +5 ao adversario e registra `wrong_opponent_bonus`.
- Timeout sem grupo ativo entra no Desafio do Tribunal sem pontuacao automatica.
- Sorteio deterministico do grupo chamado por seed, rodada e pergunta.
- Acoes operacionais do tribunal: arriscar, passar, resolver correto, resolver errado e cancelar.
- Dois passes encerram a rodada com `O tribunal registra silêncio nos autos.`
- Placar aceita resultado negativo real para o -10 do tribunal; o calculo visual usa percentuais seguros.
- Historico e CSV ganharam campos de ator, beneficiario, delta, dados do tribunal e acao do operador.
- Stage ganhou overlay `DESAFIO DO TRIBUNAL`.
- Admin ganhou painel dedicado do tribunal.
- Audio publico da Stage ganhou `desafio_tribunal_theme`, separado do pre-show, SFX e Veredito Final.

## Audio

- Original preservado: `public/audio/fundo tribunal.mp3`.
- Derivado gerado: `public/audio/music/desafio_tribunal_theme.mp3`.
- Parametros: recorte 20s-50s, mono, 44.1kHz, 96kbps, fade-in 0.6s e fade-out 1.2s.
- Risco de copyright/licenca registrado em `public/audio/CREDITS_AUDIO.md`.

## Preservado

- Arduino `.ino` nao foi alterado.
- Web Serial e BroadcastChannel seguem como contratos existentes.
- Pre-show 4.2 continua isolado no `intro`.
- Audio publico continua na Stage via `Ativar audio da TV`.
- Veredito Final continua separado em `quizMode: "tie_breaker"`.
