"""Test installer payload integrity and extraction without Qt or Windows."""
import importlib.util
from pathlib import Path
import stat
import subprocess
import sys
import shutil
import tempfile
import zipfile

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('installer_bootstrap', root / 'installer_bootstrap.py')
installer = importlib.util.module_from_spec(spec); spec.loader.exec_module(installer)

with tempfile.TemporaryDirectory() as directory:
    root = Path(directory)
    archive = root / 'payload.zip'; manifest = root / 'payload.json'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('MarjaCAN/MarjaCAN.exe', b'fake executable')
        z.writestr('MarjaCAN/_internal/python312.dll', b'fake library')
        z.writestr('MarjaCAN/_internal/PyQt6/Qt6/bin/QtWebEngineProcess.exe', b'fake webengine')
        z.writestr('MarjaCAN/_internal/other.dat', b'complete data')
    version = (Path(installer.__file__).parent / 'VERSION').read_text().split()[1]
    installer.prepare(archive, manifest, version)
    assert installer.validate(archive, manifest, version) == version
    try: installer.validate(archive, manifest, '1.05')
    except ValueError: pass
    else: raise AssertionError('Wrong version accepted')
    shutil.copy2(archive, root / 'installer_payload.zip')
    shutil.copy2(Path(installer.__file__), root / 'installer_bootstrap.py')
    result = subprocess.run([sys.executable, str(root/'installer_bootstrap.py'), '--self-test', version], capture_output=True)
    assert result.returncode == 0, result.stderr
    assert subprocess.run([sys.executable, str(root/'installer_bootstrap.py'), '--self-test', '1.02'], capture_output=True).returncode != 0
    exe1 = installer.install_archive(archive, root / 'Local AppData', version)
    assert exe1.read_bytes() == b'fake executable'
    assert (exe1.parent / '_internal' / 'python312.dll').read_bytes() == b'fake library'
    exe2 = installer.install_archive(archive, root / 'Local AppData', version)
    assert exe1 != exe2 and exe1.exists() and exe2.exists()
    altered = root / 'altered.zip'; altered.write_bytes(archive.read_bytes() + b'changed')
    try: installer.validate(altered, manifest, version)
    except ValueError: pass
    else: raise AssertionError('Altered archive accepted')
    for bad in ['../outside', 'MarjaCAN/../../outside', 'MarjaCAN/C:/evil', 'MarjaCAN\\evil']:
        unsafe = root / 'unsafe.zip'
        with zipfile.ZipFile(unsafe, 'w') as z:
            z.writestr('MarjaCAN/MarjaCAN.exe', b'x'); z.writestr('MarjaCAN/_internal/python312.dll', b'x'); z.writestr('MarjaCAN/_internal/QtWebEngineProcess.exe', b'x'); z.writestr(bad, b'x')
        try: installer.inspect_archive(unsafe)
        except ValueError: pass
        else: raise AssertionError(f'Unsafe path accepted: {bad}')
    with zipfile.ZipFile(root/'symlink.zip', 'w') as z:
        z.writestr('MarjaCAN/MarjaCAN.exe', b'x'); z.writestr('MarjaCAN/_internal/python312.dll', b'x'); z.writestr('MarjaCAN/_internal/QtWebEngineProcess.exe', b'x')
        link = zipfile.ZipInfo('MarjaCAN/link'); link.create_system = 3; link.external_attr = (stat.S_IFLNK | 0o777) << 16; z.writestr(link, 'target')
    try: installer.inspect_archive(root/'symlink.zip')
    except ValueError: pass
    else: raise AssertionError('Symbolic link accepted')
    with zipfile.ZipFile(root/'missing.zip', 'w') as z: z.writestr('MarjaCAN/MarjaCAN.exe', b'x')
    try: installer.inspect_archive(root/'missing.zip')
    except ValueError: pass
    else: raise AssertionError('Missing Python DLL accepted')
print('Installer payload integrity, safe extraction, complete bundle and non-destructive reinstall passed.')
