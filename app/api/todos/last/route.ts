import { NextResponse } from "next/server";
import { getLastTodo } from "@/lib/todos";

// Persisting to a file means this route must run on the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET the last todo in the list.
export async function GET() {
  const todo = await getLastTodo();
  if (!todo) {
    return NextResponse.json({ error: "No todos" }, { status: 404 });
  }
  return NextResponse.json(todo);
}
