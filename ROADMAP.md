# Metropolis 2140: Roadmap

Owner: PM. Scope: `index.html` (2,181 lines at `7ec5f9e`, one `boot()` closure). Verification: `node tools/shot.js` (headless SwiftShader, ~45 s per shot).
Line numbers below are for `7ec5f9e`. Section banners (`/* ---------- … ---------- */`) are the stable anchors; prefer them when lines drift.

## The idea

Metropolis 2140 is Manhattan 230 years from now: the same island, the same street grid, the same bridges and the same two
landmark footprints as v1 (v1's stepped Empire-State tower and WTC-style tower became the twisting megatower and the crystal needle).
The loader states the theme outright: the 1910 skyline sinks and the neon city rises. The fantasy is **watching a living future city
breathe, and then dropping into it**: orbit it as a calm diorama at dusk or night, then take a flying car down between the towers and
feel its scale. Every change should make the city more legible, more alive, or more inhabitable. Changes that turn it into a
different game do not belong here.

## Current state (after Sprint 1 + QA round 1)

- **Orbit view: strong.** After M-002 the night and dusk orbits read clearly (hero spires, maglev ring, window grids). All three QA personas
  loved it. Remaining roughness: the searchlight beams become a "pile of sticks" from top-down views (Q6-14a).
- **Loader: loved, but rigid.** The 1910→2140 story is the best statement of the idea. It has a hard 6.8 s floor (line 189), can't be skipped,
  collapses to its last frame under reduced motion, and its caption never says what the story is.
- **Fly mode: the weak link.** It works and nothing dead-ends, and Boost is a hit. But the street is blown out to white, the car moves before you
  touch it, mouse-only users can't steer at all, the touch stick stalls into walls, the chase camera ends up inside buildings, and the
  key hint is unreadable. The "drop into it" half of the idea currently loses people within a minute.
- **UI chrome:** plain-word chips work for adults but are small (31-37 px), carry no icons, follow the OS theme rather than the scene, and
  "Orbit" and the HUD "Night" button are ambiguous.
- **Hunt mode** is hidden behind `#hunt` (M-003, owner decision: hide, don't cut). Its code (≈1814-2060) stays in the file but is off-vision:
  no work, no fixes.
- **Code health:** `drawRadar` reads `hunt`/`cur` before their declarations. `B` is mutated after the instanced city mesh is built. `isMobile`
  is a UA sniff whose branches consume the seeded `rand()`, so **phones generate a different city** (M-004).

## Risks

1. **Legibility collapse.** Each new set piece subtracts legibility. Set pieces stay frozen.
2. **Phone performance is unmeasured.** Shadows at 2048², full-res bloom, CPU drone show, no adaptive quality. M-001 provides the numbers, and M-004 acts on them.
3. **Single-file collisions.** Three agents share one file. Work by region, keep section banners, never reformat, and merge one ticket at a time.
4. **Harness blind spots.** No sound, no real frame rate, and the `dt` cap of 0.05 s makes held inputs simulate far less than wall time (QA saw about 1 fps).
   Feel-related criteria must be checked by reading values through `--eval` (M-001), not by watching.
5. **Artifact constraints.** It must stay self-contained, use pinned three@0.128.0 from jsDelivr only, and Google Fonts only.

## QA round 1 (personas: age 6 touch, age 40 casual, age 75 cautious; reports in `qa/`, shots in `qa/shots/`)

Build `7ec5f9e`, with zero JS errors in every run. Findings are cited by persona ID and folded into the tickets below.

**Top 5 cross-persona issues**
1. **Flying fights you.** The car moves on its own at spawn, mouse users have no way to steer, the touch stick stalls and turns into a wall, impacts stop the car dead, and B does nothing without W.
   (Q75-01, Q75-02, Q40-08, Q6-01, Q40-05, Q40-06, Q40-15) → M-006, M-016
2. **The street is blown out, so the key hint can't be read.** The hint is white 13 px text on a near-white road, written in gamer jargon, and it never mentions the arrow keys.
   (Q40-03, Q75-03, Q40-20, Q6-09, Q6-11) → M-007 (glare), M-006 (hint)
3. **The chase camera goes inside buildings.** The screen turns black or becomes a wall, and there is no visible way out. (Q40-01, Q6-01, Q40-05) → M-017
4. **Controls are small, text-only, and ambiguous.** Targets are 31-37 px with no icons. "Fly a car" isn't prominent. "Orbit" looks like a fourth mood. The HUD "Night" button actually switches *to Day*.
   (Q6-02, Q6-03, Q6-04, Q75-10, Q75-08, Q40-12, Q40-11, Q75-09, Q75-07) → M-018
5. **The HUD ignores the scene and the screen.** Pale OS-theme panels sit over a night city, the gauge reflows at 3 digits, the compass overlaps the gauge, and in phone landscape the radar sits on top of Boost.
   (Q6-08, Q40-13, Q6-10, Q40-10, Q6-07) → M-008

Next tier: reduced-motion gaps (Q75-04, Q75-05 → M-019, M-010) and a loader that can't be skipped or understood (Q6-05, Q75-05, Q75-06 → M-010).

**What all three enjoyed (protect it; any change that degrades these is a regression)**
- **The night and dusk orbits** are share-worthy (Q6-14, Q40-17, Q75-13). Don't add set pieces or beams on top of them.
- **The 1910→2140 loader story** (Q75-12 and the Q40 session). M-010 must keep it intact on the first visit.
- **Boost with speed lines and the FOV kick:** "the best part" (Q6-13, Q40-19). Only reduced motion may turn the FX off.
- **Safe, predictable Exit.** Esc or Exit returns to the exact orbit view you left, and mashing never creates a dead end (Q75-14, Q6-16, Q40-18).
- **Plain-word buttons** for adults (Q75-15). M-018 adds icons *beside* the words and doesn't replace them.

**Not taken (with reason)**
- Hunt-only findings Q40-02 (Exit pushed off screen by the hunt panel), Q40-07 and Q40-14. Hunt is off-vision and hidden. The general rule "Exit never leaves the screen" is still enforced in M-008.
- Q40-04, retention through scores, goals and saved progress: this is a different game. A "postcard" PNG of the current orbit is on-idea, so it's parked as P2 M-021.
- Q6-12: not a bug (a capture taken mid-transition).

## Backlog

Priority: P0 = this sprint/next, P1 = next two sprints, P2 = later or only if cheap. "Shot" means `node tools/shot.js index.html tools/out/<name>.png --wait=25000 --w=960 --h=600`,
and every shot also requires `"errors": []`. "Fly shot" adds `--eval="document.getElementById('fly').click()"`. Criteria that read values rely on M-001's printed `--eval`.

### Done
- **M-002 Readable skyline** (render-dev) ✅ done. This also fixed the sky shader's missing `<encodings_fragment>`, which had made every standard material black. Before-images taken before `7ec5f9e` are invalid.
- **M-003 Hunt behind `#hunt`** (gameplay-dev) ✅ done. Owner decision: hide it, don't cut it. There is no dock button. `huntEnabled()` checks `location.hash==='#hunt'`.

### P0

**M-001 Harness: metrics, phone preset, printed eval** (perf-qa-dev) ✅ done 🔶 in-progress
Why: every other ticket needs numbers and a phone view to be verifiable, and perf is the biggest unknown.
- `shot.js --metrics` prints JSON with `calls`, `triangles`, `geometries`, `textures`, mean/p95 frame ms over 120 frames, shadow-caster count and `isMobile`.
  `window.__m2140={renderer,camera,controls,info()}` hook (loop region 2160-2181 only).
- `--mobile` emulates 390x844, DPR 3, touch and an iPhone UA. After clicking `#fly`, the stick and Boost/Up/Down are visible. The `--eval` result is printed in the JSON.
- Baselines for desktop orbit, desktop fly and mobile orbit are appended to this file.

**M-014 Designed flying car** (render-dev) ✅ done (owner request). The car is 18.5k triangles and 94 meshes; M-004 may merge its static parts for phones.
Why: the car is the player's body in the "drop into it" half, and it must read at chase distance.
- Region: car section 1383-1430 only. Fly shot: the car's silhouette reads at chase distance in Night and Dusk. Car emissives stay at or below the bloom threshold set by M-007, and
  `--metrics` triangles rise by less than 5%. No edits to cockpit, radar or dash (1431-1554) in this ticket.

**M-007 Street-level glare** (render-dev) ⬆ P0 · Sprint 2
Why: every persona's fly screenshots are blown out to white. This hides the car, kills the hint (top issue 2) and turns "between the towers" into fog. (Q40-20, Q6-09, Q40-03, Q75-03)
- Region: lamp heads and blade signs 1171-1217, LED banner colour at ~1273, the lamp-pool shader 1657-1665, and the mood table bloom values 2108-2130.
- Fly shot at Night and Dusk: no single bloom blob covers more than 3% of the frame, the road under the car is not near-white (mean luminance of the bottom third below 0.6 by eye or a pixel check), and lamp *pools* remain visible.
- The default orbit shot is unchanged in character (window grids and hero spires still read, as in the M-002 shots). `--metrics` calls do not increase.

**M-006 Fly mode: the first ten seconds** (gameplay-dev) · Sprint 2 ✅ done
Why: "dropping in" should be a reveal you control. Today the first frame is a glare canyon, the car is already moving, and mouse users can't steer.
(Q75-02, Q75-01, Q40-08, Q75-03, Q40-03, Q40-06, Q75-11, Q6-11, Q75-15, Q40-15, Q6-01)
- Region: `enterDrive` 1711-1721, `.keys` CSS 121, the `pointer:coarse` rule at 130, hint markup at 214, and the stick and vbtns markup at 219-220. **Not** `updateDrive`.
- Spawn hovering at **0 km/h** on a rooftop pad (`PADS`) at 120-200 m, facing the megatower. Fly shot: the gauge reads `0` and altitude reads 120-200, with the car and megatower in frame and lit streets below.
- The district name toasts at spawn ("Downtown, Manhattan").
- Mouse users can fly: on `pointer:fine` the stick and Up/Down/Boost are shown until the first key press (they already take pointer events). There is a "Steer" label under the stick.
  A desktop fly shot shows them.
- The hint sits on a dark pill at ≥ 16 px and leads with the arrow keys: "Arrow keys: steer and speed · Space/Shift: up/down · B: boost · Escape or Exit: back to city".
  It fades after about 8 s. Fly shot: the hint is legible.
- The Exit-restores-orbit behaviour (Q75-14) is unchanged. Verify with the eval `fly.click(); exitBtn.click()` and compare to the orbit shot.

**M-004 Phone render budget** (perf-qa-dev; render-dev reviews). Blocked on M-001 baselines.
Why: "must work on phones" is a hard constraint, and today it is untested.
- Region: renderer 293-315, post 2094-2107, and `isMobile` branches. Mobile tier: shadows off or 1024² static, bloom at half resolution, DPR cap ≤ 1.5. At Night, `sun.castShadow` is off on all tiers.
- With `--mobile --metrics`, calls and ms/frame are each ≥ 30% below the M-001 mobile baseline. Decimation uses a second seeded RNG, so the mobile and desktop orbit shots have the same tower layout.

### P1

**M-016 Steering that doesn't fight you** (gameplay-dev)
Why: the car should go where a child's thumb, or anyone's, means it to. (Q6-01, Q40-05, Q40-06, Q40-15)
- Region: `updateDrive` input and physics, 1756-1776.
- Touch auto-cruise: a mostly-sideways stick keeps ≥ 20 km/h forward. Check with eval: dispatch pointer events holding `#stick` at its left edge for 60 frames, then read `#spd` ≥ 20.
- B implies forward. The eval `KeyB` alone raises speed.
- Wall impacts keep the tangential velocity (slide) with a small bounce. Eval: driving into a facade at 150 km/h leaves speed ≥ 30% after 6 frames.
- Climb rate ramps when Up is held. Eval: Space held for 48 frames gains ≥ 25 m.

**M-017 Chase camera never enters buildings** (gameplay-dev)
Why: a black screen is the one true dead end in the product. (Q40-01, Q6-01)
- Region: chase-camera block 1791-1799.
- The camera ray from the car to `_want` is tested with `collide()` and the camera is pulled in and up when blocked. Eval: steer into a facade (`age40-k-climb.png` repro), then shot: the car is visible and less than 20% of the frame is black.

**M-008 HUD follows the scene and the screen** (gameplay-dev)
Why: pale panels over a night city break the mood, and colliding widgets look broken. (Q6-08, Q40-13, Q6-10, Q40-10, Q6-07, Q40-02 general rule)
- Region: CSS tokens 11-25 and HUD CSS 108-160 (excluding 121/130 if M-006 has not merged).
- In-scene UI uses dark tokens at Night and Dusk regardless of `prefers-color-scheme`. A light-scheme fly shot shows dark translucent panels.
- The gauge has a fixed width with `nowrap`. The compass sits below the gauge at ≤ 700 px. A short-height media query keeps the radar off Boost. Shots: `--mobile` fly with Boost
  (3-digit speed) and 844x390 landscape fly show no overlaps. Exit stays fully on screen at 320 px width.

**M-018 Controls anyone can use** (gameplay-dev; can be split with M-008 by region)
Why: the 6-year-old can't read the chips and the 75-year-old can't see them, yet both want to use them. (Q6-02, Q6-03, Q6-04, Q75-10, Q75-08, Q40-12, Q40-11, Q75-09, Q75-07, Q6-06)
- Region: dock CSS 37-46 and title CSS 36, dock/HUD markup 195-209, UI JS 2146-2158, and the `lightBtn` handler 1735.
- Icons beside the words (sun, sunset, moon, ⟳, car, ✕, speaker, ↑ ↓ ⚡). The words stay. All targets are ≥ 44 px, sizes are in `rem`, and `user-select:none` / `-webkit-touch-callout:none` are set on hold buttons.
- "Fly a car" becomes a distinct primary button. "Orbit" is renamed "Slow spin" and styled as a toggle, not a selected chip. A "Reset view" button eases back to the default orbit.
- The HUD mood button reads "Lighting: Night ▸" (an action, not a state). The orbit hint is ≥ 15 px on a dark backing.
- Shots: the default orbit at 390x844 has a one-row dock (or a clear two-row layout with Fly prominent). In the orbit shot only the active mood looks selected.

**M-010 Honest loader** (perf-qa-dev) · Sprint 2 ✅ done
Why: the 1910→2140 story is the idea's best moment. It should explain itself, survive reduced motion, and not tax repeat visits. (Q6-05, Q75-05, Q75-06, Q75-12, Q40 session)
- Region: loader CSS 47-106, reduced-motion rule 182, head JS 185-191, loader HTML 222-269.
- The first visit plays the full sequence. Repeat visits (per-viewer `localStorage` in try/catch) or a tap after `__ready` dismiss it. Shot with `--wait` just after ready
  on a repeat visit: the loader is gone within 500 ms.
- The caption changes per era ("1910: the brick city" … "2140: the neon city rises") at ≥ 16 px. Loader shots at 1/3/5 s show the three captions.
- Under `prefers-reduced-motion`, 3-4 still frames crossfade slowly instead of cutting to the end. A reduced-motion loader shot at 1.5 s shows 1910, not 2140.

**M-019 Reduced motion and comfort in fly mode** (gameplay-dev)
Why: calm is part of the idea, and the cautious visitor is exactly who turns reduced motion on. (Q75-04, Q40-16)
- Region: the FX lines in `updateDrive` 1800-1806 (shake, FOV, speedfx) and the hit flash in the collide branch 1772-1775.
- Under reduced motion there is no speed-line overlay, no FOV kick and no shake, and a soft cue replaces the red flash. Eval with emulated `reducedMotion:'reduce'` while boosting: `#speedfx` opacity 0.
- On `visibilitychange` to hidden, the AudioContext suspends.

**M-005 Two eras, one city** (render-dev)
Why: the loader promises 1910→2140. The city should show old bones under new light.
- Heritage low-rise (`style 0`, city shader 366-514) gets warm windows, while modern towers keep cool LEDs. Dusk orbit shot: a warm band at street level and cool towers above.
- Cornices and fire escapes read in a close orbit shot (~150 m, camera set through `__m2140`).

**M-009 Regression pack** (perf-qa-dev)
- `tools/check.sh` runs orbit-night, orbit-dusk, fly and mobile-orbit, fails on any error, and prints the metrics diff against the stored baseline (±10%). Its output is pasted on every merge.

### P2

**M-011 Default mood: Night vs Dusk** (render-dev). QA split: Q6-14 keep Night, while Q40-17 and Q75-13 favour Dusk. Decide after M-005 using side-by-side shots, and record the decision here.
**M-012 Orbit as a slow landmark tour** (gameplay-dev). The auto orbit drifts past the megatower, the bridges, Liberty and the park. Shots at `--after` 0/15/30 s show three landmarks, and any drag hands control back immediately.
**M-013 Drone show to GPU** (perf-qa-dev). Move the 900-point morph to a vertex shader. The dusk orbit shows no visual change and mobile ms/frame drops.
**M-020 Cockpit view cleanup** (render-dev, after M-014). The dash neon blooms into a slab, the dash text duplicates the HUD, and in portrait the dash is cropped (Q40-09). Region: cockpit/dash 1431-1554.
**M-021 Postcard** (gameplay-dev). One button saves a PNG of the current orbit view, which is the thing Q40 wanted to share. Only if cheap: `preserveDrawingBuffer` must not cost perf.
**Watch:** searchlight beams read as sticks from top-down views (Q6-14a, region 1018-1038). Fold this into M-012 or M-011 if it is touched anyway.

### Blocked / pending owner decision

**M-019 Populate Central Park** (render-dev #2) ✅ done (owner request, 2026-11-24). Follow-up: street-lamp rows still cross the park; the fix is assigned to M-007.
Why: the park is the city's green heart and the one place where the two eras meet at human scale. Today it's a flat slab with ponds and trees.
- Path network, recognisable Central Park places reimagined for 2140, and people, robots, dogs and boats that move through the park.
- Its own seeded RNG, so the rest of the city doesn't reshuffle. Night lighting that reads from the orbit view. Phone tier capped.
- Region: the park section plus a new park-life section after it. At most one call line in the loop.

**M-020 Detailed monorail** (render-dev #3) ✅ done (owner request). The guideway is an I-beam on tapered T-pylons. Cars have shaped bodies, a shader-drawn window band with lit interiors and passenger silhouettes, doors, route 21/40 livery and bellows between cars. Bullet-nose end cars. Cost: +3 draw calls, +66k triangles. Follow-up: the skirts look heavy in Day; optional stations were skipped.

**M-021 Central Park from reference photos** (render-dev) ⏸ paused (patch in wip/) (owner request, 2026-11-25). Rework the park to match the owner's 5 reference photos: the real south-to-north layout from the aerial, Bethesda Fountain with the Angel, the park drive with a carriage, Bow Bridge with rowboats, the Mall's elm canopy, and autumn foliage. The 2140 layer stays, but subtle. The photos are kept out of the repo.

**M-015 Real NYC/NJ footprints** (render-dev + gameplay-dev). ⛔ Blocked on network only: owner approved the scope (Manhattan + Jersey City + Hoboken) on 2026-11-24. Data source is OpenStreetMap; Google 3D Tiles was ruled out because its terms forbid extracting building geometry.
Rebuild the city from OpenStreetMap building footprints and heights for Manhattan plus the Jersey City/Hoboken waterfront, with 2140 upgrades grown from each real building.
- It would replace geography 515-538 (the island outline), procedural buildings 539-667 and the two hero placements, and it would feed instancing 668-692, the collision/radar `B`, `district()` 1495 and the set-piece anchors (bridges, pads, Liberty).
  The city shader, moods and fly mode stay.
- The data has to be embedded in the single file, so a size budget is needed (simplified footprints, quantised). Generation stays deterministic.
- **ODbL:** a visible "© OpenStreetMap contributors" credit (dock or loader) and a link to the licence. Derived data has share-alike implications, which the owner must accept.
- Scope note: the NJ waterfront extends beyond "the same island" in the idea. If it's approved, the idea text gets updated first.

**Deferred (do not start):** new landmarks or set pieces, weather, ambient orbit audio, more traffic layers, any mode beyond Fly, scores, goals or saved progress.

## Sprint 1 (closed)
M-002 ✅, M-003 ✅, M-001 carried into Sprint 2.

## Sprint 2

Status 2026-11-25: ⏸ PAUSED until credits refresh; M-007 and M-021 saved in `wip/`. Earlier: 2026-11-24 18:11 EST resumed after the owner's pause. M-006 and M-010 continue from the patches in `wip/`. M-020 Detailed monorail (render-dev, owner request) runs alongside. Line numbers below predate the M-014 car merge (+~100 lines after line 1383); find regions by their section comments.
: make "dropping in" work

Carry-overs occupy regions that nobody else may touch: **M-001** (`tools/shot.js` plus the loop end 2160-2181) and **M-014** (car section 1383-1430).

| Dev | Ticket | Regions of `index.html` touched | Starts |
|---|---|---|---|
| render-dev | **M-007** Street-level glare | 1171-1217, ~1273, 1657-1665, mood table 2108-2130 | after M-014 merges, or in a second render worktree now |
| gameplay-dev | **M-006** Fly: first ten seconds | CSS 121, 130; HTML 214, 219-220; `enterDrive` 1711-1721 | now |
| perf-qa-dev | **M-010** Honest loader | CSS 47-106, 182; head JS 185-191; loader HTML 222-269 | after M-001 merges |

**Why these three:**
- **M-007** removes the root cause of top issue 2 and is a precondition for judging any fly-mode ticket. Every fly screenshot from all three personas is blown out.
  It sharpens existing lighting and adds no features.
- **M-006** is the smallest change that hits top issue 1 (no car moving on its own, mouse users can fly by reusing the existing stick) and top issue 2 (a readable hint).
  It also softens issue 3, because spawning in open air at 150 m removes the "first turn into a wall". It stays out of `updateDrive`, so M-016/M-017 can follow without conflict.
- **M-010** covers the "protect the loader" item and three personas' findings, sits in a fully isolated region, and is cheap.

**Why not the others yet:**
- M-016/M-017 edit `updateDrive`. They should land after M-006 changes the spawn context and M-007 makes the results visible.
- M-008/M-018 are broad HUD/dock CSS+HTML surgery. They overlap M-006's hint and stick lines, and gameplay-dev has one slot.
- M-004 is blocked on M-001 baselines and would collide with M-007 on bloom settings. It goes first for perf-qa-dev in Sprint 3.

**Coordination:** M-007 must not edit car emissives (1383-1430). It posts its new bloom threshold for M-014 to respect. M-006 must not touch HUD CSS outside 121/130.
Sprint exit: all tickets merged one at a time. After each merge, re-shoot orbit night, orbit dusk, fly and `--mobile` fly, all error-free. QA personas re-run their fly sessions.
Sprint 3 (queued): M-016 + M-017 (gameplay-dev), M-004 (perf-qa-dev), and M-008/M-018 split once M-006 is in.

## M-001 baseline (2026-11-24, perf-qa-dev)

Measured on the pre-M-002 build. Re-measure on main before M-004 uses these as its target.

`node tools/shot.js index.html <out> --wait=40000 --metrics [--mobile] [--eval="document.getElementById('fly').click()"]`, Night mood, 120 timed frames.
Counts are for one full frame (shadow pass plus every composer pass, so `info.autoReset` is off for that frame). They are deterministic and are what later tickets diff against.
Frame ms are SwiftShader on a shared 4-CPU host under heavy load from parallel agents (`hostLoad` = 1-min load avg before/after timing). Compare them only against runs at similar load.

| View | calls | triangles | points | geometries | textures | programs | shadow casters | shadow map | isMobile | DPR | frame ms mean / p95 | hostLoad |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| desktop orbit 1280x800 | 545 | 6,347,656 | 25,347 | 312 | 16 | 31 | 137 | 4096² | false | 1 | 16,876 / 25,245 | ~8.6 |
| desktop fly 1280x800 | 505 | 6,322,498 | 25,487 | 349 | 16 | 40 | 137 | 4096² | false | 1 | 36,045 / 66,559 | 37 → 11 |
| mobile orbit 390x844 @3x | 385 | 3,718,924 | 17,682 | 233 | 16 | 31 | 137 | 2048² | true | 1.5 | 12,423 / 15,810 | 34 → 23 |

Notes: the mobile tier still renders shadows (2048², 137 casters) and ~3.7 M triangles a frame, which is the M-004 target.
`isMobile` is also true for any viewport narrower than 700 px on its short side, so the `--w=960 --h=600` shot in CLAUDE.md runs the mobile tier.
