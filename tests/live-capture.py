"""Hardware-free integration test using a Linux pseudo-terminal and real pyserial."""
import os
from pathlib import Path
import pty
import select
import sys
import tempfile
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from live_capture import Capture, parse_frame

assert parse_frame('t75280322FD3FFFFFFFFF') == (0x752, False, bytes.fromhex('0322FD3FFFFFFFFF'), 'Rx', '1')
assert parse_frame('T18DAF1103010203') == (0x18DAF110, True, b'\x01\x02\x03', 'Rx', '1')
assert parse_frame('tFFF100') is None
assert parse_frame('t1232AA') is None
assert parse_frame('t1231AA1234') == (0x123, False, b'\xaa', 'Rx', '1')
assert parse_frame('12:34:56:1234 Tx 2 0x123 s 2 AA BB') == (0x123, False, b'\xaa\xbb', 'Tx', '2')
assert parse_frame('12:34:56:1234 Rx 2 0x800 s 1 AA') is None
master, slave = pty.openpty()
try:
    with tempfile.TemporaryDirectory() as d:
        c = Capture(os.ttyname(slave), 115200, Path(d)/'capture.name')
        c.start()
        assert not select.select([master], [], [], .2)[0], 'Capture sent unexpected adapter commands'
        payload = b't75280322FD3FFFFFFFFF\r\n12:34:56:1234 Tx 2 0x123 s 2 AA BB\r\nunknown text\r\n'
        os.write(master, payload)
        deadline = time.monotonic() + 5
        while c.bytes_read < len(payload) and time.monotonic() < deadline: time.sleep(.02)
        c.stop(); c.thread.join(3)
        assert not c.running and c.error is None
        assert c.raw_path.read_bytes() == payload
        assert c.frames == 2 and c.unparsed == 1
        content = c.log_path.read_text()
        assert '***PROTOCOL CAN***' in content and '***HEX***' in content
        assert 'Rx 1 0x752 s 8 03 22 FD 3F FF FF FF FF' in content
        assert 'Tx 2 0x123 s 2 AA BB' in content
        assert c.log_path.name == 'capture.name.log'
        try: Capture(os.ttyname(slave), 115200, Path(d)/'capture.name').start()
        except FileExistsError: pass
        else: raise AssertionError('Existing capture was overwritten')
        raw_path = Path(d)/'collision.raw'; raw_path.write_bytes(b'original')
        try: Capture(os.ttyname(slave), 115200, Path(d)/'collision').start()
        except FileExistsError: pass
        else: raise AssertionError('Existing raw file was overwritten')
        assert raw_path.read_bytes() == b'original' and not (Path(d)/'collision.log').exists()
        print('PTY capture passed:', c.log_path.read_text().splitlines()[-2:])
finally:
    os.close(master); os.close(slave)
