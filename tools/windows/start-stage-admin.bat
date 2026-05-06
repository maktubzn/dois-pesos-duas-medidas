@echo off
setlocal
cd /d "%~dp0\..\.."
echo Abrindo Stage e Admin no navegador padrao.
echo Se as paginas nao carregarem, rode tools\windows\start-dev.bat primeiro.
start "" "http://127.0.0.1:5173/stage"
start "" "http://127.0.0.1:5173/admin"
pause
