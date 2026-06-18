import { promises as fs } from "fs";
import path from "path";

export type FeedbackType = "bug" | "suggestion" | "praise" | "other";

export type Feedback = {
  id: string;
  type: FeedbackType;
  rating: number; // 1-5, or 0 when not provided
  message: string;
  name: string;
  page: string;
  userAgent: string;
  viewport: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "feedback.json");

export async function readFeedback(): Promise<Feedback[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // File missing or malformed — start fresh.
    return [];
  }
}

export async function addFeedback(entry: Feedback): Promise<Feedback> {
  const all = await readFeedback();
  all.push(entry);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
  return entry;
}
