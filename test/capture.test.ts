import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { startSession } from "../src/session.js";
import { capture } from "../src/capture.js";

function sh(cwd: string, command: string) {
  execFileSync("sh", ["-c", command], { cwd, stdio: "ignore" });
}

test("capture records dirty files, scripts, and command logs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agenthandoff-capture-"));
  try {
    sh(dir, "git init && git config user.email test@example.com && git config user.name Test");
    await writeFile(join(dir, "package.json"), JSON.stringify({ name: "fixture", scripts: { test: "node --test" } }));
    sh(dir, "git add package.json && git commit -m init");
    await startSession({ cwd: dir });
    await writeFile(join(dir, "index.js"), "console.log('hi')\n");
    await writeFile(join(dir, "pass.log"), "$ npm test\nexit: 0\n");
    const packet = await capture({ cwd: dir, commandLogPaths: [join(dir, "pass.log")] });
    assert.equal(packet.repo.name.startsWith("agenthandoff-capture-"), true);
    assert.equal(packet.packageScripts.scripts.test, "node --test");
    assert.equal(packet.commandLogs[0]?.status, "passed");
    assert.ok(packet.changedFiles.some((file) => file.path === "index.js"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
