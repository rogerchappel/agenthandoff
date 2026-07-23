import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { startSession } from "../src/session.js";
import { capture } from "../src/capture.js";
import { finish } from "../src/finish.js";

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

test("nested commands share the repository-root session", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-session-nested-"));
  const nested = join(dir, "packages", "app");
  try {
    await mkdir(nested, { recursive: true });
    git(dir, ["init"]);
    git(dir, ["config", "user.email", "test@example.com"]);
    git(dir, ["config", "user.name", "Test"]);
    execFileSync("sh", ["-c", "echo hi > README.md && git add README.md && git commit -m init"], { cwd: dir, stdio: "ignore" });

    const started = await startSession({ cwd: nested, title: "Nested session", notes: ["Keep this context"] });
    const captured = await capture({ cwd: nested });
    const finished = await finish({ cwd: nested });

    assert.equal(started.cwd, dir);
    assert.equal(captured.session.id, started.id);
    assert.equal(captured.session.title, "Nested session");
    assert.deepEqual(captured.session.notes, ["Keep this context"]);
    assert.equal(captured.session.cwd, dir);
    assert.equal(captured.session.startedFrom, started.startedFrom);
    assert.equal(finished.session.id, started.id);
    assert.equal(finished.repo.root, dir);
    await assert.rejects(access(join(nested, ".agenthandoff")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
