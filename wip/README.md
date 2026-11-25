# Paused work (2026-11-24)

Development was paused by the owner until credits reset. These patches hold the unfinished changes from agents stopped mid-ticket.
They apply on top of commit `dece20f`/later main with `git apply wip/<file>.patch`. They are unverified: the agents were stopped before they finished testing.

| Ticket | Patch | State when stopped |
|---|---|---|
| M-007 Street glare | none | Was still taking before screenshots; no edits yet. |
| M-019 Populate Central Park | none | No edits yet. |
| M-020 Detailed monorail | none | No edits yet. |

To resume, restart each ticket's agent with its original brief, and hand it the patch where one exists.

## 2026-11-25: container restart
| M-007 Street glare | `M-007-street-glare.patch` | Four WIP checkpoints (glare, lamp pools, darker asphalt, no avenue lamps in Central Park), all unverified. The dev was restarted from them. |

## 2026-11-25: paused again until credits refresh
| Ticket | Patch | State when stopped |
|---|---|---|
| M-007 Street glare | `M-007-street-glare.patch` (replaces the earlier one; against `33f178a`) | Earlier checkpoints applied, plus dimmer road pools and shopfronts near the camera. Was taking the baseline shot; unverified. |
| M-021 Central Park from reference photos | `M-021-central-park-refs.patch` (against `33f178a`) | Early uncommitted edits to the park section; unverified. The reference photos are not in the repo; ask the owner to re-share them if the scratchpad copies are gone. |
