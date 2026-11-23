"""Single-file, per-user Windows installer for the complete MarjaCAN onedir bundle.

Build with PyInstaller --onefile and include installer_payload.zip and payload.json.
The recipient does not need Python, Qt or Inno Setup installed.
"""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import queue
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import threading
import uuid
import zipfile


def payload_root():
    return Path(getattr(sys, '_MEIPASS', Path(__file__).resolve().parent))


def inspect_archive(path, full_check=False):
    """Reject unsafe or incomplete bundles before extracting anything."""
    with zipfile.ZipFile(path) as archive:
        names = set()
        total = 0
        for info in archive.infolist():
            name = info.filename
            parts = PurePosixPath(name).parts
            if (not parts or name.startswith('/') or '\\' in name or ':' in name
                    or any(part in ('.', '..') for part in parts)
                    or parts[0] != 'MarjaCAN' or stat.S_ISLNK(info.external_attr >> 16)):
                raise ValueError(f'Unsafe file in installation archive: {name}')
            key = name.rstrip('/').casefold()
            if key in names:
                raise ValueError(f'Duplicate file in installation archive: {name}')
            names.add(key)
            total += info.file_size
            if total > 2 * 1024**3 or len(names) > 100000:
                raise ValueError('Installation archive is too large.')
        required = {'marjacan/marjacan.exe', 'marjacan/_internal/python312.dll'}
        if not required.issubset(names):
            raise ValueError('Installation archive is incomplete: executable or Python DLL is missing.')
        if not any(name.endswith('/qtwebengineprocess.exe') for name in names):
            raise ValueError('Installation archive is incomplete: Qt WebEngine process is missing.')
        if full_check:
            bad = archive.testzip()
            if bad:
                raise ValueError(f'Installation archive is corrupt: {bad}')


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def prepare(path, metadata, version):
    if not re.fullmatch(r'\d+\.\d{2,}', version):
        raise ValueError('Invalid beta version.')
    inspect_archive(path, full_check=True)
    metadata.write_text(json.dumps({'version': version, 'sha256': sha256(path)}), encoding='utf-8')


def validate(path, metadata, expected=None):
    manifest = json.loads(metadata.read_text(encoding='utf-8'))
    version = manifest.get('version', '')
    if not isinstance(version, str) or not re.fullmatch(r'\d+\.\d{2,}', version):
        raise ValueError('Invalid installer version.')
    if expected and version != expected:
        raise ValueError(f'Installer version {version} does not match expected {expected}.')
    if sha256(path) != manifest.get('sha256'):
        raise ValueError('Installer data failed its integrity check.')
    inspect_archive(path, full_check=True)
    return version


def install_archive(archive_path, local_appdata, version):
    """Install in a new per-version directory, without deleting existing installs."""
    if not re.fullmatch(r'\d+\.\d{2,}', version):
        raise ValueError('Invalid installer version.')
    inspect_archive(archive_path, full_check=False)
    base = Path(local_appdata) / 'Programs' / 'MarjaCAN_BETA'
    base.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix='.marja-staging-', dir=base))
    try:
        with zipfile.ZipFile(archive_path) as archive:
            archive.extractall(stage)
        final = base / f'{version}-{uuid.uuid4().hex[:8]}'
        # Rename within one directory; never overwrite an existing installation.
        (stage / 'MarjaCAN').rename(final)
        return final / 'MarjaCAN.exe'
    finally:
        shutil.rmtree(stage, ignore_errors=True)


def create_shortcuts(executable, version):
    """Use Windows' own special-folder lookup (including OneDrive redirected Desktop)."""
    env = dict(os.environ, MARJA_INSTALL_EXE=str(executable), MARJA_INSTALL_VERSION=version)
    script = '''$ErrorActionPreference = 'Stop'
$s = New-Object -ComObject WScript.Shell
$paths = @($s.SpecialFolders.Item('Desktop'), $s.SpecialFolders.Item('Programs'))
foreach ($p in $paths) {
 if (-not $p) { throw 'A shortcut folder was unavailable.' }
 $link = $s.CreateShortcut((Join-Path $p 'Marja CAN BETA.lnk'))
 $link.TargetPath = $env:MARJA_INSTALL_EXE
 $link.WorkingDirectory = Split-Path $env:MARJA_INSTALL_EXE
 $link.Description = 'Marja CAN BETA ' + $env:MARJA_INSTALL_VERSION
 $link.Save()
}'''
    result = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script],
                            env=env, capture_output=True, text=True, timeout=60,
                            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    if result.returncode:
        raise OSError(result.stderr.strip() or 'Unable to create Windows shortcuts.')


