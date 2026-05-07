import { capture, type CaptureOptions } from "./capture.js";
import { handoffJsonPath, handoffMarkdownPath, writeJson, writeText } from "./fs.js";
import { renderMarkdown } from "./render.js";
import type { HandoffPacket } from "./types.js";

export interface FinishOptions extends CaptureOptions {
  summary?: string[];
  tests?: string[];
  risks?: string[];
  nextSteps?: string[];
}

export async function finish(options: FinishOptions): Promise<HandoffPacket> {
  const packet = await capture(options);
  if (options.summary?.length) packet.summary = options.summary;
  if (options.tests?.length) packet.tests = [...packet.tests, ...options.tests];
  if (options.risks?.length) packet.risks = options.risks;
  if (options.nextSteps?.length) packet.nextSteps = options.nextSteps;
  const markdown = renderMarkdown(packet);
  await writeText(handoffMarkdownPath(packet.repo.root), markdown);
  await writeJson(handoffJsonPath(packet.repo.root), packet);
  return packet;
}
