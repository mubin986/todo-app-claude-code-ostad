import { NextResponse } from "next/server";
import { getFirstTodo } from "@/lib/todos";

// Persisting to a file means this route must run on the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET the first todo in the list.
export async function GET() {
  const todo = await getFirstTodo();
  if (!todo) {
    return NextResponse.json({ error: "No todos" }, { status: 404 });
  }
  return NextResponse.json(todo);
}
