import type Anthropic from "@anthropic-ai/sdk";

// Result of running a tool: the text fed back to the model, plus whether it
// represents an error (surfaced as `is_error` on the tool_result block).
export type ToolResult = { content: string; isError?: boolean };

// A tool handler receives the model-supplied input (already parsed JSON) and
// returns a result. Keep handlers pure: no streaming, no request-level state.
export type ToolHandler = (
  input: Record<string, unknown>
) => Promise<ToolResult>;

// One registered tool: the schema sent to the model plus everything the
// registry needs to organize, discover, and execute it. This is the unit you
// add when the app grows — drop a ToolDef into a category module and it is
// automatically searchable and callable.
export type ToolDef = {
  // The Anthropic tool schema (name, description, input_schema) sent to the
  // model when this tool is loaded.
  definition: Anthropic.Tool;
  // Executes the tool.
  handler: ToolHandler;
  // Dotted grouping for management + discovery, e.g. "todo.read", "todo.write".
  category: string;
  // Extra search terms beyond name/description/category to aid discovery.
  keywords?: string[];
  // Core tools ship in every request (no search needed). Keep this set small —
  // everything else is discovered on demand via search_tools.
  core?: boolean;
};

// Concise result constructors.
export const ok = (content: string): ToolResult => ({ content });
export const err = (content: string): ToolResult => ({ content, isError: true });
export const json = (value: unknown): ToolResult => ({
  content: JSON.stringify(value),
});

// Log a tool invocation — name, input, and a short outcome — to the server
// console. Called once per dispatch so every tool call is traceable no matter
// how large the catalog grows. Long results are truncated to keep logs readable.
export function logToolCall(
  name: string,
  input: unknown,
  result: ToolResult
): void {
  const body =
    result.content.length > 200
      ? result.content.slice(0, 200) + "…"
      : result.content;
  const outcome = result.isError ? `error: ${body}` : body;
  console.log(`[tool] ${name}(${JSON.stringify(input)}) -> ${outcome}`);
}
