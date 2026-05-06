@echo off
setlocal EnableExtensions

title Dois Pesos - iniciar jogo

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo.
echo Dois Pesos, Duas Medidas - inicializacao segura
echo.

if not exist "package.json" (
  echo [ERRO] package.json nao encontrado. Execute este arquivo na raiz do projeto.
  pause
  exit /b 1
)

call :ensure_node
if errorlevel 1 exit /b 1

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado junto com o Node.js.
  echo Reinstale o Node.js marcando a opcao de instalar npm.
  pause
  exit /b 1
)

echo [OK] Node encontrado:
node --version
echo [OK] npm encontrado:
npm --version
echo.

if not exist "node_modules" (
  echo [INFO] node_modules ausente. Instalando dependencias com npm...
  if exist "package-lock.json" (
    call npm ci
  ) else (
    call npm install
  )
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    echo Verifique a internet/DNS. O npm precisa acessar o registro online na primeira instalacao.
    echo Se for usar sem internet, leve a pasta node_modules ja instalada nesta maquina.
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

start "Dois Pesos Dev Server" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

timeout /t 4 /nobreak >nul
start "" "%ADMIN_URL%"

echo [OK] Servidor iniciado em uma nova janela.
echo Feche a janela do servidor para encerrar o jogo.
endlocal
exit /b 0

:ensure_node
where node >nul 2>nul
if not errorlevel 1 exit /b 0

echo [AVISO] Node.js nao encontrado no PATH.
echo [INFO] Procurando instalador local do Node.js no projeto...

set "NODE_INSTALLER="
for %%F in (
  "%ROOT%node-v*.msi"
  "%ROOT%node-v*.exe"
  "%ROOT%nodejs*.msi"
  "%ROOT%nodejs*.exe"
  "%ROOT%tools\node-v*.msi"
  "%ROOT%tools\node-v*.exe"
  "%ROOT%tools\nodejs*.msi"
  "%ROOT%tools\nodejs*.exe"
  "%ROOT%installers\node-v*.msi"
  "%ROOT%installers\node-v*.exe"
  "%ROOT%installers\nodejs*.msi"
  "%ROOT%installers\nodejs*.exe"
) do (
  if not defined NODE_INSTALLER (
    for %%G in (%%F) do (
      if exist "%%~fG" set "NODE_INSTALLER=%%~fG"
    )
  )
)

if not defined NODE_INSTALLER (
  echo [ERRO] Node.js nao encontrado e nenhum instalador local foi achado.
  echo Coloque o instalador na raiz, em tools\ ou em installers\.
  echo Exemplos: node-v24.15.0-x64.msi ou nodejs-x64.msi
  pause
  exit /b 1
)

echo [INFO] Instalador encontrado:
echo "%NODE_INSTALLER%"
echo.
echo [INFO] Iniciando instalacao do Node.js. Pode pedir permissao do Windows.

if /i "%NODE_INSTALLER:~-4%"==".msi" (
  start /wait "" msiexec /i "%NODE_INSTALLER%" /passive /norestart
) else (
  start /wait "" "%NODE_INSTALLER%"
)

set "PATH=%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js ainda nao foi encontrado apos a instalacao.
  echo Feche este terminal, abra o .bat de novo, ou reinicie o Windows.
  pause
  exit /b 1
)

exit /b 0
