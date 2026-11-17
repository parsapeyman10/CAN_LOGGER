// Check recorded BUSMASTER rows can be read by the existing analyzer.
const {chromium}=require('playwright-core'), assert=require('assert'), path=require('path');
(async()=>{
 const env={...process.env}; if(env.CHROMIUM_LIBRARY_PATH) env.LD_LIBRARY_PATH=env.CHROMIUM_LIBRARY_PATH;
 const browser=await chromium.launch({executablePath:env.CHROMIUM,args:['--no-sandbox','--disable-gpu','--single-process'],env});
 try {
  const page=await browser.newPage(); await page.goto('file://'+path.resolve('app/index.html'));
  await page.waitForFunction(()=>typeof parseBusmaster==='function');
  const result=await page.evaluate(()=>{
   const input='***BUSMASTER Ver 3.2.2***\n***PROTOCOL CAN***\n***HEX***\n12:34:56:123456 Rx 1 0x752 s 8 03 22 FD 3F FF FF FF FF\n12:34:56:223456 Tx 2 0x123 s 2 AA BB\n';
   const [channels,note]=parseBusmaster(input);return {entries:Array.from(channels.entries()),note};
  });
  assert.equal(result.entries.length,2);assert.equal(result.entries[0][1][0][1],0x752);assert.equal(result.entries[1][1][0][4],'Tx');
  console.log('Recorded BUSMASTER rows are accepted by the HTML analyzer.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
