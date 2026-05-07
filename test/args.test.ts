import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../src/args.js";

test("parseArgs collects flags and positionals", () => {
  const parsed = parseArgs(["finish", "HANDOFF.md", "--log", "test.log", "--risk=stale"]);
  assert.equal(parsed.command, "finish");
  assert.deepEqual(parsed.positionals, ["HANDOFF.md"]);
  assert.deepEqual(parsed.flags.log, ["test.log"]);
  assert.deepEqual(parsed.flags.risk, ["stale"]);
});
