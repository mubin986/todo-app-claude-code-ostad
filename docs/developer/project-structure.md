# Project Structure

```text
app/
  layout.tsx              # root layout; mounts the FeedbackWidget app-wide
  page.tsx                # the todo app (client component, localStorage)
  globals.css             # all styles
  components/
    FeedbackWidget.tsx    # floating "Feedback" button + form (client)
  feedback/page.tsx       # review page for collected feedback (force-dynamic)
  api/feedback/route.ts   # GET (list) / POST (save) feedback; Node.js runtime
  api/greeting/route.ts   # GET a random greeting (JSON)
lib/feedback.ts           # read/write helper for data/feedback.json
data/feedback.json        # stored feedback — gitignored, created on first POST
docs/                     # this documentation site (MkDocs)
mkdocs.yml                # documentation config
.github/workflows/
  ci.yml                  # build the app; upload .next as a GitHub artifact
  release-draft.yml       # version bump + changelog + draft GitHub release
  commit-lint.yml         # enforces Conventional Commits on PRs/main
  docs.yml                # build + deploy the docs site to GitHub Pages
commitlint.config.js      # commit-lint rules
```

## Conventions

- **Client components** need the `"use client"` directive — the todo page and
  the feedback widget.
- **The feedback API stays on the Node.js runtime** (`export const runtime = "nodejs"`)
  because it writes to the filesystem.
- **TypeScript strict mode** is on — keep it type-clean; `npm run build` must pass.

## Gitignored paths

- `/node_modules`, `/.next/`, `/out/`, `/build`
- `/data` — the feedback store (`data/feedback.json`) is created at runtime.
- `/site` — the generated docs output (`mkdocs build`).

See [Conventions](conventions.md) for commit message rules and
[CI & Releases](ci-and-releases.md) for the automation.
