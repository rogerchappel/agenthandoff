# Security Policy

## Supported versions

Security fixes target the latest released `0.x` version.

## Reporting a vulnerability

Please do not open a public issue for sensitive reports. Email the maintainer or use GitHub private vulnerability reporting if enabled.

Include:

- Affected version or commit.
- Reproduction steps.
- Impact and any known mitigations.

## Security model

`agenthandoff` is local-first and should not make network calls. It reads local repository metadata, package files, and command logs explicitly provided by the user. Treat generated handoffs as potentially sensitive because they can include file paths, commit IDs, command output previews, and project context.

## Handling command logs

Command logs may contain secrets. Review logs before sharing a generated `HANDOFF.md` or `.agenthandoff/handoff.json` outside your team.
