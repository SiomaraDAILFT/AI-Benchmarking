@echo off
rem Starts the DRACO testing app (both protocols: the published DRACO protocol and
rem the efficient one) and opens it in your browser. Needs Node.js 20 or newer:
rem https://nodejs.org. Close this window to stop the app.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)
start "" http://localhost:4173
node app\server.mjs
pause
