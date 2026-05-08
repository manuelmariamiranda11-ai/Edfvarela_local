@echo off
chcp 65001 >nul
cd /d "%~dp0"
title IP do PC na rede local

echo.
echo  ============================================
echo   Enderecos IP deste PC na rede local
echo  ============================================
echo.
ipconfig | findstr /i "IPv4"
echo.
echo  Usa um destes IPs no browser dos outros
echo  dispositivos para aceder ao site EDF.
echo.
echo  Exemplo: http://192.168.1.XX:3000
echo.
pause
