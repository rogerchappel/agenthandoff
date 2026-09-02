export interface ParsedArgs {
  command: string;
  flags: Record<string, string[]>;
  positionals: string[];
}

const COMMAND_FLAGS: Record<string, Record<string, "boolean" | "value">> = {
  start: { title: "value", note: "value" },
  capture: { log: "value", json: "boolean" },
  finish: { log: "value", summary: "value", test: "value", risk: "value", next: "value" },
  validate: { json: "boolean" }
};

const COMMAND_POSITIONAL_LIMITS: Record<string, number> = {
  start: 0,
  capture: 0,
  finish: 0,
  validate: 1
};

export function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const commandFlags = COMMAND_FLAGS[command];
  const flags: Record<string, string[]> = {};
  const positionals: string[] = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token) continue;
    if (token.startsWith("--")) {
      const [keyRaw, inlineValue] = token.slice(2).split("=", 2);
      const key = keyRaw ?? "";
      const kind = commandFlags?.[key];
      if (!kind) throw new Error(`Unknown flag --${key || "<empty>"} for ${command}. Run agenthandoff --help for usage.`);
      if (kind === "boolean") {
        if (inlineValue !== undefined) throw new Error(`Flag --${key} does not accept a value.`);
        flags[key] = [...(flags[key] ?? []), "true"];
        continue;
      }
      const next = rest[index + 1];
      const value = inlineValue ?? (next && !next.startsWith("--") ? rest[++index] : undefined);
      if (value === undefined || value === "") throw new Error(`Flag --${key} requires a value.`);
      flags[key] = [...(flags[key] ?? []), value];
    } else {
      positionals.push(token);
    }
  }
  const positionalLimit = COMMAND_POSITIONAL_LIMITS[command];
  if (positionalLimit === 0 && positionals.length > 0) {
    throw new Error(`${command} does not accept positional arguments. Run agenthandoff --help for usage.`);
  }
  if (positionalLimit !== undefined && positionals.length > positionalLimit) {
    throw new Error(`${command} accepts at most one positional path. Run agenthandoff --help for usage.`);
  }
  return { command, flags, positionals };
}

export function flag(flags: Record<string, string[]>, name: string): string | undefined {
  return flags[name]?.at(-1);
}

export function flagAll(flags: Record<string, string[]>, name: string): string[] {
  return flags[name] ?? [];
}
