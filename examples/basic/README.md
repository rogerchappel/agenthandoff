# Basic human-to-agent handoff

```sh
agenthandoff start --title "Fix parser bug" --note "Reproduced in parser.test.ts"
npm test 2>&1 | tee .agenthandoff/npm-test.log
agenthandoff finish --log .agenthandoff/npm-test.log --next "Inspect parser edge cases"
agenthandoff validate HANDOFF.md
```
