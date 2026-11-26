# Paused work

When development pauses mid-ticket (credit limits, container restarts), each agent's unfinished changes go here as `<ticket>-<slug>.patch`, with a row in the table below. Delete the patch and its row once the ticket merges.

To resume, run `git apply -3 wip/<file>.patch` in a fresh worktree off current main, and restart the ticket's agent with its brief from ROADMAP.md.

## 2026-11-25: paused until credits renew
| Ticket | Patch (base) | State when stopped |
|---|---|---|
| M-027 Rink and skating | `M-027-rink-skating.patch` (`6020f50`) | Rebased onto main 2026-11-26. Rink and skating edits are applied. Was taking the after-metrics and the Day shot from the north-east. Unverified. |

M-026 (ride the train) and M-008/M-018 (HUD and dock) have not started.
