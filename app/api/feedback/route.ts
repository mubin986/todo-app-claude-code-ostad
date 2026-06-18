import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  addFeedback,
  readFeedback,
  type Feedback,
  type FeedbackType,
} from "@/lib/feedback";

const VALID_TYPES: FeedbackType[] = ["bug", "suggestion", "praise", "other"];

// Persisting to a file means this route must run on the Node.js runtime.
export const runtime = "nodejs";

export async function GET() {
  const all = await readFeedback();
  // Newest first for the review page.
  return NextResponse.json(all.slice().reverse());
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (!message) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const type =
    typeof data.type === "string" &&
    VALID_TYPES.includes(data.type as FeedbackType)
      ? (data.type as FeedbackType)
      : "other";

  const ratingRaw = Number(data.rating);
  const rating =
    Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
      ? Math.round(ratingRaw)
      : 0;

  const entry: Feedback = {
    id: randomUUID(),
    type,
    rating,
    message: message.slice(0, 2000),
    name: (typeof data.name === "string" ? data.name.trim() : "").slice(0, 100),
    page: (typeof data.page === "string" ? data.page : "").slice(0, 300),
    userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? "",
    viewport: (typeof data.viewport === "string" ? data.viewport : "").slice(
      0,
      40
    ),
    createdAt: new Date().toISOString(),
  };

  await addFeedback(entry);
  return NextResponse.json(entry, { status: 201 });
}
