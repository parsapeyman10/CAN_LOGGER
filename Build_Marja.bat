@echo off
setlocal EnableExtensions DisableDelayedExpansion
pushd "%~dp0" || exit /b 1
set "MARJA_ROOT=%CD%"
set "MARJA_WORK=%MARJA_ROOT%\build-marja"
set "MARJA_OUT=%MARJA_ROOT%\installer"
set "MARJA_SELF=%~f0"
if not exist "Marja_CAN.py" goto :sourceMissing
if not exist "live_capture.py" goto :sourceMissing
:findCompiler
if defined ISCC if exist "%ISCC%" goto :build
set "ISCC="
for /f "delims=" %%I in ('where ISCC.exe 2^>nul') do set "ISCC=%%I"
if defined ISCC goto :build
for %%D in ("%ProgramFiles(x86)%\Inno Setup 6" "%ProgramFiles%\Inno Setup 6" "%LOCALAPPDATA%\Programs\Inno Setup 6") do if exist "%%~D\ISCC.exe" set "ISCC=%%~D\ISCC.exe"
:build
if not exist "%MARJA_WORK%\" mkdir "%MARJA_WORK%" || goto :failed
if not exist "%MARJA_OUT%\" mkdir "%MARJA_OUT%" || goto :failed
echo [1/5] Preparing Python 3.12 build environment...
set "MARJA_UV=%MARJA_WORK%\uv-0.9.26.exe"
set "UV_PYTHON_INSTALL_DIR=%MARJA_WORK%\python"
set "PYTHONPATH="
set "PYTHONHOME="
if exist "%MARJA_UV%" goto :haveUv
powershell -NoProfile -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $meta=Invoke-RestMethod 'https://pypi.org/pypi/uv/0.9.26/json'; $wheel=$meta.urls | Where-Object filename -eq 'uv-0.9.26-py3-none-win_amd64.whl'; if(!$wheel){throw 'Windows x64 wheel missing'}; $zip=Join-Path $env:MARJA_WORK 'uv-download.zip'; Invoke-WebRequest -UseBasicParsing $wheel.url -OutFile $zip; if((Get-FileHash $zip -Algorithm SHA256).Hash -ne '0315fc321f5644b12118f9928086513363ed9b29d74d99f1539fda1b6b5478ab'){throw 'uv checksum mismatch'}; Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead($zip); try{$entry=$z.Entries | Where-Object Name -eq 'uv.exe'; if(@($entry).Count -ne 1){throw 'Invalid uv wheel'}; [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,($env:MARJA_UV+'.tmp'),$true)}finally{$z.Dispose()}; Move-Item -Force ($env:MARJA_UV+'.tmp') $env:MARJA_UV" || goto :failed
:haveUv
"%MARJA_UV%" venv --managed-python --python 3.12 --clear "%MARJA_WORK%\portable-venv" || goto :failed
set "VENV_PY=%MARJA_WORK%\portable-venv\Scripts\python.exe"
"%MARJA_UV%" pip install --python "%VENV_PY%" "PyQt6>=6.8,<7" "PyQt6-WebEngine>=6.8,<7" "pyserial>=3.5,<4" "PyInstaller>=6.11,<7" || goto :failed
echo [2/5] Checking embedded HTML and desktop startup...
rem When the standalone preview is present, refuse to package an outdated desktop embed.
if not exist "%MARJA_ROOT%\app\index.html" goto :skipHtmlCheck
"%VENV_PY%" Marja_CAN.py --check-preview "%MARJA_ROOT%\app\index.html" || goto :failed
:skipHtmlCheck
"%VENV_PY%" Marja_CAN.py --smoke-test || goto :failed
echo [3/5] Packaging the Qt WebEngine runtime...
"%VENV_PY%" -m PyInstaller --noconfirm --clean --onedir --windowed --noupx --name MarjaCAN --workpath "%MARJA_WORK%\work" --distpath "%MARJA_WORK%\dist" --specpath "%MARJA_WORK%" "%MARJA_ROOT%\Marja_CAN.py" || goto :failed
echo [4/5] Testing packaged executable...
"%VENV_PY%" -c "import os, pathlib, subprocess; exe=pathlib.Path(os.environ['MARJA_WORK'])/'dist'/'MarjaCAN'/'MarjaCAN.exe'; subprocess.run([str(exe),'--smoke-test'],check=True,timeout=90)" || goto :failed
echo [5/5] Creating portable ZIP...
"%VENV_PY%" -c "import pathlib,shutil,os; out=pathlib.Path(os.environ['MARJA_OUT']); base=out/'MarjaCAN_BETA_Portable_x64'; archive=shutil.make_archive(str(base)+'.tmp','zip',pathlib.Path(os.environ['MARJA_WORK'])/'dist','MarjaCAN'); os.replace(archive,base.with_suffix('.zip'))" || goto :failed
echo Portable ZIP ready: "%MARJA_OUT%\MarjaCAN_BETA_Portable_x64.zip"
if defined ISCC goto :installer
echo Inno Setup 6 was not found. The portable ZIP is ready to distribute.
goto :success
:installer
echo Compiling optional installer...
powershell -NoProfile -Command "$lines=[IO.File]::ReadAllLines($env:MARJA_SELF); $n=[Array]::IndexOf($lines,':INNO_SCRIPT'); if($n -lt 0){exit 1}; [IO.File]::WriteAllLines((Join-Path $env:MARJA_WORK 'Marja.iss'),$lines[($n+1)..($lines.Length-1)])" || goto :failed
"%ISCC%" "%MARJA_WORK%\Marja.iss" || goto :failed
echo Installer ready: "%MARJA_OUT%\MarjaCAN_BETA_Setup.exe"
:success
popd
pause
exit /b 0
:sourceMissing
echo Put Marja_CAN.py and live_capture.py next to this BAT file.
goto :failed
:failed
popd
pause
exit /b 1
:INNO_SCRIPT
[Setup]
ArchitecturesAllowed=x64
AppId=MarjaCAN.Beta
AppName=Marja CAN BETA
AppVersion=1.03
AppVerName=Marja CAN BETA 1.03
DefaultDirName={localappdata}\Programs\MarjaCAN_BETA
PrivilegesRequired=lowest
DefaultGroupName=Marja CAN BETA
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\MarjaCAN.exe
OutputDir={#GetEnv("MARJA_OUT")}
OutputBaseFilename=MarjaCAN_BETA_Setup
Compression=lzma2/fast
SolidCompression=yes
WizardStyle=modern
[Files]
Source: "{#GetEnv("MARJA_WORK")}\dist\MarjaCAN\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
[Icons]
Name: "{group}\Marja CAN BETA"; Filename: "{app}\MarjaCAN.exe"
