"""Run the CLI against a real serial pseudo-terminal; no hardware required."""
import os
from pathlib import Path
import pty
import subprocess
import sys
import tempfile
import time

root = Path(__file__).resolve().parents[1]
master, slave = pty.openpty()
try:
    with tempfile.TemporaryDirectory() as directory:
        code = '''
import sys
from types import SimpleNamespace
from serial.tools import list_ports
list_ports.comports = lambda: [SimpleNamespace(device=sys.argv[1],description="test SPP",hwid="virtual")]
import capture_ports
capture_ports.__file__ = sys.argv[2] + "/capture_ports.py"
raise SystemExit(capture_ports.main())
'''
        env = dict(os.environ, PYTHONPATH=str(root), PYTHONUNBUFFERED='1')
        proc = subprocess.Popen([sys.executable, '-u', '-c', code, os.ttyname(slave), directory], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
        proc.stdin.write('1\n115200\ny\n'); proc.stdin.flush()
        while True:
            line = proc.stdout.readline()
            assert line, 'Capture terminated before starting'
            if 'Press ENTER' in line: break
        payload = b't75280322FD3FFFFFFFFF\r'
        os.write(master, payload)
        time.sleep(.5)
        proc.stdin.write('\n'); proc.stdin.flush()
        out, err = proc.communicate(timeout=10)
        assert proc.returncode == 0, (out, err)
        files = list((Path(directory)/'captures').glob('*/*.raw'))
        assert len(files) == 1 and files[0].read_bytes() == payload
        assert '0x752 s 8 03 22 FD 3F FF FF FF FF' in files[0].with_suffix('.log').read_text()
        assert '1 frames' in out
        print('CLI discovery, confirmation, serial capture and clean stop passed.')
finally:
    os.close(master); os.close(slave)
