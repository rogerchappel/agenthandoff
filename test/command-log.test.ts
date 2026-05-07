import test from "node:test";
import assert from "node:assert/strict";
import { readCommandLog } from "../src/command-log.js";

test("readCommandLog detects passing command", async () => {
  const log = await readCommandLog("test/fixtures/command-logs/pass.log");
  assert.equal(log.command, "npm test");
  assert.equal(log.exitCode, 0);
  assert.equal(log.status, "passed");
});

test("readCommandLog detects failed command", async () => {
  const log = await readCommandLog("test/fixtures/command-logs/fail.log");
  assert.equal(log.command, "npm run check");
  assert.equal(log.status, "failed");
});
