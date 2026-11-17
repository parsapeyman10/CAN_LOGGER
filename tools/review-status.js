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
  // Session response timing is defined in each supplied specification, as two
  // big-endian pairs, with different resolutions. Values are reported, not a verdict.
  function sessionInfo(model, request, response, offset, language) {
    if (!['BCMi','NBCM','SBCM'].includes(model) || !/^10[0-9A-F]{2}$/.test(request) || !/^50[0-9A-F]{2}(?:[0-9A-F]{2})*$/.test(response) || parseInt(response.slice(2,4),16)!==(parseInt(request.slice(2,4),16)&127)) return null;
    const fa=language==='fa', tr=(a,b)=>fa?a:b, bytes=response.match(/../g), ref=model==='BCMi'?'BCMi DiagSpec A13 · PDF 22–23':model==='NBCM'?'NBCM DiagSpec V06 · PDF 12–13':'SBCM DiagSpec V10 · PDF 12–13';
    if(offset===0) return tr('50: پاسخ مثبت کنترل نشست دیاگ.','50: positive Diagnostic Session Control response.')+'\n'+ref;
    if(offset===1) {
      const value=bytes[1], sessions=fa?{'01':'پیش‌فرض','02':'برنامه‌ریزی مجدد','03':'خدمات پس از فروش','60':'تأمین‌کننده'}:{'01':'default','02':'reprogramming','03':'after-sales','60':'supplier'};
      return tr('نشست تأییدشده','Confirmed session')+`: ${value} · `+(sessions[value] || tr('کد ناشناخته','unknown code'))+'\n'+ref;
    }
    if(offset>=2 && offset<=5) {
      const start=offset<4?2:4, group=bytes.slice(start,start+2), name=start===2?'P2Server_max':'P2*Server_max';
      const description=start===2?tr('زمان پاسخ عادی','Normal response timing'):tr('زمان پاسخ پس از اعلام در حال پردازش (NRC 78)','Response timing after response-pending (NRC 78)');
      return `${name} · ${description}\n${tr('دو بایت پُرارزش به کم‌ارزش','Two bytes, high then low')}: ${group.join(' ')}`+(group.length===2 ? ` = ${parseInt(group.join(''),16)*(start===2?1:10)} ms` : ` · ${tr('ناقص؛ مقدار قابل محاسبه نیست','Incomplete; value cannot be calculated')}`)+`\n${ref}`;
    }
    return null;
  }
  window.CANSessionInfo = Object.freeze({lookup:sessionInfo});
  // Map only frames which reproduce the exact assembled message and timestamps.
  // Other transfers, flow-control frames and padding are never treated as data.
  function frameAnnotations(run, exchange) {
    const rows=exchange.frames.slice().sort((a,b)=>a[0]-b[0]);
    const result=rows.map(()=>({})), model=typeof selectedModel==='function'?selectedModel(run):'';
    const l=lang(), fa=l==='fa', response=exchange.ans?.p || '';
    const tr=(a,b)=>fa?a:b;
    const ids=typeof _d402de164e==='function'?_d402de164e(run).map(x=>parseInt(x,16)):[];
    const record=exchange.p.slice(2,6);
    const title=record==='FD3F' ? tr('وضعیت ورودی‌های BCM','BCM input status') : ({F080:tr('ناحیه شناسایی نرم‌افزار','Authentication zone'),FDC0:tr('پیکربندی پایان خط','End-of-line configuration'),F190:'VIN',F18B:tr('تاریخ تولید','Manufacturing date')})[record] || tr('رکورد داده','Data record');
    const dataInfo=offset=>{
      const group=window.CANDiagGroups?.lookup(model,exchange.p,response,offset,l);
      if(group) return group;
      if(model==='BCMi' && exchange.p==='22FD3F') {
        const table=[...rootTable.querySelectorAll('.exchange-response .detail table tbody tr, .exchange-response .payloadcard table tbody tr')];
        const row=table.find(r=>r.cells.length===4 && r.cells[0].textContent.trim()===String(offset));
        if(row && row.cells[1].textContent.trim()!=='—' && row.cells[2].textContent.trim().toUpperCase()===response.slice(6+offset*2,8+offset*2))
          return `${tr('ورودی','Input')} ${offset}: ${row.cells[1].textContent.trim()} · ${row.cells[3].textContent.trim()}\nBCMi DiagSpec A13 · ${tr('جدول ۴۳، صفحات PDF ۴۹ تا ۵۳','Table 43, PDF pages 49–53')}`;
      }
      return `${title} · ${tr('بایت رکورد','Data-record byte')} ${offset}\n${tr('تعریف تأییدشده‌ای برای این موقعیت در دسترس نیست.','No verified definition for this position is available.')}`;
    };
    let rootTable=null;
    function mapMessage(message, id, start, end, isResponse) {
      if(!message || !Number.isFinite(start) || !Number.isFinite(end)) return;
      const candidates=rows.map((r,i)=>({r,i})).filter(({r})=>r[1]===id && r[0]>=start && r[0]<=end);
      if(!candidates.length || candidates[0].r[0]!==start || candidates[candidates.length-1].r[0]!==end) return;
      let built='', refs=[], expected=0, seq=1, first=true;
      for(const {r,i} of candidates) {
        const bytes=r[2].match(/../g)||[], pci=parseInt(bytes[0],16), type=pci>>4;
        if(first) {
          if(type===0) { expected=pci&15; if(!expected) return; refs.push({i,j:0,kind:'sf',length:expected}); for(let j=1;j<bytes.length&&built.length/2<expected;j++){refs.push({i,j,offset:built.length/2});built+=bytes[j];} }
          else if(type===1 && bytes.length>=3) { expected=((pci&15)<<8)|parseInt(bytes[1],16); if(expected<=7) return; refs.push({i,j:0,kind:'ff',length:expected},{i,j:1,kind:'ff',length:expected}); for(let j=2;j<bytes.length&&built.length/2<expected;j++){refs.push({i,j,offset:built.length/2});built+=bytes[j];} }
          else return;
          first=false;
        } else { if(type!==2 || (pci&15)!==seq) return; seq=(seq+1)%16; refs.push({i,j:0,kind:'cf',sequence:pci&15}); for(let j=1;j<bytes.length&&built.length/2<expected;j++){refs.push({i,j,offset:built.length/2});built+=bytes[j];} }
      }
      if(built!==message || built.length/2!==expected) return;
      // Flow-control travels in the opposite direction within this confirmed transfer.
      rows.forEach((r,i) => {
        const bytes=r[2].match(/../g)||[], pci=parseInt(bytes[0],16);
        if(r[1]===id || !ids.includes(r[1]) || r[0]<start || r[0]>end || (pci>>4)!==3 || bytes.length<3) return;
        const state=(pci&15), states=fa?['ادامه ارسال','انتظار','سرریز']:['continue sending','wait','overflow'];
        result[i][0]=tr('کنترل جریان ISO-TP: ','ISO-TP flow control: ')+(states[state] || tr('وضعیت رزرو','reserved status'));
        result[i][1]=tr('اندازه بلوک: ','Block size: ')+parseInt(bytes[1],16)+tr(' فریم (۰ یعنی بدون محدودیت بلوک).',' frames (0 means no block limit).');
        result[i][2]=tr('حداقل فاصله بین فریم‌ها (STmin)، مقدار خام: ','Minimum separation time (STmin), raw value: ')+bytes[2];
        for(let j=3;j<bytes.length;j++) result[i][j]=tr('بایت پرکننده فریم کنترل جریان.','Flow-control padding byte.');
      });
      for(const ref of refs) {
        let explanation='';
        if(ref.kind==='sf') explanation=tr(`سرآیند انتقال ISO-TP: فریم تکی؛ طول پیام ${ref.length} بایت.`,`ISO-TP single-frame header; message length ${ref.length} bytes.`);
        else if(ref.kind==='ff') explanation=tr(`سرآیند ISO-TP: فریم اول؛ طول کل پیام ${ref.length} بایت.`,`ISO-TP first-frame header; total message length ${ref.length} bytes.`);
        else if(ref.kind==='cf') explanation=tr(`سرآیند ISO-TP: فریم ادامه؛ شماره ترتیب ${ref.sequence}.`,`ISO-TP consecutive-frame header; sequence ${ref.sequence}.`);
        else if(exchange.p.startsWith('10') && isResponse && sessionInfo(model,exchange.p,response,ref.offset,l)) explanation=sessionInfo(model,exchange.p,response,ref.offset,l);
        else if(exchange.p.startsWith('10') && !isResponse && ref.offset===0) explanation=tr('10: درخواست کنترل نشست دیاگ.','10: Diagnostic Session Control request.');
        else if(exchange.p.startsWith('10') && !isResponse && ref.offset===1) {
          const sub=message.slice(2,4), session=sessionInfo(model,exchange.p,'50'+(parseInt(sub,16)&127).toString(16).toUpperCase().padStart(2,'0'),1,l);
          explanation=session ? tr('نشست درخواستی: ','Requested session: ')+session : tr('شماره نشست درخواستی: ','Requested session number: ')+sub;
          if(parseInt(sub,16)&128) explanation+=' · '+tr('بیت حذف پاسخ مثبت فعال است.','Suppress-positive-response bit is set.');
        }
        else if(exchange.p.startsWith('22') && (!isResponse || response.startsWith('62'+record)) && ref.offset===0) explanation=isResponse ? tr('62: پاسخ مثبت به خواندن داده با شناسه (UDS 22).','62: positive response to Read Data by Identifier (UDS 22).') : tr('22: درخواست خواندن داده با شناسه.','22: Read Data by Identifier request.');
        else if(exchange.p.startsWith('22') && (!isResponse || response.startsWith('62'+record)) && (ref.offset===1 || ref.offset===2)) explanation=tr(`شناسه مشترک دو بایتی ${record}: ${title}.`,`Two-byte identifier ${record}: ${title}.`);
        else if(exchange.p.startsWith('22') && isResponse && response.startsWith('62'+record)) explanation=dataInfo(ref.offset-3);
        else if(ref.offset===0) { const section=rootTable.querySelector(isResponse?'.exchange-response':'.exchange-message:not(.exchange-response)'); const part=section?.querySelector('.bytepart'); explanation=part ? [part.querySelector('b')?.textContent,part.querySelector('.byteval')?.textContent,part.querySelector(':scope > span')?.textContent].filter(Boolean).join(' · ') : tr('کد سرویس','Service code')+': '+message.slice(0,2); }
        else explanation=tr('پارامتر پیام؛ تفسیر مستندی در دسترس نیست.','Message parameter; no verified interpretation available.');
        result[ref.i][ref.j]=explanation;
      }
      for(const {r,i} of candidates) { const bytes=r[2].match(/../g)||[]; for(let j=0;j<bytes.length;j++) if(!result[i][j]) result[i][j]=tr('بایت پرکننده خارج از طول پیام ISO-TP.','Padding byte outside the ISO-TP message length.'); }
    }
    return {apply(root) { rootTable=root; mapMessage(exchange.p,ids[0],exchange.start,exchange.end,false); if(response) mapMessage(response,ids[1],exchange.ans.start,exchange.ans.end,true); return result; }};
  }
  function rawFrames(root, t, run, exchange) {
    const annotations = run && exchange ? frameAnnotations(run, exchange).apply(root) : [];
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
    for (const [rowIndex, cell] of [...root.querySelectorAll('.frame-trace tbody tr td:last-child[data-bytes-prepared="true"]')].entries()) {
      cell.querySelectorAll(':scope > span').forEach((part, index) => {
        const hex = part.textContent;
        info(part, annotations[rowIndex]?.[index] || `${t.byte} ${index + 1}: ${hex} · ${t.unknown}`);
      });
    }
  }
  function getRun(id) { return typeof activeRuns === 'function' ? activeRuns().find(run => String(run.uid) === document.getElementById(id).value) : null; }
  function entries(run) { return run && typeof diagnosticExchanges === 'function' ? diagnosticExchanges(run).out : []; }
  function annotate(report, run, exchange) {
    if (!report || !run || !exchange || !report.querySelector('.validation')) return;
    const t = T[lang()], result = assess(run, exchange);
    rawFrames(report, t, run, exchange);
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
        let context = sessionInfo(model, exchange.p, exchange.ans?.p || '', number-1, lang()) || '';
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
