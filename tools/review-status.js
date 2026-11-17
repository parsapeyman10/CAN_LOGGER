/* UI-only checks: use existing validation results; do not infer unknown payload values. */
(() => {
  const T = {
    en: {
      green: 'Checked header and length match', orange: 'Expected reply header; data is shorter', red: 'Mismatch in checked data', gray: 'Not enough information to assess',
      greenInfo: 'The checked response fields and known length match. Other payload values may not be checked; this does not prove the device is healthy.',
      orangeInfo: 'The checked reply header matches, but the data is shorter than the selected reference. Missing data cannot be validated.',
      redInfo: 'At least one checked field differs, the response is negative, or a reference check reported a mismatch. Review the evidence below.',
      grayInfo: 'No final reply, no applicable length reference, or an uncertain length prevents a complete assessment. Check the details and reference.',
      expected: 'Expected length', received: 'Received length', bytes: 'bytes', bits: 'bits',
      byte: 'Byte', binary: 'Binary (bit 7 → bit 0)', unknown: 'No field definition is available for this byte. Binary digits alone do not identify their meaning.',
      field: 'Field', interpretation: 'Interpretation', detail: 'Point to a byte or select it with the keyboard to see its explanation.',
      statusNote: 'Colours indicate the checks shown here, not a confirmed diagnosis.',
      rowMatch: 'This checked field matches.', rowShort: 'The reported length is shorter than the reference.', rowMismatch: 'This checked field does not match.'
    },
    fa: {
      green: 'سرآیند بررسی‌شده و طول مطابق‌اند', orange: 'سرآیند مورد انتظار؛ طول داده کمتر است', red: 'مغایرت در دادهٔ بررسی‌شده', gray: 'اطلاعات کافی برای ارزیابی نیست',
      greenInfo: 'فیلدهای پاسخِ بررسی‌شده و طولِ مشخص‌شده مطابق‌اند. ممکن است سایر مقادیر بررسی نشده باشند؛ این نتیجه سلامت قطعه را ثابت نمی‌کند.',
      orangeInfo: 'سرآیند پاسخِ بررسی‌شده مطابق است، اما طول داده از مرجع انتخابی کمتر است. دادهٔ موجودنبود‌ه قابل ارزیابی نیست.',
      redInfo: 'حداقل یکی از فیلدهای بررسی‌شده متفاوت است، پاسخ منفی است یا بررسی مرجع مغایرت گزارش کرده است. شواهد زیر را بررسی کنید.',
      grayInfo: 'نبود پاسخ نهایی، نامشخص بودن طول مرجع یا نامشخص بودن پذیرش طول، مانع ارزیابی کامل است. جزئیات و مرجع را بررسی کنید.',
      expected: 'طول مورد انتظار', received: 'طول دریافت‌شده', bytes: 'بایت', bits: 'بیت',
      byte: 'بایت', binary: 'نمایش دودویی (بیت ۷ ← بیت ۰)', unknown: 'برای این بایت تعریف فیلد در دسترس نیست. رقم‌های دودویی به‌تنهایی معنی بیت‌ها را مشخص نمی‌کنند.',
      field: 'فیلد', interpretation: 'تفسیر', detail: 'برای دیدن توضیح، نشانگر را روی بایت ببرید یا با صفحه‌کلید آن را انتخاب کنید.',
      statusNote: 'رنگ‌ها فقط وضعیت بررسی‌های نمایش‌داده‌شده را نشان می‌دهند، نه تشخیص قطعی.',
      rowMatch: 'این فیلد بررسی‌شده مطابق است.', rowShort: 'طول ثبت‌شده کمتر از مرجع است.', rowMismatch: 'این فیلد بررسی‌شده مغایر است.'
    }
  };
  const lang = () => document.documentElement.lang === 'fa' ? 'fa' : 'en';
  const getNum = value => /^\d+$/.test(String(value)) ? Number(value) : null;
  function assess(run, exchange) {
    if (!run || !exchange || typeof validateExchange !== 'function' || typeof faultReasons !== 'function') return {status:'gray', rows:[]};
    const response = exchange.ans?.p || '';
    const rows = validateExchange(run, exchange, true);
    if (!response) return {status:'gray', rows};
    let expected = null, received = null;
    const numericLengths = rows.filter(row => /طول/.test(row[0]) && getNum(row[1]) !== null && getNum(row[2]) !== null);
    if (numericLengths.length === 1) { expected = getNum(numericLengths[0][1]); received = getNum(numericLengths[0][2]); }
    const ep6FD3F = typeof selectedModel === 'function' && selectedModel(run) === 'BCMi' && exchange.p === '22FD3F' && response.startsWith('62FD3F');
    if (ep6FD3F) { expected = 77; received = (response.length - 6) / 2; }
    const mismatches = rows.filter(row => row[3] === 'مغایر' || row[3] === 'تطبیق نشد');
    const onlyShortLength = row => /طول/.test(row[0]) && getNum(row[1]) !== null && getNum(row[2]) !== null && getNum(row[2]) < getNum(row[1]);
    // An empty payload is a short-data case only if the expected length is known;
    // the service/ID must still match and no other independent mismatch may exist.
    const missingContent = row => row[0] === 'محتوای رکورد' && expected !== null && expected > 0 && received === 0;
    const nonLengthMismatch = mismatches.some(row => !onlyShortLength(row) && !missingContent(row));
    const reasons = faultReasons(run, exchange);
    const ep6LengthOnly = reason => /^EP6 · طول دادهٔ FD3F برابر \d+ بایت است\. انتظار ۷۷ بایت\.$/.test(reason);
    // EP6 expects all 17 VIN bytes to be FF. A matching FF prefix that is
    // merely too short is incomplete, not proof that a received value differs.
    const vinShortPrefix = typeof selectedModel === 'function' && selectedModel(run) === 'BCMi' && exchange.p === '22F190' && response.startsWith('62F190') && received !== null && expected === 17 && received < expected && /^(?:FF)*$/.test(response.slice(6));
    const shortVinOnly = reason => vinShortPrefix && reason === 'EP6 · مقدار VIN با معیار خالی‌بودن در پایان خط مغایرت دارد';
    const otherFinding = reasons.some(reason => !ep6LengthOnly(reason) && !shortVinOnly(reason) && !numericLengths.some(row => reason.startsWith(row[0] + ' ·')) && !mismatches.some(row => missingContent(row) && reason.startsWith(row[0] + ' ·')));
    if (response.startsWith('7F') || nonLengthMismatch || otherFinding) return {status:'red', rows, expected, received};
    if (expected !== null && received !== null && received < expected) return {status:'orange', rows, expected, received};
    // EP6 explicitly says that an extended FD3F length depends on the specification version.
    if (ep6FD3F && received > expected) return {status:'gray', rows, expected, received};
    if (expected !== null && received !== null && received > expected) return {status:'red', rows, expected, received};
    if (expected !== null && expected === received && !mismatches.length && !reasons.length) return {status:'green', rows, expected, received};
    return {status:'gray', rows, expected, received};
  }
  // Expose the assessment for regression tests; it reads, but never mutates, app data.
  window.CANReviewAssessment = Object.freeze({assess});
  const tooltip = document.createElement('div'); tooltip.className = 'byte-tooltip'; tooltip.id = 'byte-tooltip'; tooltip.setAttribute('role','tooltip'); tooltip.hidden = true; document.body.append(tooltip);
  let currentTarget = null, previousDescription = null;
  function hide() {
    tooltip.hidden = true;
    if (currentTarget) {
      if (previousDescription === null) currentTarget.removeAttribute('aria-describedby');
      else currentTarget.setAttribute('aria-describedby', previousDescription);
    }
    currentTarget = null; previousDescription = null;
  }
  function show(target) {
    if (!target?.dataset.byteInfo) return;
    if (currentTarget !== target) { hide(); currentTarget = target; previousDescription = target.getAttribute('aria-describedby'); target.setAttribute('aria-describedby', [previousDescription, tooltip.id].filter(Boolean).join(' ')); }
    tooltip.textContent = target.dataset.byteInfo; tooltip.dir = 'auto'; tooltip.hidden = false;
    const box = target.getBoundingClientRect(), width = tooltip.offsetWidth, height = tooltip.offsetHeight;
    tooltip.style.left = Math.max(8, Math.min(box.left, innerWidth - width - 8)) + 'px';
    tooltip.style.top = Math.max(8, box.bottom + 8 + height <= innerHeight ? box.bottom + 8 : box.top - height - 8) + 'px';
  }
  document.addEventListener('pointerover', event => { const target = event.target.closest('[data-byte-info]'); if (target) show(target); });
  document.addEventListener('pointerout', event => { if (currentTarget && !currentTarget.contains(event.relatedTarget) && !currentTarget.matches(':focus')) hide(); });
  document.addEventListener('focusin', event => { const target = event.target.closest('[data-byte-info]'); if (target) show(target); });
  document.addEventListener('focusout', event => { if (currentTarget && !currentTarget.contains(event.relatedTarget)) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => {
    if (currentTarget && (currentTarget.matches(':hover') || currentTarget.matches(':focus'))) show(currentTarget);
    else hide();
  }, true);
  function info(node, text) { node.dataset.byteInfo = text; node.tabIndex = 0; node.classList.add('byte-explained'); node.setAttribute('aria-label', text); }
  function rawFrames(root, t) {
    for (const cell of root.querySelectorAll('.frame-trace tbody tr td:last-child')) {
      if (cell.dataset.bytesPrepared === 'true') continue;
      const text = cell.textContent.trim();
      if (!/^[0-9a-f]{2}(?:\s+[0-9a-f]{2})*$/i.test(text)) continue;
      const bytes = text.split(/\s+/); const fragment = document.createDocumentFragment();
      bytes.forEach((hex, index) => {
        if (index) fragment.append(document.createTextNode(' '));
        const part = document.createElement('span'); part.textContent = hex;
        info(part, `${t.byte} ${index + 1}: ${hex} · ${t.binary}: ${parseInt(hex,16).toString(2).padStart(8,'0')} · ${t.unknown}`);
        fragment.append(part);
      });
      cell.dataset.bytesPrepared = 'true'; cell.replaceChildren(fragment);
    }
    // Re-localize already prepared raw bytes without changing their content.
    for (const cell of root.querySelectorAll('.frame-trace tbody tr td:last-child[data-bytes-prepared="true"]')) {
      cell.querySelectorAll(':scope > span').forEach((part, index) => {
        const hex = part.textContent;
        info(part, `${t.byte} ${index + 1}: ${hex} · ${t.binary}: ${parseInt(hex,16).toString(2).padStart(8,'0')} · ${t.unknown}`);
      });
    }
  }
  function getRun(id) { return typeof activeRuns === 'function' ? activeRuns().find(run => String(run.uid) === document.getElementById(id).value) : null; }
  function entries(run) { return run && typeof diagnosticExchanges === 'function' ? diagnosticExchanges(run).out : []; }
  function annotate(report, run, exchange) {
    if (!report || !run || !exchange || !report.querySelector('.validation')) return;
    const t = T[lang()], result = assess(run, exchange);
    rawFrames(report, t);
    let box = report.querySelector(':scope > .review-verdict');
    if (!box) { box = document.createElement('div'); box.className = 'review-verdict'; report.querySelector('.validation').before(box); }
    box.className = 'review-verdict ' + result.status;
    const heading = document.createElement('strong'); heading.textContent = t[result.status];
    const description = document.createElement('p'); description.textContent = t[result.status + 'Info'];
    const foot = document.createElement('small'); foot.textContent = t.statusNote;
    const parts = [heading, description];
    if (result.expected !== null && result.expected !== undefined && result.received !== null && result.received !== undefined) {
      const length = document.createElement('p'); length.textContent = `${t.expected}: ${result.expected} ${t.bytes} (${result.expected * 8} ${t.bits}) · ${t.received}: ${result.received} ${t.bytes} (${result.received * 8} ${t.bits})`; parts.push(length);
    }
    const hint = document.createElement('p'); hint.className = 'review-hint'; hint.textContent = t.detail;
    parts.push(foot, hint); box.replaceChildren(...parts);
    const validation = report.querySelector('.validation');
    validation.classList.remove('review-green','review-orange','review-red','review-gray'); validation.classList.add('review-' + result.status);
    const tableRows = validation.querySelectorAll('tbody tr');
    result.rows.forEach((row, index) => {
      const tr = tableRows[index]; if (!tr) return;
      const exp = getNum(row[1]), actual = getNum(row[2]);
      const short = (/طول/.test(row[0]) && exp !== null && actual !== null && actual < exp) || (result.status === 'orange' && row[0] === 'محتوای رکورد' && result.received === 0);
      const status = row[3] === 'مطابق' ? 'green' : short ? 'orange' : (row[3] === 'مغایر' || row[3] === 'تطبیق نشد') ? 'red' : 'gray';
      tr.classList.remove('review-row-green','review-row-orange','review-row-red','review-row-gray'); tr.classList.add('review-row-' + status);
      tr.title = status === 'green' ? t.rowMatch : status === 'orange' ? t.rowShort : status === 'red' ? t.rowMismatch : '';
    });
    // EP6 length does not appear in the generic validation table, so colour that check separately.
    if (exchange.p === '22FD3F' && typeof selectedModel === 'function' && selectedModel(run) === 'BCMi') {
      const ep6 = [...report.querySelectorAll(':scope > .notice')].find(el => /EP6/.test(el.querySelector('h3')?.textContent || ''));
      if (ep6) { ep6.classList.remove('review-green','review-orange','review-red','review-gray'); ep6.classList.add('review-' + result.status); }
    }
    for (const node of report.querySelectorAll('.bytepart > .byteval')) {
      const parent = node.closest('.bytepart');
      info(node, [parent.querySelector('b')?.textContent, node.textContent, parent.querySelector(':scope > span')?.textContent].filter(Boolean).join(' · '));
    }
    for (const node of report.querySelectorAll('.payloadcard details > summary .byteval')) {
      const details = node.closest('details');
      info(node, [details.querySelector('summary')?.textContent, ...[...details.querySelectorAll(':scope > p')].map(p => p.textContent)].filter(Boolean).join(' · '));
    }
    const model = typeof selectedModel === 'function' ? selectedModel(run) : '';
    const groupInfo = offset => window.CANDiagGroups?.lookup(model, exchange.p, exchange.ans?.p, offset, lang());
    const response = report.querySelector('.exchange-response');
    if (response) {
      response.querySelectorAll('.payloadcard > details').forEach((details, offset) => {
        const node = details.querySelector(':scope > summary .byteval'), explanation = groupInfo(offset);
        if (node && explanation) info(node, explanation);
      });
      for (const row of response.querySelectorAll('.detail table tbody tr, .payloadcard table tbody tr')) {
        const cells = row.querySelectorAll('td'); if (cells.length !== 4) continue;
        const offset = Number(cells[0].textContent.trim());
        info(cells[2], groupInfo(offset) || `${t.field}: ${cells[1].textContent} · ${t.interpretation}: ${cells[3].textContent}`);
      }
      const isRead = exchange.p.startsWith('22') && exchange.ans?.p.startsWith('62' + exchange.p.slice(2,6));
      for (const cell of response.querySelectorAll('.hexgrid > span')) {
        const number = Number(cell.querySelector('small')?.textContent), hex = cell.querySelector('code')?.textContent.trim();
        if (!Number.isInteger(number) || !/^[0-9a-f]{2}$/i.test(hex || '')) continue;
        let context = '';
        if (isRead && number >= 4) {
          const offset = number - 4;
          const row = [...response.querySelectorAll('.detail table tbody tr, .payloadcard table tbody tr')].find(tr => {
            const td = tr.querySelectorAll('td'); return td.length === 4 && Number(td[0].textContent.trim()) === offset && td[2].textContent.trim().toUpperCase() === hex.toUpperCase();
          });
          if (row) { const td = row.querySelectorAll('td'); context = `${t.field}: ${td[1].textContent} · ${t.interpretation}: ${td[3].textContent}`; }
          context = groupInfo(offset) || (exchange.p === '22FDC0' ? '' : context);
        }
        info(cell, context || `${t.byte} ${number}: ${hex} · ${t.unknown}`);
      }
    }
  }
  function refresh() {
    hide();
    try {
      const walkRun = getRun('walkRun');
      if (!document.getElementById('walk').hidden && walkRun && typeof _6d47b2478d === 'function') {
        const filtered = entries(walkRun).filter(_6d47b2478d), value = document.getElementById('walkIndex').value;
        if (value !== '') annotate(document.getElementById('walkReport'), walkRun, filtered[Number(value)]);
      }
      if (!document.getElementById('compare').hidden && typeof _63db65fae6 !== 'undefined' && typeof _ce1848e545 === 'function') {
        const index = document.getElementById('cmpIndex').value, pair = index === '' ? null : _63db65fae6[Number(index)]?.[0], runs = _ce1848e545();
        if (pair && document.getElementById('kind').value === 'diag') document.querySelectorAll('#pairCards > article').forEach((article, i) => annotate(article, runs[i], pair[i]?.x));
      }
      if (!document.getElementById('canFrames').hidden) rawFrames(document.getElementById('framesResult'), T[lang()]);
      if (!document.getElementById('faults').hidden) {
        const run = getRun('faultRun'), findings = entries(run).filter(entry => faultReasons(run, entry).length);
        document.querySelectorAll('#faultList > details').forEach((details, i) => { const report = details.querySelector(':scope > div'); if (report) annotate(report, run, findings[i]); });
      }
    } catch (error) { console.error('Unable to annotate diagnostic checks', error); }
  }
  let queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; refresh(); }); } }
  for (const id of ['walkReport','pairCards','framesResult']) new MutationObserver(schedule).observe(document.getElementById(id), {childList:true});
  new MutationObserver(records => { if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches('details > div') || node.querySelector?.('.validation'))))) schedule(); }).observe(document.getElementById('faultList'), {childList:true, subtree:true});
  new MutationObserver(schedule).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  document.addEventListener('click', event => { if (event.target.closest('#tabs, #openWalk, #go, .summary-action')) schedule(); });
  document.addEventListener('change', event => { if (event.target.closest('#walkRun, #walkIndex, #faultRun, #leftRun, #rightRun, #cmpIndex, #kind, #filter, #scope, #filelist')) schedule(); });
  schedule();
})();
