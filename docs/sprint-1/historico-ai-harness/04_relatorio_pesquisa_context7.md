# Pesquisa Tecnica - Web Serial, Video, Playwright e HUD

## Web Serial API

- `navigator.serial.requestPort()` precisa ser chamado por gesto do usuario.
- Em localhost/HTTPS o Chrome permite a API; outros navegadores podem nao suportar.
- Ler linhas do Arduino por `port.readable.getReader()` e normalizar `\r\n`.
- Tratar ausencia de `navigator.serial` sem quebrar a tela.

## Video de fundo/cue do martelo

- `HTMLMediaElement.play()` retorna promessa e precisa de `try/catch`.
- `currentTime` pode falhar antes de metadata; manter fallback.
- `ended` e estado visual do video devem ficar no `GameBackground`.
- O martelo visual correto vem do video/fundo, nao do DOM.

## Playwright/QA

- Usar `page.setViewportSize()` para 1920x1080, 1600x900 e 1366x768.
- Usar `page.evaluate()` para overflow e APIs globais.
- Usar screenshots fullPage para evidencia visual.

## CSS Scorebar/HUD

- Track interno precisa de `overflow: hidden`.
- Labels devem ficar dentro da mesma geometria do track.
- Textura pode ser CSS com gradientes/repeating-linear-gradient.
- Evitar scroll containers no HUD.

## Decisoes sugeridas ao Orquestrador

- Manter projeto em HTML/CSS/JS puro nesta fatia.
- Nao adicionar dependencias.
- Registrar fallback sem Arduino como parte do aceite.

