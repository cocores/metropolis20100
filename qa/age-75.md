# QA: Metropolis 2140 for a 75-year-old visitor

Tester persona: 75, laptop with mouse/trackpad at 1366x768 (browser zoom sometimes 125–150%), sometimes a large-text iPad.
Reading glasses, prefers calm motion (reduced-motion may be on), not a gamer, cautious, curious about the city's history.
Build tested: `index.html` @ `7ec5f9e` (M-002 merged, 2181 lines). Headless Chromium + SwiftShader via scripts in the
scratchpad `qa75/` folder (CDN routed to `tools/node_modules/three`, fonts stubbed, so the fallback system font is what renders).

**Old vs new render.** Shots `age75-11-*` and `age75-12-*` were taken **before** M-002 (old, mostly black city). Treat them as
evidence for the UI chrome only (title and dock at 150% zoom with a dark OS theme). Everything else is from the current build.

## Session story
I opened the link and got a lovely little picture: an old sepia skyline with smoke and a ship. The years counted up from 1910 to 2140
and the old buildings sank while neon towers rose. The big year numbers were easy to read. The caption under them only said
"Building Metropolis 2140" in small grey type, so I wasn't sure what the picture was telling me. With "reduce motion" on I went
straight to the 2140 frame and missed the story altogether. Then the city appeared and it was beautiful. At Dusk the pink sky and
glowing towers looked like a postcard. The line "Drag to orbit, pinch or scroll to zoom" was tiny white text under the big title,
and I needed my glasses for it. The buttons along the bottom were clear words (Day, Dusk, Night, Orbit, Fly a car). But "Night"
and "Orbit" were both dark, so I couldn't tell which was "the one I'd picked". I didn't know what "Orbit" meant.

