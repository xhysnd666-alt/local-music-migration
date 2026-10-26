@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting local migration site at http://127.0.0.1:8787
node server.mjs
endlocal

