"""Verify the desktop ships the same document as the standalone preview (no Qt needed)."""
import hashlib
import importlib.util
from pathlib import Path
import tempfile

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('marja_can', root / 'Marja_CAN.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
version = (root / 'VERSION').read_text(encoding='ascii').strip()
assert module.APP_VERSION == version
html = (root / 'app/index.html').read_bytes()
assert version.encode('ascii') in html
bat = (root / 'Build_Marja.bat').read_text(encoding='utf-8')
assert f'AppVersion={version.split()[1]}' in bat
assert f'AppVerName=Marja CAN {version}' in bat
assert hashlib.sha256(html).hexdigest() == module.DOCUMENT_SHA256
with tempfile.TemporaryDirectory() as directory:
    target = module.materialize(Path(directory))
    assert target.read_bytes() == html
    target.write_bytes(b'outdated')
    assert module.materialize(Path(directory)).read_bytes() == html
print('Desktop embedded HTML, integrity digest and stale-cache replacement match preview.')
