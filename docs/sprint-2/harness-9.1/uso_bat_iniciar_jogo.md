# Uso do iniciar-jogo.bat

Arquivo criado:

```txt
iniciar-jogo.bat
```

## O que faz

1. Verifica se esta na raiz do projeto pelo `package.json`.
2. Verifica Node.js.
3. Verifica Yarn ou Corepack.
4. Se `node_modules/` nao existir, roda `yarn install`.
5. Sobe Vite com:

```txt
yarn dev --host 127.0.0.1 --port 5173 --strictPort
```

6. Abre:

```txt
http://localhost:5173/admin
```

## Seguranca

- Nao apaga arquivos.
- Nao mata processos.
- Nao usa caminho absoluto.
- Nao instala em loop.
- Se Yarn/Corepack nao existir, para com mensagem clara.

## Risco conhecido

O repo atual possui `package-lock.json` e nao possui `yarn.lock`, mas o prompt do Harness 9.1 exigiu `yarn dev`. O `.bat` respeita essa exigencia e avisa caso Yarn/Corepack nao esteja disponivel.
