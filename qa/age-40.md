# QA persona: ~40-year-old casual player (laptop 1440x900 + phone 390x844)

Build tested: `7ec5f9e` (M-002 merged, "readable skyline"). **All screenshots below are from the new render.** My first desktop run had
loaded the old build, but it was killed before it saved any screenshot, so none of the findings below depend on the old render.
Harness: Playwright + SwiftShader (scripts in the session scratchpad, `qa40/`). Software GL on a shared box ran at about 1 frame per 2-50 s,
so frame rate, input latency, sound and "feel" **cannot be judged here**. Sim time is capped at 0.05 s per frame (`tick`, line 2163), so
key holds were measured in frames and HUD values (speed, altitude, boost bar, compass offset) were read before and after each one.
Viewports: 1440x900 orbit shots, 720x450 for the keyboard and hunt run (to keep frames affordable), 390x844 touch phone (dark scheme, DPR 1).
JS errors: **none** in any run. The only console output was SwiftShader "GPU stall due to ReadPixels" warnings caused by the screenshots.

## Session story
The 1910→2140 loader is charming, and the city appears after the 6.8 s floor (line 189), so the first "wow" comes at about 7-8 s on real hardware.
That is inside my 15-second patience window. The night orbit (`age40-d-orbit-night.png`) is now properly impressive: twin hero spires, the maglev loop and
coloured window grids. Dusk (`age40-d-dusk.png`) is a lovely pink postcard. I hit "Fly a car", and the street is bright enough to wash out half the
frame. The white key hint at the bottom disappears into the white road. I steer A, then D, and drift sideways into a facade. The chase camera
then sits *inside* the building and the screen goes black (`age40-k-climb.png`). I boost at 181 km/h and stop dead against a wall. Cockpit
view is a pink neon slab with a dashboard that repeats the HUD. I would play about 3 minutes. I would screenshot the dusk orbit and share
*that*, not the flying. Nothing brings me back: no score, no goal, no saved progress, no "share this view". On the phone, the Hunt
HUD pushes **Exit off the screen**. I found `#hunt`, but in about 5 s of sim time the rogues stayed as red dots on the radar edge and never appeared on screen.

