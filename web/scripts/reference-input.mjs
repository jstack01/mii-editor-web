import{readFileSync}from'node:fs';
const hex=JSON.parse(readFileSync(new URL('../test-support/fixtures/default-character.json',import.meta.url))).hex;
/** Explicit historical input fixture for geometry/byte-isolation regressions.
 * Supplies an existing saved record on the first read only, without writing it.
 * Real empty-origin creation is tested separately in wii-browser.mjs. */
export async function referenceInput(pageOrContext){await pageOrContext.addInitScript(({hex})=>{const get=Storage.prototype.getItem;let supplied=false;Storage.prototype.getItem=function(key){const raw=get.call(this,key);if(!supplied&&key==='mii-editor.character.v1'){supplied=true;if(raw===null)return hex;}return raw;};},{hex});}
