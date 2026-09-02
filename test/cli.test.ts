import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { execFileSync } from "node:child_process";
import { runCli } from "../src/cli.js";

function git(cwd: string, args: string[]) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

async function expectMissing(path: string) {
  await assert.rejects(access(path), { code: "ENOENT" });
}

test("invalid positional arguments fail before commands write artifacts", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-cli-arity-"));
  try {
    git(dir, ["init"]);
    git(dir, ["config", "user.email", "test@example.com"]);
    git(dir, ["config", "user.name", "Test"]);
    await writeFile(join(dir, "README.md"), "fixture\n");
    git(dir, ["add", "README.md"]);
    git(dir, ["commit", "-m", "init"]);

    for (const args of [
      ["start", "unexpected"],
      ["capture", "--json", "unexpected"],
      ["finish", "unexpected", "--summary", "ignored"]
    ]) {
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      let error = "";
      stderr.setEncoding("utf8");
      stderr.on("data", (chunk) => { error += chunk; });
      assert.equal(await runCli({ cwd: dir, args, stdout, stderr }), 1);
      assert.match(error, /does not accept positional arguments/);
      assert.match(error, /agenthandoff --help/);
    }

    await expectMissing(join(dir, ".agenthandoff"));
    await expectMissing(join(dir, "HANDOFF.md"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("validate rejects a second path before reading either file", async () => {
  const output = new PassThrough();
  let error = "";
  output.setEncoding("utf8");
  output.on("data", (chunk) => { error += chunk; });
  assert.equal(await runCli({ cwd: process.cwd(), args: ["validate", "missing.md", "other.md"], stdout: output, stderr: output }), 1);
  assert.match(error, /validate accepts at most one positional path/);
  assert.doesNotMatch(error, /ENOENT/);
});
