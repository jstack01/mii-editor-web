import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from './browser-engine.mjs';
import { xmlCompatibilityChecks } from './xml-browser-checks.mjs';
import { fullRenderingBrowserChecks } from './full-rendering-browser-checks.mjs';
import { renderingBrowserChecks } from './rendering-browser-checks.mjs';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const preview = process.argv.includes('--preview');
const port = preview ? 5175 : 5174;
const origin = `http://127.0.0.1:${port}`;
if(preview){const fixture=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','scripts/diagnostics-vite.config.mjs'],{cwd,encoding:'utf8'});if(fixture.status!==0)throw Error(fixture.stdout+fixture.stderr);}
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...(preview ? ['preview','--outDir','test-results/diagnostics-dist'] : []), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk; });
server.stderr.on('data', (chunk) => { serverOutput += chunk; });
const original = '000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000';
const reportDir = process.env.MII_BROWSER_REPORT_DIR || fileURLToPath(new URL('../test-results/', import.meta.url));
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite failed: ${serverOutput}`);
    try { ready = (await fetch(origin+'/diagnostics.html')).ok; } catch { /* wait for server startup */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Vite startup timed out: ${serverOutput}`);
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 650 } });
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (!request.url().startsWith(origin) && !request.url().startsWith('data:') && !request.url().startsWith(`blob:${origin}/`)) externalRequests.push(request.url()); });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(origin+'/diagnostics.html');
  const input = page.getByLabel('Name', { exact: true });
  const hex = page.getByLabel('Hexadecimal data');
  assert.equal(await input.inputValue(), 'defaultBoy');
  assert.equal(await hex.inputValue(), original);
  assert.ok(await hex.getAttribute('readonly') !== null);
  const checks = ['default fixture decoded', '74-byte hex shown read-only'];
  for (const [name, encoded] of [['Alice', '0041006c006900630065' + '0000'.repeat(5)], ['水😀', '6c34d83dde00' + '0000'.repeat(7)], ['', '0000'.repeat(10)]]) {
    await input.fill(name);
    const actual = await hex.inputValue();
    assert.equal(actual, original.slice(0, 4) + encoded + original.slice(44));
    assert.equal(actual.length, 148);
  }
  checks.push('ASCII, non-ASCII, surrogate pair and empty edits preserve all unrelated bytes');
  await input.fill('1234567890');
  await input.press('End');
  await page.keyboard.type('extra');
  assert.equal(await input.inputValue(), '1234567890');
  checks.push('keyboard input limited to ten UTF-16 units');
  await page.getByRole('button', { name: 'Reset to original default' }).click();
  assert.equal(await hex.inputValue(), original);
  assert.equal(await input.inputValue(), 'defaultBoy');
  checks.push('reset restores exact original bytes');
  const rendering = await renderingBrowserChecks(page, {preview,reportDir});
  const fullRendering=await fullRenderingBrowserChecks(page,{preview,reportDir});
  checks.push('eight complete original-vector characters, feature controls, native SVG sweep and source shadow checked');
  checks.push('original vector head, blank frames, name-edit pixel stability and diagnostic scope verified');
  for (const width of [900, 360]) {
    await page.setViewportSize({ width, height: 650 });
    await page.waitForFunction(() => {
      const stage = document.getElementById('stage');
      const viewport = document.getElementById('viewport');
      return Math.abs(stage.getBoundingClientRect().width - viewport.clientWidth) < 1;
    });
    const bounds = await page.locator('#stage').boundingBox();
    assert.ok(Math.abs(bounds.width / bounds.height - 640 / 500) < 0.001);
    assert.ok(bounds.x + bounds.width <= width);
    const scope = await page.locator('.scope').boundingBox();
    assert.ok(scope.y + scope.height < bounds.y + bounds.height, 'All explanatory content fits the 500px surface');
    assert.ok(await page.locator('#stage').evaluate((stage) => stage.scrollHeight <= stage.clientHeight), 'No vertical content overflow');
  }
  checks.push('640 × 500 surface scales uniformly at desktop and narrow widths');
  await page.setViewportSize({ width: 900, height: 650 });
  await page.waitForFunction(() => document.getElementById('stage').getBoundingClientRect().width > 600);
  await input.focus();
  await page.keyboard.type('A');
  assert.equal(await input.inputValue(), 'defaultBoy'); // existing ten-unit default is full
  checks.push('keyboard interaction verified');
  const dataCompatibility = preview ? null : await page.evaluate(xmlCompatibilityChecks);
  if (dataCompatibility) checks.push(`${dataCompatibility.count} native-browser XML compatibility cases passed`);
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  checks.push('no browser errors or external requests');
  mkdirSync(reportDir, { recursive: true });
  await page.screenshot({ path: `${reportDir}/${preview ? 'production' : 'dev'}.png` });
  const report = { mode: preview ? 'production preview' : 'Vite dev', browser: await browser.version(), checks, dataCompatibility, rendering, fullRendering, errors, externalRequests };
  writeFileSync(`${reportDir}/${preview ? 'production' : 'dev'}.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (browser) await browser.close();
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    await once(server, 'exit');
  }
}
