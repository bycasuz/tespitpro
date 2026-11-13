@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "TespitPro Yonetim Sunucu" cmd /k node admin\sunucu.js
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:4310
