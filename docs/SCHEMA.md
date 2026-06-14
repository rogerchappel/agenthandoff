# JSON Schema Notes

`agenthandoff` writes `.agenthandoff/handoff.json` with `schemaVersion: "0.1.0"`.

The JSON packet mirrors the Markdown handoff and is intended for orchestration systems that need to route or validate agent work without parsing prose.

Stable top-level fields:

- `repo`: repository name and root.
- `session`: session id, creation time, title, starting ref, and notes.
- `git`: branch, HEAD, upstream, ahead/behind, dirty state, recent commits, and stale start-ref flag.
- `changedFiles`: parsed `git status --short` entries.
- `packageScripts`: detected package manager plus `package.json` scripts.
- `commandLogs`: explicit log files with command, exit code, status, and output preview.
- `summary`, `tests`, `risks`, `nextSteps`: handoff narrative fields.
- `validation`: machine-readable validation result.

Markdown validation rejects untouched summary and next-step placeholders, and
warns on the default risks placeholder, so a generated packet is not mistaken
for a reviewed takeover brief.
