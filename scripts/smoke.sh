#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cd "$TMP"
git init >/dev/null
git config user.email smoke@example.com
git config user.name Smoke
printf '{"name":"smoke-fixture","scripts":{"test":"node --test"}}\n' > package.json
git add package.json
git commit -m init >/dev/null
node "$ROOT/dist/src/cli.js" start --title "Smoke test"
printf 'console.log("smoke")\n' > index.js
printf '$ npm test\nexit: 0\n' > test.log
node "$ROOT/dist/src/cli.js" capture --log test.log --json >/dev/null
node "$ROOT/dist/src/cli.js" finish --log test.log --summary "Smoke changed index.js" --test "npm test: passed" --next "Review generated handoff"
VISIBLE_ROOT="$PWD"
node "$ROOT/dist/src/cli.js" validate "$VISIBLE_ROOT/HANDOFF.md"
[ -f "$VISIBLE_ROOT/HANDOFF.md" ]
[ -f "$VISIBLE_ROOT/.agenthandoff/session.json" ]
[ -f "$VISIBLE_ROOT/.agenthandoff/capture.json" ]
[ -f "$VISIBLE_ROOT/.agenthandoff/handoff.json" ]
