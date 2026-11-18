/* Verified reference groups, zero-based DataRecord offsets. No vehicle variant is inferred.
 * BCMi_DiagSpec_UDS_A13.pdf pages 44–49, 53–55 (PDF pages, not printed page numbers).
 * NBCM_Diagnostic_Specification_V06(1).pdf pages 25–29, 31–32.
 * SBCM_IKCO_Diagnostic_Specification_10.pdf pages 25–29.
 * Only built-in models and single-DID positive 0x22 responses are decoded here.
 */
(() => {
  const names = {
    en: {part:'IKCO part number', sw:'Software version (major + minor)', release:'Software release date (day, month, year)', db:'CAN/LS database version (major, minor, edition)', customer:'Software customer/supplier identifier', product:'Software product identifier', variant:'Software product variant', compat:'Software compatibility', mfgShort:'ECU manufacturing date (day, month, year)', download:'Download date (day, month, year)', tool:'Downloading tool signature', reference:'Software reference', serial:'ECU serial number', vin:'Vehicle identification number (VIN)', date:'Manufacturing date (day, month, year MSB + LSB)', eol:'End-of-line date (day, month, year MSB + LSB)', after:'Last after-sales date (day, month, year MSB + LSB)', odo:'Odometer value (MSB first; resolution 1 m)', bootid:'Software customer/supplier and product IDs', bootversion:'Bootloader version (major + minor)', session:'Active diagnostic session', reset:'Odometer reset flags', source:'Reference', group:'Data-record bytes', received:'Recorded group', partial:'Incomplete group — decoded value is not available', ascii:'ASCII', bit:'Bit', reserved:'Bits 5–0 are reserved as 0', reservedS:'Bits 6–0 are reserved as 0', done:'done', notDone:'not done', vehicle:'Applicability depends on the vehicle variant; do not assume an N/A field is fitted.', config:'End-of-line configuration', sensors:'Sensor/mirror configuration (bits 7–4)', switches:'Switch configuration (bits 3–0)', fuel:'Fuel system (bits 6–4)', tires:'Tire size (bits 3–0)', tpms:'TPMS type (bits 7–6)', lighting:'Lighting types (bits 5–2)', id:'Vehicle type code', unknownCode:'Code not named in this table', binaryValue:'raw value', sourceHint:'Interpretation uses the selected reference; verify that it matches this ECU.'},
    fa: {part:'شمارهٔ قطعهٔ IKCO', sw:'نسخهٔ نرم‌افزار (اصلی و فرعی)', release:'تاریخ انتشار نرم‌افزار (روز، ماه، سال)', db:'نسخهٔ پایگاه دادهٔ CAN/LS (اصلی، فرعی، ویرایش)', customer:'شناسهٔ مشتری/تأمین‌کنندهٔ نرم‌افزار', product:'شناسهٔ محصول نرم‌افزار', variant:'گونهٔ محصول نرم‌افزار', compat:'سازگاری نرم‌افزار', mfgShort:'تاریخ تولید ECU (روز، ماه، سال)', download:'تاریخ دانلود (روز، ماه، سال)', tool:'امضای ابزار دانلود', reference:'مرجع نرم‌افزار', serial:'شمارهٔ سریال قطعه', vin:'شمارهٔ شناسایی خودرو (VIN)', date:'تاریخ تولید (روز، ماه، بایت‌های بالا و پایین سال)', eol:'تاریخ پایان خط (روز، ماه، بایت‌های بالا و پایین سال)', after:'تاریخ آخرین خدمات (روز، ماه، بایت‌های بالا و پایین سال)', odo:'کارکرد خودرو (بایت پُرارزش ابتدا؛ ضریب ۱ متر)', bootid:'شناسه‌های مشتری/تأمین‌کننده و محصول', bootversion:'نسخهٔ بوت‌لودر (اصلی و فرعی)', session:'نشست دیاگ فعال', reset:'پرچم‌های بازنشانی کارکرد', source:'مرجع', group:'بایت‌های رکورد داده', received:'دادهٔ ثبت‌شدهٔ گروه', partial:'گروه ناقص است؛ مقدار کامل قابل تفسیر نیست', ascii:'متن ASCII', bit:'بیت', reserved:'بیت‌های ۵ تا ۰ رزرو و برابر ۰ هستند', reservedS:'بیت‌های ۶ تا ۰ رزرو و برابر ۰ هستند', done:'انجام شده', notDone:'انجام نشده', vehicle:'کاربرد فیلد به تیپ خودرو بستگی دارد؛ N/A به معنی وجود تجهیز نیست.', config:'پیکربندی پایان خط', sensors:'پیکربندی سنسور/آینه (بیت‌های ۷ تا ۴)', switches:'نوع کلیدها (بیت‌های ۳ تا ۰)', fuel:'سیستم سوخت (بیت‌های ۶ تا ۴)', tires:'اندازهٔ تایر (بیت‌های ۳ تا ۰)', tpms:'نوع TPMS (بیت‌های ۷ تا ۶)', lighting:'نوع چراغ‌ها (بیت‌های ۵ تا ۲)', id:'کد نوع خودرو', unknownCode:'این کد در جدول نام‌گذاری نشده است', binaryValue:'مقدار خام', sourceHint:'تفسیر بر اساس مرجع انتخابی است؛ تطابق آن با ECU را بررسی کنید.'}
  };
  function reference(model, record) {
    const pages = {
      BCMi:{F080:'46–47',F0FE:'47–48',F18C:'49',F190:'49',F180:'48',F18B:'49',F186:'48–49',D708:'45',FDC0:'53–55',FDC2:'56',FDC3:'56',FDC4:'56'},
      NBCM:{F080:'26–27',F0FE:'27',F18C:'28',F190:'29',F180:'27–28',F18B:'28',F186:'28',D708:'26',FDC0:'31–32',FDC2:'35',FDC3:'35',FDC4:'35'},
      SBCM:{F080:'27',F0FE:'27–28',F18C:'28–29',F190:'29',F180:'28',F18B:'28',F186:'28',D708:'26'}
    };
    const page = pages[model]?.[record]; if (!page) return null;
    const name = model === 'BCMi' ? 'BCMi DiagSpec A13' : model === 'NBCM' ? 'NBCM DiagSpec V06' : 'SBCM DiagSpec V10';
    return {name,page};
  }
  const text = (fa,en,l) => l === 'fa' ? fa : en;
  function bitsFor(model, record, offset, v, t, l) {
    const bit = b => (v >> b) & 1;
    if (record === 'D708' && offset === 0) {
      const items = [`${t.bit} 7 · ${model === 'SBCM' ? 'RAZ' : 'RAZ1'}: ${bit(7) ? t.done : t.notDone}`];
      if (model !== 'SBCM') items.push(`${t.bit} 6 · RAZ2: ${bit(6) ? t.done : t.notDone}`);
      items.push(model === 'SBCM' ? t.reservedS : t.reserved);
      return items;
    }
    if (record !== 'FDC0') return [];
    if (model === 'BCMi') {
      if (offset === 0) return [
        `${t.sensors}: RLS=${bit(7)}, ${text('آینهٔ تاشو','folding mirror',l)}=${bit(6)}, ${text('تا کردن با ریموت','remote folding',l)}=${bit(5)}, ${text('سنسور عقب','rear sensors',l)}=${bit(4)}`,
        `${t.switches}: ${text('فلاشر','hazard',l)}=${bit(3)}, AC=${bit(2)}, DSM=${bit(1)}, ${text('نمایش تعویض دنده','gear indicator',l)}=${bit(0)}`,t.vehicle];
      if (offset === 1) {
        const fuel=(v>>4)&7, tire=v&15;
        const fuels=[text('بنزین از EMS، بدون CNG','fuel from EMS, no CNG',l),text('بنزین و CNG از EMS','fuel and CNG from EMS',l)];
        const sizes=['185/65 R15','195/60 R15','185/65 R14','205/50 R16','R13'];
        return [`${t.bit} 7 · ${text('سانروف','sunroof',l)}: ${bit(7)}`,`${t.fuel}: ${fuel} · ${fuels[fuel] || t.unknownCode}`,`${t.tires}: ${tire} · ${sizes[tire] || t.unknownCode}`,t.vehicle];
      }
      if (offset === 2) return [`${text('ماژول‌ها (بیت‌های ۶ تا ۱)','Modules (bits 6–1)',l)}: ${text('گیربکس خودکار','automatic gearbox',l)}=${bit(6)}, DSM=${bit(5)}, EPS=${bit(4)}, HVAC=${bit(3)}, MFD=${bit(2)}, MMS=${bit(1)}`,text('بیت‌های ۷ و ۰ رزرو هستند.','Bits 7 and 0 are reserved.',l),t.vehicle];
      if (offset === 3) return [`${text('تنظیم مصرف سوخت (ضریب ۰٫۱ لیتر در ۱۰۰ کیلومتر)','Fuel consumption setting (resolution 0.1 L/100 km)',l)}: ${(v/10).toFixed(1)} L/100 km`,t.vehicle];
      if (offset === 4) {
        const code=(v>>6)&3, options=l==='fa'?['ندارد','غیرمستقیم','مستقیم','یکپارچه']:['not available','indirect','direct','integrated'];
        return [`${t.tpms}: ${code} · ${options[code]}`,`${t.lighting}: ${text('موقعیت','position',l)}=${bit(5)}, ${text('ترمز','brake',l)}=${bit(4)}, ${text('مه‌شکن','fog',l)}=${bit(3)}, ${text('راهنما','indicators',l)}=${bit(2)} ${text('(۰=لامپ، ۱=LED)','(0=bulb, 1=LED)',l)}`,text('بیت‌های ۱ و ۰ رزرو هستند.','Bits 1 and 0 are reserved.',l),t.vehicle];
      }
      if (offset === 5) { const vehicle={17:'Rana Plus',34:'207 HB',52:'Soren Plus',96:'Arisan'}[v]; return [`${t.id}: 0x${v.toString(16).toUpperCase().padStart(2,'0')} · ${vehicle || t.unknownCode}`]; }
    }
    if (model === 'NBCM') {
      if (offset === 0) return [
        `${t.sensors}: RLS=${bit(7)}, ${text('آینهٔ تاشو','folding mirror',l)}=${bit(6)}, ${text('تا کردن با ریموت','remote folding',l)}=${bit(5)}, ${text('سنسور عقب','rear sensors',l)}=${bit(4)}`,
        `${t.switches}: DRL=${bit(3)}, ${text('فلاشر','hazard',l)}=${bit(2)}, ${text('نمایش تعویض دنده','gear indicator',l)}=${bit(1)}, HVAC=${bit(0)}`,t.vehicle];
      if (offset === 1) return [
        `${text('نوع کلید چندمنظوره (بیت‌های ۷ تا ۶)','Multi-function switch type (bits 7–6)',l)}: ${(v>>6)&3} · ${(l==='fa'?['بدون RLS','با RLS','استفاده نشده','استفاده نشده']:['without RLS','with RLS','not used','not used'])[(v>>6)&3]}`,
        `${text('بیت ۵: خروجی پمپ خلأ یا SBR بسته به تیپ','Bit 5: vacuum pump output or SBR, depending on variant',l)}: ${bit(5)}`,
        `${text('بیت‌های ۳ تا ۰: سایز تایر یا DLC فرمان، بسته به تیپ','Bits 3–0: tire size or steering DLC, depending on variant',l)}: ${v&15}`,t.vehicle];
      if (offset === 3) return [
        `${text('گیربکس، سانروف و PEPS (بیت‌های ۷ تا ۵)','Gearbox, sunroof and PEPS (bits 7–5)',l)}: ${bit(7)} ${bit(6)} ${bit(5)}`,
        `${text('سیستم TPMS (بیت‌های ۴ و ۳)','TPMS system (bits 4–3)',l)}: ${(v>>3)&3} · ${(l==='fa'?['ندارد','غیرمستقیم','مستقیم','تعریف نشده']:['not available','indirect','direct','not defined'])[(v>>3)&3]}`,
        `${text('سیستم سوخت (بیت‌های ۲ تا ۰)','Fuel system (bits 2–0)',l)}: ${v&7} · ${(v&7)===0?text('بنزین از EMS، بدون CNG','fuel from EMS, no CNG',l):(v&7)===1?text('بنزین و CNG از EMS','fuel and CNG from EMS',l):text('رزرو','reserved',l)}`,t.vehicle];
    }
    return [];
  }
  function lookup(model, request, response, offset, language) {
    const l=language==='fa'?'fa':'en', t=names[l];
    if (!['BCMi','NBCM','SBCM'].includes(model) || !/^22[0-9A-F]{4}$/.test(request) || !response?.startsWith('62'+request.slice(2))) return null;
    const did=request.slice(2), source=reference(model,did); if(!source) return null;
    const bytes=(response.slice(6).match(/[0-9A-F]{2}/g)||[]); if(offset<0||offset>=bytes.length) return null;
    const specs = {
      F080:[[0,9,'part','ASCII'],[10,10,'customer','HEX'],[11,11,'product','HEX'],[12,12,'variant','HEX'],[13,14,'sw','BCD'],[15,15,'compat','HEX'],[16,18,'release','BCD'],[19,21,'db','HEX']],
      F0FE:[[6,8,'mfgShort','BCD'],[13,15,'download','BCD'],[17,19,'tool','HEX'],[21,23,'reference','HEX']],
      F18C:[[0,13,'serial','ASCII']],F190:[[0,16,'vin','ASCII']],F18B:[[0,3,'date','BCD']],FDC2:[[0,3,'eol','BCD']],FDC3:[[0,3,'after','BCD']],FDC4:[[0,3,'odo','MSB']],
      F180:[[0,1,'bootid','HEX'],[2,3,'bootversion','BCD']],F186:[[0,0,'session','HEX']],D708:[[0,0,'reset','BITS']],FDC0:[[offset,offset,'config','BITS']]
    };
    const group=specs[did]?.find(([start,end])=>offset>=start&&offset<=end); if(!group) return null;
    let [start,end,key,encoding]=group;
    if (did === 'F180' && key === 'bootversion' && model !== 'BCMi') encoding = 'HEX';
    // FDC0 has vehicle-specific layouts; only give verified bit groups, never a generic guess.
    const items=bitsFor(model,did,offset,parseInt(bytes[offset],16),t,l);
    if(did==='FDC0' && !items.length) return null;
    const values=bytes.slice(start,end+1), complete=values.length===end-start+1;
    const lines=[`${t[key]} · ${t.group} ${start}${end===start?'':'–'+end} (${encoding})`,`${t.received}: ${values.join(' ')}${complete?'':` · ${t.partial}`}`];
    if (encoding==='ASCII' && complete && values.every(x=>{const n=parseInt(x,16);return n>=32&&n<=126;})) lines.push(`${t.ascii}: ${values.map(x=>String.fromCharCode(parseInt(x,16))).join('')}`);
    if (complete && encoding==='BCD') {
      if (values.every(x=>/^[0-9]{2}$/.test(x))) {
        const decoded = ['date','eol','after'].includes(key) ? `${values[0]}/${values[1]}/${values[2]}${values[3]}` : ['release','mfgShort','download'].includes(key) ? values.join('/') : values.join('.');
        lines.push(`${text('مقدار BCD','BCD value',l)}: ${decoded}`);
      } else lines.push(text('دادهٔ BCD معتبر نیست؛ مقدار تفسیر نمی‌شود.','Invalid BCD; value not decoded.',l));
    }
    if (complete && encoding==='MSB') lines.push(`${parseInt(values.join(''),16).toLocaleString(l==='fa'?'fa-IR':'en-US')} m`);
    lines.push(...items,`${t.source}: ${source.name} · PDF ${source.page}`,t.sourceHint);
    return lines.join('\n');
  }
  window.CANDiagGroups=Object.freeze({lookup});
})();
