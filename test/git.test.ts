import test from "node:test";
import assert from "node:assert/strict";
import { parseChangedFile } from "../src/git.js";

test("parseChangedFile detects modified files", () => {
  assert.deepEqual(parseChangedFile(" M src/index.ts"), {
    path: "src/index.ts",
    index: " ",
    workingTree: "M",
    kind: "modified"
  });
});

test("parseChangedFile detects renamed target path", () => {
  const file = parseChangedFile("R  old.ts -> new.ts");
  assert.equal(file.path, "new.ts");
  assert.equal(file.kind, "renamed");
});
