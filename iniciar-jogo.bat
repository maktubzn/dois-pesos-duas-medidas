@echo off
setlocal

title Dois Pesos - iniciar jogo

echo.
echo Dois Pesos, Duas Medidas - inicializacao segura
echo.

if not exist package.json (
  echo [ERRO] package.json nao encontrado. Execute este arquivo na raiz do projeto.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado no PATH.
  echo Instale o Node.js e execute novamente.
  pause
  exit /b 1
)

where yarn >nul 2>nul
if errorlevel 1 (
  where corepack >nul 2>nul
  if errorlevel 1 (
    echo [ERRO] Yarn nao encontrado e Corepack indisponivel.
    echo Instale Yarn ou habilite Corepack antes de iniciar.
    pause
    exit /b 1
  )
  set "YARN_CMD=corepack yarn"
) else (
  set "YARN_CMD=yarn"
)

if not exist node_modules (
  echo [INFO] node_modules ausente. Instalando dependencias com %YARN_CMD% install...
  call %YARN_CMD% install
  if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
) else (
  echo [OK] Dependencias locais encontradas.
)

set "ADMIN_URL=http://localhost:5173/admin"
echo [INFO] Subindo Vite em porta fixa 5173.
echo [INFO] Admin: %ADMIN_URL%
echo.

start "Dois Pesos Dev Server" cmd /k "%YARN_CMD% dev --host 127.0.0.1 --port 5173 --strictPort"

timeout /t 4 /nobreak >nul
start "" "%ADMIN_URL%"

echo [OK] Servidor iniciado em uma nova janela.
echo Feche a janela do servidor para encerrar o jogo.
endlocal
