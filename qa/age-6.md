# QA persona: age 6 (touch only, can't read, ~10 s attention span)

Build tested: `index.html` at merge `7ec5f9e` (M-002, readable skyline), 2,181 lines. All screenshots below come from this build.
The first pair of runs started on the pre-M-002 file. I killed them before any screenshot and reran, so **no finding comes from the old dark render**.
Devices: iPhone 390x844 and iPad 820x1180 (Playwright, `isMobile`, `hasTouch`, iOS UA, `(pointer:coarse)` active), plus phone landscape 844x390.
Input was sent as real CDP touch events. Runs: kid session x2 (phone, iPad), plus one focused controls run (phone). Scripts are in my scratchpad `qa6/`.
JS errors: **none** in any run (`pageerror` and `console.error` were both empty).

**What the headless test can't tell:** sound (the engine synth and crash `thud()` exist in code at 1484 but couldn't be heard), real frame rate
(SwiftShader ran at about 1 fps with other agents rendering), haptics, iOS long-press callouts and text selection, and real multi-finger palm mashing.
Because `dt` is capped at 0.05 s per frame (line 2163), 15 s of holding a button simulated under 1 s of flight, so distances flown here are tiny.

## Session story (as the child)

> The grown-up opens it and I see a... nothing? A dark screen, then a picture. I tapped it lots and nothing happened.
> Then a BIG city with sparkly towers and a white pointy one! There's a blue flying thing in the sky. Ooooh. (`age6-phone-2-city.png`, `age6-ipad-2-city.png`)
> The words at the top are small and I can't read them. The buttons at the bottom say words. I pressed all of them really fast.
> The sky went grey-purple, the city went pink, and then I swiped and it flipped upside-down-ish so I was looking down on it like a map (`age6-phone-3-dock-mash.png`).
> Mum read "Fly a car" to me. On the phone it's on its own line at the bottom and doesn't look special.
> I pressed it and I'M IN A PINK CAR in a street with lights! (`age6-phone-4-fly-start.png`) The circle thing at the bottom is a wheel? I pushed it up
> and pressed the round button. FAST! Lines everywhere! (`age6-phone-5-boost-hold.png`, `age6-ipad-5-boost-hold.png`) That's the best part.
> I pushed the circle sideways and the car stopped going and turned into a wall. Now it's just a wall with windows. (`age6-phone-9-turned-climbed.png`)
> I pressed "Up" and went a bit higher, but there's still a wall. I tapped everywhere: the round map, the letters, the numbers. Nothing happened.
> I want to go back. Which one is "back"? I pressed the little black one in the corner (that's "Exit", but I can't read it). Back to the city, phew.
> Then I turned the phone sideways and flew again. The map circle is on top of the Boost button (`age6-phone-8-landscape-fly.png`).
> Bored after about 4-5 minutes. I came back for the boost.

## Findings

