import { randomUUID } from "node:crypto";
import { collectGitFacts, gitRoot } from "./git.js";
import { ensureDir, sessionJsonPath, sessionMarkdownPath, stateDir, writeJson, writeText } from "./fs.js";
import type { SessionInfo } from "./types.js";

export interface StartOptions {
  cwd: string;
  title?: string | undefined;
  notes?: string[];
}

export async function startSession(options: StartOptions): Promise<SessionInfo> {
  const root = await gitRoot(options.cwd);
  const git = await collectGitFacts(root);
  const session: SessionInfo = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    cwd: root,
    title: options.title ?? "Agent handoff session",
    startedFrom: git.head,
    notes: options.notes ?? []
  };
  await ensureDir(stateDir(root));
  await writeJson(sessionJsonPath(root), session);
  await writeText(sessionMarkdownPath(root), renderSession(session));
  return session;
}

export function renderSession(session: SessionInfo): string {
  const notes = session.notes.length ? session.notes.map((note) => `- ${note}`).join("\n") : "- No notes yet.";
  return `# agenthandoff session\n\n- ID: ${session.id}\n- Created: ${session.createdAt}\n- Title: ${session.title}\n- Started from: ${session.startedFrom ?? "unknown"}\n\n## Notes\n\n${notes}\n`;
}
