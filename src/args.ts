export interface ParsedArgs {
  command: string;
  flags: Record<string, string[]>;
  positionals: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const flags: Record<string, string[]> = {};
  const positionals: string[] = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token) continue;
    if (token.startsWith("--")) {
      const [keyRaw, inlineValue] = token.slice(2).split("=", 2);
      const key = keyRaw ?? "";
      const next = rest[index + 1];
      const value = inlineValue ?? (next && !next.startsWith("--") ? rest[++index] : "true");
      flags[key] = [...(flags[key] ?? []), value ?? "true"];
    } else {
      positionals.push(token);
    }
  }
  return { command, flags, positionals };
}

export function flag(flags: Record<string, string[]>, name: string): string | undefined {
  return flags[name]?.at(-1);
}

export function flagAll(flags: Record<string, string[]>, name: string): string[] {
  return flags[name] ?? [];
}
