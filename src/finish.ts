import { capture, type CaptureOptions } from "./capture.js";
import { handoffJsonPath, handoffMarkdownPath, writeJson, writeText } from "./fs.js";
import { renderMarkdown } from "./render.js";
import type { HandoffPacket } from "./types.js";
import { sentence, uniqueNonEmpty } from "./format.js";

export interface FinishOptions extends CaptureOptions {
  summary?: string[];
  tests?: string[];
  risks?: string[];
  nextSteps?: string[];
}

export async function finish(options: FinishOptions): Promise<HandoffPacket> {
  const packet = await capture(options);
  if (options.summary?.length) packet.summary = uniqueNonEmpty(options.summary).map(sentence);
  if (options.tests?.length) packet.tests = uniqueNonEmpty([...packet.tests, ...options.tests]);
  if (options.risks?.length) packet.risks = uniqueNonEmpty(options.risks).map(sentence);
  if (options.nextSteps?.length) packet.nextSteps = uniqueNonEmpty(options.nextSteps).map(sentence);
  const markdown = renderMarkdown(packet);
  await writeText(handoffMarkdownPath(packet.repo.root), markdown);
  await writeJson(handoffJsonPath(packet.repo.root), packet);
  return packet;
}
