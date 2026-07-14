import { NextResponse } from "next/server";
import { deleteTodo, updateTodo } from "@/lib/todos";

// Persisting to a file means this route must run on the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const patch: { text?: string; done?: boolean } = {};

  if (typeof data.text === "string") {
    const text = data.text.trim();
    if (!text) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 }
      );
    }
    patch.text = text.slice(0, 500);
  }
  if (typeof data.done === "boolean") patch.done = data.done;

  const updated = await updateTodo(params.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const ok = await deleteTodo(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
