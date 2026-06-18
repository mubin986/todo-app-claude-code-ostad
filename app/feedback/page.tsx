import { readFeedback, type FeedbackType } from "@/lib/feedback";

// Always read the latest from disk on each request.
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<FeedbackType, string> = {
  bug: "🐞 Bug",
  suggestion: "💡 Suggestion",
  praise: "👍 Praise",
  other: "💬 Other",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default async function FeedbackPage() {
  const all = await readFeedback();
  const items = all.slice().reverse(); // newest first

  return (
    <main className="container fb-review">
      <div className="fb-head">
        <h1>Tester Feedback</h1>
        <span className="fb-count">{items.length} total</span>
      </div>

      {items.length === 0 ? (
        <p className="empty">
          No feedback yet. Open the app and use the “Feedback” button.
        </p>
      ) : (
        <ul className="fb-list">
          {items.map((f) => (
            <li key={f.id} className="fb-card">
              <div className="fb-card-top">
                <span className="fb-type">{TYPE_LABEL[f.type]}</span>
                {f.rating > 0 && (
                  <span className="fb-rating">
                    {"★".repeat(f.rating)}
                    <span className="fb-rating-off">
                      {"★".repeat(5 - f.rating)}
                    </span>
                  </span>
                )}
              </div>

              <p className="fb-message">{f.message}</p>

              <div className="fb-meta">
                {f.name && <span>{f.name}</span>}
                <span>{formatDate(f.createdAt)}</span>
                {f.page && <span>page: {f.page}</span>}
                {f.viewport && <span>{f.viewport}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
