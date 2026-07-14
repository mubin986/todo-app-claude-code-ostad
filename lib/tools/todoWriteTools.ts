import { addTodo, updateTodo, deleteTodo, clearCompleted } from "@/lib/todos";
import type { ToolDef } from "./types";
import { err, json } from "./types";

const CATEGORY = "todo.write";

export const todoWriteTools: ToolDef[] = [
  {
    category: CATEGORY,
    keywords: ["add", "create", "new", "make", "insert"],
    definition: {
      name: "add_todo",
      description:
        "Create a new todo with the given text. Returns the created todo " +
        "(including its generated id).",
      input_schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The todo text. Trimmed and capped at 500 characters.",
          },
        },
        required: ["text"],
      },
    },
    handler: async (input) => {
      const text = typeof input.text === "string" ? input.text.trim() : "";
      if (!text) return err("text is required.");
      return json(await addTodo(text.slice(0, 500)));
    },
  },
  {
    category: CATEGORY,
    keywords: ["update", "edit", "change", "rename", "complete", "done", "reopen", "mark", "toggle"],
    definition: {
      name: "update_todo",
      description:
        "Update a todo's text and/or completion status by id. Use this to edit a " +
        "todo's text or to mark it done/undone (i.e. to complete or reopen it). " +
        "Provide the id (from a read tool) plus at least one of text or done. " +
        "Returns the updated todo.",
      input_schema: {
        type: "object",
        properties: {
          id: { type: "string", description: "The id of the todo to update." },
          text: {
            type: "string",
            description:
              "New text (trimmed, capped at 500 chars). Omit to leave unchanged.",
          },
          done: {
            type: "boolean",
            description:
              "New completion status: true = completed, false = reopened. " +
              "Omit to leave unchanged.",
          },
        },
        required: ["id"],
      },
    },
    handler: async (input) => {
      const id = typeof input.id === "string" ? input.id : "";
      const patch: { text?: string; done?: boolean } = {};
      if (typeof input.text === "string") {
        const text = input.text.trim();
        if (!text) return err("text cannot be empty.");
        patch.text = text.slice(0, 500);
      }
      if (typeof input.done === "boolean") patch.done = input.done;

      if (!id) return err("id is required.");
      if (patch.text === undefined && patch.done === undefined) {
        return err("Provide text and/or done to update.");
      }
      const todo = await updateTodo(id, patch);
      return todo ? json(todo) : err(`No todo with id ${id}.`);
    },
  },
  {
    category: CATEGORY,
    keywords: ["delete", "remove", "drop", "destroy"],
    definition: {
      name: "delete_todo",
      description:
        "Permanently delete a single todo by id. This cannot be undone — only " +
        "call it when the user clearly asks to delete that todo.",
      input_schema: {
        type: "object",
        properties: {
          id: { type: "string", description: "The id of the todo to delete." },
        },
        required: ["id"],
      },
    },
    handler: async (input) => {
      const id = typeof input.id === "string" ? input.id : "";
      if (!id) return err("id is required.");
      const okDeleted = await deleteTodo(id);
      return okDeleted
        ? json({ ok: true, deleted: id })
        : err(`No todo with id ${id}.`);
    },
  },
  {
    category: CATEGORY,
    keywords: ["clear", "delete", "remove", "completed", "done", "bulk", "cleanup"],
    definition: {
      name: "clear_completed",
      description:
        "Permanently delete every completed (done) todo at once. This cannot be " +
        "undone. Returns the number of todos removed.",
      input_schema: { type: "object", properties: {} },
    },
    handler: async () => json({ removed: await clearCompleted() }),
  },
];
