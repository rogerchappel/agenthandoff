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
    await finish({ cwd: dir, summary: ["Implemented fixture"], nextSteps: ["Review HANDOFF.md"] });
    const markdown = await readFile(join(dir, "HANDOFF.md"), "utf8");
    assert.match(markdown, /## Summary/);
    assert.match(markdown, /Implemented fixture/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
