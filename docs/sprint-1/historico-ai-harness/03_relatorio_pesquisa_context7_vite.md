# Pesquisa Context7 Vite

## Decisoes praticas

- Usar `npm create vite@latest __vite_scaffold_tmp -- --template react-ts`, porque a raiz nao esta vazia.
- Copiar o scaffold para a raiz depois do backup.
- Usar `public/img/` para assets atuais com nomes estaveis, principalmente PNGs e MP4.
- Usar `src/assets/` apenas em fatias futuras com assets renomeados/importados.
- Configurar alias `@` manualmente em `vite.config.ts` e `tsconfig.app.json`.
- Usar Zustand para estado minimo de quiz.
- Manter Web Serial como recurso opcional e Chromium-first, com fallback teclado.

## Comandos recomendados

```powershell
rtk npm create vite@latest __vite_scaffold_tmp -- --template react-ts
rtk npm install
rtk npm install motion zustand howler
rtk npm install -D @types/howler vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

## Riscos

- Web Serial exige gesto do usuario, contexto seguro/localhost e suporte do navegador.
- `HTMLVideoElement.play()` pode rejeitar; o controle deve tratar promessa.
- Assets em `public/` devem ser referenciados com caminho absoluto `/img/...`.
- QA precisa verificar DOM para garantir ausencia de martelo HTML extra.

## Estrategia de testes

- `npm run typecheck`
- `npm run build`
- `npm run test -- --run`
- `npm run test:e2e`
- Screenshots Playwright em 1920x1080, 1600x900, 1366x768 e 900x900.

