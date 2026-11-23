"""Static checks for the Windows build script; does not execute CMD or PyInstaller."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = (root / 'Build_Marja.bat').read_bytes()
assert data.count(b'\n') == data.count(b'\r\n'), 'BAT must use CRLF consistently'
text = data.decode('utf-8').replace('\r\n', '\n')
assert 'set "MARJA_BASE=%LOCALAPPDATA%\\MarjaCAN\\Builds"' in text
assert 'set "MARJA_BASE=%TEMP%\\MarjaCAN\\Builds"' in text
assert 'set "MARJA_WORK=%MARJA_BASE%\\build-%RANDOM%-%RANDOM%"' in text
assert 'if exist "%MARJA_WORK%\\" goto :chooseWork' in text
assert 'set "PYINSTALLER_CONFIG_DIR=%MARJA_WORK%\\pyinstaller-cache"' in text
assert 'set "UV_CACHE_DIR=%MARJA_WORK%\\uv-cache"' in text
assert 'PyInstaller --noconfirm --onedir' in text and '--clean' not in text
assert 'set "MARJA_OUT=%MARJA_ROOT%\\installer"' in text
assert 'Temporary files remain' in text
assert text.count('\n:sourceMissing\n') == 1
assert text.count('\n:versionFailed\n') == 1
assert 'if not exist "Marja_CAN.py" goto :sourceMissing' in text
assert 'if not exist "live_capture.py" goto :sourceMissing' in text
assert 'set "MARJA_VERSION=' in text and 'check_build_version' in text
assert "os.replace(archive,str(base)+'.zip')" in text
assert 'MarjaCAN_BETA_%MARJA_VERSION%_Portable_x64.zip' in text
assert f'OutputBaseFilename=MarjaCAN_BETA_{(root / "VERSION").read_text().split()[1]}_Setup' in text
assert 'if not exist "installer_bootstrap.py" goto :sourceMissing' in text
assert 'PyInstaller --noconfirm --onefile --windowed' in text
assert '--self-test' in text and 'installer_payload.zip' in text
assert 'MarjaCAN_BETA_%MARJA_VERSION%_Installer.exe' in text
assert 'Setup.exe"\ngoto :success\n:innoFailed' in text
assert 'Marja_CAN.py --check-preview' in text and '--smoke-test' in text
print('Windows build script checks passed (static only; actual Windows build not run).')
