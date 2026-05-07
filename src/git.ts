import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ChangedFile, GitFacts } from "./types.js";

const execFileAsync = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd, encoding: "utf8" });
  return stdout.trimEnd();
}

async function gitOr(cwd: string, args: string[], fallback = ""): Promise<string> {
  try {
    return await git(cwd, args);
  } catch {
    return fallback;
  }
}

export async function gitRoot(cwd: string): Promise<string> {
  const root = await gitOr(cwd, ["rev-parse", "--show-toplevel"]);
  return root || cwd;
}

export function parseChangedFile(line: string): ChangedFile {
  const index = line.slice(0, 1).trim() || " ";
  const workingTree = line.slice(1, 2).trim() || " ";
  const rawPath = line.slice(3);
  const path = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) ?? rawPath : rawPath;
  const code = `${index}${workingTree}`;
  let kind: ChangedFile["kind"] = "unknown";
  if (code.includes("?")) kind = "untracked";
  else if (code.includes("A")) kind = "added";
  else if (code.includes("D")) kind = "deleted";
  else if (code.includes("R")) kind = "renamed";
  else if (code.includes("C")) kind = "copied";
  else if (code.includes("M")) kind = "modified";
  return { path, index, workingTree, kind };
}

export async function collectChangedFiles(cwd: string): Promise<ChangedFile[]> {
  const status = await gitOr(cwd, ["status", "--short"]);
  return status.split("\n").filter(Boolean).map(parseChangedFile);
}

function parseAheadBehind(raw: string): { ahead: number; behind: number } {
  const [aheadRaw = "0", behindRaw = "0"] = raw.trim().split("\t");
  return { ahead: Number(aheadRaw) || 0, behind: Number(behindRaw) || 0 };
}

export async function collectGitFacts(cwd: string, startedFrom?: string): Promise<GitFacts> {
  const root = await gitRoot(cwd);
  const branch = await gitOr(root, ["branch", "--show-current"], "detached");
  const head = await gitOr(root, ["rev-parse", "HEAD"], "unknown");
  const headShort = await gitOr(root, ["rev-parse", "--short", "HEAD"], "unknown");
  const upstream = await gitOr(root, ["rev-parse", "--abbrev-ref", "@{upstream}"]);
  const counts = upstream ? parseAheadBehind(await gitOr(root, ["rev-list", "--left-right", "--count", `${upstream}...HEAD`])) : { ahead: 0, behind: 0 };
  const statusShort = await gitOr(root, ["status", "--short"]);
  const recentCommits = (await gitOr(root, ["log", "--oneline", "-5"])).split("\n").filter(Boolean);
  const staleStartRef = Boolean(startedFrom && startedFrom !== head);
  return {
    root,
    branch: branch || "detached",
    head,
    headShort,
    upstream: upstream || undefined,
    ahead: counts.ahead,
    behind: counts.behind,
    dirty: statusShort.length > 0,
    statusShort,
    recentCommits,
    startedFrom,
    staleStartRef
  };
}
