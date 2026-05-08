@echo off
chcp 65001 >nul

:: Mudar sempre para a pasta onde este ficheiro .bat está guardado
cd /d "%~dp0"

title Inscrições EDF — Servidor Local

echo.
echo  ============================================
echo   INSCRICOES EDF — Servidor Local da Escola
echo  ============================================
echo.
echo  Pasta do projeto: %~dp0
echo.

:: Verificar se o Node.js está instalado
where node >nul 2>nul
if errorlevel 1 (
    echo  ERRO: Node.js nao esta instalado!
    echo.
    echo  Faz o download em: https://nodejs.org
    echo  Escolhe a versao "LTS" e instala normalmente.
    echo.
    pause
    exit /b 1
)

:: Verificar se node_modules existe
if not exist "node_modules\" (
    echo  [1/2] A instalar dependencias pela primeira vez...
    echo        Pode demorar 1-2 minutos. Aguarda...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERRO: Falha no npm install.
        echo  Certifica-te de que o Node.js esta instalado corretamente.
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

:: Abrir o browser automaticamente
start "" "http://localhost:3000"

call npm run dev
pause
