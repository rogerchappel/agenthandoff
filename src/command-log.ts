import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { CommandLog } from "./types.js";

function parseExitCode(text: string): number | null {
  const patterns = [/exit(?: code)?:\s*(\d+)/i, /status:\s*(\d+)/i, /\[exit=(\d+)\]/i];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  return null;
}

function parseCommand(path: string, text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const commandMatch = firstLine.match(/^(?:\$|command:)\s*(.+)$/i);
  if (commandMatch?.[1]) return commandMatch[1].trim();
  return basename(path).replace(/\.(log|txt|md)$/i, "");
}

export async function readCommandLog(path: string): Promise<CommandLog> {
  const text = await readFile(path, "utf8");
  const exitCode = parseExitCode(text);
  const status: CommandLog["status"] = exitCode === null ? "unknown" : exitCode === 0 ? "passed" : "failed";
  const outputPreview = text.split(/\r?\n/).slice(0, 30).join("\n").slice(0, 3000);
  return { path, command: parseCommand(path, text), exitCode, status, outputPreview };
}

export async function readCommandLogs(paths: string[]): Promise<CommandLog[]> {
  const logs: CommandLog[] = [];
  for (const path of paths) {
    logs.push(await readCommandLog(path));
  }
  return logs;
}
