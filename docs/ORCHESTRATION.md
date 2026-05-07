# Orchestration Guide

`agenthandoff` is designed for humans and coding agents that need a portable, honest takeover packet.

## Lifecycle

1. `agenthandoff start` creates `.agenthandoff/session.md` and records the starting git ref.
2. `agenthandoff capture` refreshes `.agenthandoff/capture.json` with repository facts.
3. `agenthandoff finish` writes `HANDOFF.md` and `.agenthandoff/handoff.json`.
4. `agenthandoff validate HANDOFF.md` checks required content and stale references.

## Machine Contract

Automation should treat `.agenthandoff/handoff.json` as the stable interface and `HANDOFF.md` as the human-readable packet.

Required JSON keys:

- `schemaVersion`
- `repo`
- `session`
- `git`
- `changedFiles`
- `packageScripts`
- `commandLogs`
- `summary`
- `tests`
- `risks`
- `nextSteps`
- `validation`

## Exit Codes

- `0`: command completed successfully.
- `1`: validation failed or a required command input is missing.
- `2`: command usage error.

## Local-first Policy

No network calls are made by the CLI. All facts come from the current working tree, local git metadata, package files, and explicit log files.
