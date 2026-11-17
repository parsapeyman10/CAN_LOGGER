"""Passive serial capture: Classic CAN SLCAN and BUSMASTER text rows.

No device commands are sent. The adapter/source must already stream frames.
The complete byte stream is kept separately; timestamps in the .log are PC reception time.
"""
from datetime import datetime
from pathlib import Path
import queue
import re
import threading
import time

_SLCAN = re.compile(r'^([tT])([0-9A-Fa-f]{3}|[0-9A-Fa-f]{8})([0-8])([0-9A-Fa-f]*)(?:[0-9A-Fa-f]{4})?$')
_BUS = re.compile(r'^\d\d:\d\d:\d\d:\d+\s+(Rx|Tx)\s+(\d+)\s+0x([0-9A-Fa-f]+)\s+([sx])\s+([0-8])(?:\s+(.*?))?\s*$', re.I)


def parse_frame(line):
    """Return (CAN ID, extended, bytes, direction, channel) or None; reject ambiguity."""
    line = line.strip()
    m = _SLCAN.fullmatch(line)
    if m:
        typ, identifier, dlc, tail = m.groups()
        extended = typ == 'T'
        if len(identifier) != (8 if extended else 3):
            return None
        size = int(dlc) * 2
        if len(tail) not in (size, size + 4):
            return None
        data = tail[:size]
        can_id = int(identifier, 16)
        if can_id > (0x1fffffff if extended else 0x7ff):
            return None
        # SLCAN does not carry direction; Rx is an assumption for passive streams.
        return can_id, extended, bytes.fromhex(data), 'Rx', '1'
    m = _BUS.fullmatch(line)
    if not m:
        return None
    direction, channel, identifier, typ, dlc, raw = m.groups()
    fields = (raw or '').split()
    can_id = int(identifier, 16)
    if len(fields) != int(dlc) or not all(re.fullmatch(r'[0-9A-Fa-f]{2}', b) for b in fields):
        return None
    extended = typ.lower() == 'x'
    if can_id > (0x1fffffff if extended else 0x7ff):
        return None
    return can_id, extended, bytes.fromhex(''.join(fields)), direction.title(), channel


def log_line(frame, now):
    identifier, extended, data, direction, channel = frame
    stamp = now.strftime('%H:%M:%S:') + f'{now.microsecond:06d}'
    payload = ' '.join(f'{b:02X}' for b in data)
    return f'{stamp} {direction} {channel} 0x{identifier:X} {"x" if extended else "s"} {len(data)}' + (' ' + payload if payload else '') + '\n'


class Capture:
    """Read serial in a background thread, persist raw and parsed data immediately."""
    def __init__(self, port, baud, base, serial_factory=None):
        self.port, self.baud, self.base = port, baud, Path(base)
        self.log_path = Path(str(self.base) + '.log')
        self.raw_path = Path(str(self.base) + '.raw')
        if self.log_path == self.raw_path:
            raise ValueError('Invalid capture file names')
        self.factory = serial_factory
        self.events = queue.Queue(maxsize=300)
        self.stop_event = threading.Event()
        self.thread = None
        self.error = None
        self.frames = 0
        self.unparsed = 0
        self.bytes_read = 0
        self.display_dropped = 0

    def _notify(self, event):
        try:
            self.events.put_nowait(event)
        except queue.Full:
            self.display_dropped += 1

    def start(self):
        if self.thread is not None:
            raise RuntimeError('Capture already started')
        if self.factory is None:
            import serial
            self.factory = serial.Serial
        # Exclusive creation prevents accidental replacement. Remove our empty file if
        # opening the second file or serial port fails; never remove an existing file.
        log = self.log_path.open('x', encoding='ascii', newline='\n')
        raw = None
        device = None
        try:
            raw = self.raw_path.open('xb')
            device = self.factory(self.port, self.baud, timeout=0.2, write_timeout=0.2)
            log.write('***BUSMASTER Ver 3.2.2***\n***PROTOCOL CAN***\n***HEX***\n*** PC reception time; source direction preserved where supplied; SLCAN assumed Rx ***\n')
            log.flush()
        except BaseException:
            if device is not None:
                device.close()
            log.close()
            self.log_path.unlink(missing_ok=True)
            if raw is not None:
                raw.close()
                self.raw_path.unlink(missing_ok=True)
            raise
        self.thread = threading.Thread(target=self._run, args=(device, log, raw), daemon=True)
        self.thread.start()

    def _run(self, device, log, raw):
        pending = bytearray()
        oversized = False
        last_flush = time.monotonic()
        try:
            while not self.stop_event.is_set():
                chunk = device.read(4096)
                if chunk:
                    raw.write(chunk)
                    self.bytes_read += len(chunk)
                    for byte in chunk:
                        if byte in (10, 13):
                            if oversized:
                                self.unparsed += 1
                            elif pending:
                                frame = parse_frame(pending.decode('ascii', errors='replace'))
                                if frame is None:
                                    self.unparsed += 1
                                else:
                                    row = log_line(frame, datetime.now())
                                    log.write(row)
                                    self.frames += 1
                                    self._notify(row.strip())
                            pending.clear()
                            oversized = False
                        elif not oversized:
                            pending.append(byte)
                            if len(pending) > 4096:
                                pending.clear()
                                oversized = True
                if time.monotonic() - last_flush >= 1:
                    raw.flush(); log.flush(); last_flush = time.monotonic()
            if pending or oversized:
                self.unparsed += 1  # no terminator: do not invent a complete frame
        except Exception as exc:
            self.error = str(exc)
        finally:
            try:
                device.close()
            except Exception as exc:
                self.error = self.error or str(exc)
            for stream in (raw, log):
                try:
                    stream.close()
                except Exception as exc:
                    self.error = self.error or str(exc)
            self._notify(None)

    def stop(self):
        self.stop_event.set()

    @property
    def running(self):
        return self.thread is not None and self.thread.is_alive()


