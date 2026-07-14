import type { ToolDef } from "./types";
import { todoReadTools } from "./todoReadTools";
import { todoWriteTools } from "./todoWriteTools";

// The full catalog. To add capabilities as the app grows, create a new category
// module (e.g. lib/tools/tagTools.ts) exporting a ToolDef[] and spread it here.
// Everything else — discovery, loading, dispatch — works automatically.
const REGISTRY: ToolDef[] = [...todoReadTools, ...todoWriteTools];

const BY_NAME = new Map<string, ToolDef>(
  REGISTRY.map((t) => [t.definition.name, t])
);

export function getTool(name: string): ToolDef | undefined {
  return BY_NAME.get(name);
}

// Tools loaded up front in every request. Keep this small — it's the fixed
// token cost paid on every turn regardless of how large the catalog grows.
export function coreTools(): ToolDef[] {
  return REGISTRY.filter((t) => t.core);
}

export function toolCount(): number {
  return REGISTRY.length;
}

export function categories(): string[] {
  return Array.from(new Set(REGISTRY.map((t) => t.category))).sort();
}

export type ToolSearchHit = {
  name: string;
  description: string;
  category: string;
};

function describe(t: ToolDef): string {
  return typeof t.definition.description === "string"
    ? t.definition.description
    : "";
}

// Rank the catalog against space-separated query terms. A term is matched
// against the tool name (highest weight), category, keywords, then description.
// Returns the top `maxResults` hits. An empty query browses the catalog.
export function searchTools(query: string, maxResults = 8): ToolSearchHit[] {
  const limit = Math.max(1, Math.min(25, Math.floor(maxResults) || 8));
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = REGISTRY.map((t) => {
    const name = t.definition.name.toLowerCase();
    const category = t.category.toLowerCase();
    const keywords = (t.keywords ?? []).join(" ").toLowerCase();
    const description = describe(t).toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (name.includes(term)) score += 5;
      if (category.includes(term)) score += 3;
      if (keywords.includes(term)) score += 2;
      if (description.includes(term)) score += 1;
    }
    return { t, score };
  });

  const hits =
    terms.length === 0
      ? scored
      : scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  return hits.slice(0, limit).map(({ t }) => ({
    name: t.definition.name,
    description: describe(t),
    category: t.category,
  }));
}
