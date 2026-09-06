import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { startSession } from "../src/session.js";
import { finish } from "../src/finish.js";

function sh(cwd: string, command: string) {
  execFileSync("sh", ["-c", command], { cwd, stdio: "ignore" });
}

test("finish writes markdown handoff", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-finish-"));
  try {
    sh(dir, "git init && git config user.email test@example.com && git config user.name Test");
    await writeFile(join(dir, "README.md"), "fixture\n");
    sh(dir, "git add README.md && git commit -m init");
    await startSession({ cwd: dir });
    await writeFile(join(dir, "review café notes.txt"), "notes\n");
    await finish({ cwd: dir, summary: ["Implemented fixture"], nextSteps: ["Review HANDOFF.md"] });
    const markdown = await readFile(join(dir, "HANDOFF.md"), "utf8");
    assert.match(markdown, /## Summary/);
    assert.match(markdown, /Implemented fixture/);
    assert.match(markdown, /- review café notes\.txt \(untracked;/);
    assert.doesNotMatch(markdown, /"review|\\303/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("finish validates normalized overrides before writing artifacts", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-finish-validation-"));
  try {
    sh(dir, "git init && git config user.email test@example.com && git config user.name Test");
    await writeFile(join(dir, "README.md"), "fixture\n");
    sh(dir, "git add README.md && git commit -m init");

    const packet = await finish({
      cwd: dir,
      summary: [" ", "\t"],
      nextSteps: ["  ", "\n"]
    });
    const markdown = await readFile(join(dir, "HANDOFF.md"), "utf8");
    const json = JSON.parse(await readFile(join(dir, ".agenthandoff", "handoff.json"), "utf8"));

    assert.equal(packet.validation.ok, false);
    assert.deepEqual(packet.validation.issues.map((issue) => issue.code), ["summary.empty", "nextSteps.empty"]);
    assert.deepEqual(json.validation, packet.validation);
    assert.match(markdown, /- OK: no/);
    assert.match(markdown, /ERROR summary\.empty/);
    assert.match(markdown, /ERROR nextSteps\.empty/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
