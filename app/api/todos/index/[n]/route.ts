import { NextResponse } from "next/server";
import { getTodoByIndex } from "@/lib/todos";

// Persisting to a file means this route must run on the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { n: string } };

// GET a todo by its position. Accepts negative indexes (-1 = last).
export async function GET(_req: Request, { params }: Params) {
  const index = Number(params.n);
  if (!Number.isInteger(index)) {
    return NextResponse.json(
      { error: "Index must be an integer" },
      { status: 400 }
    );
  }

  const todo = await getTodoByIndex(index);
  if (!todo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(todo);
}
