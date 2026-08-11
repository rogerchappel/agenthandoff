import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectChangedFiles, parseChangedFile, parsePorcelainStatus } from "../src/git.js";

function git(cwd: string, ...args: string[]): void {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

async function withRepository(run: (cwd: string) => Promise<void>): Promise<void> {
  const cwd = await mkdtemp(join(tmpdir(), "agenthandoff-git-"));
  try {
    git(cwd, "init");
    git(cwd, "config", "user.email", "test@example.com");
    git(cwd, "config", "user.name", "Test");
    await run(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

test("parseChangedFile detects modified files", () => {
  assert.deepEqual(parseChangedFile(" M src/index.ts"), {
    path: "src/index.ts",
    index: " ",
    workingTree: "M",
    kind: "modified"
  });
});

test("parseChangedFile detects renamed target path", () => {
  const file = parseChangedFile("R  old.ts -> new.ts");
  assert.equal(file.path, "new.ts");
  assert.equal(file.kind, "renamed");
});

test("collectChangedFiles preserves spaces and non-ASCII characters", async () => {
  await withRepository(async (cwd) => {
    await writeFile(join(cwd, "space name.txt"), "space\n");
    await writeFile(join(cwd, "café.txt"), "coffee\n");
    await writeFile(join(cwd, "quote \" -> name.txt"), "quoted\n");

    const files = await collectChangedFiles(cwd);

    assert.deepEqual(files.map((file) => file.path).sort(), ["café.txt", "quote \" -> name.txt", "space name.txt"]);
    assert.ok(files.every((file) => file.kind === "untracked"));
  });
});

test("collectChangedFiles uses the destination path for renames", async () => {
  await withRepository(async (cwd) => {
    await writeFile(join(cwd, "rename source.txt"), "rename me\n");
    git(cwd, "add", ".");
    git(cwd, "commit", "-m", "fixtures");
    git(cwd, "mv", "rename source.txt", "renamed café.txt");
    git(cwd, "add", ".");

    const files = await collectChangedFiles(cwd);

    assert.deepEqual(files.map((file) => [file.kind, file.path]), [["renamed", "renamed café.txt"]]);
  });
});

test("parsePorcelainStatus consumes the source record for copies", () => {
  assert.deepEqual(parsePorcelainStatus("C  copied café.txt\0copy source.txt\0"), [{
    path: "copied café.txt",
    index: "C",
    workingTree: " ",
    kind: "copied"
  }]);
});