def show_installer(archive, metadata):
    import tkinter as tk
    from tkinter import messagebox

    root = tk.Tk()
    root.title('Marja CAN BETA Installer / نصب برنامه')
    root.geometry('620x390'); root.minsize(560, 350)
    outer = tk.Frame(root, padx=24, pady=20); outer.pack(fill='both', expand=True)
    tk.Label(outer, text='Install Marja CAN BETA', font=('Segoe UI', 17, 'bold')).pack(anchor='w')
    tk.Label(outer, text='نصب برنامه برای کاربر فعلی ویندوز', font=('Segoe UI', 11)).pack(anchor='w', pady=(2, 12))
    tk.Label(outer, justify='left', wraplength=520, text=(
        'Install the complete application and its required files. No Python or Qt installation is needed on this computer.\n'
        'The program is installed for the current user; existing installations are not deleted.\n\n'
        'برنامه با همهٔ فایل‌های لازم برای کاربر فعلی نصب می‌شود و به نصب جداگانهٔ پایتون نیاز ندارد.')).pack(anchor='w')
    status = tk.StringVar(value='Ready / آمادهٔ نصب')
    tk.Label(outer, textvariable=status, wraplength=520, justify='left').pack(anchor='w', pady=12)
    buttons = tk.Frame(outer); buttons.pack(anchor='w', pady=5)
    install = tk.Button(buttons, text='Install / نصب', width=19)
    cancel = tk.Button(buttons, text='Close / بستن', width=15, command=root.destroy)
    install.pack(side='left', padx=(0, 8)); cancel.pack(side='left')
    events = queue.Queue()
    running = False

    def worker():
        try:
            version = validate(archive, metadata)
            local = os.environ.get('LOCALAPPDATA')
            if not local:
                raise OSError('LOCALAPPDATA is unavailable. Sign in to a Windows user account and retry.')
            executable = install_archive(archive, local, version)
            try:
                create_shortcuts(executable, version)
                warning = None
            except Exception as error:
                warning = str(error)
            events.put(('ok', executable, warning))
        except Exception as error:
            events.put(('error', str(error)))

    def poll():
        nonlocal running
        try:
            result = events.get_nowait()
        except queue.Empty:
            if running: root.after(200, poll)
            return
        running = False; cancel.config(state='normal')
        if result[0] == 'error':
            status.set('Installation failed / نصب انجام نشد')
            install.config(state='normal')
            messagebox.showerror('Installation failed / خطای نصب', result[1], parent=root)
        else:
            executable, warning = result[1:]
            status.set('Installed / نصب انجام شد')
            detail = f'Installed here / محل نصب:\n{executable}'
            if warning:
                detail += '\n\nShortcuts could not be created. Open the program from this folder.\n' + warning
            if messagebox.askyesno('Installation complete / نصب کامل شد', detail + '\n\nOpen Marja CAN now? / برنامه باز شود؟', parent=root):
                try: os.startfile(str(executable))
                except OSError as error: messagebox.showerror('Cannot open application', str(error), parent=root)
            root.destroy()

    def start():
        nonlocal running
        if running: return
        running = True; install.config(state='disabled'); cancel.config(state='disabled')
        status.set('Checking and installing… Please wait. / در حال نصب؛ لطفاً صبر کنید.')
        threading.Thread(target=worker, daemon=True).start(); root.after(200, poll)

    def close():
        if not running: root.destroy()
    root.protocol('WM_DELETE_WINDOW', close)
    install.config(command=start)
    root.mainloop()


def main(args):
    if len(args) == 4 and args[0] == '--prepare':
        prepare(Path(args[1]), Path(args[2]), args[3]); return 0
    root = payload_root(); archive = root / 'installer_payload.zip'; metadata = root / 'payload.json'
    if len(args) == 2 and args[0] == '--self-test':
        validate(archive, metadata, args[1]); return 0
    if args:
        raise ValueError('Unknown installer argument.')
    if sys.platform != 'win32':
        raise OSError('This installer is intended for Windows x64.')
    show_installer(archive, metadata); return 0


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception as error:
        if sys.platform == 'win32' and getattr(sys, 'frozen', False) and '--self-test' not in sys.argv:
            import ctypes
            ctypes.windll.user32.MessageBoxW(None, str(error), 'Marja CAN installer error', 0x10)
        else:
            print('Installer error:', error, file=sys.stderr)
        sys.exit(1)
