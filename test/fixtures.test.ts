import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateMarkdown } from "../src/validate.js";

test("stale fixture produces validation warning only", async () => {
  const markdown = await readFile("test/fixtures/repos/stale/HANDOFF.md", "utf8");
  const result = validateMarkdown(markdown);
  assert.equal(result.ok, true);
  assert.ok(result.issues.some((issue) => issue.code === "git.staleStartRef"));
});
