# agenthandoff

Local-first handoff packets for humans and coding agents. `agenthandoff` captures repository facts, changed files, package scripts, command logs, stale refs, risks, and next steps into a Markdown takeover brief plus JSON for orchestration.

## Install

```sh
npm install -g agenthandoff
```

Or run from a checkout:

```sh
npm install
npm run build
node dist/cli.js --help
```

## Quick start

```sh
agenthandoff start --title "Finish auth refactor" --note "Parser tests are the current blocker"
npm test 2>&1 | tee .agenthandoff/npm-test.log
agenthandoff capture --log .agenthandoff/npm-test.log
agenthandoff finish \
  --log .agenthandoff/npm-test.log \
  --summary "Auth parser refactor is partially complete" \
  --risk "Session start ref may be stale after new commits" \
  --next "Run npm run check and inspect parser.test.ts"
agenthandoff validate HANDOFF.md
```

## Commands

- `agenthandoff start` creates `.agenthandoff/session.md` and `.agenthandoff/session.json`.
- `agenthandoff capture` writes `.agenthandoff/capture.json` using local git/package/log facts.
- `agenthandoff finish` writes `HANDOFF.md` and `.agenthandoff/handoff.json`.
- `agenthandoff validate HANDOFF.md` checks required sections, stale refs, and failed command logs.

## What gets captured

- Branch, HEAD, upstream, ahead/behind, dirty status, recent commits, and start-ref staleness.
- Changed files from `git status --short`.
- Package manager and `package.json` scripts.
- Explicit command logs passed with `--log`.
- Human-supplied summary, tests, risks, and next steps.

## JSON packet

Automation can read `.agenthandoff/handoff.json`. See [docs/SCHEMA.md](docs/SCHEMA.md) for the stable top-level fields.

## Local-first promise

The CLI makes no network calls. It reads the current working tree, local git metadata, package files, and command logs you explicitly provide.

## Limitations

- `agenthandoff` records local evidence; it does not prove that omitted logs, untracked files, or remote branches are complete.
- Stale-ref and failed-command warnings are heuristics for handoff review, not a replacement for rerunning the project test suite.
- Command logs may contain secrets or private data. Review generated Markdown and JSON before sharing them outside the repository.
- The tool does not create commits, push branches, open pull requests, or enforce permissions.

## Examples

See [`examples/basic`](examples/basic) and [`examples/agent-to-agent`](examples/agent-to-agent).

## Development

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Security

Please report vulnerabilities privately using the process in [SECURITY.md](SECURITY.md).

## Verify

Run local verification before opening a PR or publishing:

```bash
npm test
npm run release:check
```

`release:check` runs type-checking, build, smoke tests, and a dry-run `npm pack` to ensure everything ships cleanly.
