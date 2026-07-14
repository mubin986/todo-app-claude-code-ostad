import { NextResponse } from "next/server";
import { addTodo, clearCompleted, readTodos } from "@/lib/todos";

// Persisting to a file means this route must run on the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const all = await readTodos();
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const text = typeof data.text === "string" ? data.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const todo = await addTodo(text.slice(0, 500));
  return NextResponse.json(todo, { status: 201 });
}

// Clear all completed todos.
export async function DELETE() {
  const removed = await clearCompleted();
  return NextResponse.json({ removed });
}
