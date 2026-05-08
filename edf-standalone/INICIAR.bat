@echo off
chcp 65001 >nul
title Inscrições EDF — Servidor Local

echo.
echo  ============================================
echo   INSCRICOES EDF — Servidor Local da Escola
echo  ============================================
echo.

:: Verificar se node_modules existe
if not exist "node_modules\" (
    echo  [1/2] A instalar dependencias pela primeira vez...
    echo        (pode demorar 1-2 minutos)
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERRO: npm install falhou. Verifica se o Node.js esta instalado.
        echo  Download: https://nodejs.org
        pause
        exit /b 1
    )
    echo.
)

echo  [2/2] A iniciar o servidor...
echo.
echo  -----------------------------------------------
echo   O site vai abrir em:
echo     http://localhost:3000
echo.
echo   Outros dispositivos na mesma rede Wi-Fi:
echo     http://^<IP-do-PC^>:3000
echo     (ve o IP com: ipconfig ^| find "IPv4")
echo  -----------------------------------------------
echo.
echo  Para fechar o servidor: fecha esta janela ou prime CTRL+C
echo.

:: Abrir o browser automaticamente apos 2 segundos
start "" timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

call npm run dev
pause
