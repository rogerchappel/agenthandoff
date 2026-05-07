# Agent-to-agent handoff

Producer agent:

```sh
agenthandoff start --title "Release prep"
agenthandoff capture --json > .agenthandoff/snapshot.json
agenthandoff finish --summary "Release notes updated" --risk "Package smoke not run" --next "Run npm run release:check"
```

Consumer agent:

```sh
agenthandoff validate HANDOFF.md
cat .agenthandoff/handoff.json
```
