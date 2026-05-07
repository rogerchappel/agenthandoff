#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs, flag, flagAll } from "./args.js";
import { capture } from "./capture.js";
import { finish } from "./finish.js";
import { startSession } from "./session.js";
import { validateMarkdown } from "./validate.js";
import type { CliOptions } from "./types.js";

const HELP = `agenthandoff\n\nUsage:\n  agenthandoff start [--title text] [--note text]\n  agenthandoff capture [--log path] [--json]\n  agenthandoff finish [--log path] [--summary text] [--test text] [--risk text] [--next text]\n  agenthandoff validate [HANDOFF.md] [--json]\n`;

export async function runCli(options: CliOptions): Promise<number> {
  const parsed = parseArgs(options.args);
  const cwd = options.cwd;
  try {
    if (parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h") {
      options.stdout.write(HELP);
      return 0;
    }
    if (parsed.command === "start") {
      const session = await startSession({ cwd, title: flag(parsed.flags, "title"), notes: flagAll(parsed.flags, "note") });
      options.stdout.write(`Started handoff session ${session.id}\n`);
      return 0;
    }
    if (parsed.command === "capture") {
      const packet = await capture({ cwd, commandLogPaths: flagAll(parsed.flags, "log").map((path) => resolve(cwd, path)) });
      options.stdout.write(flag(parsed.flags, "json") ? `${JSON.stringify(packet, null, 2)}\n` : `Captured ${packet.changedFiles.length} changed file(s).\n`);
      return packet.validation.ok ? 0 : 1;
    }
    if (parsed.command === "finish") {
      const packet = await finish({
        cwd,
        commandLogPaths: flagAll(parsed.flags, "log").map((path) => resolve(cwd, path)),
        summary: flagAll(parsed.flags, "summary"),
        tests: flagAll(parsed.flags, "test"),
        risks: flagAll(parsed.flags, "risk"),
        nextSteps: flagAll(parsed.flags, "next")
      });
      options.stdout.write(`Wrote HANDOFF.md for ${packet.repo.name}.\n`);
      return packet.validation.ok ? 0 : 1;
    }
    if (parsed.command === "validate") {
      const path = resolve(cwd, parsed.positionals[0] ?? "HANDOFF.md");
      const result = validateMarkdown(await readFile(path, "utf8"));
      if (flag(parsed.flags, "json")) options.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else options.stdout.write(result.ok ? "Handoff is valid.\n" : `Handoff is invalid (${result.issues.length} issue(s)).\n`);
      for (const issue of result.issues) options.stderr.write(`${issue.level}: ${issue.code}: ${issue.message}\n`);
      return result.ok ? 0 : 1;
    }
    options.stderr.write(`Unknown command: ${parsed.command}\n${HELP}`);
    return 2;
  } catch (error) {
    options.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = await runCli({ cwd: process.cwd(), args: process.argv.slice(2), stdout: process.stdout, stderr: process.stderr });
  process.exitCode = code;
}
