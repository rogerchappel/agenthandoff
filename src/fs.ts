import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function writeText(path: string, value: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value, "utf8");
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
