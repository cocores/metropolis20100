# Metropolis 2140: Roadmap

Owner: PM. Scope: `index.html` (2,148 lines, one `boot()` closure). Verification: `node tools/shot.js` (headless SwiftShader, ~45 s per shot).
Screenshots referenced below were taken at 960x600 and live in `tools/out/pm-*.png` (gitignored).

## The idea

Metropolis 2140 is Manhattan 230 years from now: the same island, the same street grid, the same bridges and the same two
landmark footprints as v1 (v1's stepped Empire-State tower and WTC-style tower at `(-37.5,-165)` and `(-112.5,-1191)` became the
twisting megatower and the crystal needle, lines 582-595). The loader states the theme outright: the 1910 skyline sinks and the
neon city rises (HTML 222-269). The fantasy is **watching a living future city breathe, and then dropping into it**: orbit it as a
calm diorama at dusk or night, then take a flying car down between the towers and feel its scale. Every change should make the
city more legible, more alive, or more inhabitable. Changes that turn it into a different game do not belong here.

## Current state

**Boot and loader** (CSS 47-106, HTML 222-269, JS 185-191, 2144-2145). The 1910→2140 CSS animation is the best statement of the idea
in the file. A hard 6.8 s floor (line 189) holds the loader up even when the scene is ready. A WebGL failure is handled (293-294).

**Renderer, sky, moods** (286-352, 2061-2111). ACES, PCFSoft shadows at 4096² (2048² mobile) covering ±1900 units, PMREM env from
the sky shader, UnrealBloom plus gamma, and MSAA RT on desktop WebGL2 only. Three moods tween smoothly (2103-2110). Night is the default (v1 defaulted
to Dusk). *Rough:* in `pm-orbit.png` there is a hard horizontal seam where the fogged water/land meets the sky dome (fog colour
≠ sky horizon colour, 304/2079 vs 328). The sun still casts full-res shadows at Night (`sunI:0.5`). The PMREM is rebuilt every 14 frames during
mood tweens (2132). `pm-dusk.png` reads clearly better than Night: the towers form a legible silhouette and the hero spires
stand out, though the horizon seam is even sharper there.

**City generation and materials** (363-672, 956-1045, 1144-1274). Seeded RNG (288). Avenue/street grid, two hero towers, sky bridges,
boroughs, instanced boxes with one big `onBeforeCompile` shader (365-474) that draws LED windows, neon edges and crowns, shopfronts,
lamp pools *and* v1-era heritage detail (brick, sills, quoins, cornices: 411-445; fire escapes and AC units: 1191-1274).
*Off-vision:* from the default orbit the city reads as dark silhouettes plus rainbow noise. Window grids barely show, searchlight
beams (999-1010, ~22% of supertalls plus heroes) form "spaghetti", and the hero towers do not stand out. The heritage layer, which is the
v1 DNA and the "two eras" story, cannot be seen at any orbit distance. All LEDs are cool white or amber (449), and v1's warm windows are gone.

**Set pieces** (674-1127, 1528-1629). Park + lakes, five NYC bridges (701-859, very detailed), maglev loop, ground and flying traffic,
60 holo billboards, rooftop pads, drone light show (900 points updated on the CPU every frame, 1062-1072), airships, hydrofoils, harbour
biodome, Liberty 2140. *Rough:* the scene is at saturation. Each new layer now subtracts legibility rather than adding it.

**Street life** (1276-1354). People, robots and delivery bots walk block perimeters, and updates are throttled when the camera is far (1336). Good.

**Fly mode** (1356-1526, 1654-1785). The car is detailed, and there are chase and cockpit views, trails, synth engine audio, a radar, a compass, district toasts
(1468-1481, which make the NYC identity explicit), roof landing, collision grid, touch stick and buttons. *Rough:* the spawn is at 18 m in a dark Downtown
avenue (1686). In `pm-fly.png` the first frame is a grey canyon with lamp heads blown out into huge bloom blocks (MeshBasic ×1.6,
1150/1177), and the car is barely readable. The HUD uses OS light/dark tokens, so it shows pale panels over a night city in light-theme browsers.

**Hunt mode** (CSS 157-180, HTML 203/208/215-218, JS 1787-2059 ≈ 330 lines, plus hooks at 1509, 1696, 2001, 2137). Rogue drones and walkers,
wanted-level stars, cash bounty, lock-on, "Wrecked". In `pm-hunt.png` (8 s in) no rogue is on screen yet, and the HUD gains a health/stars/cash panel. It works, but it is **off-vision**: it turns the future city into a GTA arena and
puts a red "Hunt rogue AI" button in the main dock beside the mood controls (203). It can't be entered from fly mode because
the dock is hidden while driving (181).

**Code health.** There is one closure with implicit ordering (`drawRadar` reads `hunt` and `cur` before their declarations, 1509/859). `B` is mutated
after the instanced city mesh is built (1620, 1654), so collision/radar and rendering disagree on what `B` means. `isMobile` is a UA sniff
(291), and its branches consume the seeded `rand()` (e.g. 1017, 1166), so **phones generate a different city** than desktop does from line ~646 on.

