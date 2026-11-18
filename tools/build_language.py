"""Rebuild the desktop document from the original distribution and language layer."""
from pathlib import Path
import base64
import gzip
import hashlib
import re
import textwrap
import argparse

parser = argparse.ArgumentParser(description='Build the standalone HTML and optionally update the desktop embed.')
parser.add_argument('--html-only', action='store_true', help='Do not modify Marja_CAN.py')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
version = (root / 'VERSION').read_text(encoding='ascii').strip()
if not re.fullmatch(r'BETA [0-9]+\.[0-9]{2,}', version):
    raise ValueError('VERSION must be BETA followed by a dotted version, e.g. BETA 1.00')
html = (root / 'CAN_Exchange_Distribution (1).html').read_text(encoding='utf-8')
css = (root / 'tools/language.css').read_text(encoding='utf-8')
js = (root / 'tools/language.js').read_text(encoding='utf-8')
translations = (root / 'tools/diagnostic-translations.js').read_text(encoding='utf-8')
js = js.replace('  /* DIAGNOSTIC_TRANSLATIONS */', translations, 1)
js += '\n' + (root / 'tools/usability.js').read_text(encoding='utf-8')
js += '\n' + (root / 'tools/explorer.js').read_text(encoding='utf-8')
js += '\n' + (root / 'tools/diag-groups.js').read_text(encoding='utf-8')
js += '\n' + (root / 'tools/review-status.js').read_text(encoding='utf-8')
assert '</script' not in js.lower()
if '</h1></div></header>' not in html:
    raise ValueError('Application header not found')
html = html.replace('</h1></div></header>', '</h1><span class="release-badge" dir="ltr">' + version + '</span></div></header>', 1)
html = html.replace('</style>', '\n' + css + '\n</style>', 1)
html = html.replace('</main>', '</main><script>\n' + js + '\n</script>', 1)
data = html.encode('utf-8')
(root / 'app').mkdir(exist_ok=True)
(root / 'app/index.html').write_bytes(data)
if args.html_only:
    print('Built standalone HTML:', len(data), 'bytes, sha256', hashlib.sha256(data).hexdigest())
    raise SystemExit(0)
encoded = base64.b64encode(gzip.compress(data, mtime=0)).decode('ascii')
block = 'DOCUMENT_SHA256 = "' + hashlib.sha256(data).hexdigest() + '"\nDOCUMENT = (\n' + ''.join('    b"' + chunk + '"\n' for chunk in textwrap.wrap(encoded, 120)) + ')'
path = root / 'Marja_CAN.py'
source = path.read_text(encoding='utf-8')
source, version_count = re.subn(r'^APP_VERSION = "[^"]+"$', f'APP_VERSION = "{version}"', source, count=1, flags=re.M)
assert version_count == 1
source, count = re.subn(r'DOCUMENT_SHA256 = "[0-9a-f]+"\nDOCUMENT = \(.*?\n\)', lambda _: block, source, count=1, flags=re.S)
assert count == 1
path.write_text(source, encoding='utf-8')
bat = root / 'Build_Marja.bat'
with bat.open('r', encoding='utf-8', newline='') as f:
    build_script = f.read()
build_script, count = re.subn(r'(?m)^AppVersion=[^\r\n]+', 'AppVersion=' + version.split()[1], build_script)
assert count == 1
build_script, count = re.subn(r'(?m)^AppVerName=[^\r\n]+', 'AppVerName=Marja CAN ' + version, build_script)
assert count == 1
with bat.open('w', encoding='utf-8', newline='') as f:
    f.write(build_script)
print('Built', len(data), 'bytes, sha256', hashlib.sha256(data).hexdigest())
