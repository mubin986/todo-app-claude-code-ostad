---
name: fix-feedback
description: Triage tester submissions in data/feedback.json and fix the reported bugs/issues in the codebase. Use when the user asks to "fix the feedback", "fix the issues from feedback", "work through tester submissions", or otherwise act on entries collected by the FeedbackWidget.
---

# Fix feedback

Tester feedback is collected by the in-app `FeedbackWidget` and stored
server-side at [data/feedback.json](../../../data/feedback.json). Each entry is
an object shaped like:

```jsonc
{
  "id": "uuid",
  "type": "bug" | "idea" | "praise" | "other",
  "rating": 1-5,            // optional
  "message": "free text from the tester",
  "name": "tester name",    // optional
  "page": "/route they were on",
  "userAgent": "...",
  "viewport": "WxH",
  "createdAt": "ISO timestamp"
}
```

This skill reads those entries and resolves the actionable ones in the code.

## Steps

1. **Read the feedback.** Read [data/feedback.json](../../../data/feedback.json).
   If it's missing or `[]`, tell the user there's nothing to fix and stop.

2. **Triage.** Sort entries into:
   - **Actionable** — `type: "bug"` or a `message` describing a concrete defect
     or a small, clear improvement. These are the ones to fix.
   - **Not actionable** — `praise`, vague notes, duplicates, or requests too
     large/ambiguous to implement safely. List these for the user but don't
     guess at changes.

   Use the `page` field to know which route the tester was on (`/` = the todo
   app in [app/page.tsx](../../../app/page.tsx), `/feedback` = the review page).
   Use `viewport`/`userAgent` when a bug looks layout- or browser-specific.

3. **Locate the code.** For each actionable item, find the relevant source.
   The app is small:
   - [app/page.tsx](../../../app/page.tsx) — the todo app (client, localStorage)
   - [app/components/FeedbackWidget.tsx](../../../app/components/FeedbackWidget.tsx) — the feedback button + form
   - [app/feedback/page.tsx](../../../app/feedback/page.tsx) — feedback review page
   - [app/api/feedback/route.ts](../../../app/api/feedback/route.ts) — feedback API
   - [lib/feedback.ts](../../../lib/feedback.ts) — JSON read/write helper
   - [app/globals.css](../../../app/globals.css) — all styles

4. **Fix it.** Make the smallest change that resolves the report. Match the
   surrounding code style. Keep TypeScript strict-clean. Don't introduce a
   database or new dependencies for a small fix.

5. **Verify.** Run `npm run build` to confirm the app still type-checks and
   builds. If you changed UI behavior, briefly note how to confirm it manually.

6. **Report.** Summarize per entry: what the feedback said → what you changed
   (with `file:line` links) → or why you skipped it.

## Notes

- **Don't edit `data/feedback.json`** as part of "fixing" — it's the tester
  record, not a todo list. Only suggest removing handled entries if the user
  explicitly wants to clear them.
- If a single fix is risky or ambiguous, ask the user before proceeding rather
  than guessing at intent from a short message.
- Commits in this repo must follow Conventional Commits (e.g.
  `fix(todo): ...`). Only commit if the user asks.
