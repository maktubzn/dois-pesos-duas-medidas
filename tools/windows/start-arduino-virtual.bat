@echo off
setlocal
cd /d "%~dp0\..\.."
echo Arduino virtual na porta COM8.
echo No Chrome/Admin, conectar em COM7.
node tools\arduino-virtual\cli.mjs --port COM8
echo.
echo Arduino virtual encerrado.
pause
