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

test("validateMarkdown rejects default summary and next-step placeholders", () => {
  const markdown = valid
    .replace("- Done", "- No summary captured.")
    .replace("- Ship", "- No next steps captured.");
  const result = validateMarkdown(markdown);

  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "markdown.summaryPlaceholder"));
  assert.ok(result.issues.some((issue) => issue.code === "markdown.nextStepsPlaceholder"));
});

test("validateMarkdown warns on default risk placeholder", () => {
  const markdown = valid.replace("- None\n\n## Next Steps", "- No risks captured.\n\n## Next Steps");
  const result = validateMarkdown(markdown);

  assert.equal(result.ok, true);
  assert.ok(result.issues.some((issue) => issue.code === "markdown.risksPlaceholder"));
});