## Findings
| ID | Sev | What happened | Evidence | Suggestion |
|---|---|---|---|---|
| Q40-01 | major | Chase camera has no collision. After turning near a facade, the camera ends up inside the building and the frame is black, with no car visible. | `age40-k-climb.png`; camera lerp has no `collide()` (1796) | Raycast or `collide()` the camera toward the car, or pull it in and up when blocked. |
| Q40-02 | major | Phone + Hunt: the HUD button row overflows to x=421 on a 390 px screen, so **Exit is cut off** (only an edge of the chip shows). The hunt panel widens `.gwrap` to 188 px and also covers the compass. | `age40-p-hunt.png`; measured `.hud-btns` right edge 421; CSS 149-151 | At ≤700 px, stack the hunt panel under the gauge, or move Mute/Day-Night into an overflow menu. Never let Exit leave the screen. |
| Q40-03 | major | Desktop key hint is white text on a now-white street, so it can't be read at spawn, and in Hunt it wraps to 2 lines (720 px wide). The Hunt crosshair (white ring) is also invisible on the bright road. | `age40-k-spawn.png`, `age40-h-start.png`; `.keys` 121, `#cross` 166 | Put the hint on a dark pill (like the HUD panels) and fade it after ~8 s. Give the crosshair a dark outline. (Root cause is the known street brightness follow-up.) |
| Q40-04 | major | No reason to come back: no localStorage, no best bounty or time, no goal in free flight, no share or permalink of a view. Hunt cash resets on Esc. | `grep localStorage/share` → 0 hits; `stopHunt` 2020 | Save best bounty and districts visited. Add a "postcard" button that saves a PNG of the current orbit view. |
| Q40-05 | minor | Hitting a wall at 181 km/h stops you dead (speed→5 km/h in 6 frames): no bounce and no slide along the wall. Combined with narrow canyons, this feels sticky. | log: "W+B 181" → "+6f 5 km/h"; `age40-k-boost.png` (car pinned on a corner); 1774 | Keep tangential velocity and remove only the normal component, plus a small bounce. |
| Q40-06 | minor | "B boost" does nothing on its own (verified: B alone → boost bar 1.0 and speed unchanged). It only works while W is held. The hint doesn't say so. | `boosting=…&&fwd>0.1` 1761; hint 214 | Make B imply forward, or change the hint to "W+B boost". |
| Q40-07 | minor | Hunt hint drops "V view, M sound" (although both still work), so the two hints disagree. | 2016 vs 214 | Reuse one hint string and append the fire instructions to it. |
| Q40-08 | minor | No mouse steering. The trackpad does nothing while flying (OrbitControls disabled), and I instinctively tried mouse-look. | `enterDrive` 1711 (controls.enabled=false); no drive mousemove handler | Optional drag-to-steer or pointer-lock yaw, at least as a fallback. |
| Q40-09 | minor | Cockpit view: a pink neon edge blooms into a slab that blocks half the windscreen. The dash display repeats the HUD speed and altitude, and its text blooms out ("24 m" unreadable). On the phone (portrait), the dash is cropped ("Downtow", "h") and hidden behind the stick and buttons. | `age40-k-cockpit.png`, `age40-p-cockpit.png`; `drawDisp` 1540 | Hide the duplicate top HUD gauge in cockpit, or drop the dash numbers. Lower the dash emissive below the bloom threshold. Narrow the dash for portrait. |
| Q40-10 | minor | Phone HUD collisions: the compass (y 74-104) overlaps the gauge and boost bar (to y 87). At 3-digit speeds "metres up" wraps to 2 lines and the gauge grows further. | `age40-p-fly-spawn.png`, `age40-p-fly-boost.png` | Fix gauge width (tabular, min-width) and push the compass below the gauge at ≤700 px. |
| Q40-11 | minor | HUD "Night" button looks like a label but *cycles* the mood. Its text shows the current mood, not what a tap will do. | 1710, 1735 | Use an icon plus "Mood: Night ▸", or show the next mood. |
| Q40-12 | minor | In the dock, "Orbit" (a toggle) uses the same filled chip as the selected mood, so two items look selected side by side. On the phone the dock wraps to 2 rows (94 px tall). | `age40-d-orbit-night.png`, `age40-p-orbit.png`; CSS 44 | Give the toggle a different style (outline or switch) and keep the phone dock to 1 row (icons). |
| Q40-13 | minor | In a light-scheme browser the dock and HUD use pale glass panels over a night city, which looks off-brand (already noted in ROADMAP). | `age40-d-orbit-night.png`, `age40-k-spawn.png`; tokens 11-13 | Force the dark tokens for in-scene UI. |
| Q40-14 | minor | Hunt onboarding: the toast says "Follow the red diamonds", but after about 5 s of sim time all 5 rogues sit at the radar edge (they spawn 230-430 m away, behind towers) with no lock and none on screen. The toast lasts 2.6 s and is then replaced by the "Downtown" district toast. | `age40-h-mid.png`; spawn distance in `spawnRogue`; toast 1494 | Spawn the first rogue in view, add an edge-of-screen arrow, and don't let the district toast overwrite the mission toast. |
| Q40-15 | minor | Climb is slow. Space for 1.2 s of sim time gained about 9-12 m, so getting above the 200 m+ towers to "see the city" takes 15 s or more. | log: alt 18→27 (Space, 24 frames) | Raise the climb cap when Space is held longer, or add a "pop up to skyline" key. |
| Q40-16 | minor | Code: no `visibilitychange` handling, so if I alt-tab while flying the engine synth keeps playing. Audio is only suspended on Exit. Not audible in headless. | `exitDrive` 1722; 0 hits for visibilitychange | Suspend the AudioContext when the tab is hidden. |
| Q40-17 | delight | The night and dusk orbits are now genuinely share-worthy: hero spires, maglev ring and window grids all read clearly at 1440x900. | `age40-d-orbit-night.png`, `age40-d-dusk.png` | Keep it. Make Dusk the first frame, or reach it with an auto-tween. |
| Q40-18 | delight | Controls do what the hint says. W 35→121 km/h and coasts down when released. A turns left and D turns right (compass NW then NNE). Space and Shift climb and descend. M toggles Mute/Unmute. V toggles Cockpit/Chase. Esc exits and restores orbit. Space after clicking a HUD button doesn't re-press it. Re-entering resets to chase. | combo log; 1736-1738 | — |
| Q40-19 | delight | Compass, radar and car agree (N label rotates correctly with yaw). The "Downtown" district toast gives NYC identity. The phone's two-thumb stick + Boost works (204→368 km/h, boost bar drains). Speed-line FX look good. | `age40-p-fly-boost.png`, `age40-k-spawn.png` | — |
| Q40-20 | known | Street level in fly mode is blown out to white (already a tracked follow-up). It makes Q40-03 worse and hides the car at boost speed on the phone. | `age40-p-fly-spawn.png`, `age40-p-fly-boost.png` | — |

## Can't tell from headless
Sound mix and engine feel, real frame rate on a laptop or phone, input latency, whether the 6.8 s loader feels long on fast hardware,
haptics, and real DPR-3 phone sharpness (phone runs used DPR 1).
