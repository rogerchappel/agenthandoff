import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeJson, writeText } from "../src/fs.js";

test("atomic text and JSON writes replace complete contents", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-atomic-"));
  try {
    const text = join(dir, "nested", "state.txt");
    await writeText(text, "old");
    await writeText(text, "replacement");
    assert.equal(await readFile(text, "utf8"), "replacement");
    const json = join(dir, "nested", "state.json");
    await writeJson(json, { value: 1 });
    await writeJson(json, { value: 2 });
    assert.deepEqual(JSON.parse(await readFile(json, "utf8")), { value: 2 });
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("failed replacement preserves the previous target", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-atomic-failure-"));
  try {
    const target = join(dir, "state.txt");
    const destination = join(dir, "directory");
    await writeText(target, "preserved");
    await symlink(target, destination);
    await assert.rejects(writeText(join(destination, "state.txt"), "new contents"));
    assert.equal(await readFile(target, "utf8"), "preserved");
  } finally { await rm(dir, { recursive: true, force: true }); }
});
