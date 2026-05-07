import type { HandoffPacket, ValidationIssue, ValidationResult } from "./types.js";

export const REQUIRED_SECTIONS = [
  "Summary",
  "Git",
  "Changed Files",
  "Package Scripts",
  "Tests Run",
  "Command Logs",
  "Risks",
  "Next Steps",
  "Validation"
];

export function validatePacket(packet: HandoffPacket): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!packet.summary.length) issues.push(error("summary.empty", "Summary must include at least one bullet."));
  if (!packet.nextSteps.length) issues.push(error("nextSteps.empty", "Next steps must include at least one bullet."));
  if (!packet.risks.length) issues.push(warn("risks.empty", "Risk list is empty; explicitly state if no risks are known."));
  if (packet.git.staleStartRef) issues.push(warn("git.staleStartRef", "Session started from a different commit than HEAD."));
  for (const log of packet.commandLogs) {
    if (log.status === "failed") issues.push(error("command.failed", `${log.command} failed with exit ${log.exitCode ?? "unknown"}.`));
  }
  return { ok: !issues.some((issue) => issue.level === "error"), issues };
}

export function validateMarkdown(markdown: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  for (const section of REQUIRED_SECTIONS) {
    const pattern = new RegExp(`^## ${escapeRegExp(section)}\\s*$`, "m");
    if (!pattern.test(markdown)) issues.push(error("markdown.missingSection", `Missing required section: ${section}.`));
  }
  const staleLine = markdown.match(/^- Stale start ref:\s*(.+)$/m)?.[1]?.trim().toLowerCase();
  if (staleLine === "yes") issues.push(warn("git.staleStartRef", "Handoff reports a stale start ref."));
  const failedCommand = /^- .*: failed \(/m.test(markdown);
  if (failedCommand) issues.push(error("command.failed", "Handoff includes a failed command log."));
  return { ok: !issues.some((issue) => issue.level === "error"), issues };
}

function error(code: string, message: string): ValidationIssue {
  return { level: "error", code, message };
}

function warn(code: string, message: string): ValidationIssue {
  return { level: "warning", code, message };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
