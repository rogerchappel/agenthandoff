# agenthandoff

Status: in-progress
Decision: selected for 2026-05-08 OSS factory run

## Scorecard

Total: 83/100
Band: build now
Last scored: 2026-05-08
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 17/20 | Human-to-agent and agent-to-agent handoffs lose state, assumptions, commands run, and remaining risks. |
| Demand signal | 16/20 | Coding agent users increasingly need durable session summaries and takeover briefs. |
| V1 buildability | 18/20 | Markdown templates, git facts, task extraction, command log ingestion, and validation are simple. |
| Differentiation | 13/15 | Focus on local handoff packets and verification checklists, not chat transcripts. |
| Agentic workflow leverage | 13/15 | Directly improves multi-agent and interrupted coding sessions. |
| Distribution potential | 6/10 | Strong niche appeal; README examples matter. |

## Pitch

`agenthandoff` creates crisp takeover packets for coding agents: what changed, what passed, what failed, what’s risky, and exactly where to resume. 🤝

## Why It Matters

Interrupted work dies in the gap between “I think I fixed it” and “here is a precise, verifiable next step.” Handoffs should be structured, diff-aware, and honest about uncertainty.

## Attribution / Inspiration

Inspired by incident handoffs, pair-programming notes, and agent orchestration workflows; build a fresh local-first CLI.

## V1 Scope

- TypeScript CLI package.
- `agenthandoff start` creates `.agenthandoff/session.md` from a template.
- `agenthandoff capture` records git status, recent commits, changed files, package scripts, and optional command logs.
- `agenthandoff finish` writes `HANDOFF.md` with summary, tests run, failures, next steps, and risk flags.
- `agenthandoff validate HANDOFF.md` checks required sections and stale git refs.
- JSON output for orchestration systems.
- Fixtures for clean repo, dirty repo, failed command log, and stale handoff.
- README with human-to-agent and agent-to-agent examples.

## Out of Scope

- Chat transcript scraping, remote sync, task management SaaS, or automatic code modification.

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- Real CLI smoke in a fixture git repo.

## Agent Prompt

Build a polished local-first TypeScript CLI named `agenthandoff` from this PRD. Prioritize honest state capture and useful takeover docs. Publish as `rogerchappel/agenthandoff` after verification.
