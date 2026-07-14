import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";
import {
  getTool,
  coreTools,
  searchTools,
  toolCount,
  categories,
} from "@/lib/tools/registry";
import { logToolCall, type ToolResult } from "@/lib/tools/types";

// The SDK call needs the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-8";

// Debug dump of the last request/response — overwritten on every request.
const DEBUG_DIR = path.join(process.cwd(), "chat-logs");

// Append-only history of every AI call (success + error), one JSON per line.
const AI_LOG_DIR = path.join(process.cwd(), "ai-logs");
const AI_LOG_FILE = path.join(AI_LOG_DIR, "requests.jsonl");

type AiLogEntry = {
  timestamp: string;
  model: string;
  request: Anthropic.MessageCreateParamsNonStreaming;
  response?: Anthropic.Message;
  error?: string;
};

async function appendAiLog(entry: AiLogEntry): Promise<void> {
  try {
    await fs.mkdir(AI_LOG_DIR, { recursive: true });
    await fs.appendFile(AI_LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // Logging is best-effort — never break the chat response.
  }
}

// Dump the most recent tool call — name, input, output — into chat-logs.
async function dumpToolCall(
  name: string,
  input: unknown,
  output: ToolResult
): Promise<void> {
  try {
    await fs.mkdir(DEBUG_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DEBUG_DIR, "last-tool-call.json"),
      JSON.stringify({ name, input, output }, null, 2),
      "utf8"
    );
  } catch {
    // Best-effort — never break the chat response.
  }
}

async function dumpDebug(
  request: Anthropic.MessageCreateParamsNonStreaming,
  response: Anthropic.Message
): Promise<void> {
  try {
    await fs.mkdir(DEBUG_DIR, { recursive: true });

    const answer = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const transcript = [
      "=== SYSTEM ===",
      typeof request.system === "string" ? request.system : "",
      "",
      "=== MESSAGES ===",
      ...request.messages.map(
        (m) =>
          `[${m.role}] ${
            typeof m.content === "string"
              ? m.content
              : JSON.stringify(m.content)
          }`
      ),
      "",
      "=== RESPONSE ===",
      answer,
      "",
      `stop_reason: ${response.stop_reason}`,
      `usage: in=${response.usage.input_tokens} out=${response.usage.output_tokens}`,
    ].join("\n");

    await Promise.all([
      fs.writeFile(
        path.join(DEBUG_DIR, "request.json"),
        JSON.stringify(request, null, 2),
        "utf8"
      ),
      fs.writeFile(
        path.join(DEBUG_DIR, "response.json"),
        JSON.stringify(response, null, 2),
        "utf8"
      ),
      fs.writeFile(path.join(DEBUG_DIR, "transcript.txt"), transcript, "utf8"),
    ]);
  } catch {
    // Debug dump is best-effort — never break the chat response.
  }
}

const SYSTEM_PROMPT = [
  "You are a friendly, capable assistant for a person's personal todos.",
  "Help them think through, prioritize, group, reflect on, and manage their tasks.",
  "",
  `You have access to a large toolset (${toolCount()} tools across the categories: ${categories().join(
    ", "
  )}), but only a small core set is loaded up front to keep the context small.`,
  "When you need a capability you don't currently have a tool for — adding,",
  "completing, editing, deleting, looking up by position, and more — call the",
  "search_tools tool with keywords describing what you need (e.g. 'add todo',",
  "'mark done', 'delete', 'first todo'). The matching tools become callable on",
  "your next turn. Always search before telling the user something can't be done.",
  "",
  "You do not have their list memorized: search_todos (a core tool) reads, counts,",
  "and finds todos — use an empty query to browse, and page through when there are",
  "many. Tools that modify a specific todo need its id; look it up with a read tool",
  "first. Deleting is permanent and cannot be undone, so only delete when clearly",
  "asked, and confirm first if the request is ambiguous.",
  "",
  "CRITICAL: Never tell the user that an action (add, complete, edit, delete, or",
  "clear) succeeded unless a tool call in THIS turn returned a successful result.",
  "Do not report success from memory or assumption. If you don't have the tool",
  "loaded, call search_tools to load it, then call the tool — a modifying tool",
  "needs the target todo's id, so look it up with a read tool first. When the user",
  "confirms a pending action (e.g. replies 'yes'), you must actually carry it out",
  "with the tool before saying it's done; a confirmation is not itself the action.",
  "Be concise and conversational. Respond with your answer directly, no preamble.",
].join("\n");

