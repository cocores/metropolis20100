# Paused work

When development pauses mid-ticket (credit limits, container restarts), each agent's unfinished changes go here as `<ticket>-<slug>.patch`, with a row in the table below. Delete the patch and its row once the ticket merges.

To resume, run `git apply -3 wip/<file>.patch` in a fresh worktree off current main, and restart the ticket's agent with its brief from ROADMAP.md.

## 2026-11-25: paused until credits renew
| Ticket | Patch (base) | State when stopped |
|---|---|---|

No paused work right now. M-008/M-018 (HUD and dock) have not started.
