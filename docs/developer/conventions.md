# Conventions

## Commit messages — Conventional Commits (required)

Every commit **must** follow the [Conventional Commits](https://www.conventionalcommits.org)
spec. This is not optional styling: the release workflow derives the next version
and changelog directly from commit messages, and `commit-lint.yml` fails CI on
violations.

Format:

```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed types

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
(`feat!: ...`) or include a `BREAKING CHANGE:` footer.

### Examples

```text
feat(feedback): add star rating to the feedback widget
fix(todo): persist todos after page reload
docs: document the release workflow
feat!: drop support for the legacy feedback schema
```

## Code

- TypeScript strict mode is on — keep it type-clean (`npm run build` must pass).
- Client components need the `"use client"` directive (todo page, widget).
- The feedback API must stay on the Node.js runtime
  (`export const runtime = "nodejs"`) because it writes to the filesystem.
