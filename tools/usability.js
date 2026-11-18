/* Workflow guidance only: no parser state, data or diagnostic verdicts are changed. */
(() => {
  const byId = id => document.getElementById(id);
  const sections = ['walk', 'compare', 'canFrames', 'faults'];
  const copy = {
    en: {
      empty: 'Start by adding and enabling a log file. Then come back to this page.',
      choose: 'Choose a log file',
      setupEmpty: 'Next: choose a log file. For comparison, you will need two different files.',
      setupReady: 'Next: explore requests, or add a second, different file to compare.',
      hint: {walk: 'Choose a file, then use Previous and Next to move through its requests. The ID filter is optional.', compare: 'Add two different files first. Pick one on each side to compare. A difference is not automatically a fault.', canFrames: 'Choose a file. Type a CAN ID, such as 752, and choose Add ID to see its messages.', faults: 'Choose a file to see items that may need a closer look. A warning is not always a confirmed fault.'},
      guideTitle: 'Start with a log file',
      guideSteps: ['Choose one or more .log (BUSMASTER hex) or .blf files below.', 'Keep Automatic reference selection, or choose the device model if you know it. Each channel appears separately.', 'Select Explore requests to review messages. To compare, add two different files and choose Compare files.'],
      guideExtra: 'A log is a recording of messages from a vehicle. A reference file is optional and helps interpret supported data. Results are evidence, not a guarantee that a device is healthy. Some uncommon or custom diagnostic descriptions may still appear in Persian.'
    },
    fa: {
      empty: 'ابتدا یک فایل لاگ اضافه و فعال کنید، سپس به این بخش برگردید.',
      choose: 'انتخاب فایل لاگ',
      setupEmpty: 'قدم بعدی: یک فایل لاگ انتخاب کنید. برای مقایسه به دو فایل متفاوت نیاز دارید.',
      setupReady: 'قدم بعدی: درخواست‌ها را مرور کنید، یا برای مقایسه یک فایل متفاوت دیگر اضافه کنید.',
      hint: {walk: 'فایل و کانال را انتخاب کنید؛ با دکمه‌های قبلی و بعدی بین درخواست‌ها حرکت کنید. فیلتر شناسه اختیاری است.', compare: 'ابتدا دو فایل متفاوت اضافه کنید و در هر طرف یکی را انتخاب کنید. هر اختلافی الزاماً خطا نیست.', canFrames: 'فایل را انتخاب کنید، یک شناسهٔ CAN مانند 752 وارد کنید و افزودن شناسه را بزنید.', faults: 'فایل را انتخاب کنید تا موارد نیازمند بررسی نمایش داده شوند. هشدار الزاماً به معنی خطای قطعی نیست.'},
      guideTitle: 'شروع با فایل لاگ',
      guideSteps: ['یک یا چند فایل .log با قالب BUSMASTER هگز یا فایل .blf انتخاب کنید.', 'انتخاب هوشمند مرجع را نگه دارید یا در صورت شناخت، مدل قطعه را انتخاب کنید. هر کانال جداگانه نمایش داده می‌شود.', 'برای دیدن پیام‌ها مرور درخواست‌ها را بزنید. برای مقایسه ابتدا دو فایل متفاوت اضافه کنید.'],
      guideExtra: 'لاگ، ثبت پیام‌های خودرو است. سند مرجع اختیاری است و به تفسیر داده‌های پشتیبانی‌شده کمک می‌کند. نتایج شاهد ثبت‌شده هستند، نه تضمین سلامت قطعه.'
    }
  };
  // Replace the English-only help with the same guidance in both languages.
  const guide = document.querySelector('.easy-guide');
  const hintNodes = Object.fromEntries(sections.map(id => [id, byId(id).querySelector('.easy-hint')]));
  const next = document.createElement('p');
  next.className = 'workflow-next'; next.setAttribute('role', 'status');
  byId('filelist').after(next);
  const emptyNodes = {};
  for (const id of sections) {
    const box = document.createElement('div'); box.className = 'workflow-empty'; box.hidden = true;
    const text = document.createElement('p');
    const button = document.createElement('button'); button.type = 'button';
    button.addEventListener('click', () => { document.querySelector('[data-tab="setup"]').click(); byId('logs').click(); });
    box.append(text, button);
    hintNodes[id].after(box); emptyNodes[id] = {box, text, button};
  }
  const bottomNavs = [];
  for (const [section, prevId, countId, nextId, anchor] of [
    ['walk', 'walkPrev', 'walkCount', 'walkNext', 'walkReport'],
    ['compare', 'prev', 'page', 'next', 'pairViewport']
  ]) {
    const nav = document.createElement('div'); nav.className = 'workflow-bottom-nav';
    const back = document.createElement('button'), count = document.createElement('span'), forward = document.createElement('button');
    back.type = forward.type = 'button'; count.setAttribute('aria-live', 'polite');
    for (const [button, id] of [[back, prevId], [forward, nextId]]) button.addEventListener('click', () => {
      byId(id).click();
      byId(section).querySelector('h2').scrollIntoView({block: 'start'});
    });
    nav.append(back, count, forward); byId(anchor).after(nav);
    bottomNavs.push({nav, back, count, forward, prevId, countId, nextId});
    for (const id of [prevId, countId, nextId]) new MutationObserver(schedule).observe(byId(id), {attributes: true, childList: true, characterData: true, subtree: true});
  }
  let scheduled = false;
  function update() {
    scheduled = false;
    const lang = document.documentElement.lang === 'fa' ? 'fa' : 'en', t = copy[lang];
    const active = !!document.querySelector('#filelist input[data-use]:checked');
    guide.hidden = false;
    const title = document.createElement('strong'); title.textContent = t.guideTitle;
    const list = document.createElement('ol');
    for (const step of t.guideSteps) { const li = document.createElement('li'); li.textContent = step; list.append(li); }
    const extra = document.createElement('p'); extra.textContent = t.guideExtra;
    // Do not rebuild help nodes if only the file list changed.
    if (guide.dataset.language !== lang) { guide.replaceChildren(title, list, extra); guide.dataset.language = lang; }
    next.textContent = active ? t.setupReady : t.setupEmpty;
    for (const item of bottomNavs) {
      item.back.textContent = byId(item.prevId).textContent;
      item.forward.textContent = byId(item.nextId).textContent;
      item.back.disabled = byId(item.prevId).disabled;
      item.forward.disabled = byId(item.nextId).disabled;
      item.count.textContent = byId(item.countId).textContent;
      item.nav.hidden = !active || !item.count.textContent.trim();
    }
    for (const id of sections) {
      const hint = hintNodes[id]; hint.hidden = false; hint.textContent = t.hint[id];
      const {box, text, button} = emptyNodes[id]; box.hidden = active; text.textContent = t.empty; button.textContent = t.choose;
    }
    document.querySelectorAll('#tabs [data-tab]').forEach(button => {
      if (button.getAttribute('aria-selected') === 'true') button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  new MutationObserver(schedule).observe(byId('filelist'), {childList: true, subtree: true});
  new MutationObserver(schedule).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  document.addEventListener('change', event => { if (event.target.matches('#filelist input[data-use]')) schedule(); });
  document.addEventListener('click', event => {
    const tab = event.target.closest('#tabs [data-tab]');
    if (tab || event.target.closest('#openWalk, #go')) {
      const id = tab ? tab.dataset.tab : event.target.closest('#openWalk') ? 'walk' : 'compare';
      // Focus the destination heading for keyboard and assistive-technology users.
      requestAnimationFrame(() => {
        const heading = byId(id).querySelector('h2');
        if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
        schedule();
      });
    }
  });
  update();
})();
