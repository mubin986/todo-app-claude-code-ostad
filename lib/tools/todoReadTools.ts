import {
  searchTodos,
  getTodoByIndex,
  getFirstTodo,
  getLastTodo,
} from "@/lib/todos";
import type { ToolDef } from "./types";
import { err, json } from "./types";

const CATEGORY = "todo.read";

export const todoReadTools: ToolDef[] = [
  {
    category: CATEGORY,
    // Core: the general read tool. Loaded up front so basic questions about the
    // list work without a discovery round.
    core: true,
    keywords: ["list", "count", "find", "filter", "browse", "paginate", "status", "open", "done"],
    definition: {
      name: "search_todos",
      description:
        "Search the user's personal todo list. Call this whenever the user asks " +
        "about, references, counts, or wants to reason over their todos. Supports " +
        "free-text search over the todo text plus pagination. Returns the matching " +
        "todos for one page along with total counts so you can page through results.",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Free-text search. Space-separated terms must ALL appear " +
              "(case-insensitive substring) in a todo's text. Use an empty string " +
              "to match every todo.",
          },
          status: {
            type: "string",
            enum: ["all", "open", "done"],
            description: "Filter by completion status. Defaults to 'all'.",
          },
          page: {
            type: "integer",
            minimum: 1,
            description: "1-based page number. Defaults to 1.",
          },
          page_size: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            description: "Results per page (1-50). Defaults to 10.",
          },
        },
        required: ["query"],
      },
    },
    handler: async (input) => {
      const result = await searchTodos({
        query: typeof input.query === "string" ? input.query : "",
        status: typeof input.status === "string" ? input.status : undefined,
        page: typeof input.page === "number" ? input.page : undefined,
        pageSize:
          typeof input.page_size === "number" ? input.page_size : undefined,
      });
      return json(result);
    },
  },
  {
    category: CATEGORY,
    keywords: ["position", "index", "nth", "negative", "first", "last"],
    definition: {
      name: "get_todo_by_index",
      description:
        "Get a single todo by its position in the list. The index is 0-based. " +
        "Negative indexes count from the end (-1 is the last todo). Returns the " +
        "todo, or an error if the index is out of range.",
      input_schema: {
        type: "object",
        properties: {
          index: {
            type: "integer",
            description:
              "0-based position of the todo. Negative counts from the end " +
              "(-1 = last, -2 = second to last).",
          },
        },
        required: ["index"],
      },
    },
    handler: async (input) => {
      const index = typeof input.index === "number" ? input.index : NaN;
      if (!Number.isInteger(index)) return err("index must be an integer.");
      const todo = await getTodoByIndex(index);
      return todo ? json(todo) : err(`No todo at index ${index}.`);
    },
  },
  {
    category: CATEGORY,
    keywords: ["first", "top", "oldest", "head"],
    definition: {
      name: "get_first_todo",
      description:
        "Get the first todo in the list. Returns the todo, or an error if the " +
        "list is empty.",
      input_schema: { type: "object", properties: {} },
    },
    handler: async () => {
      const todo = await getFirstTodo();
      return todo ? json(todo) : err("The todo list is empty.");
    },
  },
  {
    category: CATEGORY,
    keywords: ["last", "latest", "newest", "end", "tail"],
    definition: {
      name: "get_last_todo",
      description:
        "Get the last todo in the list. Returns the todo, or an error if the " +
        "list is empty.",
      input_schema: { type: "object", properties: {} },
    },
    handler: async () => {
      const todo = await getLastTodo();
      return todo ? json(todo) : err("The todo list is empty.");
    },
  },
];
