import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { startSession } from "../src/session.js";

function git(cwd: string, args: string[]) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

test("startSession writes a git-backed session", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-session-"));
  try {
    git(dir, ["init"]);
    git(dir, ["config", "user.email", "test@example.com"]);
    git(dir, ["config", "user.name", "Test"]);
    execFileSync("sh", ["-c", "echo hi > README.md && git add README.md && git commit -m init"], { cwd: dir, stdio: "ignore" });
    const session = await startSession({ cwd: dir, title: "Test" });
    assert.equal(session.title, "Test");
    assert.match(session.startedFrom ?? "", /^[a-f0-9]{40}$/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
