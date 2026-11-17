// NODE_PATH=<node_modules> CHROMIUM=<browser> node tests/review-status.cjs
const {chromium} = require('playwright-core');
const path = require('path');
const assert = require('assert');
(async () => {
  const root = path.resolve(__dirname, '..'); const env = {...process.env};
  if (env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH = env.CHROMIUM_LIBRARY_PATH;
  const browser = await chromium.launch({executablePath:env.CHROMIUM,args:['--no-sandbox','--disable-gpu','--single-process'],env});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:900}}); const errors=[];
    page.on('pageerror',e => errors.push(e.message));
    await page.goto('file://' + path.join(root,'app/index.html'));
    await page.waitForFunction(() => typeof document.querySelector('#logs').onchange === 'function');
    await page.locator('#logs').setInputFiles([path.join(root,'arisan_1.36.log'),path.join(root,'Logging.blf')]);
    await page.waitForFunction(() => document.querySelectorAll('#filelist input[data-use]:checked').length >= 2);
    await page.locator('[data-tab="walk"]').click();
    await page.waitForFunction(() => document.querySelector('#walkReport > .review-verdict.orange'));
    const verdict = page.locator('#walkReport > .review-verdict');
    assert.match(await verdict.innerText(), /77 bytes \(616 bits\).*59 bytes \(472 bits\)/s);
    assert.match(await verdict.innerText(), /Missing data cannot be validated/);
    assert.equal(await page.locator('#walkReport > .validation').evaluate(el => el.classList.contains('review-orange')), true);
    assert.equal(await page.locator('#walkReport > .notice').first().evaluate(el => el.classList.contains('review-orange')), true);
    const results = await page.evaluate(() => {
      const run=activeRuns()[0], original=diagnosticExchanges(run).out[0];
      const make = p => ({...original, ans:p ? {...original.ans,p} : null, pending:[], other:[]});
      const cases = [
        ['short', '62FD3F'+'00'.repeat(59)], ['empty', '62FD3F'],
        ['correct-length', '62FD3F'+'00'.repeat(77)], ['wrong-id', '62FD00'+'00'.repeat(59)],
        ['negative', '7F2231'], ['extended-uncertain', '62FD3F'+'00'.repeat(78)], ['missing', null]
      ];
      const result = cases.map(([name,p]) => [name,CANReviewAssessment.assess(run,make(p)).status]);
      for (const [name,request,reply] of [
        ['standard-short','22F180','62F180'+'00'.repeat(3)],
        ['standard-match','22F180','62F180'+'00'.repeat(4)],
        ['standard-long','22F180','62F180'+'00'.repeat(5)],
        ['vin-short-matching-prefix','22F190','62F190'+'FF'.repeat(10)],
        ['vin-short-wrong-value','22F190','62F190'+'FF'.repeat(9)+'00'],
        ['vin-match','22F190','62F190'+'FF'.repeat(17)],
        ['no-length-reference','22FDFD','62FDFD00']
      ]) result.push([name,CANReviewAssessment.assess(run,{...make(reply),p:request}).status]);
      return result;
    });
    assert.deepStrictEqual(results, [['short','orange'],['empty','orange'],['correct-length','green'],['wrong-id','red'],['negative','red'],['extended-uncertain','gray'],['missing','gray'],['standard-short','orange'],['standard-match','green'],['standard-long','red'],['vin-short-matching-prefix','orange'],['vin-short-wrong-value','red'],['vin-match','green'],['no-length-reference','gray']]);
    const field = page.locator('#walkReport .bytepart > .byteval').first();
    await field.hover(); await page.locator('#byte-tooltip').waitFor({state:'visible'});
    assert.match(await page.locator('#byte-tooltip').innerText(), /message type.*Read data record/);
    await field.focus(); assert.match(await field.getAttribute('aria-describedby'), /byte-tooltip/);
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#byte-tooltip').isHidden(), true);
    const hexGrid = page.locator('#walkReport .exchange-response .hexgrid').first();
    await hexGrid.locator('xpath=ancestor::details[1]/summary').click();
    const byte = hexGrid.locator('span').first(); await byte.hover();
    assert.match(await page.locator('#byte-tooltip').innerText(), /Ignition switch \(IGN\).*Disabled/);
    const raw = page.locator('#walkReport .frame-trace tbody td:last-child span').first(); await raw.hover();
    assert.match(await page.locator('#byte-tooltip').innerText(), /No field definition is available/);
    await page.locator('#walkIndex').selectOption('7');
    await page.waitForFunction(() => document.querySelector('#walkReport .exchange-response .hexgrid span')?.dataset.byteInfo?.includes('RLS='));
    assert.match(await page.locator('#walkReport .exchange-response .hexgrid span').first().getAttribute('data-byte-info'), /Sensor\/mirror configuration.*RLS=/);
    await page.locator('#walkIndex').selectOption('0');
    await page.waitForFunction(() => document.querySelector('#walkReport > .review-verdict.orange'));
    await page.locator('.language-switch').click();
    await page.waitForFunction(() => document.querySelector('#walkReport > .review-verdict')?.textContent.includes('طول داده کمتر'));
    assert.match(await verdict.innerText(), /۷۷|77/);
    const farsiField = page.locator('#walkReport .bytepart > .byteval').first();
    await farsiField.hover(); assert.match(await page.locator('#byte-tooltip').innerText(), /نوع پیام/);
    await page.locator('[data-tab="canFrames"]').click();
    await page.locator('#framesIds').fill('752'); await page.locator('#framesAdd').click();
    await page.waitForFunction(() => document.querySelector('#framesResult .frame-trace td:last-child span[data-byte-info]'));
    await page.locator('#framesResult .frame-trace td:last-child span').first().hover();
    assert.match(await page.locator('#byte-tooltip').innerText(), /تعریف فیلد در دسترس نیست/);
    await page.locator('[data-tab="faults"]').click();
    await page.locator('#faultList > details').first().locator('summary').click();
    await page.waitForFunction(() => document.querySelector('#faultList > details > div > .review-verdict'));
    assert.equal(await page.locator('#faultList > details').first().locator('.review-verdict').evaluate(el => el.classList.contains('orange')), true);
    await page.locator('[data-tab="compare"]').click();
    await page.waitForFunction(() => document.querySelector('#pairCards article .review-verdict'));
    assert((await page.locator('#pairCards article .review-verdict').count()) >= 1);
    assert.deepStrictEqual(errors, []);
    console.log('Review statuses and byte explanations passed: match, short, mismatch, unknown, hover, keyboard, both languages and views.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
