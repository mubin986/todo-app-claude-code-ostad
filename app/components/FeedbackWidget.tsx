"use client";

import { useState } from "react";

type FeedbackType = "bug" | "suggestion" | "praise" | "other";
type Status = "idle" | "sending" | "sent" | "error";

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: "bug", label: "🐞 Bug" },
  { value: "suggestion", label: "💡 Suggestion" },
  { value: "praise", label: "👍 Praise" },
  { value: "other", label: "💬 Other" },
];

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function reset() {
    setType("bug");
    setRating(0);
    setMessage("");
    setName("");
    setStatus("idle");
  }

  function closePanel() {
    setOpen(false);
    // Reset shortly after closing so a fresh open starts clean.
    setTimeout(reset, 200);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          rating,
          message,
          name,
          page: window.location.pathname,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        className="fw-launch"
        onClick={() => (open ? closePanel() : setOpen(true))}
        aria-label="Give feedback"
      >
        {open ? "×" : "Feedback"}
      </button>

      {open && (
        <div className="fw-panel" role="dialog" aria-label="Feedback form">
          {status === "sent" ? (
            <div className="fw-thanks">
              <p className="fw-thanks-title">Thanks! 🎉</p>
              <p>Your feedback was recorded.</p>
              <button className="fw-secondary" onClick={() => reset()}>
                Send another
              </button>
            </div>
          ) : (
            <form className="fw-form" onSubmit={submit}>
              <p className="fw-heading">Share feedback</p>

              <div className="fw-types">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    className={`fw-chip${type === t.value ? " active" : ""}`}
                    onClick={() => setType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="fw-stars" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`fw-star${n <= rating ? " on" : ""}`}
                    onClick={() => setRating(n === rating ? 0 : n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="fw-textarea"
                placeholder="What happened? What would you change?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                aria-label="Feedback message"
              />

              <input
                className="fw-input"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your name"
              />

              {status === "error" && (
                <p className="fw-error">Couldn’t send — please try again.</p>
              )}

              <button
                className="fw-submit"
                type="submit"
                disabled={status === "sending" || !message.trim()}
              >
                {status === "sending" ? "Sending…" : "Send feedback"}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
