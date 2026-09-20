@echo off
echo "== Initializing repo =="
echo "# myalgoapp" > README.md

REM Init git only if not already initialized
IF NOT EXIST ".git" git init

REM Stage and commit
echo "# aibackend" >> README.md
git add .
git commit -m "first commit"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/myalgofax/asofiyaai.git
git push -u origin main

echo === Commit Complete ===
