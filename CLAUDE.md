# Metropolis 2140

A procedurally generated island megacity in the year 2140, rendered in the browser with three.js r128.
The product north star ("the idea") lives in `ROADMAP.md` — read it before starting work and keep changes in service of it.

## Layout
- `index.html` — the whole experience (HTML + CSS + JS in one file). Current version.
- `archive/metropolis-v1.html` — the earlier present-day version, kept for reference. Don't edit.
- `ROADMAP.md` — vision, backlog, sprint. Owned by the PM agent.
- `tools/shot.js` — headless render harness (routes the three.js CDN to the local npm copy).
- `.claude/agents/` — the team: `pm`, `render-dev`, `gameplay-dev`, `perf-qa-dev`.

## Hard constraints
- Stays a single self-contained `index.html` that can be published as a claude.ai artifact.
- External scripts only from pinned `cdn.jsdelivr.net/npm/three@0.128.0/...` URLs; fonts only from Google Fonts. No build step.
- Must work on phones: touch controls, `isMobile` quality caps, safe-area insets, no horizontal scroll.
- Deterministic city: generation uses the seeded `rand()`; don't swap in `Math.random()` for layout.

## Verifying a change
```
cd tools && npm install   # once; installs three@0.128.0 locally
node tools/shot.js index.html tools/out/x.png --wait=25000 --w=1280 --h=800   # short side <700px triggers the phone tier
node tools/shot.js index.html tools/out/fly.png --wait=25000 --eval="document.getElementById('fly').click()"
```
Add `--metrics` for draw calls/triangles/frame ms, `--mobile` for an iPhone preset (390x844, touch).
Exit code is non-zero if the page logged JS errors. Software GL is slow (~45s); that's expected.
Look at the PNG (Read tool) — a change isn't done until you've seen it render.

## Team workflow
1. PM picks the sprint in `ROADMAP.md`; each ticket has one owner and a code region.
2. Devs work only inside their ticket's region, verify with `tools/shot.js`, and report before/after screenshots.
3. Parallel devs use separate worktrees; changes merge back one ticket at a time, re-verified after each merge.
4. PM updates ticket status in `ROADMAP.md`.
