# Prompt 10 — Criar `.bat` Seguro para Iniciar o Jogo

## Objetivo

Criar `.bat` na raiz para:
- verificar dependências;
- instalar se necessário;
- subir `yarn dev`;
- abrir `/admin`.

## Segurança

Não apagar arquivos. Não matar processos sem confirmação. Não usar caminho absoluto. Não instalar em loop. Não depender do computador do Gustavo.

## Nome sugerido

`iniciar-jogo.bat`

## Comportamento

1. Verificar `package.json`.
2. Verificar `node_modules`.
3. Se faltar, rodar `yarn install`.
4. Se yarn não existir, avisar.
5. Subir `yarn dev`.
6. Abrir `http://localhost:5173/admin` ou porta real detectada.

## Diagnóstico antes

Checar scripts, porta Vite, monorepo, root e `.bat` existentes.

## Testes

Validação estática, execução se possível, não apaga nada, abre URL correta.

## Documento

Criar `docs/sprint-2/harness-9.1/uso_bat_iniciar_jogo.md`.

## Saída

Nome, resumo, dependências, URL, testes, riscos.
