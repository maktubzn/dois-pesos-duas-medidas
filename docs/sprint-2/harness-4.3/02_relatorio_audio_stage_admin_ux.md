# Harness 4.3 - Relatorio de implementacao

## Audio publico
- O Admin deixou de importar `AudioManager` e `GameAudioController` para sons publicos.
- A Stage passou a usar `useStageAudioController`, com gesto `Ativar audio da TV`.
- Mute e volume publicos agora ficam no store/snapshot como `publicAudioMuted` e `publicAudioMasterVolume`.
- A Stage publica `STAGE_AUDIO_STATUS_SYNC` com estado de unlock, mute, volume, loops ativos e ultimo erro.

## Mute/desmute
- `setMuted(true)` continua parando o audio ativo.
- Ao desmutar, a Stage reseta o controlador e sincroniza novamente com o estado atual.
- Se o timer ainda estiver em `buzz_open` e `running`, o loop `tempo_resposta_relogio_tenso` volta.

## SFX reais
- Originais preservados em `public/audio`.
- Copias preservadas em `public/audio/_raw`.
- Arquivos finais gerados com ffmpeg em mono, 44.1kHz, 96kbps:
  - `public/audio/sfx/resposta_certa.mp3`
  - `public/audio/sfx/resposta_errada.mp3`
  - `public/audio/sfx/tempo_esgotado.mp3`
  - `public/audio/sfx/tempo_resposta_relogio_tenso.mp3`
- Como `correto.mp3` e `incorreto.mp3` nao existiam, foram usados os equivalentes existentes `resposta_certa.mp3` e `resposta_errada.mp3`.

## Stage
- A Stage mostra o botao discreto `Ativar audio da TV`.
- A ampulheta virou barra horizontal centralizada no rodape.
- O timer aparece somente quando a janela de resposta esta aberta e o timer esta rodando.
- Ao pausar, marcar resposta, tomar a vez, acabar o tempo, resetar ou sair da rodada, a barra some e os loops param.

## Admin
- Adicionado topo operacional com estado atual, proxima acao e status do audio da TV.
- Audio virou painel `Audio da TV`.
- Pares duplicados foram reduzidos a toggles: pre-show, mute, mesa, timer e sequencia.
- Acoes perigosas passaram a pedir confirmacao: pular abertura, resetar rodada, resetar partida e limpar historico.
- Adicionado modal `Ajuda` com busca e categorias operacionais.

## Riscos
- `grupo_pegou_vez.mp3` permanece no manifest como SFX esperado, mas nao foi fornecido nesta fatia.
- O navegador ainda pode rejeitar `play()`; nesse caso a Stage segue silenciosa.
- O arquivo de musica do pre-show continua com risco de copyright ja registrado no 4.2.
