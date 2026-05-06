# 25 - Relatorio Fatia 02 Routes Admin Login

## Arquivos alterados/criados

- `src/App.tsx`
- `src/components/Admin/AdminPage.tsx`
- `src/components/Admin/AdminPage.module.css`
- `src/components/QuizStage/QuizStage.tsx`
- `src/components/QuizStage/QuizStage.module.css`

## Implementado

- `/stage` renderiza o telão.
- `/admin` renderiza login e mesa de controle.
- `/` redireciona internamente para `/stage`.
- Login local: `admin123` / `121212`.
- Sessao em `sessionStorage`.
- Logout limpa a sessao.
- Stage deixou de renderizar painel Web Serial e controles administrativos.

## Observacao

Login e senha sao controle local de feira, nao seguranca para internet.
