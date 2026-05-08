@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Inscrições EDF — Servidor Local

echo.
echo  ============================================
echo   INSCRICOES EDF — Servidor Local da Escola
echo  ============================================
echo.

:: Navegar para a pasta do site
if not exist "edf-standalone\" (
    echo  ERRO: Pasta "edf-standalone" nao encontrada.
    echo  Certifica-te de que este ficheiro esta na pasta
    echo  raiz do projeto descarregado.
    pause
    exit /b 1
)

cd edf-standalone
echo  Pasta do site: %cd%
echo.

:: Verificar se o Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
    echo  ERRO: Node.js nao esta instalado!
    echo.
    echo  Faz o download em: https://nodejs.org
    echo  Escolhe a versao "LTS" e instala normalmente.
    echo  Depois fecha e volta a abrir este ficheiro.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  Node.js encontrado: %NODE_VER%
echo.

:: Instalar dependencias se necessario
if not exist "node_modules\" (
    echo  [1/2] A instalar dependencias pela primeira vez...
    echo        Pode demorar 1-2 minutos. Aguarda...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERRO: Falha no npm install.
        pause
        exit /b 1
    )
    echo.
)

echo  [2/2] A iniciar o servidor...
echo.
echo  -----------------------------------------------
echo   Site disponivel em:
echo     http://localhost:3000
echo.
echo   Para acesso pelo telemovel (mesma rede Wi-Fi):
echo     Corre VER_IP.bat para saber o IP do PC
echo     Depois abre:  http://IP-DO-PC:3000
echo  -----------------------------------------------
echo.
echo  Para fechar: fecha esta janela ou prime CTRL+C
echo.

start "" "http://localhost:3000"
call npm run dev
pause
