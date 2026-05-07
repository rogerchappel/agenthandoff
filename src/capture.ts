import { basename } from "node:path";
import { captureJsonPath, readJson, sessionJsonPath, writeJson } from "./fs.js";
import { collectChangedFiles, collectGitFacts, gitRoot } from "./git.js";
import { collectPackageFacts } from "./package.js";
import { readCommandLogs } from "./command-log.js";
import type { HandoffPacket, SessionInfo } from "./types.js";
import { validatePacket } from "./validate.js";

export interface CaptureOptions {
  cwd: string;
  commandLogPaths?: string[];
}

async function readSession(cwd: string): Promise<SessionInfo> {
  try {
    return await readJson<SessionInfo>(sessionJsonPath(cwd));
  } catch {
    return {
      id: "ad-hoc",
      createdAt: new Date().toISOString(),
      cwd,
      title: "Ad-hoc handoff",
      notes: []
    };
  }
}

export async function capture(options: CaptureOptions): Promise<HandoffPacket> {
  const root = await gitRoot(options.cwd);
  const session = await readSession(root);
  const git = await collectGitFacts(root, session.startedFrom);
  const changedFiles = await collectChangedFiles(root);
  const packageScripts = await collectPackageFacts(root);
  const commandLogs = await readCommandLogs(options.commandLogPaths ?? []);
  const packet: HandoffPacket = {
    schemaVersion: "0.1.0",
    generatedAt: new Date().toISOString(),
    repo: { name: basename(root), root },
    session,
    git,
    changedFiles,
    packageScripts,
    commandLogs,
    summary: buildSummary(changedFiles.length, commandLogs.length, git.dirty),
    tests: commandLogs.map((log) => `${log.command}: ${log.status}${log.exitCode === null ? "" : ` (${log.exitCode})`}`),
    risks: buildRisks(git.staleStartRef, commandLogs.some((log) => log.status === "failed")),
    nextSteps: ["Review changed files", "Run relevant verification", "Resolve any validation warnings"] ,
    validation: { ok: true, issues: [] }
  };
  packet.validation = validatePacket(packet);
  await writeJson(captureJsonPath(root), packet);
  return packet;
}

function buildSummary(changedCount: number, logCount: number, dirty: boolean): string[] {
  return [
    dirty ? `Working tree has ${changedCount} changed file(s).` : "Working tree is clean.",
    logCount ? `Captured ${logCount} command log(s).` : "No command logs were supplied."
  ];
}

function buildRisks(staleStartRef: boolean, failedLogs: boolean): string[] {
  const risks: string[] = [];
  if (staleStartRef) risks.push("Session start ref is stale relative to HEAD.");
  if (failedLogs) risks.push("One or more command logs reported failure.");
  if (!risks.length) risks.push("No explicit risks captured yet.");
  return risks;
}