def open_capture_dialog(parent):
    """Native dialog. Bluetooth Classic SPP must first be paired by the OS."""
    from PyQt6.QtCore import QTimer
    from PyQt6.QtWidgets import (QComboBox, QDialog, QFileDialog, QFormLayout,
                                 QHBoxLayout, QLabel, QMessageBox, QPlainTextEdit,
                                 QPushButton, QVBoxLayout)
    try:
        from serial.tools import list_ports
    except ImportError:
        QMessageBox.critical(parent, 'Live capture', 'pyserial is missing. Install pyserial, then restart the app.')
        return

    class Dialog(QDialog):
        def __init__(self):
            super().__init__(parent)
            self.capture = None
            self.out = None
            self.last_error = None
            self.setMinimumSize(680, 490)
            layout = QVBoxLayout(self)
            top = QHBoxLayout()
            self.language = QComboBox(); self.language.addItems(['English', 'فارسی'])
            top.addStretch(); top.addWidget(self.language); layout.addLayout(top)
            self.guide = QLabel(); self.guide.setWordWrap(True); layout.addWidget(self.guide)
            form = QFormLayout(); layout.addLayout(form)
            self.port = QComboBox(); self.port.setEditable(True)
            row = QHBoxLayout(); row.addWidget(self.port); self.refresh_button = QPushButton(); row.addWidget(self.refresh_button)
            self.port_label = QLabel(); form.addRow(self.port_label, row)
            self.baud = QComboBox(); self.baud.setEditable(True); self.baud.addItems(['115200', '9600', '38400', '57600', '230400', '460800', '921600'])
            self.baud_label = QLabel(); form.addRow(self.baud_label, self.baud)
            self.path_label = QLabel(); self.path = QLabel(); self.path.setWordWrap(True)
            pathrow = QHBoxLayout(); pathrow.addWidget(self.path, 1); self.choose = QPushButton(); pathrow.addWidget(self.choose)
            form.addRow(self.path_label, pathrow)
            actions = QHBoxLayout(); self.start_button = QPushButton(); self.stop_button = QPushButton(); self.close_button = QPushButton()
            for button in (self.start_button, self.stop_button, self.close_button): actions.addWidget(button)
            layout.addLayout(actions)
            self.status = QLabel(); self.status.setWordWrap(True); layout.addWidget(self.status)
            self.preview = QPlainTextEdit(); self.preview.setReadOnly(True); self.preview.document().setMaximumBlockCount(200); layout.addWidget(self.preview, 1)
            self.timer = QTimer(self); self.timer.setInterval(250); self.timer.timeout.connect(self.update_capture); self.timer.start()
            self.language.currentIndexChanged.connect(self.translate)
            self.refresh_button.clicked.connect(self.refresh)
            self.choose.clicked.connect(self.choose_path)
            self.start_button.clicked.connect(self.start)
            self.stop_button.clicked.connect(self.stop)
            self.close_button.clicked.connect(self.close)
            self.refresh(); self.translate(); self.update_capture()

        def text(self, en, fa):
            return fa if self.language.currentIndex() else en

        def translate(self):
            self.setWindowTitle(self.text('Live serial / Bluetooth capture', 'ضبط زنده از سریال / بلوتوث'))
            self.guide.setText(self.text(
                '1. Pair Bluetooth Classic SPP in your OS, or connect a serial adapter. 2. Select its COM/serial port and serial baud rate. 3. Choose a new save name and start. The source must already stream SLCAN frames or BUSMASTER text rows. No commands are sent. BLE, ELM/OBD polling and direct CANoe connections are not supported.',
                '۱. بلوتوث کلاسیک SPP را در سیستم جفت کنید یا مبدل سریال را وصل کنید. ۲. پورت و سرعت سریال را انتخاب کنید. ۳. نام فایل جدید را انتخاب و ضبط را شروع کنید. منبع باید از قبل فریم SLCAN یا ردیف متنی BUSMASTER ارسال کند. برنامه فرمانی نمی‌فرستد. BLE، پرس‌وجوی ELM/OBD و اتصال مستقیم CANoe پشتیبانی نمی‌شوند.'))
            self.port_label.setText(self.text('Serial port', 'پورت سریال'))
            self.baud_label.setText(self.text('Serial baud rate (not CAN bitrate)', 'سرعت سریال (نه نرخ CAN)'))
            self.path_label.setText(self.text('Save as', 'ذخیره در'))
            self.refresh_button.setText(self.text('Refresh ports', 'نوسازی پورت‌ها'))
            self.choose.setText(self.text('Choose…', 'انتخاب…'))
            self.start_button.setText(self.text('Start recording', 'شروع ضبط'))
            self.stop_button.setText(self.text('Stop', 'توقف'))
            self.close_button.setText(self.text('Close', 'بستن'))
            if not self.out: self.path.setText(self.text('Choose a new .log file', 'یک فایل .log جدید انتخاب کنید'))
            self.update_capture()

        def refresh(self):
            previous = self.port.currentData() or self.port.currentText()
            self.port.clear()
            for p in list_ports.comports(): self.port.addItem(f'{p.device} — {p.description}', p.device)
            index = self.port.findData(previous)
            if index >= 0: self.port.setCurrentIndex(index)
            elif previous: self.port.setEditText(previous)

        def choose_path(self):
            path, _ = QFileDialog.getSaveFileName(self, self.text('Save capture', 'ذخیره ضبط'), '', 'CAN log (*.log)')
            if path:
                self.out = Path(path).with_suffix('') if Path(path).suffix.lower() == '.log' else Path(path)
                self.path.setText(str(self.out) + '.log  |  ' + str(self.out) + '.raw')

        def start(self):
            if self.capture and self.capture.running: return
            port = self.port.currentData() or self.port.currentText().strip()
            try:
                baud = int(self.baud.currentText())
                if not port or not 1200 <= baud <= 4000000 or not self.out:
                    raise ValueError(self.text('Select a port, a baud rate from 1200 to 4000000, and a save name.', 'پورت، سرعت بین ۱۲۰۰ تا ۴۰۰۰۰۰۰ و نام فایل را انتخاب کنید.'))
                capture = Capture(port, baud, self.out)
                capture.start()
                self.capture = capture; self.last_error = None; self.preview.clear()
            except Exception as exc:
                QMessageBox.warning(self, self.text('Unable to start', 'شروع ضبط ممکن نیست'), str(exc))
            self.update_capture()

        def stop(self):
            if self.capture: self.capture.stop()
            self.update_capture()

        def update_capture(self):
            capture = self.capture
            running = bool(capture and capture.running)
            self.start_button.setEnabled(not running); self.stop_button.setEnabled(running)
            self.refresh_button.setEnabled(not running); self.port.setEnabled(not running); self.baud.setEnabled(not running); self.choose.setEnabled(not running)
            if not capture:
                self.status.setText(self.text('Ready. Files are never overwritten.', 'آماده. فایل‌های موجود بازنویسی نمی‌شوند.')); return
            for _ in range(300):
                try: item = capture.events.get_nowait()
                except queue.Empty: break
                if item is not None: self.preview.appendPlainText(item)
            state = self.text('Recording' if running else 'Stopped', 'در حال ضبط' if running else 'متوقف شد')
            self.status.setText(f'{state} · {self.text("Frames", "فریم")}: {capture.frames} · {self.text("Unparsed lines", "خط نامشخص")}: {capture.unparsed} · {self.text("Raw bytes", "بایت خام")}: {capture.bytes_read} · {self.text("Preview lines skipped", "خط نمایش‌داده‌نشده")}: {capture.display_dropped}\n{self.text("Time: PC reception; SLCAN assumed Rx; raw saved separately.", "زمان: دریافت رایانه؛ جهت SLCAN دریافتی فرض می‌شود؛ دادهٔ خام جداگانه ذخیره شد.")}')
            if capture.error and not running and capture.error != self.last_error:
                self.last_error = capture.error
                QMessageBox.warning(self, self.text('Capture stopped', 'ضبط متوقف شد'), capture.error)

        def closeEvent(self, event):
            if self.capture and self.capture.running:
                self.capture.stop()
                self.status.setText(self.text('Stopping; close again when finished.', 'در حال توقف؛ پس از پایان دوباره ببندید.'))
                event.ignore()
            else:
                event.accept()

    dialog = Dialog()
    dialog.exec()
