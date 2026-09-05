import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The master document the landing-page chat is grounded on. Kept as a plain
 * Markdown file next to this module so it can be reviewed and edited without
 * touching code — see master-context.md for the actual content and the rule
 * that governs it (published site copy only, no invented claims).
 */
let cached: string | null = null;

export function getMasterContext(): string {
  if (cached !== null) return cached;
  cached = readFileSync(
    join(process.cwd(), "src/lib/evi-chat/master-context.md"),
    "utf-8",
  );
  return cached;
}
