# 12 - Relatorio Pesquisa Web Serial Arduino Vite

## Decisoes tecnicas

- Web Serial deve ler `ReadableStream` por chunks e montar linhas ate `\n`; um `read()` nao equivale a uma mensagem.
- `requestPort()` precisa de gesto do usuario, contexto seguro ou localhost e permissao explicita.
- Assets Vite que precisam manter nome e caminho estavel devem ficar em `public/` e ser referenciados por caminho absoluto, como `/img/BGVIDEO.mp4`.
- Playwright cobre viewport, overflow, screenshots e fallback de teclado; o chooser nativo do Web Serial nao deve ser falsificado como teste real.
- Arduino Uno + `SoftwareSerial(6, 7)` deve usar comunicacao esparsa a 9600 baud.
- `DFPLAYER_ERROR` nao e bloqueador do jogo; o sketch tem fallback no buzzer.

## Riscos

- Web Serial nao e baseline em todos os browsers.
- Porta serial pode estar ocupada pelo Arduino IDE, Serial Monitor, navegador ou outro processo.
- DFPlayer pode falhar por SD, fiação ou nome de arquivo de audio.

## Referencias

- MDN Web Serial API.
- MDN `Serial.requestPort()`.
- Chrome Web Serial guide.
- Vite static asset handling.
- Playwright webServer/baseURL docs.