## Risks

1. **Legibility collapse.** The idea only works if the skyline reads at a glance. It currently doesn't at the default view, and adding more set pieces
   makes it worse. Mitigation: freeze new set pieces until M-002/M-005 land.
2. **Phone performance is unmeasured.** A 4096²/2048² shadow pass over thousands of instances, full-res bloom at DPR 1.5, ~3k car matrices,
   900-point drone CPU update and street life every frame, with no adaptive quality and no FPS number anywhere. The harness is SwiftShader,
   so absolute FPS is meaningless there. We need relative budgets (draw calls, triangles, ms/frame, shadow casters).
3. **Mode sprawl.** Hunt mode competes with the core fantasy for dock space, code (~15% of the file) and team attention. Every rendering
   change now also has to be checked against hunt FX.
4. **Single-file size.** At 156 KB and 2,148 lines, three agents editing one file will collide. Mitigation: work by line region (below), keep
   section banners intact, and rebase often. Never reformat.
5. **Harness blind spots.** `shot.js` reports only errors and a PNG. It can't assert numbers, emulate a phone, or print `--eval` results.
6. **Artifact constraints.** It must stay self-contained, use pinned jsDelivr three@0.128.0 only and Google Fonts only. Don't add a new CDN dependency
   for post-processing or stats.

## Backlog

Priority: P0 = this sprint/next, P1 = next two sprints, P2 = later or only if cheap. "Shot" means `node tools/shot.js index.html tools/out/<name>.png --wait=25000 --w=960 --h=600`
and always also requires `"errors": []`.

### P0

**M-001 Harness: metrics, phone preset, printed eval** (perf-qa-dev)
Why: every other ticket needs numbers and a phone view to be verifiable, and perf is the biggest unknown.
- `shot.js --metrics` prints JSON with `calls`, `triangles`, `geometries`, `textures` (from `renderer.info`), mean/p95 frame ms over 120 frames,
  shadow-caster count and `isMobile`. Index exposes a `window.__m2140 = {renderer, camera, controls, info()}` debug hook (loop region 2127-2142 only).
- `shot.js --mobile` emulates 390x844, DPR 3, touch, iPhone UA. In the PNG, the stick and Boost/Up/Down buttons are visible after clicking `#fly`.
- `--eval` result is printed in the JSON output.
- Baseline numbers for desktop orbit, desktop fly and mobile orbit are recorded in a short table appended to this file.

**M-002 Readable skyline at the default view** (render-dev)
Why: the first 5 seconds after the loader *are* the idea. Right now they read as noise.
- Default orbit shot: no visible horizon seam (sky horizon and fog colour match per mood, 304/328/2077-2079). Verify by eye at the
  sky/water boundary in `pm-orbit.png` vs the new shot.
- Searchlight beams cut to ≤ 6, limited to the two heroes plus the tallest supertalls, with lower alpha (552, 999-1010). The two hero towers are the
  two most identifiable shapes in the shot.
- Lit window grids are distinguishable on mid-distance towers (a viewer can count floors on at least 3 towers in the 960x600 shot).
- Same checks pass for `data-mode=dusk` and `data-mode=day` shots. `--metrics` draw calls do not increase.

**M-003 Hide Hunt mode behind `#hunt`** (gameplay-dev)  — owner decision 2026-11-24: hide, don't cut
Why: it is off-vision and costs ~330 lines, dock space and test surface. Fly mode stays as the "drop in" fantasy.
- Remove `#huntBtn` (203), the hunt CSS (157-180), HUD markup (`#huntBar` 208, `#cross`/`#lockBox`/`#killPop`/`#wreck`/`#fireBtn` 215-218)
  and JS 1787-2059 plus hooks at 1509, 1696, 2001, 2137. The code survives in git history.
- `grep -c "hunt" index.html` returns 0. File shrinks by ≥ 300 lines.
- Shots: default orbit (dock shows Day/Dusk/Night/Orbit/Fly only) and `--eval="document.getElementById('fly').click()"` both have zero errors,
  and the fly HUD shows no health, stars or cash.
- If the owner vetoes the cut, the fallback is to gate it behind `location.hash==='#hunt'` with no dock button. The same shots apply.

**M-004 Phone render budget** (perf-qa-dev, pairs with render-dev for review)
Why: "must work on phones" is a hard constraint, and today it is untested.
- Mobile tier: shadows off or a 1024² map with static-only update, bloom at half resolution, DPR cap ≤ 1.5 (298, 348, 2063-2072).
  Night disables `sun.castShadow` on all tiers (sun is 0.5 intensity).
- `--mobile --metrics`: calls and ms/frame are each ≥ 30% below the M-001 mobile baseline. The mobile orbit PNG is still recognisably the same
  skyline as desktop.
