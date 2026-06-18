# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

A simple **Next.js todo app** with an in-app **tester feedback tool**. Testers
add/complete/delete todos and submit feedback via a floating widget; the
developer reviews submissions at `/feedback`.

## Tech stack

- **Next.js 14.2.35** (App Router) + **React 18** + **TypeScript** (strict).
- **No database.** Todos persist in the browser via `localStorage`; tester
  feedback persists server-side as a JSON file (`data/feedback.json`).
- **Node 18.17.1.** This is why we are pinned to **Next 14** — Next 15/16
  require Node ≥ 18.18. Do not bump Next past 14.2.x unless Node is upgraded.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (run before pushing to catch type errors)
npm run start    # serve the production build
npm run lint     # next lint
```

## Structure

```
app/
  layout.tsx              # root layout; mounts the FeedbackWidget app-wide
  page.tsx                # the todo app (client component, localStorage)
  globals.css             # all styles
  components/
    FeedbackWidget.tsx    # floating "Feedback" button + form (client)
  feedback/page.tsx       # review page for collected feedback (server, dynamic)
  api/feedback/route.ts   # GET (list) / POST (save) feedback; Node.js runtime
lib/feedback.ts           # read/write helper for data/feedback.json
data/feedback.json        # stored feedback — gitignored, created on first POST
.github/workflows/
  ci.yml                   # build the app; upload .next as a GitHub artifact
  release-draft.yml        # version bump + changelog + draft GitHub release
  commit-lint.yml          # enforces Conventional Commits on PRs/main
commitlint.config.js       # commit-lint rules
```

## Conventions

### Commit messages — Conventional Commits (REQUIRED)

Every commit **must** follow the [Conventional Commits](https://www.conventionalcommits.org)
spec. This is not optional styling: the release workflow derives the next
version and changelog directly from commit messages, and `commit-lint.yml`
fails CI on violations.

Format:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

Allowed `type`s (see [commitlint.config.js](commitlint.config.js)):

| Type       | Use for                                   | Version effect |
| ---------- | ----------------------------------------- | -------------- |
| `feat`     | a new feature                             | minor bump     |
| `fix`      | a bug fix                                 | patch bump     |
| `docs`     | documentation only                        | none           |
| `style`    | formatting, whitespace                    | none           |
| `refactor` | code change that isn't a feat or fix      | none           |
| `perf`     | performance improvement                   | patch bump     |
| `test`     | adding/fixing tests                       | none           |
| `build`    | build system or dependency changes        | none           |
| `ci`       | CI configuration                          | none           |
| `chore`    | maintenance not touching src/test         | none           |
| `revert`   | reverting a previous commit               | varies         |

A **breaking change** bumps the major version — add `!` after the type
(`feat!: ...`) or a `BREAKING CHANGE:` footer.

Examples:

```
feat(feedback): add star rating to the feedback widget
fix(todo): persist todos after page reload
docs: document the release workflow
feat!: drop support for the legacy feedback schema
```

### Code

- TypeScript strict mode is on — keep it type-clean (`npm run build` must pass).
- Client components need the `"use client"` directive (todo page, widget).
- The feedback API must stay on the Node.js runtime (`export const runtime = "nodejs"`)
  because it writes to the filesystem.

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on pushes to `main`,
on pull requests, and manually. It installs deps with `npm ci`, lints, builds,
and uploads the production build output (`.next`, minus `.next/cache`) as a
GitHub artifact named `next-build-<sha>` (retained 7 days).

## Releases

Releases are automated by [.github/workflows/release-draft.yml](.github/workflows/release-draft.yml)
using [TriPSs/conventional-changelog-action](https://github.com/TriPSs/conventional-changelog-action):

1. Merge Conventional Commits into `main`.
2. The workflow bumps the version in `package.json`, regenerates `CHANGELOG.md`,
   commits both with `[skip ci]`, and creates a git tag.
3. It then opens a **draft** GitHub Release (via `softprops/action-gh-release`)
   with the generated notes — review and publish it manually.

These workflows require the repo to be a Git repository with a GitHub remote.
If a commit has no releasable types (e.g. only `docs`/`chore`), the changelog
step is skipped and no draft release is created.

## Notes / known limitations

- Feedback storage is a **local JSON file**. On ephemeral/serverless hosts
  (e.g. Vercel) the filesystem is not persistent — move to a real datastore
  before deploying for remote testers.
- There is no auth on `/feedback`; anyone who can reach the app can read
  submissions. Add a gate before exposing it publicly.
