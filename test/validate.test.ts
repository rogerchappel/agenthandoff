import test from "node:test";
import assert from "node:assert/strict";
import { validateMarkdown } from "../src/validate.js";

const valid = `# Handoff\n\n## Summary\n\n- Done\n\n## Git\n\n- Stale start ref: no\n\n## Changed Files\n\n- None\n\n## Package Scripts\n\n- None\n\n## Tests Run\n\n- npm test\n\n## Command Logs\n\n- None\n\n## Risks\n\n- None\n\n## Next Steps\n\n- Ship\n\n## Validation\n\n- OK: yes\n`;

test("validateMarkdown accepts required sections", () => {
  assert.equal(validateMarkdown(valid).ok, true);
});

test("validateMarkdown rejects missing sections", () => {
  const result = validateMarkdown("# nope");
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "markdown.missingSection"));
});
