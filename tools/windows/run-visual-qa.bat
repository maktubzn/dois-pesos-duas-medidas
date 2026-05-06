@echo off
setlocal
cd /d "%~dp0\..\.."
echo Rodando QA visual Harness 4.6.
npm run visual:all
echo.
echo QA visual finalizado.
pause
