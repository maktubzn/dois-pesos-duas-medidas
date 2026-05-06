# Harness 4.3 - Plano de audio na Stage e Admin operacional

## Objetivo
Mover o audio publico para `/stage`, manter `/admin` como painel de controle, corrigir mute/desmute, integrar os SFX reais, ajustar a ampulheta de tempo no rodape e organizar o Admin para operacao tecnica.

## Decisoes
- A Stage e a fonte sonora publica porque esta na TV/HDMI/espelhamento.
- O Admin controla apenas estado, volume e mute publicos via snapshot/BroadcastChannel.
- A Stage exige gesto local em `Ativar audio da TV`; se o navegador bloquear `play()`, o jogo visual continua.
- O mute para loops; o desmute ressincroniza o controlador com o snapshot atual para retomar o loop se o timer ainda estiver rodando.
- O teste de mesa do 4.2 continua isolado no `intro` e nao pontua.

## Implementacao planejada
- Adicionar `publicAudioMuted` e `publicAudioMasterVolume` ao snapshot.
- Adicionar status leve `STAGE_AUDIO_STATUS_SYNC` para o Admin mostrar se a Stage esta desbloqueada.
- Remover do Admin a execucao de sons publicos com `GameAudioController`.
- Criar controlador de audio da Stage usando o `AudioManager` existente.
- Gerar SFX finais em `public/audio/sfx` a partir dos arquivos reais preservados.
- Trocar a ampulheta vertical por barra horizontal no rodape, visivel so com timer rodando.
- Reorganizar o Admin em Operacao, Audio da TV, Mesa/Arduino, Rodada, Historico e Ajuda.
- Criar Ajuda pesquisavel com dialog modal acessivel.

## Fora de escopo
- Desafio do Tribunal.
- Nova pontuacao.
- `public/audio/fundo tribunal.mp3`.
- Final Show, brasao do vencedor ou nova tela de vencedor.