| ID | Sev | What happened | Evidence | Suggestion |
|---|---|---|---|---|
| Q6-01 | major | **Turning stalls the car and parks it facing a wall.** The stick is throttle and steering at once (`fwd = ... + stick.y`, line 1758). A child pushing hard left gives `stick.y≈0`, so speed decayed from 33 to 7 km/h while the car turned ~115°, ending nose-first into a building with the whole screen a wall. There is no visual way out. | `age6-phone-9-turned-climbed.png`; ctrl log: spd 33→24→7, compass −570→−406px | Give touch a gentle auto-cruise (e.g. keep min forward speed ~20 when stick is mostly sideways), or a separate throttle. Consider spawning higher than 18 m (line 1713) so the first turn isn't into a wall. |
| Q6-02 | major | **Every control is a text word.** Dock (Day/Dusk/Night/Orbit/Fly a car), HUD (Cockpit/Night/Mute/Exit) and Boost/Up/Down have no icons. A pre-reader can't tell Exit from Mute, or Up from Down, except by position. | All fly shots; HTML 196-220 | Add icons (car, sun/moon, ↑ ↓, ⚡, ✕, speaker) next to or instead of the words. Keep the words as `aria-label`. |
| Q6-03 | major | **Touch targets are small for small fingers.** Dock buttons measured 58-89 × **37 px**. Phone `Exit` measured **39 × 31 px** (iPad 49 × 34), tucked in the top-right corner beside Mute (12 px font, line 151). Mute and Exit are neighbours, so a miss-tap mutes instead of leaving. | log `sizes`, `exit {w:39.5,h:31}`; CSS 42, 118, 151 | Make targets ≥44 px (≥48 for kids). Make Exit a larger, distinct round ✕ button away from Mute. |
| Q6-04 | major | **"Fly a car", the one thing a child wants, is not prominent.** On the phone the dock wraps and "Fly a car" sits alone on a second row with the same plain style as the mood buttons. On the iPad it's the last item in the pill. | `age6-phone-2-city.png`, `age6-ipad-2-city.png` | Make it a big bright primary button (glowing chip + car icon), visually separate from the mood toggles. |
| Q6-05 | minor | **Loader can't be tapped and can't be skipped.** No input handler, and a 6.8 s floor (line 189). In headless the main thread was blocked by `boot()` (line 2178) long enough that even a screenshot of the loader timed out (30 s), so I could not capture it. On a slow tablet the 1910→2140 animation may freeze too. Unconfirmed on real hardware. | `ctrl.log` "loader shot fail"; lines 189, 2178 | Let a tap after `__ready` dismiss the loader early. Check on a real low-end tablet that the CSS animation keeps running during `boot()`. |
| Q6-06 | minor | **Wild swipes leave the orbit camera in odd views** (top-down map angle, city in a corner). There is no "reset view" button. Auto-rotate resumes after 5 s (line 2153), but the angle doesn't reset. | `age6-phone-3-dock-mash.png`, `age6-ipad-3-dock-mash.png`, `age6-phone-7-exit.png` | Ease back toward the default view after idle, or add a home/reset button. |
| Q6-07 | minor | **Landscape phone: radar overlaps the Boost button.** Radar box 680-830 × 80-230, `.vbtns` 756-822 × 142-364. Boost draws on top of the map. The HUD takes about a third of the 390 px height. The iPad landscape layout is fine (`age6-ipad-8-landscape-fly.png`). | `age6-phone-8-landscape-fly.png`, log `land sizes` | Add a landscape/short-height media query: shrink or move the radar left, and drop the compass. |
| Q6-08 | minor | **HUD panels are pale/white in a light-theme browser** (headless defaults to light). White glass over a bright street lowers contrast for the numbers and buttons. Already noted in ROADMAP. | `age6-phone-4-fly-start.png`, `age6-ipad-5-boost-hold.png` | Force dark HUD tokens while driving. |
| Q6-09 | minor | **Street level is very bright/white** (lamp heads and road bloom). The road under the car is near-white at Dusk. Lead says this is a known M-002 follow-up. | `age6-phone-5-boost-hold.png`, `age6-ipad-5-boost-hold.png` | (known) |
| Q6-10 | minor | **Gauge reflows at 3-digit speed on phone:** "metres up" wraps to two lines and the panel jumps size when boosting. | `age6-phone-5-boost-hold.png` vs `-4-` | Fixed width / `white-space:nowrap` on the gauge labels. |
| Q6-11 | minor | **Text hint is useless to this user.** "Drag to orbit, pinch or scroll to zoom" is 13 px text (line 36/195), and the toasts ("Downtown") are words. A child needs a visual cue (pulsing hand/finger icon). | `age6-*-2-city.png` | Show an animated finger-swipe glyph for the first few seconds. |
| Q6-12 | (n/a) | Mood-mash capture on the iPad showed the pressed chip with no label. The later shot `age6-ipad-7-exit.png` renders "Dusk" correctly, so this was a headless capture mid-CSS-transition. **Not a bug.** | `age6-ipad-3-dock-mash.png` | — |
| Q6-13 | delight | **Boost is the hit.** The knob visibly moves, Boost lights up (`.on`), the speed jumps to 128-150 km/h, and speed-lines plus FOV kick appear. A clear cause → effect. | `age6-phone-5-boost-hold.png`, `age6-ipad-5-boost-hold.png` | Keep. Maybe add a little screen glow/sound burst on press. |
| Q6-14a | minor | **From the top-down view the searchlight beams become a pink "pile of sticks"** over Midtown. Fun-looking, but it hides the towers (matches ROADMAP "spaghetti"; beam rotation at line 2167). | `age6-ipad-7-exit.png`, `age6-ipad-3-dock-mash.png` | Fewer or shorter beams when viewed from high angles. |
| Q6-14 | delight | **The city at Night from the default orbit** is sparkly, colourful and full of towers, with a glowing white hero spire and a blimp. It reads as "a city of lights" right away. | `age6-phone-2-city.png`, `age6-ipad-2-city.png` | Keep Night as the default. |
| Q6-15 | delight | **The pink flying car** is readable, centred and cute from the chase cam, with a light trail. Up visibly climbs (18→37 m). | `age6-phone-4-fly-start.png`, ctrl log | Keep. |
| Q6-16 | ok | **No dead ends from mashing.** Rapid dock taps, a double-tap on Fly, random taps on the radar/compass/gauge, two-finger stick+Boost, and sliding a finger off Up then releasing left nothing stuck (`vbtn` cleared, knob recentred, line 1745-1750). Exit always returned to orbit. No horizontal scroll (`scrollWidth == innerWidth`). | logs | — |

## Not verified / out of reach headless
- Sound: whether the engine hum starts on the Fly tap on iOS. `initAudio()` (line 1720) runs inside the click handler, so it should unlock.
- Whether iOS long-press on Boost/Up shows a text-selection magnifier. The buttons have `touch-action:none` but no `user-select:none` / `-webkit-touch-callout:none`, so it's worth a device check.
- Real frame rate on a tablet. At ~1 fps here the controls felt laggy, which may not happen on device.
