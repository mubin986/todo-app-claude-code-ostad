import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "todos.json");

// Log a data-access function call — its arguments and a short outcome — to the
// server console, so tool calls from the chat route are traceable.
function logCall(fn: string, args: unknown, outcome: string): void {
  console.log(`[todos] ${fn}(${JSON.stringify(args)}) -> ${outcome}`);
}

export async function readTodos(): Promise<Todo[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // File missing or malformed — start fresh.
    return [];
  }
}

async function writeTodos(all: Todo[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function addTodo(text: string): Promise<Todo> {
  const all = await readTodos();
  const todo: Todo = {
    id: randomUUID(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };
  all.push(todo);
  await writeTodos(all);
  logCall("addTodo", { text }, todo.id);
  return todo;
}

export async function updateTodo(
  id: string,
  patch: Partial<Pick<Todo, "text" | "done">>
): Promise<Todo | null> {
  const all = await readTodos();
  const todo = all.find((t) => t.id === id);
  if (!todo) {
    logCall("updateTodo", { id, patch }, "not found");
    return null;
  }
  if (typeof patch.text === "string") todo.text = patch.text;
  if (typeof patch.done === "boolean") todo.done = patch.done;
  await writeTodos(all);
  logCall("updateTodo", { id, patch }, "updated");
  return todo;
}

export async function deleteTodo(id: string): Promise<boolean> {
  const all = await readTodos();
  const next = all.filter((t) => t.id !== id);
  const removed = next.length !== all.length;
  if (removed) await writeTodos(next);
  logCall("deleteTodo", { id }, removed ? "deleted" : "not found");
  return removed;
}

export async function clearCompleted(): Promise<number> {
  const all = await readTodos();
  const next = all.filter((t) => !t.done);
  await writeTodos(next);
  const removed = all.length - next.length;
  logCall("clearCompleted", {}, `removed ${removed}`);
  return removed;
}

// Get a todo by its position in the list. Supports negative indexing from the
// end (e.g. -1 is the last todo). Returns null if the index is out of range.
export async function getTodoByIndex(index: number): Promise<Todo | null> {
  if (!Number.isInteger(index)) {
    logCall("getTodoByIndex", { index }, "invalid index");
    return null;
  }
  const all = await readTodos();
  const i = index < 0 ? all.length + index : index;
  const todo = i >= 0 && i < all.length ? all[i] : null;
  logCall("getTodoByIndex", { index }, todo ? todo.id : "out of range");
  return todo;
}

export async function getFirstTodo(): Promise<Todo | null> {
  const all = await readTodos();
  const todo = all.length ? all[0] : null;
  logCall("getFirstTodo", {}, todo ? todo.id : "empty list");
  return todo;
}

export async function getLastTodo(): Promise<Todo | null> {
  const all = await readTodos();
  const todo = all.length ? all[all.length - 1] : null;
  logCall("getLastTodo", {}, todo ? todo.id : "empty list");
  return todo;
}

export type TodoStatus = "all" | "open" | "done";

export type TodoSearchOptions = {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type TodoSearchResult = {
  query: string;
  status: TodoStatus;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  results: Todo[];
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function normalizeStatus(status?: string): TodoStatus {
  return status === "open" || status === "done" ? status : "all";
}

// Free-text, paginated search over the todo list. Space-separated terms in
// `query` must all appear (case-insensitive substring) in the todo text.
export async function searchTodos(
  opts: TodoSearchOptions
): Promise<TodoSearchResult> {
  const all = await readTodos();
  const query = (opts.query ?? "").trim();
  const status = normalizeStatus(opts.status);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  let filtered = all;
  if (status === "open") filtered = filtered.filter((t) => !t.done);
  else if (status === "done") filtered = filtered.filter((t) => t.done);
  if (terms.length) {
    filtered = filtered.filter((t) => {
      const text = t.text.toLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }

  const pageSize = clamp(opts.pageSize ?? 10, 1, 50);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clamp(opts.page ?? 1, 1, totalPages);
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize);

  logCall(
    "searchTodos",
    { query, status, page, pageSize },
    `${results.length} of ${total} (page ${page}/${totalPages})`
  );
  return { query, status, page, pageSize, total, totalPages, results };
}
