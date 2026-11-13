@echo off
rem Google puan/yorumlarini tazeleyip siteyi yeniden yayinlar.
cd /d "%~dp0"
node uret.js > gunluk.log 2>&1
git add docs icerik.json >> gunluk.log 2>&1
git diff --cached --quiet && exit /b 0
git commit -m "Google verisi guncelleme" >> gunluk.log 2>&1
git push >> gunluk.log 2>&1
