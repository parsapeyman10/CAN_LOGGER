"""Static checks for the Windows build script; does not execute CMD or PyInstaller."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = (root / 'Build_Marja.bat').read_bytes()
assert data.count(b'\n') == data.count(b'\r\n'), 'BAT must use CRLF consistently'
text = data.decode('utf-8')
assert 'set "MARJA_BASE=%LOCALAPPDATA%\\MarjaCAN\\Builds"' in text
assert 'set "MARJA_BASE=%TEMP%\\MarjaCAN\\Builds"' in text
assert 'set "MARJA_WORK=%MARJA_BASE%\\build-%RANDOM%-%RANDOM%"' in text
assert 'if exist "%MARJA_WORK%\\" goto :chooseWork' in text
assert 'set "PYINSTALLER_CONFIG_DIR=%MARJA_WORK%\\pyinstaller-cache"' in text
assert 'set "UV_CACHE_DIR=%MARJA_WORK%\\uv-cache"' in text
assert 'PyInstaller --noconfirm --onedir' in text and '--clean' not in text
assert 'set "MARJA_OUT=%MARJA_ROOT%\\installer"' in text
assert 'Temporary files remain' in text
assert 'Marja_CAN.py --check-preview' in text and '--smoke-test' in text
print('Windows build script checks passed (static only; actual Windows build not run).')
