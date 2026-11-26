# Paused work

When development pauses mid-ticket (credit limits, container restarts), each agent's unfinished changes go here as `<ticket>-<slug>.patch`, with a row in the table below. Delete the patch and its row once the ticket merges.

To resume, run `git apply -3 wip/<file>.patch` in a fresh worktree off current main, and restart the ticket's agent with its brief from ROADMAP.md.

## 2026-11-25: paused until credits renew
| Ticket | Patch (base) | State when stopped |
|---|---|---|
| M-024 Police patrol | `M-024-police-patrol.patch` (`f6ba6ff`) | Hunt rework, on-foot mode, good/rogue robots, scan/detain mostly written. Was wiring the drive-section hooks (`updateDrive`, radar, `toggleView`). The "Patrol" dock button, requested later by the owner, may not be done yet. Unverified. |
| M-027 Rink and skating | `M-027-rink-skating.patch` (`4439af9`) | Rink edits in progress. Was starting the skate-pose shader changes. Unverified. |

M-026 (ride the train) and M-008/M-018 (HUD and dock) have not started.
