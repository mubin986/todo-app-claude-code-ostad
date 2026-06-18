---
name: push
description: Stage, commit, and push changes using a Conventional Commits message. Use when the user asks to "commit and push", "commit my changes", "push this", or otherwise wants the working tree committed and sent to the remote.
---

# Commit & push

This repo **requires** [Conventional Commits](https://www.conventionalcommits.org).
`commit-lint.yml` fails CI on violations, and the release workflow derives the
next version + changelog from commit messages. Get the message right.

## Steps

1. **Survey the changes.** Run `git status` and `git diff` (and
   `git diff --staged`) to see what's changed. Read enough to understand *what*
   changed and *why*, so the commit type and description are accurate.

2. **Pick the type + scope.** Choose the Conventional Commit `type` from the
   change (see table below) and an optional scope (e.g. `todo`, `feedback`).
   - `feat` new feature · `fix` bug fix · `docs` docs only · `style`
     formatting · `refactor` neither feat nor fix · `perf` performance ·
     `test` tests · `build` build/deps · `ci` CI config · `chore` maintenance ·
     `revert` revert.
   - Breaking change → add `!` (`feat!: ...`) or a `BREAKING CHANGE:` footer.
   - If the diff mixes unrelated concerns, prefer **splitting into multiple
     commits** over one vague message.

3. **Branch if needed.** If on `main` (the default branch), create a topic
   branch first rather than committing directly:
   `git switch -c <type>/<short-desc>`. (Skip if the user explicitly wants to
   commit on the current branch.)

4. **Stage + commit.** Stage the relevant files (`git add`), then commit with a
   Conventional Commits message. Format:

   ```
   <type>(<scope>): <imperative, lowercase, no trailing period>

   [optional body explaining why]

   Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
   ```

   Always end the commit message with the `Co-Authored-By` trailer above.

5. **Push.** `git push`. If the branch has no upstream, use
   `git push -u origin <branch>`. Report the result, including the branch and
   whether a PR is the natural next step.

## Guardrails

- **Verify before committing.** If the change touches app/build code, run
  `npm run build` first so a broken build doesn't get pushed. Mention if you
  skip it and why.
- **Never** commit secrets, `data/feedback.json` (gitignored tester data), or
  `.next/` build output.
- Match the example messages in [CLAUDE.md](../../../CLAUDE.md), e.g.
  `feat(feedback): add star rating to the feedback widget` or
  `fix(todo): persist todos after page reload`.
- Only do this when the user has asked to commit/push — don't push unrequested.
