# Harness 4.1 - Implementação de Áudio Mínimo

## Objetivo

Implementar um pacote mínimo de áudio para operação do jogo, sem transformar o quiz em uma superfície barulhenta. O harness não implementa os 106 eventos do mapa-mestre e não implementa easter eggs.

## Decisão técnica

Foi escolhida implementação nativa com `HTMLAudioElement`, sem instalar dependência nova. O motivo é reduzir peso e manter o controle simples para os 13 arquivos do pacote mínimo. A decisão considera que `HTMLMediaElement.play()` pode ser bloqueado pelo navegador sem gesto do usuário, então o Admin recebeu o botão `Ativar áudio` para executar o unlock operacional antes do fluxo.

Referências consultadas:
- React/Context7: efeitos com cleanup e sincronização com sistemas externos.
- Vitest/Context7: mocks de globais e construtores para testes.
- Playwright/Context7: assertions por role/label.
- MDN: `HTMLMediaElement.play()` retorna `Promise` e pode rejeitar por política de autoplay.
- ffmpeg: conversão por linha de comando para MP3 mono com bitrate definido.

## Arquitetura

Arquivos criados:
- `src/audio/audioTypes.ts`: tipos de categoria, manifest, estado mínimo do jogo e runtime.
- `src/audio/audioManifest.ts`: 13 sons mínimos e caminhos públicos.
- `src/audio/AudioManager.ts`: engine central de áudio.
- `src/audio/audioEvents.ts`: mapeamento estado do jogo -> som.

O áudio é acionado em um único ponto no Admin. Os componentes visuais da Stage não instanciam áudio e não recebem lógica sonora.

## Pacote mínimo

Voz:
- `/audio/voz/contador_5.mp3`
- `/audio/voz/contador_4.mp3`
- `/audio/voz/contador_3.mp3`
- `/audio/voz/contador_2.mp3`
- `/audio/voz/contador_1.mp3`
- `/audio/voz/contador_0_valendo.mp3`

SFX:
- `/audio/sfx/tempo_resposta_relogio_tenso.mp3`
- `/audio/sfx/grupo_pegou_vez.mp3`
- `/audio/sfx/resposta_certa.mp3`
- `/audio/sfx/resposta_errada.mp3`
- `/audio/sfx/tempo_esgotado.mp3`

Stingers:
- `/audio/stingers/veredito_final.mp3`
- `/audio/stingers/fim_de_jogo.mp3`

## Regras implementadas

- Countdown é limitado entre 3 e 5 segundos para áudio.
- Countdown 3 toca `3,2,1,0_valendo`.
- Countdown 4 toca `4,3,2,1,0_valendo`.
- Countdown 5 toca `5,4,3,2,1,0_valendo`.
- Ao abrir a janela de resposta (`buzz_open` com timer rodando), toca loop `tempo_resposta_relogio_tenso`.
- Quando um grupo pega a vez, o loop faz fade/stop e toca `grupo_pegou_vez`.
- Resposta correta para loops e toca `resposta_certa`.
- Resposta errada para loops e toca `resposta_errada`.
- Tempo esgotado para loops e toca `tempo_esgotado`.
- Veredito Final toca `veredito_final`.
- Game over para loops e toca `fim_de_jogo`.
- Reset/volta para intro limpa áudio.

## Admin

Controles adicionados:
- `Ativar áudio`
- `Mudo` / `Com som`
- `Volume master`

Os controles ficam em um painel compacto, sem alterar Web Serial, BroadcastChannel ou regra do jogo.

## Estrutura pública

Criado:
- `public/audio/voz/`
- `public/audio/sfx/`
- `public/audio/stingers/`
- `public/audio/ui/`
- `public/audio/_raw/`
- `public/audio/_unused/`
- `public/audio/CREDITS_AUDIO.md`

O usuário deve colocar manualmente os arquivos finais nos caminhos do manifest. Se algum arquivo faltar, o fluxo segue em silêncio.

## Otimização

Criado `tools/audio/optimize-audio.mjs`.

Uso:

```bash
rtk npm run audio:optimize
```

Se `ffmpeg` existir, o script lê `public/audio/_raw/`, converte para MP3 mono 44.1kHz e envia para a pasta provável:
- voz: 128kbps
- sfx: 96kbps
- stingers: 128kbps

Se `ffmpeg` não existir, o script informa comandos manuais e termina sem falhar.
