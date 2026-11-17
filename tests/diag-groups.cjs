// Focused tests for reference scope, group boundaries, values, and incomplete records.
const {chromium}=require('playwright-core'), assert=require('assert'), path=require('path');
(async()=>{
 const env={...process.env}; if(env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH=env.CHROMIUM_LIBRARY_PATH;
 const browser=await chromium.launch({executablePath:env.CHROMIUM,args:['--no-sandbox','--disable-gpu','--single-process'],env});
 try {
  const page=await browser.newPage(); await page.goto('file://'+path.resolve('app/index.html'));
  await page.waitForFunction(()=>window.CANDiagGroups);
  const lookup=(...args)=>page.evaluate(args=>CANDiagGroups.lookup(...args),args);
  const part='494B3032373536333830', response='62F080'+part+'B1A502123400010224010203';
  for(let i=0;i<10;i++) assert.match(await lookup('BCMi','22F080',response,i,'en'),/IKCO part number[\s\S]*bytes 0–9[\s\S]*IK02756380[\s\S]*A13/);
  assert.match(await lookup('BCMi','22F080',response,13,'en'),/Software version[\s\S]*12\.34/);
  assert.match(await lookup('BCMi','22F190','62F1904142',0,'en'),/Incomplete group/);
  assert.match(await lookup('NBCM','22F18B','62F18B31122024',2,'fa'),/31\/12\/2024/);
  assert.match(await lookup('BCMi','22F18B','62F18BFA122024',0,'en'),/Invalid BCD/);
  assert.match(await lookup('NBCM','22FDC4','62FDC4000003E8',3,'en'),/1,000 m/);
  assert.match(await lookup('BCMi','22FDC0','62FDC000120000C0',1,'en'),/Fuel system.*1.*fuel and CNG[\s\S]*Tire size.*2.*185\/65 R14/);
  assert.match(await lookup('BCMi','22FDC0','62FDC000120000C0',4,'en'),/TPMS type.*3.*integrated/);
  assert.match(await lookup('NBCM','22FDC0','62FDC000C8000A',1,'en'),/bits 7–6.*3.*not used[\s\S]*depending on variant/);
  assert.match(await lookup('NBCM','22FDC0','62FDC000C8000A',3,'en'),/TPMS system.*1.*indirect[\s\S]*Fuel system.*2.*reserved/);
  assert.match(await lookup('SBCM','22D708','62D708C0',0,'en'),/RAZ: done[\s\S]*Bits 6–0/);
  assert.equal(await lookup('CUSTOM','22F080',response,0,'en'),null);
  assert.equal(await lookup('NBCM','22F080','62F081'+part,0,'en'),null);
  assert.equal(await lookup('SBCM','22FDC0','62FDC000',0,'en'),null);
  const sess=(...args)=>page.evaluate(args=>CANSessionInfo.lookup(...args),args);
  assert.match(await sess('BCMi','1060','506000FA27',4,'en'),/Incomplete/);
  assert.equal(await sess('BCMi','1060','500100FA2710',2,'en'),null);
  assert.equal(await sess('CUSTOM','1060','506000FA2710',2,'en'),null);
  assert.match(await sess('NBCM','1060','506000FA2710',5,'en'),/100000 ms[\s\S]*NBCM DiagSpec V06/);
  console.log('Documented diagnostic groups, model isolation, values, incomplete records and both languages passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
