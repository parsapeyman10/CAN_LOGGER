/* Desktop-to-analyzer handoff: bounded chunks, same file import path as Add files. */
(() => {
  let chunks = null, name = '', expected = 0, count = 0;
  const max = 64 * 1024 * 1024;
  const text = (en, fa) => document.documentElement.lang === 'fa' ? fa : en;
  const message = value => {
    const status = document.getElementById('capture-import-status');
    if (status) { status.hidden = false; status.textContent = value; }
  };
  function begin(filename, size) {
    if (!Number.isSafeInteger(size) || size < 1 || size > max || typeof filename !== 'string' || !filename.toLowerCase().endsWith('.log')) return false;
    chunks = []; name = filename; expected = size; count = 0;
    document.querySelector('[data-tab="setup"]').click();
    message(text('Opening the recorded log…', 'در حال باز کردن لاگ ضبط‌شده…'));
    return true;
  }
  function append(base64) {
    if (!chunks || typeof base64 !== 'string') return false;
    try {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      if (!bytes.length || count + bytes.length > expected) throw Error('Invalid size');
      chunks.push(bytes); count += bytes.length; return true;
    } catch (_) { chunks = null; message(text('Could not open the capture. Choose the saved .log using Add files.', 'باز کردن ضبط انجام نشد. فایل .log ذخیره‌شده را از بخش افزودن فایل انتخاب کنید.')); return false; }
  }
  async function finish() {
    if (!chunks || count !== expected) { chunks = null; message(text('The capture could not be transferred. Choose the saved .log using Add files.', 'انتقال ضبط کامل نشد. فایل .log ذخیره‌شده را از بخش افزودن فایل انتخاب کنید.')); return; }
    try {
      const file = new File(chunks, name, {type:'text/plain'}); chunks = null;
      const input = document.getElementById('logs'), dt = new DataTransfer();
      dt.items.add(file); input.files = dt.files;
      const before = typeof activeRuns === 'function' ? activeRuns().length : 0;
      await input.onchange({target:input});
      if (typeof activeRuns === 'function' && activeRuns().length > before) {
        message(text('Capture added. Showing the recorded requests.', 'ضبط اضافه شد؛ درخواست‌های ثبت‌شده نمایش داده می‌شوند.'));
        document.querySelector('[data-tab="walk"]').click();
      } else message(text('No supported frames were added. Check the source format or open the saved .raw file separately.', 'فریم پشتیبانی‌شده‌ای اضافه نشد. قالب منبع یا فایل خام ذخیره‌شده را بررسی کنید.'));
    } catch (_) { chunks = null; message(text('Could not open the capture. Choose the saved .log using Add files.', 'باز کردن ضبط انجام نشد. فایل .log ذخیره‌شده را از بخش افزودن فایل انتخاب کنید.')); }
  }
  window.CANImport = Object.freeze({begin, append, finish});
})();