// The one tool always present alongside the core set: it lets the model discover
// and lazy-load the rest of the catalog instead of shipping every schema up front.
const SEARCH_TOOLS_TOOL: Anthropic.Tool = {
  name: "search_tools",
  description:
    `Discover tools by capability. This assistant has ${toolCount()} tools total, ` +
    "but only a core set is loaded up front to save context. Call this with " +
    "keywords for the capability you need (e.g. 'delete todo', 'mark done', " +
    "'find by status') and it returns matching tools; each returned tool becomes " +
    "callable on your next turn. If you lack a tool for the user's request, " +
    "search for it before giving up.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Keywords describing the capability you need, e.g. 'add todo' or " +
          "'search by status'. Use an empty string to browse the catalog.",
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 25,
        description: "Maximum number of tools to return. Defaults to 8.",
      },
    },
    required: ["query"],
  },
};

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { messages?: unknown };
  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    return Response.json({ error: "messages is required" }, { status: 400 });
  }

  // Keep only well-formed, non-empty user/assistant turns.
  const messages: ChatMessage[] = data.messages
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof (m as ChatMessage).content === "string" &&
        ((m as ChatMessage).role === "user" ||
          (m as ChatMessage).role === "assistant") &&
        (m as ChatMessage).content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0 || messages[0].role !== "user") {
    return Response.json(
      { error: "Conversation must start with a user message." },
      { status: 400 }
    );
  }

  const client = new Anthropic();

  // Running conversation the agentic loop appends to (assistant turns + tool
  // results). Seeded with the client-supplied history.
  const conversation: Anthropic.MessageParam[] = [...messages];

  // Tools sent to the model this request. Starts as the core set; search_tools
  // adds discovered tools here so they become callable on subsequent turns.
  // A Set keeps loading idempotent as the same tool is discovered/called again.
  const loaded = new Set<string>(coreTools().map((t) => t.definition.name));

  function currentTools(): Anthropic.Tool[] {
    const defs: Anthropic.Tool[] = [SEARCH_TOOLS_TOOL];
    for (const name of Array.from(loaded)) {
      const tool = getTool(name);
      if (tool) defs.push(tool.definition);
    }
    return defs;
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastRequest: Anthropic.MessageCreateParamsNonStreaming | null = null;
      try {
        // Tool-use loop: stream a turn; run any tool calls (including
        // search_tools, which lazy-loads more tools), feed results back, and
        // stream the next turn — until the model stops. Extra rounds give the
        // model room to discover tools and then use them.
        const MAX_ROUNDS = 10;
        for (let round = 0; round < MAX_ROUNDS; round++) {
          const requestParams: Anthropic.MessageCreateParamsNonStreaming = {
            model: MODEL,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: currentTools(),
            messages: conversation,
          };
          lastRequest = requestParams;

          const stream = client.messages.stream(requestParams);
          stream.on("text", (delta) => {
            controller.enqueue(encoder.encode(delta));
          });
          const final = await stream.finalMessage();

          await dumpDebug(requestParams, final);
          await appendAiLog({
            timestamp: new Date().toISOString(),
            model: MODEL,
            request: requestParams,
            response: final,
          });

          conversation.push({ role: "assistant", content: final.content });

          if (final.stop_reason !== "tool_use") break;

          // Execute every tool call and return all results in one user turn.
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of final.content) {
            if (block.type !== "tool_use") continue;
            const input = (block.input ?? {}) as Record<string, unknown>;
            let result: ToolResult;

            if (block.name === "search_tools") {
              const query =
                typeof input.query === "string" ? input.query : "";
              const max =
                typeof input.max_results === "number"
                  ? input.max_results
                  : 8;
              const hits = searchTools(query, max);
              // Lazy-load: discovered tools ship in the next request.
              for (const hit of hits) loaded.add(hit.name);
              result = {
                content: JSON.stringify({
                  query,
                  matched: hits.length,
                  tools: hits,
                  note:
                    hits.length > 0
                      ? "These tools are now loaded and callable on your next turn."
                      : "No tools matched. Try different keywords.",
                }),
              };
            } else {
              const tool = getTool(block.name);
              if (!tool) {
                result = {
                  content: `Unknown tool: ${block.name}. Use search_tools to find the right tool.`,
                  isError: true,
                };
              } else {
                // Ensure it stays loaded for the rest of the conversation.
                loaded.add(block.name);
                result = await tool.handler(input);
              }
            }

            logToolCall(block.name, input, result);
            await dumpToolCall(block.name, block.input, result);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result.content,
              is_error: result.isError ?? false,
            });
          }
          conversation.push({ role: "user", content: toolResults });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Streaming failed";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        await appendAiLog({
          timestamp: new Date().toISOString(),
          model: MODEL,
          request: lastRequest ?? {
            model: MODEL,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: currentTools(),
            messages: conversation,
          },
          error: msg,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
