@echo off
setlocal
cd /d "%~dp0"
rem Use real installed Python only. Do not invoke Store aliases or install managers.
for /f "delims=" %%P in ('where python.exe 2^>nul') do (
    call :try_python "%%P"
    if defined MII_PYTHON_USED goto done
)
for /f "delims=" %%P in ('where python3.exe 2^>nul') do (
    call :try_python "%%P"
    if defined MII_PYTHON_USED goto done
)
echo.
echo Mii Editor needs an existing Python 3.9 or newer installation.
echo Nothing was installed and no security settings were changed.
echo Optional installation instructions: https://www.python.org/downloads/
echo Choose a real Python installation on PATH, not the Microsoft Store alias.
echo See START-HERE.md, then run this launcher again.
pause
exit /b 1
:try_python
set "MII_CANDIDATE=%~1"
echo "%MII_CANDIDATE%" | findstr /I /L "\Microsoft\WindowsApps" >nul
if not errorlevel 1 exit /b 1
"%MII_CANDIDATE%" -c "import sys; raise SystemExit(0 if sys.version_info >= (3,9) else 1)" >nul 2>nul
if errorlevel 1 exit /b 1
set "MII_PYTHON_USED=1"
set "PYTHONUTF8=1"
"%MII_CANDIDATE%" "%~dp0serve.py"
set "MII_RESULT=%ERRORLEVEL%"
if not "%MII_RESULT%"=="0" pause
exit /b %MII_RESULT%
:done
exit /b %MII_RESULT%
