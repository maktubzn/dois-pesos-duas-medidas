@echo off
setlocal
cd /d "%~dp0\..\.."
echo Iniciando Vite em http://127.0.0.1:5173
npm run dev -- --host 127.0.0.1
echo.
echo Servidor encerrado.
pause
