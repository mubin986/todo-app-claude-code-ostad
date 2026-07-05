---
name: document-project
description: >
  Ensure this project has accurate, current documentation. Creates a README.md
  if one is missing; otherwise reconciles the existing docs against the real
  state of the code (scripts, routes, structure, tech stack) and updates what
  drifted. Use when the user says "document this project", "update the docs",
  "/document-project", or asks to create/refresh the README.
---

# Document Project

Keep the project's human-facing documentation true to the code. **Create** it
if absent, **update** it if present. Never invent facts — every claim must trace
to a file you read.

## Scope

The primary artifact is **`README.md`** at the repo root (human-facing: what the
project is, how to run it, how it's laid out).

Also reconcile, if they exist and drifted:
- `CLAUDE.md` — agent/contributor guidance (keep authoritative; don't duplicate
  it wholesale into the README, link to it).
- `CHANGELOG.md` — leave to the release automation; do **not** hand-edit it.

Do not touch `data/`, `node_modules/`, build output (`.next/`), or anything
gitignored.

## Procedure

### 1. Survey the real state (read before you write)

Gather ground truth — do not rely on memory or existing prose:

```bash
ls -la                                   # top-level layout
find . -name "*.md" -not -path "./node_modules/*"   # existing docs
cat package.json                          # name, scripts, deps, engines
```

Then read what defines the project:
- `package.json` → real `scripts`, dependency versions, `engines` (Node pin).
- App entry points and routes (for this repo: `app/` — pages, `app/api/*/route.ts`).
- Config that affects running it (`next.config.*`, `tsconfig.json`, env files).
- `CLAUDE.md` for stack facts and constraints already documented.

Build a short mental model: **what it is, how to run it, structure, constraints.**

### 2. Decide create vs. update

- **No `README.md`** → create one from the template below.
- **`README.md` exists** → compare each section to ground truth. Fix what
  drifted (renamed scripts, changed versions, new/removed routes or folders,
  stale commands). Preserve the author's voice, ordering, and any prose that's
  still accurate. Minimal diffs — don't rewrite sections that are already right.

### 3. README structure

Adapt to the project; include only sections that apply:

```markdown
# <Project name>

<One-paragraph description: what it does and who it's for.>

## Tech stack
<Framework + version, language, runtime/engine pin, storage, notable deps —
 sourced from package.json and config, not assumed.>

## Getting started
<Prereqs (Node version from `engines`), then the real npm scripts:
 install, dev, build, start, lint — copied from package.json `scripts`.>

## Project structure
<Tree of the top-level dirs/files that matter, each with a one-line purpose.
 Mirror what's actually on disk.>

## Configuration / environment
<Env vars, config files, runtime constraints (e.g. API must run on Node.js
 runtime). Only if real.>

## Notes / limitations
<Known caveats — pull real ones from CLAUDE.md if present.>
```

For **this repo specifically**, accurate facts to reflect (verify they still
hold before writing): Next.js 14.2.x App Router + React 18 + TypeScript strict;
Node pinned at 18.17.1 (why Next stays on 14); no database — todos in
`localStorage`, feedback in `data/feedback.json`; routes `/` (todo app),
`/feedback` (review page), `/api/feedback` (GET/POST, Node.js runtime). Link to
`CLAUDE.md` for contributor conventions (Conventional Commits, CI, releases)
rather than restating them.

### 4. Verify before finishing

- Every command in the README runs as written (`scripts` exist in
  `package.json`).
- Every path mentioned exists on disk.
- Versions match `package.json` / lockfile.
- No contradictions between README and `CLAUDE.md`.

Report what you did: **created** vs **updated**, and a one-line list of the
sections changed. Do not commit unless the user asks.
