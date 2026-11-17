// NODE_PATH=<node_modules> CHROMIUM=<browser> node tests/explorer.cjs
const {chromium} = require('playwright-core');
const path = require('path');
const assert = require('assert');
(async () => {
  const root = path.resolve(__dirname, '..');
  const env = {...process.env};
  if (env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH = env.CHROMIUM_LIBRARY_PATH;
  const browser = await chromium.launch({executablePath: env.CHROMIUM, args:['--no-sandbox','--disable-gpu','--single-process'], env});
  try {
    const page = await browser.newPage({viewport:{width: 375, height: 800}});
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('file://' + path.join(root, 'app/index.html'));
    await page.waitForFunction(() => typeof document.getElementById('logs').onchange === 'function');
    assert.equal(await page.locator('.task-card').count(), 3);
    await page.locator('.task-card').nth(1).click();
    assert.equal(await page.locator('#compare').isVisible(), true);
    assert.equal(await page.locator('#compare .workflow-empty').isVisible(), true);
    await page.locator('[data-tab="setup"]').click();
    await page.locator('#logs').setInputFiles([path.join(root,'arisan_1.36.log'),path.join(root,'Logging.blf')]);
    await page.waitForFunction(() => document.querySelectorAll('#filelist input[data-use]:checked').length >= 2);
    await page.locator('.task-card').nth(0).click();
    const summary = page.locator('#walk .analysis-summary');
    await page.waitForFunction(() => document.querySelector('#walk .summary-metric'));
    let numbers = await summary.locator('.summary-metric strong').allTextContents();
    const actual = await page.evaluate(() => {
      const run = activeRuns().find(r => String(r.uid) === document.querySelector('#walkRun').value);
      const result = diagnosticExchanges(run);
      return [result.out.length, result.out.filter(entry => faultReasons(run,entry).length).length, result.incomplete || 0].map(String);
    });
    assert.deepStrictEqual(numbers, actual);
    assert.deepStrictEqual(numbers, ['183','82','0']);
    assert.match(await summary.innerText(), /Needs review/);
    assert.match(await summary.innerText(), /59 data bytes; the EP6 reference expects 77/);
    assert.match(await summary.innerText(), /not a confirmed fault/);
    await page.locator('#walkIndex').selectOption('11');
    await page.waitForFunction(() => document.querySelector('#walk .analysis-summary')?.textContent.includes('No final reply recorded'));
    assert.match(await summary.innerText(), /does not by itself prove a failure/);
    await page.locator('#walkDid').fill('FD3F'); await page.locator('#walkAdd').click();
    await page.waitForFunction(() => document.querySelector('#walkTags').textContent.includes('FD3F'));
    numbers = await summary.locator('.summary-metric strong').allTextContents();
    assert.deepStrictEqual(numbers, actual, 'overview must not be affected by the request filter');
    await page.locator('.language-switch').click();
    await page.waitForFunction(() => document.querySelector('#walk .analysis-summary')?.textContent.includes('خلاصهٔ لاگ'));
    assert.match(await summary.innerText(), /خطای قطعی نیست/);
    await summary.locator('.summary-action').click();
    assert.equal(await page.locator('#faults').isVisible(), true);
    await page.waitForFunction(() => document.querySelector('#faults .summary-metric'));
    assert.deepStrictEqual(await page.locator('#faults .summary-metric strong').allTextContents(), actual);
    assert.equal(await page.locator('#faultList > details').count(), Number(actual[1]));
    await page.locator('[data-tab="compare"]').click();
    await page.waitForFunction(() => document.querySelector('.compare-summary .summary-metric'));
    const comparison = page.locator('.compare-summary');
    const expectedComparison = await page.evaluate(() => {
      let same=0, different=0, oneSide=0;
      for (const [pair] of _63db65fae6) {
        if (!pair[0] || !pair[1]) oneSide++;
        else if ((pair[0].f ?? pair[0].p) === (pair[1].f ?? pair[1].p)) same++;
        else different++;
      }
      return [_63db65fae6.length, different, oneSide, same].map(String);
    });
    assert.deepStrictEqual(await comparison.locator('.summary-metric strong').allTextContents(), expectedComparison);
    await comparison.locator('.summary-action').click();
    assert.equal(await page.locator('#scope').inputValue(), 'diff');
    await page.waitForFunction(() => document.querySelector('.compare-summary .summary-metric:last-child strong')?.textContent === '0');
    assert.equal((await comparison.locator('.summary-metric strong').allTextContents())[3], '0');
    const size = await page.evaluate(() => ({document:document.documentElement.scrollWidth, viewport:window.innerWidth}));
    assert(size.document <= size.viewport + 1, 'overview should fit a narrow viewport');
    assert.deepStrictEqual(errors, []);
    console.log('Task cards and diagnostic summaries passed with sample data, filtering, language change and review navigation.');
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode=1;});
