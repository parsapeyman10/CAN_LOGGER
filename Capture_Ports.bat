@echo off
setlocal EnableExtensions DisableDelayedExpansion
pushd "%~dp0" || exit /b 1
if not exist "capture_ports.py" goto :missing
if not exist "live_capture.py" goto :missing
where py >nul 2>&1
if not errorlevel 1 goto :launcher
where python >nul 2>&1
if errorlevel 1 goto :noPython
set "PYTHON=python"
goto :check
:launcher
set "PYTHON=py -3"
:check
%PYTHON% -c "import serial" >nul 2>&1
if errorlevel 1 goto :missingSerial
%PYTHON% capture_ports.py
set "RESULT=%ERRORLEVEL%"
popd
pause
exit /b %RESULT%
:missingSerial
echo pyserial is not installed. Run: %PYTHON% -m pip install pyserial
popd
pause
exit /b 1
:noPython
echo Python 3 is required. Install it and enable the Python launcher or PATH.
popd
pause
exit /b 1
:missing
echo Put capture_ports.py and live_capture.py next to this BAT file.
popd
pause
exit /b 1
