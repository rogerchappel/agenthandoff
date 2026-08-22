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

test("boolean flags preserve validate positionals in either order", () => {
  assert.deepEqual(parseArgs(["validate", "--json", "custom.md"]).positionals, ["custom.md"]);
  assert.deepEqual(parseArgs(["validate", "custom.md", "--json"]).positionals, ["custom.md"]);
});

test("value flags support repetition and inline values", () => {
  const parsed = parseArgs(["finish", "--summary", "first", "--summary=second", "--log=a.log", "--log", "b.log"]);
  assert.deepEqual(parsed.flags.summary, ["first", "second"]);
  assert.deepEqual(parsed.flags.log, ["a.log", "b.log"]);
});

test("value flags reject missing values", () => {
  assert.throws(() => parseArgs(["start", "--title"]), /--title requires a value/);
  assert.throws(() => parseArgs(["capture", "--log", "--json"]), /--log requires a value/);
  assert.throws(() => parseArgs(["finish", "--risk="]), /--risk requires a value/);
});

test("every command rejects unknown flags", () => {
  for (const command of ["start", "capture", "finish", "validate"]) {
    assert.throws(() => parseArgs([command, "--unknown"]), new RegExp(`Unknown flag --unknown for ${command}`));
  }
});

test("boolean flags reject inline values", () => {
  assert.throws(() => parseArgs(["validate", "--json=false"]), /--json does not accept a value/);
});
