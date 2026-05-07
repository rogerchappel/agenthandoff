import type { ChangedFile, CommandLog, HandoffPacket } from "./types.js";

function list(items: string[], empty: string): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${empty}`;
}

function fileLine(file: ChangedFile): string {
  return `- ${file.path} (${file.kind}; index=${file.index}, worktree=${file.workingTree})`;
}

function commandLine(log: CommandLog): string {
  const exit = log.exitCode === null ? "unknown exit" : `exit ${log.exitCode}`;
  return `- ${log.command}: ${log.status} (${exit}) — ${log.path}`;
}

export function renderMarkdown(packet: HandoffPacket): string {
  const scripts = Object.entries(packet.packageScripts.scripts).map(([name, cmd]) => `- \`${name}\`: ${cmd}`);
  const validation = packet.validation.issues.map((issue) => `- ${issue.level.toUpperCase()} ${issue.code}: ${issue.message}`);
  return `# Handoff: ${packet.repo.name}\n\nGenerated: ${packet.generatedAt}\n\n## Summary\n\n${list(packet.summary, "No summary captured.")}\n\n## Git\n\n- Branch: ${packet.git.branch}\n- HEAD: ${packet.git.headShort} (${packet.git.head})\n- Upstream: ${packet.git.upstream ?? "none"}\n- Ahead/behind: ${packet.git.ahead}/${packet.git.behind}\n- Dirty: ${packet.git.dirty ? "yes" : "no"}\n- Started from: ${packet.git.startedFrom ?? "unknown"}\n- Stale start ref: ${packet.git.staleStartRef ? "yes" : "no"}\n\n### Recent commits\n\n${list(packet.git.recentCommits, "No commits found.")}\n\n## Changed Files\n\n${packet.changedFiles.length ? packet.changedFiles.map(fileLine).join("\n") : "- None"}\n\n## Package Scripts\n\n- Manager: ${packet.packageScripts.manager}\n- Package: ${packet.packageScripts.name ?? "unknown"} ${packet.packageScripts.version ?? ""}\n\n${scripts.length ? scripts.join("\n") : "- None"}\n\n## Tests Run\n\n${list(packet.tests, "No tests recorded.")}\n\n## Command Logs\n\n${packet.commandLogs.length ? packet.commandLogs.map(commandLine).join("\n") : "- None"}\n\n## Risks\n\n${list(packet.risks, "No risks captured.")}\n\n## Next Steps\n\n${list(packet.nextSteps, "No next steps captured.")}\n\n## Validation\n\n- OK: ${packet.validation.ok ? "yes" : "no"}\n${validation.length ? validation.join("\n") : "- No validation issues."}\n`;
}
