"""Interactive passive COM/Bluetooth SPP capture for Capture_Ports.bat."""
from datetime import datetime
from pathlib import Path
import sys

from live_capture import Capture


def safe_filename(value):
    return ''.join(c if c.isalnum() or c in '-_' else '_' for c in value)[:60] or 'port'


def main():
    try:
        import serial
        from serial.tools import list_ports
    except ImportError:
        print('Missing pyserial. Install it with: py -3 -m pip install pyserial')
        return 1
    ports = sorted(list_ports.comports(), key=lambda p: p.device.lower())
    print('\nPASSIVE SERIAL / BLUETOOTH SPP CAPTURE')
    print('Bluetooth Classic SPP must already be paired and expose a COM port.')
    print('BLE, direct CANoe, ELM initialization and wireless packet sniffing are NOT supported.')
    print('Only connect to ports you own or are authorized to monitor.')
    if not ports:
        print('\nNo serial ports found. Connect an adapter or pair an SPP device and try again.')
        return 1
    print('\nDetected ports (opening a serial port can affect an attached device):')
    for index, port in enumerate(ports, 1):
        print(f'  {index}. {port.device} - {port.description} [{port.hwid}]')
    selection = input('\nPort numbers separated by commas, or ALL: ').strip()
    try:
        selected = list(range(len(ports))) if selection.upper() == 'ALL' else [int(x.strip()) - 1 for x in selection.split(',')]
        if not selected or len(set(selected)) != len(selected) or any(i < 0 or i >= len(ports) for i in selected):
            raise ValueError
    except ValueError:
        print('Invalid selection. No ports were opened.')
        return 1
    value = input('Serial baud rate (not CAN bitrate) [115200]: ').strip() or '115200'
    try:
        baud = int(value)
        if not 1200 <= baud <= 4000000:
            raise ValueError
    except ValueError:
        print('Invalid baud rate; choose 1200 to 4000000. No ports were opened.')
        return 1
    print('\nSelected:', ', '.join(ports[i].device for i in selected))
    print('Data is saved as .raw (all bytes) and .log (SLCAN/BUSMASTER classic CAN only).')
    print('No CAN or adapter commands are sent; adapters must already be streaming.')
    print('Port opening can assert serial control lines and affect other applications.')
    if input('Open the selected ports and start recording? [y/N]: ').strip().lower() != 'y':
        print('Cancelled. No ports were opened.')
        return 0
    directory = Path(__file__).resolve().parent / 'captures' / datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    try:
        directory.mkdir(parents=True, exist_ok=False)
    except OSError as exc:
        print(f'Cannot create capture folder: {exc}')
        return 1
    active = []
    failed = []
    try:
        for index in selected:
            p = ports[index]
            capture = Capture(p.device, baud, directory / f'{index+1:02d}_{safe_filename(p.device)}')
            try:
                capture.start()
                active.append(capture)
                print(f'Recording {p.device}: {capture.log_path.name}, {capture.raw_path.name}')
            except (OSError, ValueError, serial.SerialException) as exc:
                failed.append(p.device)
                print(f'Could not open {p.device}: {exc}')
        if not active:
            print('No ports were opened successfully.')
            return 1
        print(f'\nSaving in: {directory}')
        print('Press ENTER to stop recording (Ctrl+C also stops).')
        try:
            input()
        except (KeyboardInterrupt, EOFError):
            print('\nStopping...')
    finally:
        for capture in active:
            capture.stop()
        for capture in active:
            capture.thread.join(5)
            if capture.running:
                print(f'WARNING: {capture.port} is still closing; files may be incomplete.')
                failed.append(capture.port)
            elif capture.error:
                print(f'ERROR {capture.port}: {capture.error}')
                failed.append(capture.port)
            print(f'{capture.port}: {capture.frames} frames, {capture.unparsed} unparsed lines, {capture.bytes_read} raw bytes')
        if active:
            print('Timestamps are PC reception times; SLCAN direction is assumed Rx.')
            print('Unknown and binary data remains in .raw; import .log via Add files.')
    return 1 if failed else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print('\nCancelled.')
        sys.exit(1)