I clicked "Fly a car", twice to be safe. Nothing bad happened. But the car **was already moving** and I hadn't touched anything. The
street was dazzlingly bright, and the only instructions were a line of white text at the bottom, written in game-speak ("W/S speed,
A/D steer, Space climb, Shift descend…"), and I could barely see it against the glare. My mouse did nothing to steer. I didn't know
what "Esc" was. Luckily there was a dark "Exit" button at the top right, and it took me straight back to the same city view I'd
left. That was reassuring. Pressing the "Night" button up there changed the city to *Day*, which surprised me.

## Findings

| ID | Sev | What happened | Evidence | Suggestion |
|---|---|---|---|---|
| Q75-01 | major | **No way to fly with a mouse.** On desktop (`pointer:fine`) the touch stick and Up/Down/Boost buttons are hidden, and canvas drags and the wheel do nothing while driving (OrbitControls are disabled, and no mouse handlers feed `fwd`/`turn`). A mouse-only visitor cannot steer, climb or stop. | CSS 130 (stick only on `pointer:coarse`), JS 1713-1716, 1758-1760 (input comes only from keys/stick/vbtn) | Show the on-screen stick and Up/Down buttons for mouse users too (or click-and-drag-to-steer), at least until a key is pressed. |
| Q75-02 | major | **Car moves on its own on entry**: `drive.speed=12`, so the HUD shows 33–35 km/h with no input. With no way to control it (Q75-01), a cautious user will feel they've "set something off". | JS 1713; `age75-31-zoom150-fly-start.png` (35 km/h, no keys pressed) | Spawn at 0 speed, hovering. Show a short first-time card such as "You're hovering. Use the arrows to move. Exit returns you to the city view." |
| Q75-03 | major | **Key hint is unreadable and in jargon.** 13 px white text with only a text shadow sits on the very bright street, and it disappears in the render. It names W/S, A/D, Shift and Esc but never the **arrow keys**, which do work (line 1758) and are what a non-gamer would try. | HTML 214, CSS 121; `age75-31-…png`, `age75-32-…png`, `age75-42-…` (touch: hint hidden and nothing replaces it) | Put it on a solid panel at ≥16 px. Lead with "Arrow keys to steer and speed up · Page Up/Down or Up/Down buttons to climb · Exit button to leave". Spell out "Escape key". (The brightness itself is the known M-002 follow-up.) |
| Q75-04 | major | **Reduced motion is only partly honoured.** The orbit auto-rotate and the loader animation are switched off, but in fly mode the speed-line overlay still appears (`speedfx` opacity 0.35 measured while boosting with `reducedMotion:'reduce'`), FOV still zooms on boost (+10°), the camera shakes on collisions (`Math.random` jitter), and a red flash plays on hits. | JS 1800, 1801, 1805, 1773; `age75-32-zoom150-boost.png` (streaks at left edge) | Under `prefers-reduced-motion`: no speedfx, no FOV kick, no shake, a soft hit cue instead of a red flash. |
| Q75-05 | minor | **Reduced motion skips the whole 1910→2140 story.** The animations collapse to their final frame, so the loader shows only "2140" for ~7 s. The best history moment in the product is lost for exactly the audience that loves it. | CSS 182; `age75-0R-loader-1500ms.png` vs `age75-0L-loader-1000/3000/5200ms.png` | Under reduced motion, crossfade 3–4 still frames (1910 / 1960 / 2020 / 2140) slowly instead of cutting to the end. |
| Q75-06 | minor | **The loader caption doesn't explain the story.** "Building Metropolis 2140" (14 px, #5a5672 on #e4e3f0 = 5.5:1) never says *what* the picture shows. After the loader there is no history text anywhere. | CSS 92, HTML 268 | Caption per era, e.g. "1910: the brick city… 2140: the neon city rises", at ≥16 px. Optionally add an "About this city" line or button in the dock. |
| Q75-07 | minor | **Instructions are 13 px over the 3D scene** ("Drag to orbit, pinch or scroll to zoom", 86% white plus a shadow). They read OK over the night sky but are weak over the Day sky. | CSS 36, HTML 195; `age75-02-orbit-night.png`, `age75-33-…after-exit.png` (Day) | 15–16 px on a subtle dark backing; write "Drag with the mouse to look around · scroll wheel to zoom". |
| Q75-08 | minor | **"Orbit" is unclear and looks like a 4th lighting mode.** It is a toggle for slow auto-rotation, but its pressed style is identical to the selected mood, so "Night" and "Orbit" both look selected. The dock's aria-label is "Lighting". After any drag it silently resumes rotating 5 s later. | HTML 197-203, CSS 44, JS 2153; `age75-02-…png`, `age75-41-ipad-dusk-orbit.png` | Rename it "Slow spin: on/off" (or a ⟳ icon with a label), style the toggle differently from the mood segment, and add a "Reset view" button for "how do I get back". |
| Q75-09 | minor | **In-flight "Night" button is a state label, not an action.** Clicking "Night" switched to **Day** (measured: `Night -> Day`). It cycles Day→Dusk→Night. | HTML 209, JS 1735 | Label it "Lighting: Night ▸" or use the same three-way control as the dock. |
| Q75-10 | minor | **Small targets and text.** Dock buttons are 37 px tall at 14 px, HUD buttons are 34 px tall at 13 px, gauge labels ("km/h", "metres up") are 12 px, and compass letters are 12 px. Everything is in `px`, so the iPad's Larger Text setting won't enlarge any of it (only browser zoom does). | CSS 42, 116, 118, 136; measured via `getBoundingClientRect` | Minimum 44 px targets and 16 px body/labels. Use `rem` so user text settings apply. |
| Q75-11 | minor | **No "you are here" in fly mode until it's too late.** No district toast appeared in either fly run (the district check runs every 15th frame, and frames are slow headless, so this may differ live). The radar has no labels. | JS 1782 region (district toast); `age75-31`, `age75-42` | Show the district name right at spawn ("Downtown, Manhattan") and a "Back to overview" hint. |
| Q75-12 | delight | **The 1910→2140 loader** is charming and legible: the year numerals are 62 px, #16132a on #e4e3f0 = 14.3:1. | `age75-0L-loader-1000ms.png`, `…3000ms.png`, `…5200ms.png` | Keep it, and lengthen the story beats (Q75-05/06). |
| Q75-13 | delight | **Dusk is gorgeous**: a calm postcard view with a legible skyline. The new M-002 Night is also far more readable than the old black render. | `age75-41-ipad-dusk-orbit.png`, `age75-02-orbit-night.png` vs old `age75-12-…` | Consider Dusk as the default for first-time visitors. |
| Q75-14 | delight | **Exit is safe and predictable**: the dark "Exit" pill is the most prominent HUD button, Escape also works, and both return to the exact orbit view the visitor left. Double-clicking "Fly a car" is harmless (the 2nd click lands on the canvas). | `age75-33-zoom150-after-exit.png`; JS 1722-1730 | Keep. Could add "Exit to city view" wording. |
| Q75-15 | delight | **Plain-word buttons** (Day / Dusk / Night / Fly a car) and the layout holds at 150% zoom (911x512 CSS px): the dock fits, the HUD doesn't overlap, and the iPad touch stick and Boost/Up/Down buttons show. | `age75-31-…png`, `age75-42-ipad-fly-touch.png`, `age75-11-…` (old render, chrome only) | The touch stick has no visible label. Add "Steer" under it. |

## Not verifiable headless
- Sound (engine synth, Mute button) was not heard. Real frame rate and smoothness of orbit and flight are unknown: SwiftShader ran at
  roughly one frame per tens of seconds with other agents rendering, so motion comfort is judged from the code, not by feel.
- Fonts were stubbed, so Instrument Sans/Big Shoulders were not loaded. Sizes are CSS-measured, glyphs are the fallback font.
- Fly-mode street brightness (`age75-31/32/42`) is the known post-M-002 follow-up. It is listed here only because it is why Q75-03's
  hint text can't be read.

## JS errors
None recorded in any run (`pageerror`/`console.error` empty in 5 completed runs: loader x2 contexts, old zoom, new zoom fly, iPad).
Two desktop 1366x768 runs timed out in Playwright actions because of SwiftShader load. They produced `age75-02-orbit-night.png` only.

## Screenshots (qa/shots/)
`age75-0L-loader-{1000,3000,5200,8000}ms.png` loader, normal motion · `age75-0R-loader-1500ms.png` loader, reduced motion at 150% zoom ·
`age75-02-orbit-night.png` 1366x768 orbit (new) · `age75-11/12-zoom150-rm-*.png` **old render** · `age75-31/32/33-zoom150-*.png`
150%-zoom equivalent, reduced motion: fly start, boost, after exit · `age75-41-ipad-dusk-orbit.png`, `age75-42-ipad-fly-touch.png` iPad portrait.
