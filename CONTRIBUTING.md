# Contributing

Thanks for helping improve `agenthandoff`.

## Development setup

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
```

## Design principles

- Stay local-first: no telemetry, sync, or network calls in the CLI.
- Prefer honest state over optimistic summaries.
- Keep handoff Markdown useful for humans and JSON stable for automation.
- Add tests for new validation or capture behavior.

## Pull requests

1. Open an issue or describe the problem clearly in the PR.
2. Keep changes focused and reversible.
3. Update docs/examples when CLI behavior changes.
4. Run `bash scripts/validate.sh` before requesting review.

## Commit style

Use short conventional-style subjects where practical, for example:

- `feat: capture worktree status`
- `fix: validate stale refs`
- `docs: add agent handoff example`
