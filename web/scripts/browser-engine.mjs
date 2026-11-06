/** Existing browser pipelines can run unchanged on each actual Playwright engine. */
import {chromium as chromiumType,firefox,webkit} from 'playwright';
export const engineName=process.env.MII_BROWSER_ENGINE||'chromium';
const type={chromium:chromiumType,firefox,webkit}[engineName];
if(!type)throw Error('Unknown browser engine '+engineName);
export const chromium={async launch(options={}){
 const selected={timeout:20000,...options};if(engineName!=='chromium')delete selected.channel;
 else if(process.env.PLAYWRIGHT_CHANNEL)selected.channel=process.env.PLAYWRIGHT_CHANNEL;
 const browser=await type.launch(selected);console.log(JSON.stringify({testedEngine:engineName,browserVersion:browser.version()}));return browser;
}};
