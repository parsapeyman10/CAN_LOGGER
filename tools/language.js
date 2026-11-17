/* Presentation-only translation. The parser and its Persian internal values stay untouched. */
(() => {
  const words = {
    'واحد مهندسی محصول':'Product Engineering', 'واحد مهندسی محصول -':'Product Engineering -', 'بررسی لاگ شبکه CAN':'CAN Log Explorer',
    'فایل‌ها و مدل قطعه':'1. Add files', 'مرور درخواست‌ها':'2. Explore requests', 'مقایسهٔ لاگ‌ها':'Compare files', 'فریم‌های CAN':'CAN messages', 'خطایاب':'Find problems',
    'خطایاب لاگ':'Find possible problems', 'فایل و کانال':'File and channel', 'لاگ‌های آزمون':'Your log files', 'افزودن لاگ':'📁 Choose log files',
    'مشاهدهٔ مقایسه':'⚖️ Compare two files', 'مرور درخواست‌های لاگ':'🔎 Explore requests', 'مراجع تشخیص و ترجمه':'Optional: device reference', 'افزودن DiagSpec':'📄 Add a reference file',
    'بازبینی تعریف قطعه':'Review device definition', 'ثبت این مرجع':'Save reference', 'ذخیرهٔ قواعد به JSON':'Download JSON', 'انصراف':'Cancel',
    'مرور درخواست‌به‌درخواست':'Explore requests, one at a time', 'رفتن به درخواست':'Go to request', 'شناسه‌های مورد بررسی (DID یا روتین)':'Filter by ID (optional)',
    'افزودن شناسه':'Add ID', 'درخواست قبلی':'← Previous', 'درخواست بعدی':'Next →', 'مقایسهٔ محتوای لاگ‌ها':'Compare two log files',
    'لاگ اول':'First file', 'لاگ دوم':'Second file', 'نوع بررسی':'What to compare', 'رخداد مشاهده‌شده':'Event', 'نمایش':'Show',
    'درخواست تستر و پاسخ قطعه':'Requests and replies', 'تغییر داده روی CAN':'Changes in CAN data', 'همهٔ ردیف‌ها':'All rows', 'فقط اختلاف بین لاگ‌ها':'Only differences between files', 'فقط تغییر نسبت به وقوع قبلی':'Only changes from the previous event', 'رفتن به رخداد':'Go to event',
    'شناسه‌های CAN (هگز)':'CAN IDs (hexadecimal)', 'صفحهٔ قبل':'← Previous page', 'صفحهٔ بعد':'Next page →', 'داخلی143':'Extension 143',
    'برای شروع یک فایل وارد کنید.':'Choose a log file to get started.', 'ابتدا یک لاگ اضافه و فعال کنید.':'First, add and enable a log file.', 'ابتدا در بخش فایل‌ها یک لاگ اضافه و فعال کنید.':'First, add and enable a log file in Add files.',
    'ابتدا مدل قطعه را در بخش فایل‌ها انتخاب کنید.':'First, choose the device model in Add files.', 'برای مقایسه، دو فایل لاگ متفاوت اضافه و فعال کنید.':'To compare, add and enable two different log files.',
    'برای حذف، شناسه را بزنید.':'Select an ID to remove it.', 'همهٔ درخواست‌ها نمایش داده می‌شوند.':'Showing all requests.', 'همهٔ تبادل‌های ثبت‌شده':'All recorded exchanges',
    'هیچ فریم کلاسیک خوانده نشد':'No classic CAN messages were found.', 'خطای خواندن فایل':'Could not read the file', 'قالب BUSMASTER CAN هگز شناسایی نشد':'This is not a recognized hexadecimal BUSMASTER CAN log.',
    'رخدادی مطابق فیلتر وجود ندارد.':'No events match this filter.', 'برای این شناسه‌ها در فایل و کانال انتخابی فریمی ثبت نشده است.':'No messages with these IDs were found in this file and channel.',
    'شناسه‌های CAN مورد بررسی را اضافه کنید.':'Add the CAN IDs you want to inspect.', 'شناسهٔ CAN نامعتبر است.':'That CAN ID is not valid.', 'شناسهٔ هگز بین 0 و 1FFFFFFF وارد کنید.':'Enter a hexadecimal ID between 0 and 1FFFFFFF.',
    'هر شناسه باید چهار رقم هگز داشته باشد، مانند FDC0. چند شناسه را با ویرگول جدا کنید.':'Each ID needs four hexadecimal digits, like FDC0. Separate multiple IDs with commas.',
    'داده یکسان است':'Data is the same', 'محتوا متفاوت است':'Data is different', 'محتوای یکسان':'Same data', 'پاسخ':'Reply', 'درخواست':'Request', 'قطعه':'Device', 'تستر':'Tester',
    'بدون پاسخ نهایی':'No final reply', 'پاسخ مثبت':'Positive reply', 'پاسخ نهایی ثبت نشده':'No final reply recorded', 'پاسخ متناظر پیدا نشد':'No matching reply found', 'مغایر':'Does not match', 'مطابق':'Matches', 'فعال':'Enabled', 'غیرفعال':'Disabled',
    'مدل قطعه':'Device model', 'حذف از بررسی':'Remove', 'چه اتفاقی افتاد؟':'What happened?', 'تستر چه خواست؟':'What did the tester ask?', 'قطعه چه گفت؟':'What did the device say?', 'صحه‌سنجی پاسخ':'Reply check', 'درخواست تستر به قطعه':'Tester request to device', 'پاسخ قطعه به تستر':'Device reply to tester', 'شناسه‌های تستر و قطعه':'Tester and device IDs', 'بایت‌های متفاوت':'Different bytes', 'درخواست:':'Request:', 'پاسخ:':'Reply:', 'موقعیت':'Position', 'فیلد':'Field', 'تفسیر':'Meaning', 'کنترل':'Check', 'انتظار':'Expected', 'ثبت‌شده':'Recorded', 'نتیجه':'Result', 'مرجع:':'Reference:', 'بایت':'Byte', 'فریم':'Message', 'داده':'Data', 'نامشخص':'Unknown', 'موفق':'Passed', 'ناموفق':'Failed', 'ندارد':'None', 'عمومی':'General', 'UDS عمومی':'Generic UDS',
    'مرجع ثبت شد؛ آن را از فهرست مدل قطعه انتخاب کنید.':'Reference saved. Choose it from the device model list.', 'قواعد را مرور کنید.':'Please review the rules.', 'خواندن سند انجام نشد:':'Could not read the reference:', 'ساختار قواعد نامعتبر است.':'The rules have an invalid structure.',
    'برای ترجمه، مدل این قطعه را در بخش فایل‌ها انتخاب کنید.':'To interpret this, choose the device model in Add files.',
    'برای جفت شناسهٔ انتخابی، درخواست کامل ثبت نشده است.':'No complete request was recorded for these IDs.',
    'برای شناسه‌های انتخابی در این فایل و کانال تبادلی ثبت نشده است.':'No exchanges for these IDs were found in this file and channel.',
    'انتخاب هوشمند مرجع':'Automatic reference selection', 'خواندن رکورد داده':'Read data record', 'انتخاب نشست دیاگ':'Select diagnostic session', 'نشست تأمین‌کننده':'Supplier session', 'وضعیت ورودی‌های واحد کنترل بدنه':'Body control inputs', 'اطلاعات شناسایی قطعه و نرم‌افزار':'Device and software identification', 'نوشتن رکورد داده':'Write data record', 'پارامترهای پایان خط تولید':'End-of-line settings', 'درخواست ریست':'Reset request', 'کنترل ورودی یا خروجی':'Control input or output', 'اجرای دستور روتین':'Run routine', 'نسخهٔ بوت‌لودر':'Bootloader version', 'کارکرد ثبت‌شدهٔ خودرو':'Recorded vehicle mileage', 'شمارهٔ سریال دستگاه':'Device serial number', 'درخواست دسترسی امنیتی':'Security access request', 'درخواست شروع انتقال':'Start transfer request', 'انتقال بلوک داده':'Transfer data block', 'پایان انتقال':'End transfer', 'شمارهٔ شناسایی خودرو (VIN)':'Vehicle identification number (VIN)',
    'پاسخ نهایی در بازهٔ ثبت دیده نشد':'No final reply was seen in the recording', 'فیلد طول بیشینهٔ بلوک':'Maximum block length', 'قالب طول و مقدار':'Length and value format', 'ناقص یا ناسازگار':'Incomplete or inconsistent'
  };
  Object.assign(words, {
    'تطابق در فیلدهای قابل بررسی':'The fields checked below match. Review the other checks for additional findings.', 'کد سرویس پاسخ مثبت':'Positive reply service code', 'شناسهٔ داده یا خروجی':'Data or output ID', 'صحه‌سنجی با مشخصات تستر BCMi · EP6':'Check against BCMi tester specification · EP6', 'فریم‌های ثبت‌شدهٔ تستر و قطعه':'Recorded tester and device messages', 'هگز':'Hex', 'در ستون آریسان کاربرد ندارد':'Not used for Arisan', 'در ستون آریسان کاربردی تعریف نشده است':'No use defined for Arisan', 'قفل':'Locked',
    'سوئیچ احتراق IGN':'Ignition switch (IGN)', 'سوئیچ تجهیزات جانبی ACC':'Accessory switch (ACC)', 'کلید پدال ترمز':'Brake pedal switch', 'کلید مه‌شکن جلو':'Front fog light switch', 'کلید مه‌شکن عقب':'Rear fog light switch', 'کلید چراغ موقعیت':'Position light switch', 'کلید دنده‌عقب':'Reverse gear switch', 'کلید نور پایین':'Low beam switch', 'کلید نور بالا':'High beam switch', 'کلید فلاشر':'Hazard light switch', 'کلید راهنمای چپ':'Left turn signal switch', 'کلید راهنمای راست':'Right turn signal switch', 'کلید بوق':'Horn switch', 'کلید فشار روغن موتور':'Engine oil pressure switch', 'کلید کمربند جلویی':'Front seat belt switch', 'کلید کمربند جلو':'Front seat belt switch', 'کلید در جلو چپ':'Front left door switch', 'کلید در جلو راست':'Front right door switch', 'کلید قفل مرکزی':'Central lock switch', 'کلید شیشه‌شوی جلو':'Front washer switch', 'کلید کولر':'Air conditioning switch', 'کلید کاپوت':'Hood switch', 'کلید سطح مایع ترمز':'Brake fluid level switch', 'کلید ترمز دستی':'Parking brake switch', 'کلید لنت ترمز':'Brake pad switch',
    'برف‌پاک‌کن جلو، دور کند':'Front wiper, low speed', 'برف‌پاک‌کن جلو، متناوب':'Front wiper, intermittent', 'برف‌پاک‌کن جلو، دور تند':'Front wiper, high speed', 'موقعیت صفر برف‌پاک‌کن جلو':'Front wiper parked position', 'قفل در جلو چپ':'Front left door lock', 'قفل در جلو راست':'Front right door lock', 'فرمان آزادسازی قفل در تصادف':'Crash unlock command', 'بالابر شیشه جلو چپ':'Front left window up', 'پایین‌بر شیشه جلو چپ':'Front left window down', 'بالابر شیشه جلو راست':'Front right window up', 'پایین‌بر شیشه جلو راست':'Front right window down',
    'بار راهنمای راست':'Right turn signal load', 'بار راهنمای چپ':'Left turn signal load', 'بار چراغ ترمز':'Brake light load', 'بار چراغ موقعیت':'Position light load', 'بار مه‌شکن عقب':'Rear fog light load', 'بار VECO':'VECO load', 'ولتاژ دینام':'Alternator voltage', 'ولتاژ باتری':'Battery voltage', 'تعداد ریموت‌های آموخته‌شده':'Number of paired remotes',
    'شناسهٔ نرم‌افزار لاگ با مرجع تطابق کامل ندارد. معنی فیلدها طبق مدلی است که انتخاب کرده‌اید.':'The log’s software ID does not fully match the reference. Fields are interpreted using the selected model.', 'موقعیت‌ها از صفر در خود رکورد محاسبه شده‌اند. مقادیر، گزارش دستگاه در همان لحظه‌اند.':'Positions start at zero in the record. Values are what the device reported at that moment.', 'رکورد هدف را انتخاب می‌کند. تفسیر اختصاصی فیلدهای نگاشت‌شده در بخش مرجع دستگاه نمایش داده می‌شود.':'Selects the target record. Mapped fields are interpreted using the device reference.', 'ثانیه‌ها از اولین فریم دادهٔ این کانال هستند. شمارهٔ بایت‌ها از ۱ در پیام دیاگ شروع می‌شود؛ سرآیند انتقال و بایت‌های پُرکننده حذف شده‌اند.':'Times are measured from the first message in this channel. Diagnostic message byte numbers start at 1; transport headers and padding are excluded.',
    'بایت ۱ · نوع پیام':'Byte 1 · message type', 'بایت‌های ۲ و ۳ · شناسهٔ رکورد':'Bytes 2 and 3 · record ID', 'بدون شاهد پاسخ':'No reply evidence', 'پاسخ منفی':'Negative reply', 'دادهٔ انتخابی':'Selected data', 'حالت بیتی انتخابی':'Selected bit state', 'داده یکسان است':'Data is the same', 'ساختار پاسخ منفی نامعتبر است':'Invalid negative reply format', 'طول فریم CAN نامعتبر است':'Invalid CAN message length', 'رکورد BLF ناقص است':'Incomplete BLF record', 'کانتینر BLF ناقص است':'Incomplete BLF container', 'فشرده‌سازی ناشناخته':'Unknown compression', 'طول کانتینر نادرست است':'Incorrect container length'
  });
  /* DIAGNOSTIC_TRANSLATIONS */
  const originals = new WeakMap();
  const originalAttributes = new WeakMap();
  let language = 'en';
  try { language = localStorage.getItem('can-explorer-language') === 'fa' ? 'fa' : 'en'; } catch (_) {}
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'language-switch';
  const guide = document.createElement('aside'); guide.className = 'easy-guide';
  guide.innerHTML = '<strong>👋 Start with a log file</strong><ol><li>Choose one or more <b>.log</b> (BUSMASTER hex) or <b>.blf</b> files below.</li><li>Keep <b>Automatic reference selection</b>, or choose the device model if you know it. Each channel appears separately.</li><li>Select <b>Explore requests</b> to review the messages. To compare, add two different files and choose <b>Compare files</b>.</li></ol><p><b>What is a log?</b> A recording of messages from a vehicle. A device reference file is optional and is used to interpret supported data.</p><p class="translation-note">Results show recorded evidence, not a guarantee that a device is healthy. Some less common or custom diagnostic descriptions may still appear in Persian.</p>';
  document.querySelector('#setup').prepend(guide);
  const hints = [];
  for (const [section, message] of Object.entries({
    walk: 'Choose a file, then use Previous and Next to move through its requests. The ID filter is optional.',
    compare: 'Add two files first. Pick one on each side to see what is the same and what is different.',
    canFrames: 'Choose a file. Type a CAN ID, such as 752, and choose Add ID to see its messages.',
    faults: 'Choose a file to see items that may need a closer look. A warning is not always a confirmed fault.'
  })) {
    const hint = document.createElement('p'); hint.className = 'easy-hint'; hint.textContent = '💡 ' + message;
    document.querySelector('#' + section + ' h2').after(hint); hints.push(hint);
  }
  document.querySelector('.masthead').append(button);
  const englishDigits = s => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/٬/g, ',');
  // These rules are restricted to app-generated diagnostic output, not user file names,
  // editable rules, or inputs. Keep CAN bytes and diagnostic identifiers unchanged.
  function translateGenerated(text) {
    let s = text;
    const phrase = value => words[value] || value;
    s = s.replace(/تستر درخواست «(.+?)» را فرستاد\. (.+)/g, (_, action, result) => 'The tester sent a request to “' + phrase(action) + '”. ' + (words[result] || result));
    s = s.replace(/موضوع این تبادل: (.+?)\. (پاسخ مثبت|بدون پاسخ نهایی)\./g, (_, topic, status) => 'Exchange topic: ' + phrase(topic) + '. ' + phrase(status) + '.');
    s = s.replace(/قطعه پاسخ مثبت ([0-9A-F]+) را فرستاد\. پذیرش نوشتن رکورد را اعلام کرد\. تأیید مقدار ذخیره‌شده به خواندن مجدد نیاز دارد\./g, 'The device sent positive reply $1 and accepted the record write. Read it again to verify the stored value.');
    s = s.replace(/قطعه پاسخ مثبت ([0-9A-F]+) را فرستاد\. وضعیت درخواستی ([0-9A-F]+) و وضعیت گزارش‌شده ([0-9A-F]+) است\. تأیید عملکرد فیزیکی عملگر به بازخورد مستقل نیاز دارد\./g, 'The device sent positive reply $1. Requested state: $2; reported state: $3. Independent feedback is needed to verify physical actuator operation.');
    s = s.replace(/قطعه پاسخ مثبت ([0-9A-F]+) را فرستاد\./g, 'The device sent positive reply $1.');
    s = s.replace(/قطعه درخواست را رد کرد\. (.+?) \(([0-9A-F]+)\)\./g, (_, reason, code) => 'The device rejected the request. ' + phrase(reason) + ' (' + code + ').');
    s = s.replace(/این ([۰-۹٬]+) بایت همان داده‌ای است که دستگاه برگردانده است\. معنی هر فیلد به تعریف این رکورد نیاز دارد\. مقدار 00 به‌تنهایی وضعیت خاموش یا سالم را ثابت نمی‌کند\./g, (_, n) => 'These ' + englishDigits(n) + ' bytes are the data returned by the device. Interpreting each field requires its record definition. A value of 00 alone does not prove an off or healthy state.');
    s = s.replace(/آخرین نشست تأییدشده ([0-9A-F]+) است\. EP6 نشست 03 را برای این آزمون تعیین کرده است\./g, 'The last confirmed session is $1. EP6 specifies session 03 for this test.');
    s = s.replace(/را بخواند\. دستگاه پاسخ مثبت داد و ([۰-۹٬]+) بایت از آن رکورد را برگرداند\./g, (_, n) => 'to be read. The device replied positively and returned ' + englishDigits(n) + ' bytes from that record.');
    s = s.replace(/را بخواند\. پاسخ نهایی متناظری در ثبت دیده نشد\./g, 'to be read. No matching final reply was seen in the recording.');
    s = s.replace(/تستر از دستگاه خواست محتوای رکورد/g, 'The tester asked the device for record');
    s = s.replace(/جفت درخواست\/پاسخ ([0-9A-F]+) \/ ([0-9A-F]+) با پاسخ مثبت ثبت شد\./g, 'Request/reply pair $1 / $2 was recorded with a positive reply.');
    s = s.replace(/شناسهٔ نرم‌افزار ([0-9A-F]+) در F080 با شناسه‌های فهرست‌شده برای این جفت آدرس در دو مرجع تطابق کامل ندارد\./g, 'Software ID $1 in F080 does not fully match the IDs listed for this address pair in the two references.');
    s = s.replace(/شناسهٔ ([0-9A-F]+) در جدول خروجی EP6 یافت نشد\./g, 'ID $1 was not found in the EP6 output table.');
    s = s.replace(/پاسخ قطعه دقیقاً با فرمان (خاموش‌کردن|روشن‌کردن) مطابقت دارد\./g, (_, cmd) => 'The device reply exactly matches the ' + phrase(cmd).toLowerCase() + ' command.');
    s = s.replace(/برای این عملیات[،,] عنوان اختصاصی در نگاشت فعال یافت نشد\. پاسخ منفی ([0-9A-F ]+)\./g, 'No specific title for this operation was found in the active mapping. Negative reply $1.');
    s = s.replace(/سنسورهای عقب: (تعریف نشده در پیکربندی|تعریف شده در پیکربندی)/g, (_, state) => 'Rear sensors: ' + phrase(state));
    s = s.replace(/فرمان برقی: (تعریف نشده در پیکربندی|تعریف شده در پیکربندی)/g, (_, state) => 'Power steering: ' + phrase(state));
    s = s.replace(/خروجی آریسان:/g, 'Arisan output:').replace(/\(ردیف (\d+)\)/g, '(row $1)')
      .replace(/مقدار تنظیمی مصرف سوخت در تیپ‌های مشمول:/g, 'Fuel consumption setting for applicable variants:')
      .replace(/لیتر در صد کیلومتر/g, 'L/100 km').replace(/نوع کنترل /g, 'Control type ')
      .replace(/پاسخ منفی · NRC /g, 'Negative reply · NRC ')
      .replace(/پیام نامنطبق روی شناسهٔ پاسخ · انتظار /g, 'Non-matching message on reply ID · expected ');
    s = s.replace(/شناسهٔ (?=[0-9A-F])/g, 'ID ').replace(/دادهٔ فرمان (?=[0-9A-F])/g, 'Command data ');
    s = s.replace(/بیت‌های ([0-9۰-۹]+) تا ([0-9۰-۹]+)/g, (_, a, b) => 'bits ' + englishDigits(a) + ' to ' + englishDigits(b));
    s = s.replace(/بیت ([0-9۰-۹]+)/g, (_, n) => 'bit ' + englishDigits(n));
    s = s.replace(/از بایت ([۰-۹0-9]+)/g, (_, n) => 'From byte ' + englishDigits(n));
    s = s.replace(/بایت ([۰-۹0-9]+) رکورد:/g, (_, n) => 'Record byte ' + englishDigits(n) + ':');
    s = s.replace(/بایت ([۰-۹0-9]+) ·/g, (_, n) => 'Byte ' + englishDigits(n) + ' ·');
    s = s.replace(/بایت‌های ۶ تا ۹/g, 'Bytes 6 to 9');
    s = s.replace(/مرجع دستی:/g, 'Manual reference:').replace(/مرجع:/g, 'Reference:').replace(/جدول ۴۳، صفحات ۴۲–۴۶/g, 'table 43, pages 42–46').replace(/جدول ۴۴/g, 'table 44').replace(/شماره‌گذاری بایت داده از صفر/g, 'data byte numbering starts at zero').replace(/تعریف نشست فعال/g, 'active session definition').replace(/بخش وضعیت ورودی‌ها، از صفحهٔ ۲۹/g, 'input status section, from page 29').replace(/صفحهٔ PDF/g, 'PDF page').replace(/، /g, ', ');
    s = s.replace(/فریم ([۰-۹٬]+) تا ([۰-۹٬]+) از ([۰-۹٬]+)/g, (_, a, b, c) => 'Messages ' + englishDigits(a) + '–' + englishDigits(b) + ' of ' + englishDigits(c));
    s = s.replace(/^([۰-۹٬]+) از ([۰-۹٬]+)$/, (_, a, b) => englishDigits(a) + ' of ' + englishDigits(b));
    s = s.replace(/^([۰-۹٬]+) رخداد$/, (_, n) => englishDigits(n) + ' events');
    return s.split(' / ').map(side => side.split(' · ').map(part => {
      if (words[part]) return words[part];
      const labeled = part.match(/^(.*?) (\[[0-9A-F ]+\])$/);
      if (labeled && words[labeled[1]]) return words[labeled[1]] + ' ' + labeled[2];
      const read = part.match(/^(خواندن|نوشتن) (.+)$/);
      if (read && words[read[2]]) return (read[1] === 'خواندن' ? 'Read ' : 'Write ') + words[read[2]];
      return part;
    }).join(' · ')).join(' / ');
  }
  function translate(text, parent) {
    const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (match && Object.prototype.hasOwnProperty.call(words, match[2])) return match[1] + words[match[2]] + match[3];
    // Only translate structured, app-generated text in these views. Never alter file names,
    // user data, input values, or the underlying diagnostic models.
    if (parent.closest('#walkIndex')) {
      return englishDigits(translateGenerated(text));
    }
    if (parent.closest('#faultList')) {
      return text.replace(/(\d+) درخواست نیازمند بررسی از (\d+) درخواست بازسازی‌شده\./g, '$1 requests need review out of $2 reconstructed requests.')
        .replace(/درخواست (\d+)/g, 'Request $1')
        .replace(/EP6 · طول دادهٔ FD3F برابر (\d+) بایت است\. انتظار ۷۷ بایت\./g, 'EP6 · FD3F has $1 bytes; 77 bytes expected.')
        .replace(/پاسخ نهایی در بازهٔ ثبت دیده نشد/g, 'No final reply was seen in the recording')
        .replace(/پاسخ منفی · NRC/g, 'Negative reply · NRC')
        .replace(/فیلد طول بیشینهٔ بلوک · انتظار قالب طول و مقدار، ثبت‌شده ناقص یا ناسازگار/g, 'Maximum block length · expected length and value format; recorded incomplete or inconsistent');
    }
    if (parent.closest('#walkReport, #walkCount, #pairCards, #pairDiff')) {
      const digits = s => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/٬/g, ',');
      let result = (match ? match[2] : text)
        .replace(/^درخواست ([۰-۹]+) از ([۰-۹]+)$/, (_, n, total) => 'Request ' + digits(n) + ' of ' + digits(total))
        .replace(/^مرجع خودکار: (.+)$/, 'Automatic reference: $1')
        .replace(/^مغایرت طول داده: (\d+) بایت دریافت شد\. مرجع ۷۷ بایت می‌خواهد\.$/, 'Data length mismatch: received $1 bytes; the reference requires 77 bytes.')
        .replace(/^قطعه پاسخ مثبت (\S+) را فرستاد\. برای رکورد (\S+) تعداد ([۰-۹٬]+) بایت برگرداند\.$/, (_, code, id, n) => 'The device sent positive reply ' + code + '. It returned ' + digits(n) + ' bytes for record ' + id + '.')
        .replace(/^تستر از دستگاه خواست محتوای رکورد (\S+) را بخواند\. دستگاه پاسخ مثبت داد و ([۰-۹٬]+) بایت از آن رکورد را برگرداند\.$/, (_, id, n) => 'The tester asked the device to read record ' + id + '. The device replied positively and returned ' + digits(n) + ' bytes.')
        .replace(/^دستگاه مشخص می‌کند این پاسخ دربارهٔ رکورد (\S+) است\.$/, 'The device says this reply is about record $1.')
        .replace(/^کد پاسخ مثبت به «(.+)»\.$/, (_, action) => 'Positive reply code for “' + (words[action] || action) + '”.')
        .replace(/^به دستگاه می‌گوید چه کاری از آن خواسته شده است: (.+)\.$/, (_, action) => 'Tells the device what to do: ' + (words[action] || action) + '.')
        .replace(/^ورودی‌ها و اندازه‌گیری‌ها · ([۰-۹٬]+) بایت$/, (_, n) => 'Inputs and measurements · ' + digits(n) + ' bytes')
        .replace(/^دیدن ([۰-۹٬]+) بایت به‌ترتیب$/, (_, n) => 'Show ' + digits(n) + ' bytes in order')
        .replace(/^([۰-۹٬]+) میلی‌آمپر$/, (_, n) => digits(n) + ' mA')
        .replace(/^([۰-۹٬]+) ریموت$/, (_, n) => digits(n) + ' remotes');
      // Replace whole labeled segments while preserving technical identifiers.
      if (/ · /.test(result)) result = result.split(' · ').map(part => {
        if (words[part]) return words[part];
        const labeled = part.match(/^(.*?) (\[[0-9A-F ]+\])$/);
        return labeled && words[labeled[1]] ? words[labeled[1]] + ' ' + labeled[2] : part;
      }).join(' · ');
      result = translateGenerated(result);
      return match ? match[1] + result + match[3] : result;
    }
    if (parent.closest('#cmpIndex, #page, #filter, #stats, #framesCount, #framesResult')) return englishDigits(translateGenerated(text));
    if (parent.id === 'specmsg') {
      return text.replace(/^خواندن صفحهٔ ([۰-۹٬]+) از ([۰-۹٬]+)$/, (_, a, b) => 'Reading page ' + englishDigits(a) + ' of ' + englishDigits(b))
        .replace(/^([۰-۹٬]+) عنوان رکورد و ([۰-۹٬]+) نشست استخراج شد\. جدول‌های اسکن‌شده و چیدمان‌های بیتی نیاز به تعریف دستی دارند\. فیلد چندبایتی JSON به ترتیب بایت بزرگ‌انتها خوانده می‌شود\.$/, (_, records, sessions) => englishDigits(records) + ' record titles and ' + englishDigits(sessions) + ' sessions extracted. Scanned tables and bit layouts need manual definitions. Multi-byte JSON fields are read in big-endian order.')
        .replace(/^خواندن سند انجام نشد: /, 'Could not read the reference: ')
        .replace(/^شناسهٔ تعریف نامعتبر: /, 'Invalid definition ID: ')
        .replace(/^تعریف فیلد نامعتبر: /, 'Invalid field definition: ')
        .replace(/^عنوان معتبر برای (.+) لازم است$/, 'A valid title is required for $1');
    }
    if (parent.id === 'uploads') return text.split(' | ').map(item => {
      const separator = item.lastIndexOf(' · ');
      if (separator >= 0) {
        const message = item.slice(separator + 3);
        return item.slice(0, separator + 3) + (words[message] || message);
      }
      return item.replace(/ اضافه شد$/, ' added');
    }).join(' | ');
    if (parent.closest('#filelist') && !parent.closest('option')) return text
      .replace(/([۰-۹٬]+) فریم · (\d+) ردیف داده کنار گذاشته شد/, (_, count, skipped) => count.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/٬/g, ',') + ' messages · ' + skipped + ' data rows skipped')
      .replace(/([۰-۹٬]+) فریم · (\d+) رکورد خارج از فریم دادهٔ کلاسیک/, (_, count, skipped) => englishDigits(count) + ' messages · ' + skipped + ' records outside classic CAN data frames')
      .replace(/مرجع خودکار:/g, 'Automatic reference:').replace(/مرجع دستی:/g, 'Manual reference:').replace(/شواهد تشخیص:/g, 'Detection evidence:')
      .replace(/جفت درخواست\/پاسخ ([0-9A-F]+) \/ ([0-9A-F]+) با پاسخ مثبت ثبت شد\./g, 'Request/reply pair $1 / $2 was recorded with a positive reply.')
      .replace(/شناسهٔ نرم‌افزار ([0-9A-F]+) در F080 با شناسه‌های فهرست‌شده برای این جفت آدرس در دو مرجع تطابق کامل ندارد\./g, 'Software ID $1 in F080 does not fully match the IDs listed for this address pair in the two references.');
    return text;
  }
  function visit(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || node.parentElement.closest('script,style,textarea,.easy-guide,.language-switch')) return;
      const current = node.data;
      const saved = originals.get(node);
      // A fresh app update replaces the previous text, even on an existing node.
      if (!saved || (current !== saved.fa && current !== saved.en)) originals.set(node, {fa: current, en: translate(current, node.parentElement)});
      const entry = originals.get(node), next = entry[language];
      if (current !== next) {
        // Options without an explicit value otherwise change their value when translated.
        const p = node.parentElement;
        if (p.tagName === 'OPTION' && !p.hasAttribute('value')) p.value = p.textContent;
        node.data = next;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.matches('script,style,.easy-guide,.language-switch')) {
      for (const attr of ['aria-label', 'alt', 'title']) {
        if (!node.hasAttribute(attr)) continue;
        const current = node.getAttribute(attr);
        const state = originalAttributes.get(node) || {};
        if (!state[attr] || (current !== state[attr].fa && current !== state[attr].en)) {
          let en = words[current] || current;
          if (attr === 'aria-label') en = en.replace(/^حذف شناسه (.+)$/, 'Remove ID $1').replace(/^حذف (.+)$/, 'Remove $1');
          state[attr] = {fa: current, en}; originalAttributes.set(node, state);
        }
        if (current !== state[attr][language]) node.setAttribute(attr, state[attr][language]);
      }
      if (!node.matches('textarea')) for (const child of node.childNodes) visit(child);
    }
  }
  function apply() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.title = language === 'fa' ? 'بررسی لاگ شبکه CAN · واحد مهندسی محصول' : 'CAN Log Explorer';
    button.textContent = language === 'en' ? '🌐 فارسی' : '🌐 English';
    button.setAttribute('aria-label', language === 'en' ? 'Switch to Persian' : 'تغییر زبان به انگلیسی');
    guide.hidden = language !== 'en';
    for (const hint of hints) hint.hidden = language !== 'en';
    visit(document.body);
  }
  button.addEventListener('click', () => {
    language = language === 'en' ? 'fa' : 'en';
    try { localStorage.setItem('can-explorer-language', language); } catch (_) {}
    apply();
  });
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') visit(record.target);
      else for (const node of record.addedNodes) visit(node);
    }
  }).observe(document.body, {subtree: true, childList: true, characterData: true});
  apply();
})();
