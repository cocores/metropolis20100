// Render harness: loads a Metropolis page in headless Chromium with the three.js
// CDN routed to the local npm copy, then screenshots it and reports JS errors.
//
// Usage: node tools/shot.js [page.html] [out.png] [flags]
//   --wait=ms         time to wait after load before eval/metrics/screenshot (default 15000)
//   --eval="js"       expression run in the page after --wait; its result is printed as "eval"
//   --after=ms        time to wait after --eval (default 4000)
//   --w= --h=         viewport size (default 1280x800; ignored by --mobile unless given)
//   --mobile          phone preset: 390x844, DPR 3, touch, iPhone Safari UA
//   --metrics         print renderer.info (calls, triangles, geometries, textures) for one
//                     full frame (all composer passes), frame ms mean/p95 over --frames
//                     rAF intervals (default 120), shadow casters, isMobile, time-to-ready.
//                     Waits for window.__ready first. Needs the window.__m2140 hook.
//   --frames=n        frames to time for --metrics (default 120)
//   --readyTimeout=ms how long --metrics waits for window.__ready (default 900000)
//   --shotTimeout=ms  screenshot timeout (default 180000)
//
// Output: JSON on stdout. Exit code is 1 if the page logged JS errors (or eval threw).
// NOTE: software GL (SwiftShader) -- absolute ms are meaningless; compare runs relative
// to each other on the same machine.
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.length ? v.join('=') : true]; }));
const pos = args.filter(a => !a.startsWith('--'));
const page = path.resolve(pos[0] || path.join(__dirname, '..', 'index.html'));
const out = path.resolve(pos[1] || path.join(__dirname, 'out', 'render.png'));
const wait = +(flags.wait || 15000);
const THREE_DIR = path.join(__dirname, 'node_modules', 'three');

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

function contextOptions() {
  if (flags.mobile) {
    return {
      viewport: { width: +(flags.w || 390), height: +(flags.h || 844) },
      deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: IPHONE_UA,
    };
  }
  return { viewport: { width: +(flags.w || 1280), height: +(flags.h || 800) } };
}

// Collects one-frame renderer.info totals across every composer pass, plus rAF frame timing.
// Runs in the page. Exactly one tick() runs between two consecutive rAF callbacks of ours.
async function collectMetrics(p, frames) {
  return p.evaluate(async (frames) => {
    const H = window.__m2140;
    if (!H) return { error: 'window.__m2140 debug hook not found' };
    const raf = () => new Promise(r => requestAnimationFrame(r));
    const info = H.renderer.info;
    const prev = info.autoReset;
    await raf();
    info.autoReset = false; info.reset();
    await raf();
    const one = H.info();
    info.autoReset = prev;
    const dts = [];
    let last = performance.now();
    for (let i = 0; i < frames; i++) { await raf(); const now = performance.now(); dts.push(now - last); last = now; }
    const sorted = dts.slice().sort((a, b) => a - b);
    const mean = dts.reduce((a, b) => a + b, 0) / dts.length;
    const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
    const r1 = x => Math.round(x * 10) / 10;
    return Object.assign(one, {
      frames, frameMsMean: r1(mean), frameMsP95: r1(p95), frameMsMax: r1(sorted[sorted.length - 1]),
      readyMs: window.__shotReadyAt != null ? Math.round(window.__shotReadyAt) : null,
      viewport: innerWidth + 'x' + innerHeight, devicePixelRatio: devicePixelRatio,
    });
  }, frames);
}

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext(contextOptions());
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, (route) => {
    const rel = route.request().url().match(/three@[^/]+\/(.*)$/)[1];
    const f = path.join(THREE_DIR, rel);
    fs.existsSync(f) ? route.fulfill({ path: f, contentType: 'application/javascript' }) : route.abort();
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: '' }));
  // Record time-to-ready (ms since navigation start) without touching the page's code.
  await ctx.addInitScript(() => {
    const iv = setInterval(() => { if (window.__ready) { window.__shotReadyAt = performance.now(); clearInterval(iv); } }, 50);
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await p.goto('file://' + page);
  await p.waitForTimeout(wait);
  const result = { page, out, mobile: !!flags.mobile };
  if (flags.eval) {
    try {
      const v = await p.evaluate(flags.eval);
      result.eval = v === undefined ? null : v;
    } catch (e) { errors.push('eval: ' + e.message); result.eval = null; }
    await p.waitForTimeout(+(flags.after || 4000));
  }
  if (flags.metrics) {
    // Never sample a half-built city: wait for the page's own __ready flag first.
    try { await p.waitForFunction(() => window.__ready === true, null, { timeout: +(flags.readyTimeout || 900000), polling: 500 }); }
    catch (e) { errors.push('metrics: page never set __ready (' + e.message + ')'); }
    const load0 = os.loadavg()[0];
    try { result.metrics = await collectMetrics(p, +(flags.frames || 120)); }
    catch (e) { result.metrics = { error: e.message }; }
    // Host 1-min load average before/after timing: frame ms are only comparable at similar load.
    result.metrics.hostLoad = [load0, os.loadavg()[0]].map(x => Math.round(x * 10) / 10);
    result.metrics.hostCpus = os.cpus().length;
  }
  await p.screenshot({ path: out, timeout: +(flags.shotTimeout || 180000) });
  result.errors = errors;
  console.log(JSON.stringify(result, null, 1));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
