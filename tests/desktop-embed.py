"""Verify the desktop ships the same document as the standalone preview (no Qt needed)."""
import hashlib
import importlib.util
from pathlib import Path
import tempfile
import subprocess
import shutil
import sys

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('marja_can', root / 'Marja_CAN.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
version = (root / 'VERSION').read_text(encoding='ascii').strip()
assert module.APP_VERSION == version
assert module.check_build_version(version.split()[1]) == 0
assert module.check_build_version('1.02') == 1
html = (root / 'app/index.html').read_bytes()
assert version.encode('ascii') in html
bat = (root / 'Build_Marja.bat').read_text(encoding='utf-8')
assert f'AppVersion={version.split()[1]}' in bat
assert f'AppVerName=Marja CAN {version}' in bat
assert hashlib.sha256(html).hexdigest() == module.DOCUMENT_SHA256
with tempfile.TemporaryDirectory() as directory:
    copy = Path(directory) / 'Marja_CAN.py'
    shutil.copy2(root / 'Marja_CAN.py', copy)
    (Path(directory) / 'VERSION').write_text('BETA 1.02', encoding='utf-8')
    isolated_spec = importlib.util.spec_from_file_location('isolated_marja', copy)
    isolated = importlib.util.module_from_spec(isolated_spec)
    isolated_spec.loader.exec_module(isolated)
    assert isolated.check_build_version(version.split()[1]) == 1
    (Path(directory) / 'VERSION').write_text(version, encoding='utf-8')
    assert isolated.check_build_version(version.split()[1]) == 0
    preview = Path(directory) / 'preview.html'
    def check(data):
        preview.write_bytes(data)
        return subprocess.run([sys.executable, str(root / 'Marja_CAN.py'), '--check-preview', str(preview)], capture_output=True, text=True)
    result = check(html)
    assert result.returncode == 0 and 'match exactly' in result.stdout
    result = check(html.replace(b'\n', b'\r\n'))
    assert result.returncode == 0 and 'line-ending normalization' in result.stdout
    result = check(html.replace(b'\n', b'\r\n') + b'CHANGED')
    assert result.returncode != 0 and 'different content' in result.stderr
    assert check(b'\xef\xbb\xbf' + html).returncode != 0
    target = module.materialize(Path(directory))
    assert target.read_bytes() == html
    target.write_bytes(b'outdated')
    assert module.materialize(Path(directory)).read_bytes() == html
print('Desktop embedded HTML, integrity digest and stale-cache replacement match preview.')
