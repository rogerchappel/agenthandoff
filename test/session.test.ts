import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { execFileSync } from "node:child_process";
import { startSession } from "../src/session.js";
import { capture } from "../src/capture.js";
import { finish } from "../src/finish.js";
import { runCli } from "../src/cli.js";

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

test("CLI keeps artifacts at the repository root visible through an alternate path", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "agenthandoff-session-alternate-"));
  const repository = join(fixture, "repository");
  const alternate = join(fixture, "workspace");
  const nested = join(repository, "packages", "app");
  const output = new PassThrough();
  try {
    await mkdir(nested, { recursive: true });
    await symlink(repository, alternate, "dir");
    git(repository, ["init"]);
    git(repository, ["config", "user.email", "test@example.com"]);
    git(repository, ["config", "user.name", "Test"]);
    execFileSync("sh", ["-c", "echo hi > README.md && git add README.md && git commit -m init"], { cwd: repository, stdio: "ignore" });

    const cwd = join(alternate, "packages", "app");
    assert.equal(await runCli({ cwd, args: ["start"], stdout: output, stderr: output }), 0);
    assert.equal(await runCli({ cwd, args: ["capture", "--json"], stdout: output, stderr: output }), 0);
    assert.equal(await runCli({ cwd, args: ["finish"], stdout: output, stderr: output }), 0);
    assert.equal(await runCli({ cwd: alternate, args: ["validate", "HANDOFF.md"], stdout: output, stderr: output }), 0);

    await Promise.all([
      access(join(alternate, "HANDOFF.md")),
      access(join(alternate, ".agenthandoff", "session.json")),
      access(join(alternate, ".agenthandoff", "capture.json")),
      access(join(alternate, ".agenthandoff", "handoff.json"))
    ]);
    const packet = JSON.parse(await readFile(join(alternate, ".agenthandoff", "handoff.json"), "utf8"));
    assert.equal(packet.repo.root, alternate);
    assert.equal(packet.session.cwd, alternate);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
