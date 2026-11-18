/* Bilingual task navigation and evidence-based summaries. */
(() => {
  const $ = id => document.getElementById(id);
  const copy = {
    en: {
      heading: 'What would you like to do?', sub: 'Choose a task. You can change your choice at any time.',
      capture: 'Record a log', captureDesc: 'Connect a serial or paired Bluetooth SPP source.', open: 'Open a log', openDesc: 'Choose a recorded file to review.', desktopOnly: 'Live capture is available in the desktop app; here you can open a saved log.',
      review: 'Review one log', reviewDesc: 'Explore requests, replies and possible issues.',
      compare: 'Compare two logs', compareDesc: 'Find differences between two recordings.',
      frames: 'Find CAN messages', framesDesc: 'Inspect messages by CAN identifier.',
      overview: 'Log overview', current: 'Current request', selected: 'File and channel',
      total: 'Reconstructed requests', flagged: 'Requests needing review', incomplete: 'Incomplete or invalid ISO-TP events',
      scope: 'Overview covers the selected file and channel, before request filters. A finding is not a confirmed fault.',
      unavailable: 'Summary unavailable', unavailableBody: 'Select an enabled log and a device model, then check the details below.',
      reviewStatus: 'Needs review', waitStatus: 'No final reply recorded', noFinding: 'No finding in current checks', info: 'Insufficient evidence',
      caution: 'This is a finding in the recorded data, not a confirmed fault. Check the reference and evidence below.',
      cautionNone: 'Only available checks were evaluated. This does not prove that the device is healthy.',
      cautionMissing: 'A missing reply does not by itself prove a failure; the request may suppress the reply or the recording may be incomplete.',
      reason: 'First finding', more: 'additional finding(s)', next: 'Next step', nextText: 'Review the recorded evidence and verify the selected device model and reference.',
      raw: 'Request bytes', findingsLink: 'See requests needing review',
      note: 'Counts use the existing fault-finder checks; incomplete transport events are reported separately.',
      compareOverview: 'Comparison overview', shown: 'Events shown', different: 'Different content', oneSide: 'Present in one file only', same: 'Same content',
      compareScope: 'Counts reflect the current event and display filters. Each row is an aligned event, not a confirmed fault.', showDiff: 'Show only differences',
      neg: 'Negative reply', pending: 'A pending reply was recorded, but no final reply was seen.', missing: 'No final reply was seen in the recording.',
      length: (n) => `FD3F contains ${n} data bytes; the EP6 reference expects 77.`,
    },
    fa: {
      heading: 'می‌خواهید چه کاری انجام دهید؟', sub: 'یک مسیر را انتخاب کنید؛ هر زمان می‌توانید مسیر را عوض کنید.',
      capture: 'ضبط لاگ', captureDesc: 'اتصال منبع سریال یا بلوتوث SPP جفت‌شده.', open: 'باز کردن لاگ', openDesc: 'فایل ثبت‌شده را برای بررسی انتخاب کنید.', desktopOnly: 'ضبط زنده در برنامهٔ دسکتاپ است؛ در این صفحه می‌توانید لاگ ذخیره‌شده را باز کنید.',
      review: 'بررسی یک لاگ', reviewDesc: 'مرور درخواست‌ها، پاسخ‌ها و موارد نیازمند بررسی.',
      compare: 'مقایسهٔ دو لاگ', compareDesc: 'پیداکردن تفاوت‌های دو فایل ثبت‌شده.',
      frames: 'جست‌وجوی پیام‌های CAN', framesDesc: 'دیدن پیام‌ها با شناسهٔ CAN.',
      overview: 'خلاصهٔ لاگ', current: 'درخواست فعلی', selected: 'فایل و کانال',
      total: 'درخواست بازسازی‌شده', flagged: 'درخواست نیازمند بررسی', incomplete: 'رخداد ناقص یا نامعتبر ISO-TP',
      scope: 'خلاصه برای فایل و کانال انتخاب‌شده و پیش از فیلتر درخواست‌هاست. مورد نیازمند بررسی الزاماً خطای قطعی نیست.',
      unavailable: 'خلاصه در دسترس نیست', unavailableBody: 'یک لاگ فعال و مدل قطعه را انتخاب کنید و جزئیات زیر را بررسی کنید.',
      reviewStatus: 'نیازمند بررسی', waitStatus: 'پاسخ نهایی ثبت نشده', noFinding: 'در بررسی‌های فعلی موردی یافت نشد', info: 'شواهد کافی نیست',
      caution: 'این مورد از دادهٔ ثبت‌شده به دست آمده و خطای قطعی نیست. مرجع و شواهد زیر را بررسی کنید.',
      cautionNone: 'فقط بررسی‌های موجود انجام شده‌اند؛ این نتیجه سلامت قطعه را ثابت نمی‌کند.',
      cautionMissing: 'نبود پاسخ به‌تنهایی خرابی را ثابت نمی‌کند؛ ممکن است پاسخ درخواست نشده یا ثبت ناقص باشد.',
      reason: 'اولین مورد', more: 'مورد دیگر', next: 'قدم بعدی', nextText: 'شواهد ثبت‌شده و درستی مدل قطعه و مرجع انتخابی را بررسی کنید.',
      raw: 'بایت‌های درخواست', findingsLink: 'دیدن درخواست‌های نیازمند بررسی',
      note: 'تعدادها بر اساس بررسی‌های خطایاب هستند؛ رخدادهای انتقال ناقص جداگانه گزارش می‌شوند.',
      compareOverview: 'خلاصهٔ مقایسه', shown: 'رخداد نمایش‌داده‌شده', different: 'محتوای متفاوت', oneSide: 'فقط در یک فایل', same: 'محتوای یکسان',
      compareScope: 'تعدادها مربوط به فیلتر رخداد و نمایش فعلی هستند. هر ردیف یک رخداد هم‌ترازشده است و اختلاف الزاماً خطای قطعی نیست.', showDiff: 'فقط اختلاف‌ها را نشان بده',
      neg: 'پاسخ منفی', pending: 'پاسخ در حال پردازش ثبت شد، اما پاسخ نهایی دیده نشد.', missing: 'پاسخ نهایی در بازهٔ ثبت دیده نشد.',
      length: (n) => `دادهٔ FD3F شامل ${n} بایت است؛ مرجع EP6 تعداد ۷۷ بایت انتظار دارد.`,
    }
  };
  const lang = () => document.documentElement.lang === 'fa' ? 'fa' : 'en';
  const card = document.createElement('section'); card.className = 'task-start'; card.setAttribute('aria-labelledby', 'task-heading');
  const title = document.createElement('h2'); title.id = 'task-heading'; const sub = document.createElement('p');
  const grid = document.createElement('div'); grid.className = 'task-grid';
  const tasks = [ ['capture','capture','captureDesc','01'], ['open','open','openDesc','02'], ['compare','compare','compareDesc','03'] ];
  const buttons = tasks.map(([id, key, desc, number]) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'task-card';
    const marker = document.createElement('span'); marker.className = 'task-number'; marker.textContent = number;
    const body = document.createElement('span'); const label = document.createElement('strong'); const text = document.createElement('small');
    body.append(label, text); button.append(marker, body);
    button.addEventListener('click', () => {
      if (id === 'capture') {
        if (window.CANDesktop === true) window.location.href = 'marja://capture';
        else { status.hidden = false; status.textContent = copy[lang()].desktopOnly; }
      } else if (id === 'open') $('logs').click();
      else if ($(id).hidden) document.querySelector(`[data-tab="${id}"]`).click();
    });
    grid.append(button); return {button, label, text, key, desc};
  });
  const status = document.createElement('p'); status.id = 'capture-import-status'; status.hidden = true; status.setAttribute('role', 'status');
  card.append(title, sub, grid, status); document.querySelector('#setup .easy-guide').before(card);
  const panels = {};
  for (const [id, anchor] of [['walk','walkReport'], ['faults','faultList']]) {
    const panel = document.createElement('section'); panel.className = 'analysis-summary'; panel.hidden = true; panel.setAttribute('aria-live','polite');
    $(anchor).before(panel); panels[id] = panel;
  }
  const comparePanel = document.createElement('section'); comparePanel.className = 'analysis-summary compare-summary'; comparePanel.setAttribute('aria-live','polite'); $('stats').before(comparePanel);
  function make(tag, text, className) { const node = document.createElement(tag); if (className) node.className=className; node.textContent=text; return node; }
  function renderCompare() {
    if ($('compare').hidden || $('pairPanel').hidden || typeof _63db65fae6 === 'undefined') return;
    const t = copy[lang()];
    let same = 0, different = 0, oneSide = 0;
    for (const [pair] of _63db65fae6) {
      if (!pair[0] || !pair[1]) oneSide++;
      else if ((pair[0].f ?? pair[0].p) === (pair[1].f ?? pair[1].p)) same++;
      else different++;
    }
    const fragment = document.createDocumentFragment(); fragment.append(make('h3', t.compareOverview));
    const grid = document.createElement('div'); grid.className = 'summary-metrics';
    for (const [label, value] of [[t.shown,_63db65fae6.length], [t.different,different], [t.oneSide,oneSide], [t.same,same]]) {
      const item = make('div','','summary-metric'); item.append(make('strong',String(value)), make('span',label)); grid.append(item);
    }
    fragment.append(grid, make('p',t.compareScope,'summary-note'));
    if ($('scope').value !== 'diff') {
      const button = make('button',t.showDiff,'summary-action'); button.type = 'button';
      button.addEventListener('click', () => { $('scope').value = 'diff'; $('scope').dispatchEvent(new Event('change', {bubbles:true})); });
      fragment.append(button);
    }
    comparePanel.replaceChildren(fragment);
  }
  function reasonText(reason, t, language) {
    if (language === 'fa') return reason;
    let match = reason.match(/^EP6 · طول دادهٔ FD3F برابر (\d+) بایت است\. انتظار ۷۷ بایت\.$/);
    if (match) return t.length(match[1]);
    match = reason.match(/^پاسخ منفی · NRC (.+)$/); if (match) return t.neg + ' · NRC ' + match[1];
    if (reason === 'پاسخ در حال پردازش ثبت شد، پاسخ نهایی دیده نشد') return t.pending;
    if (reason === 'پاسخ نهایی در بازهٔ ثبت دیده نشد') return t.missing;
    return reason; // Preserve unrecognized details rather than inventing a translation.
  }
  function getSnapshot(id) {
    if (typeof activeRuns !== 'function' || typeof diagnosticExchanges !== 'function' || typeof faultReasons !== 'function' || typeof selectedModel !== 'function') return null;
    const run = activeRuns().find(r => String(r.uid) === $(id === 'walk' ? 'walkRun' : 'faultRun').value);
    if (!run || !selectedModel(run)) return null;
    const result = diagnosticExchanges(run);
    const results = result.out.map(entry => ({entry, reasons: faultReasons(run, entry)}));
    let current = null;
    if (id === 'walk' && typeof _6d47b2478d === 'function') {
      const filtered = results.filter(item => _6d47b2478d(item.entry));
      const index = Number($('walkIndex').value);
      if ($('walkIndex').value !== '' && Number.isInteger(index)) current = filtered[index] || null;
    }
    return {run, results, incomplete: result.incomplete, current};
  }
  function render(id) {
    const panel = panels[id], language = lang(), t = copy[language];
    const section = $(id); if (section.hidden) return;
    let snapshot;
    try { snapshot = getSnapshot(id); } catch (error) { console.error('Unable to build diagnostic overview', error); snapshot = null; }
    const heading = make('h3', t.overview); const fragment = document.createDocumentFragment(); fragment.append(heading);
    if (!snapshot) {
      fragment.append(make('p', t.unavailable, 'summary-badge info'), make('p', t.unavailableBody));
    } else {
      const chosen = $(id === 'walk' ? 'walkRun' : 'faultRun').selectedOptions[0];
      const name = chosen ? chosen.textContent : snapshot.run.name;
      fragment.append(make('p', t.selected + ': ' + name, 'summary-file'));
      const grid = document.createElement('div'); grid.className = 'summary-metrics';
      for (const [label, value] of [[t.total, snapshot.results.length], [t.flagged, snapshot.results.filter(x => x.reasons.length).length], [t.incomplete, snapshot.incomplete || 0]]) {
        const item = make('div', '', 'summary-metric'); item.append(make('strong', String(value)), make('span', label)); grid.append(item);
      }
      fragment.append(grid, make('p', t.scope, 'summary-note'));
      if (id === 'walk' && snapshot.current) {
        const {entry, reasons} = snapshot.current;
        const noReply = !entry.ans?.p;
        const status = noReply ? t.waitStatus : reasons.length ? t.reviewStatus : t.noFinding;
        const variant = reasons.length ? 'warn' : noReply ? 'info' : 'neutral';
        const current = document.createElement('div'); current.className = 'summary-current';
        current.append(make('h4', t.current), make('span', status, 'summary-badge ' + variant));
        if (noReply && reasons.length) current.append(make('span', t.reviewStatus, 'summary-badge warn'));
        current.append(make('p', t.raw + ': ' + entry.p, 'summary-bytes'));
        if (reasons.length) {
          const text = t.reason + ': ' + reasonText(reasons[0], t, language) + (reasons.length > 1 ? ` (+${reasons.length - 1} ${t.more})` : '');
          const detail = make('p', text); detail.dir = 'auto'; current.append(detail);
        }
        current.append(make('p', noReply ? t.cautionMissing : reasons.length ? t.caution : t.cautionNone));
        current.append(make('p', t.next + ': ' + t.nextText, 'summary-next'));
        fragment.append(current);
      }
      if (id === 'walk') {
        const link = make('button', t.findingsLink, 'summary-action'); link.type = 'button';
        link.addEventListener('click', () => {
          document.querySelector('[data-tab="faults"]').click();
          const options = [...$('faultRun').options];
          if (options.some(o => o.value === String(snapshot.run.uid))) { $('faultRun').value = String(snapshot.run.uid); $('faultRun').dispatchEvent(new Event('change', {bubbles:true})); }
        });
        fragment.append(link);
      }
      fragment.append(make('p', t.note, 'summary-note'));
    }
    panel.replaceChildren(fragment); panel.hidden = false;
  }
  let queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; refresh(); }); } }
  function refresh() {
    const t = copy[lang()]; title.textContent = t.heading; sub.textContent = t.sub;
    for (const b of buttons) { b.label.textContent = t[b.key]; b.text.textContent = t[b.desc]; }
    render('walk'); render('faults'); renderCompare();
  }
  for (const id of ['walkReport','faultList','pairCards']) new MutationObserver(schedule).observe($(id), {childList:true});
  new MutationObserver(schedule).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  document.addEventListener('click', event => { if (event.target.closest('#tabs, #openWalk, #go, .task-card, .summary-action')) schedule(); });
  document.addEventListener('change', event => { if (event.target.closest('#walkRun, #walkIndex, #faultRun, #filelist, #walkDidBox, #kind, #filter, #scope, #leftRun, #rightRun')) schedule(); });
  refresh();
})();
