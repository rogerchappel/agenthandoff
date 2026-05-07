import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PackageFacts } from "./types.js";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function detectPackageManager(cwd: string): Promise<PackageFacts["manager"]> {
  if (await exists(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (await exists(join(cwd, "yarn.lock"))) return "yarn";
  if (await exists(join(cwd, "bun.lockb")) || await exists(join(cwd, "bun.lock"))) return "bun";
  if (await exists(join(cwd, "package-lock.json"))) return "npm";
  if (await exists(join(cwd, "package.json"))) return "npm";
  return "unknown";
}

export async function collectPackageFacts(cwd: string): Promise<PackageFacts> {
  const manager = await detectPackageManager(cwd);
  try {
    const pkg = JSON.parse(await readFile(join(cwd, "package.json"), "utf8")) as {
      name?: string;
      version?: string;
      scripts?: Record<string, string>;
    };
    return { manager, name: pkg.name, version: pkg.version, scripts: pkg.scripts ?? {} };
  } catch {
    return { manager, scripts: {} };
  }
}
