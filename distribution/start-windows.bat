@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 serve.py %*
  goto done
)
where python >nul 2>nul
if not errorlevel 1 (
  python serve.py %*
  goto done
)
echo Python 3 is required. Install it from https://www.python.org/downloads/ and try again.
:done
if errorlevel 1 pause
endlocal