- Decimation in `isMobile` branches must not consume the city `rand()` (use a second seeded RNG). The mobile and desktop orbit shots
  show the same Manhattan tower layout.

### P1

**M-005 Two eras, one city** (render-dev)
Why: the loader promises 1910→2140. The city should show old bones under new light, which is what makes it *this* city and not generic cyberpunk.
- `style 0` (heritage low-rise, 428-445) gets warm 2700K-ish windows (v1 palette), while modern towers keep cool LEDs (449).
- Dusk orbit shot: a warm low band at street level and cool towers above, visible without zooming.
- Cornices and fire escapes still read in a close orbit shot (`--eval` setting `camera` via `__m2140` near 5th-Ave-equivalent, ~150 m).

**M-006 Fly mode: the first ten seconds** (gameplay-dev)
Why: dropping in should be a reveal, not a grey canyon.
- Spawn on a rooftop landing pad (`PADS`, 1031-1039) at 120-200 m, facing the midtown megatower (1684-1694). The first fly shot shows the car,
  the megatower and lit streets below.
- The intro toast names the district and gives one control hint. Exit restores the orbit camera exactly (1695-1703).

**M-007 Street-level glare** (render-dev)
Why: lamp heads, blade signs and banners (MeshBasic ×1.6-1.8, 1144-1189) bloom into huge blocks near the camera (`pm-fly.png`).
- In the fly shot, no single bloom blob covers > 3% of the frame. Lamp *pools* on the road (1630-1652) remain visible.

**M-008 HUD follows the scene, not the OS** (gameplay-dev)
Why: pale HUD panels over a night city break the mood (`pm-fly.png`, light-scheme headless).
- HUD and dock tokens switch with mood (Night/Dusk → dark panels, Day → light) regardless of `prefers-color-scheme` (CSS 11-25).
- Fly shot in a light-scheme context shows dark translucent HUD panels at Night.

**M-009 Regression pack** (perf-qa-dev)
Why: three agents in one file means regressions are certain.
- `tools/check.sh` runs orbit-night, orbit-dusk, fly and mobile-orbit, fails on any error, and prints the M-001 metrics diff vs the stored baseline (±10%).
- Every merged ticket has a check.sh run pasted in its PR.

**M-010 Honest loader** (perf-qa-dev)
Why: the 6.8 s floor (189) taxes every visit. The animation is lovely once, and tedious on reload.
- First visit plays the full 1910→2140 sequence. Repeat visits (per-viewer `localStorage`, try/catch) or a tap dismiss as soon as `__ready`.
- `--metrics` reports time-to-ready, and the loader is gone ≤ 500 ms after ready on a repeat visit.

### P2

**M-011 Default mood decision: Night vs Dusk** (render-dev)
Why: v1 defaulted to Dusk, and `pm-dusk.png` already reads better than the Night default. Decide using M-002/M-005 shots side by side and record the decision here.

**M-012 Orbit as a slow landmark tour** (gameplay-dev)
Why: "watch the city breathe". The auto orbit could drift past the megatower, the bridges, Liberty and the park drone show instead of one fixed ring (307-312, 2116-2120).
- Tour shot sequence (`--after` 0/15/30 s) shows three different landmarks. Any user drag hands control back immediately.

**M-013 Drone show to GPU** (perf-qa-dev)
Why: 900 points of trig per frame on the CPU (1062-1072) is a cheap win on phones. Move the shape morph into a vertex shader.
- No visual change in the dusk orbit shot, and `--metrics` ms/frame on mobile drops.

**Deferred (do not start):** new landmarks or set pieces, weather, ambient orbit audio, more traffic layers, any mode beyond Fly.
Revisit after M-002 and M-005 ship.

## Sprint 1

One ticket per dev, chosen so the line regions don't overlap:

| Dev | Ticket | Regions of `index.html` touched |
|---|---|---|
| render-dev | **M-002** Readable skyline | sky shader 316-343, city shader emissive 448-473, searchlight selection 551-552 & 999-1010, mood table 2075-2084 |
| gameplay-dev | **M-003** Retire Hunt mode | CSS 157-180, dock/HUD HTML 203, 208, 215-218, hunt JS 1787-2059, one-line hooks at 1509 (radar), 1696 (exitDrive), 2137 (loop) |
| perf-qa-dev | **M-001** Harness metrics + phone preset | `tools/shot.js` (whole file), plus a ≤ 5-line `window.__m2140` hook beside line 2139 |

Coordination notes:
- Line 2137 (gameplay drops `if(hunt.on)…`) and line 2139 (perf-qa adds the hook) are adjacent. perf-qa merges first, and gameplay rebases.
- render-dev must not touch 1787-2059 or HUD CSS. gameplay-dev must not touch the mood table.
- Sprint exit: all three merged, and `check`-style shots (orbit night, orbit dusk, fly, `--mobile` orbit) are all error-free with baselines recorded.
  M-004 and M-005 are queued next.
