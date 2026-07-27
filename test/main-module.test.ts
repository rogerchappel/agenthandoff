import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isMainModule } from "../src/main-module.js";

test("main-module guard accepts alternate paths to the same executable", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "agenthandoff-main-module-"));
  const executable = join(fixture, "cli.js");
  const alternate = join(fixture, "alternate.js");

  try {
    await writeFile(executable, "");
    await symlink(executable, alternate);

    assert.equal(isMainModule(pathToFileURL(executable).href, alternate), true);
    assert.equal(isMainModule(pathToFileURL(executable).href, join(fixture, "missing.js")), false);
    assert.equal(isMainModule(pathToFileURL(executable).href, undefined), false);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("CLI executes when invoked through an alternate executable path", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "agenthandoff-cli-alternate-"));
  const compiledCli = resolve(dirname(fileURLToPath(import.meta.url)), "../src/cli.js");
  const alternateCli = join(fixture, "agenthandoff.js");

  try {
    await symlink(compiledCli, alternateCli);
    const output = execFileSync(process.execPath, [alternateCli, "--help"], { encoding: "utf8" });
    assert.match(output, /^agenthandoff\n\nUsage:/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
