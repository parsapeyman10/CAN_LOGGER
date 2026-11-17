"""Rebuild the desktop document from the original distribution and language layer."""
from pathlib import Path
import base64
import gzip
import hashlib
import re
import textwrap

root = Path(__file__).resolve().parents[1]
html = (root / 'CAN_Exchange_Distribution (1).html').read_text(encoding='utf-8')
css = (root / 'tools/language.css').read_text(encoding='utf-8')
js = (root / 'tools/language.js').read_text(encoding='utf-8')
translations = (root / 'tools/diagnostic-translations.js').read_text(encoding='utf-8')
js = js.replace('  /* DIAGNOSTIC_TRANSLATIONS */', translations, 1)
js += '\n' + (root / 'tools/usability.js').read_text(encoding='utf-8')
assert '</script' not in js.lower()
html = html.replace('</style>', '\n' + css + '\n</style>', 1)
html = html.replace('</main>', '</main><script>\n' + js + '\n</script>', 1)
data = html.encode('utf-8')
(root / 'app').mkdir(exist_ok=True)
(root / 'app/index.html').write_bytes(data)
encoded = base64.b64encode(gzip.compress(data, mtime=0)).decode('ascii')
block = 'DOCUMENT_SHA256 = "' + hashlib.sha256(data).hexdigest() + '"\nDOCUMENT = (\n' + ''.join('    b"' + chunk + '"\n' for chunk in textwrap.wrap(encoded, 120)) + ')'
path = root / 'Marja_CAN.py'
source = path.read_text(encoding='utf-8')
source, count = re.subn(r'DOCUMENT_SHA256 = "[0-9a-f]+"\nDOCUMENT = \(.*?\n\)', lambda _: block, source, count=1, flags=re.S)
assert count == 1
path.write_text(source, encoding='utf-8')
print('Built', len(data), 'bytes, sha256', hashlib.sha256(data).hexdigest())
