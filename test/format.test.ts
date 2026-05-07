import test from "node:test";
import assert from "node:assert/strict";
import { sentence, uniqueNonEmpty } from "../src/format.js";

test("uniqueNonEmpty trims, drops blanks, and deduplicates", () => {
  assert.deepEqual(uniqueNonEmpty([" a ", "", "a", "b"]), ["a", "b"]);
});

test("sentence appends punctuation when missing", () => {
  assert.equal(sentence("Ship it"), "Ship it.");
  assert.equal(sentence("Done!"), "Done!");
});
