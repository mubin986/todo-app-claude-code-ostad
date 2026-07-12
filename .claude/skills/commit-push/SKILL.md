---
name: commit-push
description: >
  Stage changes, write a Conventional Commits message derived from the actual
  diff, commit, and push to GitHub. Respects this repo's commitlint rules and
  PR-based workflow (branches off the default branch instead of pushing straight
  to it). Use when the user says "commit and push", "write a commit and push",
  "/commit-push", or asks to commit changes following Conventional Commits.
---

# Commit & Push

Turn the working tree's changes into one well-formed [Conventional Commits](https://www.conventionalcommits.org)
commit and push it to GitHub. The message is derived from the **real diff** —
never invent a change you didn't see.

This repo enforces the spec in CI ([commitlint.config.js](../../../commitlint.config.js)
via `.github/workflows/commit-lint.yml`) and the release automation derives the
next version and changelog from commit messages. A malformed message fails CI
and can misfire the release. Get it right.

## 1. Read the changes before writing anything

```bash
git status --short          # what's staged / unstaged / untracked
git diff                    # unstaged changes
git diff --staged           # already-staged changes
git branch --show-current   # current branch
git log --oneline -5        # recent style to match
```

Understand **what actually changed and why** from the diff. Group the changes
into a single logical intent. If the diff spans several unrelated concerns,
tell the user and ask whether to split into multiple commits rather than
forcing one mixed message.

## 2. Compose the message

Format:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

**Type** — pick the one that matches the dominant change. Allowed types (must be
one of these; keep in sync with [commitlint.config.js](../../../commitlint.config.js)):

| Type | Use for | Version effect |
| --- | --- | --- |
| `feat` | a new feature | minor bump |
| `fix` | a bug fix | patch bump |
| `docs` | documentation only | none |
| `style` | formatting / whitespace | none |
| `refactor` | not a feat or fix | none |
| `perf` | performance | patch bump |
| `test` | tests | none |
| `build` | build system / deps | none |
| `ci` | CI config | none |
| `chore` | maintenance, not src/test | none |
| `revert` | revert a prior commit | varies |

**Scope** (optional) — the area touched, lowercase (`feedback`, `todo`, `ci`,
`docs`). Match scopes seen in `git log`.

**Description** — imperative mood, lowercase start, **no trailing period**,
header (`type(scope): description`) **≤ 100 chars**. Say what the change does,
not what you did: `add star rating to feedback widget`, not `added` / `I added`.

**Body** (optional) — add only when the *why* isn't obvious from the subject.
Blank line between subject and body. Wrap ~72 cols. Explain motivation, not the
mechanics the diff already shows.

**Breaking change** — `!` after type (`feat!:`) and/or a `BREAKING CHANGE:`
footer describing the break.

Every commit ends with this trailer (blank line before it):

```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

Good examples:

```
feat(feedback): add star rating to the feedback widget
fix(todo): persist todos after page reload
ci: enable lint step in the build workflow
docs: document the release workflow
feat!: drop support for the legacy feedback schema
```

## 3. Stage

- If the user named specific files, stage only those.
- Otherwise stage what belongs to the one logical change. Prefer `git add <path>`
  over blind `git add -A` — do not sweep in unrelated edits, scratch files, or
  anything gitignored (`data/`, `.next/`, `site/`).
- Confirm the staged set with `git diff --staged --stat` before committing.

## 4. Commit

Write the message with a heredoc so multi-line bodies and the trailer survive:

```bash
git commit -F - <<'EOF'
type(scope): description

Optional body explaining the why.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

## 5. Push to GitHub — respect the PR workflow

This repo merges via pull requests; do **not** push straight to the default
branch (`main`).

- **On a feature branch** → push it and set upstream:
  ```bash
  git push -u origin "$(git branch --show-current)"
  ```
- **On `main` (the default branch)** → branch off first, then push the branch
  and open a PR. Name the branch after the change (`<type>/<short-slug>`, e.g.
  `feat/star-rating`):
  ```bash
  git switch -c <type>/<short-slug>
  git push -u origin <type>/<short-slug>
  gh pr create --fill        # or --title/--body; falls back to the browser
  ```
  If `gh` is unavailable, push the branch and give the user the compare URL to
  open the PR manually.

## Guardrails

- **Never** `git push --force` unless the user explicitly asks and you've
  confirmed the target branch.
- Do not amend or rewrite already-pushed commits without asking.
- There's no local `commitlint` install here — you can't lint the message
  locally. Match the rules above by hand; the CI action is the real check.
- If `git status` is clean, stop and tell the user there's nothing to commit.
- Report back: the final commit message, the branch pushed, and the PR URL if
  one was opened.
