const {chromium}=require('playwright-core'), assert=require('assert'), path=require('path');
(async()=>{
 const env={...process.env}; if(env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH=env.CHROMIUM_LIBRARY_PATH;
 const browser=await chromium.launch({executablePath:env.CHROMIUM,args:['--no-sandbox','--disable-gpu','--single-process'],env});
 try {
  const page=await browser.newPage({viewport:{width:390,height:850}}); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve('app/index.html'));
  await page.waitForFunction(()=>typeof document.getElementById('logs').onchange==='function');
  assert.match(await page.locator('.task-card').nth(0).innerText(),/Record a log/);
  await page.locator('.task-card').nth(0).click(); assert.match(await page.locator('#capture-import-status').innerText(),/desktop app/);
  const chooser=page.waitForEvent('filechooser'); await page.locator('.task-card').nth(1).click(); await (await chooser).setFiles(path.resolve('arisan_1.36.log'));
  await page.waitForFunction(()=>document.querySelectorAll('#filelist input[data-use]:checked').length===1 && !document.querySelector('#walk').hidden);
  await page.locator('[data-tab="setup"]').click();
  await page.locator('.task-card').nth(2).click(); assert(await page.locator('#compare').isVisible());
  await page.locator('[data-tab="setup"]').click();
  const text='***BUSMASTER Ver 3.2.2***\n***PROTOCOL CAN***\n***HEX***\n12:00:01:000100 Rx 1 0x752 s 8 03 22 FD 3F FF FF FF FF\n12:00:01:001100 Rx 1 0x652 s 8 04 62 FD 3F 00 FF FF FF\n';
  const buffer=Buffer.from(text);const parts=[buffer.subarray(0,24),buffer.subarray(24)];
  const imported=await page.evaluate(async ({b,size})=>{if(!CANImport.begin('recording.log',size)) return false;for(const p of b) if(!CANImport.append(p))return false;await CANImport.finish();return true},{b:parts.map(x=>x.toString('base64')),size:buffer.length});
  assert(imported); assert(await page.locator('#walk').isVisible());
  assert.match(await page.locator('#walkRun').innerText(),/recording\.log/);
  await page.locator('[data-tab="setup"]').click(); await page.locator('.language-switch').click();
  await page.waitForFunction(()=>document.documentElement.lang==='fa');
  assert.match(await page.locator('.task-card').nth(0).innerText(),/ضبط لاگ/);
  await page.locator('.task-card').nth(0).click();assert.match(await page.locator('#capture-import-status').innerText(),/دسکتاپ/);
  assert.equal(await page.evaluate(()=>CANImport.begin('huge.log',65*1024*1024)),false);
  assert.deepStrictEqual(errors,[]); console.log('Capture workflow passed: start choices, bilingual guidance, chunk import and review.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
