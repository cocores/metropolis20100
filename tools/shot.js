// Render harness: loads a Metropolis page in headless Chromium with the three.js
// CDN routed to the local npm copy, then screenshots it and reports JS errors.
// Usage: node tools/shot.js [page.html] [out.png] [--wait=ms] [--eval="js to run after load"]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; }));
const pos = args.filter(a => !a.startsWith('--'));
const page = path.resolve(pos[0] || path.join(__dirname, '..', 'index.html'));
const out = path.resolve(pos[1] || path.join(__dirname, 'out', 'render.png'));
const wait = +(flags.wait || 15000);
const THREE_DIR = path.join(__dirname, 'node_modules', 'three');

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: +(flags.w || 1280), height: +(flags.h || 800) } });
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, (route) => {
    const rel = route.request().url().match(/three@[^/]+\/(.*)$/)[1];
    const f = path.join(THREE_DIR, rel);
    fs.existsSync(f) ? route.fulfill({ path: f, contentType: 'application/javascript' }) : route.abort();
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: '' }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await p.goto('file://' + page);
  await p.waitForTimeout(wait);
  if (flags.eval) { await p.evaluate(flags.eval); await p.waitForTimeout(+(flags.after || 4000)); }
  await p.screenshot({ path: out, timeout: +(flags.shotTimeout || 180000) });
  console.log(JSON.stringify({ page, out, errors }, null, 1));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
