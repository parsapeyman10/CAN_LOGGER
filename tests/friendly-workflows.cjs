// Actionable guidance, successful and failed file selection, and bilingual keyboard use.
const {chromium}=require('playwright-core'), assert=require('assert'), path=require('path');
(async()=>{
 const env={...process.env}; if(env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH=env.CHROMIUM_LIBRARY_PATH;
 const browser=await chromium.launch({executablePath:env.CHROMIUM,args:['--no-sandbox','--disable-gpu','--single-process'],env});
 try {
  const page=await browser.newPage({viewport:{width:375,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve('app/index.html'));await page.waitForFunction(()=>document.querySelector('#logs').dataset.workflowReady==='true');
  assert(await page.locator('.workflow-quick').isHidden());
  let chooser=page.waitForEvent('filechooser');await page.locator('.task-card').nth(1).click();await (await chooser).setFiles({name:'bad.log',mimeType:'text/plain',buffer:Buffer.from('not a CAN log')});
  await page.waitForFunction(()=>document.querySelector('#capture-import-status')?.textContent.includes('No new log'));
  assert(await page.locator('#setup').isVisible()); assert(await page.locator('#walk').isHidden());
  chooser=page.waitForEvent('filechooser');await page.locator('.task-card').nth(1).click();await (await chooser).setFiles(path.resolve('arisan_1.36.log'));
  await page.waitForFunction(()=>!document.querySelector('#walk').hidden);
  assert.match(await page.locator('#walkRun').inputValue(),/\d+/);
  await page.locator('[data-tab="setup"]').click(); assert(await page.locator('.workflow-quick').isVisible());
  await page.locator('.workflow-quick button').nth(1).click();assert(await page.locator('#compare .compare-help').isVisible());
  assert.match(await page.locator('#compare .compare-help').innerText(),/two different enabled log files/);
  chooser=page.waitForEvent('filechooser');await page.locator('#compare .compare-help button').click();await (await chooser).setFiles(path.resolve('Logging.blf'));
  await page.waitForFunction(()=>document.querySelectorAll('#filelist input[data-use]:checked').length>=2);
  await page.locator('.workflow-quick button').nth(1).click();await page.waitForFunction(()=>document.querySelector('#compare .compare-help').hidden);
  await page.locator('.language-switch').click(); await page.waitForFunction(()=>document.documentElement.lang==='fa');
  await page.locator('[data-tab="setup"]').click();
  assert.match(await page.locator('.workflow-quick').innerText(),/مرور درخواست‌ها/);
  await page.locator('.workflow-quick button').first().focus(); await page.keyboard.press('Enter'); assert(await page.locator('#walk').isVisible());
  const dimensions=await page.evaluate(()=>[document.documentElement.scrollWidth, innerWidth]);assert(dimensions[0]<=dimensions[1]+1);
  const second=await browser.newPage(); await second.goto('file://'+path.resolve('app/index.html')); await second.waitForFunction(()=>document.querySelector('#logs').dataset.workflowReady==='true');
  const cancelled=second.waitForEvent('filechooser'); await second.locator('.task-card').nth(1).click(); await (await cancelled).setFiles([]);
  await second.locator('#logs').setInputFiles(path.resolve('arisan_1.36.log'));
  await second.waitForFunction(()=>document.querySelectorAll('#filelist input[data-use]:checked').length===1);
  assert(await second.locator('#setup').isVisible(), 'cancelling the Open task must not redirect a later independent upload');
  await second.close();
  assert.deepStrictEqual(errors,[]);console.log('Friendly workflow passed: failed/successful import, one/two-file compare, keyboard, Persian and narrow viewport.');
 } finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
