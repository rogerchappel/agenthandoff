import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await atomicWrite(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function writeText(path: string, value: string): Promise<void> {
  await atomicWrite(path, value);
}

async function atomicWrite(path: string, value: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.${path.split(/[\\/]/).pop()}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  try {
    await writeFile(temporary, value, { encoding: "utf8", flag: "wx" });
    await rename(temporary, path);
  } catch (error) {
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
}

export async function readText(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export function stateDir(cwd: string): string {
  return join(cwd, ".agenthandoff");
}

export function sessionJsonPath(cwd: string): string {
  return join(stateDir(cwd), "session.json");
}

export function sessionMarkdownPath(cwd: string): string {
  return join(stateDir(cwd), "session.md");
}

export function captureJsonPath(cwd: string): string {
  return join(stateDir(cwd), "capture.json");
}

export function handoffJsonPath(cwd: string): string {
  return join(stateDir(cwd), "handoff.json");
}

export function handoffMarkdownPath(cwd: string): string {
  return join(cwd, "HANDOFF.md");
}
