// NODE_PATH=<node_modules> CHROMIUM=<browser> node tests/english-coverage.cjs
// Covers the repository's sample logs; custom names/specifications may contain any language.
const { chromium } = require('playwright-core');
const path = require('path');
const assert = require('assert');
(async () => {
  const root = path.resolve(__dirname, '..');
  const env = {...process.env};
  if (env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH = env.CHROMIUM_LIBRARY_PATH;
  const browser = await chromium.launch({executablePath: env.CHROMIUM, args: ['--no-sandbox', '--disable-gpu', '--single-process'], env});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + path.join(root, 'app/index.html'));
    await page.waitForFunction(() => typeof document.getElementById('logs').onchange === 'function');
    await page.locator('#logs').setInputFiles([path.join(root, 'arisan_1.36.log'), path.join(root, 'Logging.blf')]);
    await page.waitForFunction(() => document.querySelectorAll('#filelist select[data-model]').length >= 2);
    async function assertEnglish(selector) {
      const leftovers = await page.$eval(selector, root => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), found = [];
        for (let n; (n = walker.nextNode());) if (/[\u0600-\u06ff]/.test(n.data.trim())) found.push(n.data.trim());
        return [...new Set(found)].slice(0, 10);
      });
      assert.deepStrictEqual(leftovers, [], selector + ': untranslated text: ' + leftovers.join(' | '));
    }
    for (const model of ['BCMi A13', 'NBCM V06', 'SBCM V10']) {
      await page.locator('[data-tab="setup"]').click();
      await page.locator('#filelist select[data-model]').first().selectOption({label: model});
      // Use the sample log's actual ID pair even for the other model mappings.
      // This tests presentation paths, not whether those models fit this vehicle.
      await page.locator('#filelist details').nth(1).locator('summary').click();
      for (const [index, address] of [[0, '752'], [1, '652']]) {
        const input = page.locator(`#filelist input[data-addr][data-index="${index}"]`).first();
        await input.evaluate((element, value) => { element.value = value; element.dispatchEvent(new Event('change', {bubbles: true})); }, address);
      }
      await assertEnglish('#filelist');
      await page.locator('[data-tab="walk"]').click();
      const requests = await page.locator('#walkIndex option').evaluateAll(options => options.map(o => o.value));
      console.log(model, requests.length, await page.locator('#walkRun').inputValue());
      assert(requests.length >= 180, 'sample requests should be available');
      for (const value of requests) {
        await page.locator('#walkIndex').selectOption(value);
        await assertEnglish('#walkReport');
      }
      await assertEnglish('#walkIndex');
      await page.locator('[data-tab="compare"]').click();
      await assertEnglish('#compare');
    }
    await page.locator('[data-tab="setup"]').click();
    await page.locator('#spec').setInputFiles(path.join(root, 'BCMi_DiagSpec_UDS_A13.pdf'));
    await page.waitForFunction(() => !document.getElementById('review').hidden, null, {timeout: 120000});
    assert.match(await page.locator('#specmsg').innerText(), /record titles and .* sessions extracted/);
    await assertEnglish('#specmsg');
    await page.locator('#cancel').click();
    await page.locator('[data-tab="walk"]').click();
    const selected = await page.locator('#walkIndex').inputValue();
    await page.locator('.language-switch').click();
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('#walkIndex').inputValue(), selected);
    assert.match(await page.locator('#walkReport').innerText(), /[\u0600-\u06ff]/);
    await page.locator('.language-switch').click();
    assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
    assert.equal(await page.locator('#walkIndex').inputValue(), selected);
    await assertEnglish('#walkReport');
    assert.deepStrictEqual(errors, []);
    console.log('English coverage passed for all sample requests, three models, comparison, PDF import, and language switching.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
