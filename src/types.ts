export interface CommandLog {
  path: string;
  command: string;
  exitCode: number | null;
  status: "passed" | "failed" | "unknown";
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  outputPreview: string;
}

export interface ChangedFile {
  path: string;
  index: string;
  workingTree: string;
  kind: "added" | "modified" | "deleted" | "renamed" | "copied" | "untracked" | "unknown";
}

export interface GitFacts {
  root: string;
  branch: string;
  head: string;
  headShort: string;
  upstream?: string | undefined;
  ahead: number;
  behind: number;
  dirty: boolean;
  statusShort: string;
  recentCommits: string[];
  startedFrom?: string | undefined;
  staleStartRef: boolean;
}

export interface PackageFacts {
  manager: "npm" | "pnpm" | "yarn" | "bun" | "unknown";
  name?: string | undefined;
  version?: string | undefined;
  scripts: Record<string, string>;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  cwd: string;
  title: string;
  startedFrom?: string | undefined;
  notes: string[];
}

export interface HandoffPacket {
  schemaVersion: "0.1.0";
  generatedAt: string;
  repo: {
    name: string;
    root: string;
  };
  session: SessionInfo;
  git: GitFacts;
  changedFiles: ChangedFile[];
  packageScripts: PackageFacts;
  commandLogs: CommandLog[];
  summary: string[];
  tests: string[];
  risks: string[];
  nextSteps: string[];
  validation: ValidationResult;
}

export interface ValidationIssue {
  level: "error" | "warning";
  code: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface CliOptions {
  cwd: string;
  args: string[];
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
}
