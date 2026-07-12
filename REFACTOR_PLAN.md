# Refactor Plan — Modularization

A phased, module-by-module refactor of the todo app. Goal: split the two fat
client components into small, single-responsibility modules, kill duplicated
types/constants, and extract a hooks layer — without changing behavior.

**Guiding rule:** every phase is independently shippable. Run `npm run build`
(and a quick manual smoke test) at the end of each phase before moving on. No
phase should change what the app *does* — only how the code is *organized*.

---

## Why (current pain)

| Problem | Where | Cost |
| --- | --- | --- |
| `FeedbackType` union defined 3× | `lib/feedback.ts`, `app/components/FeedbackWidget.tsx:5`, `app/api/feedback/route.ts:10` | drift risk; add a type in one place only |
| Type→label map duplicated | `FeedbackWidget.tsx:8` (`TYPES`) vs `app/feedback/page.tsx:6` (`TYPE_LABEL`) | two sources of truth for the same emoji labels |
| Monolithic todo component | `app/page.tsx` (120 lines) | form, list, item, footer, storage, CRUD all inline |
| Monolithic feedback widget | `app/components/FeedbackWidget.tsx` (146 lines) | launcher, panel, chips, stars, submit, thanks all inline |
| Hand-rolled `localStorage` try/catch | `app/page.tsx:20-33`, `app/components/ThemeToggle.tsx:22-28` | repeated boilerplate, easy to get SSR-unsafe |
| Star render logic duplicated | `FeedbackWidget.tsx:98-110` vs `app/feedback/page.tsx:40-46` | two star implementations |
| No shared `Todo` type | only in `app/page.tsx:6` | not reusable/testable |

---

## Target module structure

```
lib/
  types.ts            # Todo, Feedback, FeedbackType — single source of truth
  feedback.ts         # file read/write (existing; import types from types.ts)
  feedback-meta.ts    # FEEDBACK_TYPES: [{ value, label }] — single source
  storage.ts          # safe JSON get/set for localStorage (SSR-guarded)
hooks/
  useLocalStorage.ts  # generic persisted state
  useTodos.ts         # todo list + CRUD, backed by useLocalStorage
  useTheme.ts         # theme read/toggle (from ThemeToggle)
  useFeedbackForm.ts  # feedback form state + submit
app/components/
  todo/
    TodoForm.tsx      # input + Add button
    TodoList.tsx      # <ul>, maps items
    TodoItem.tsx      # single <li>: checkbox, label, delete
    TodoFooter.tsx    # "N left" + Clear completed
  feedback/
    FeedbackWidget.tsx     # thin orchestrator (state via useFeedbackForm)
    FeedbackLauncher.tsx   # floating button
    FeedbackPanel.tsx      # dialog shell
    FeedbackTypePicker.tsx # chips (uses FEEDBACK_TYPES)
    StarRating.tsx         # value + optional onSelect (interactive OR display)
    FeedbackThanks.tsx     # success state
  ThemeToggle.tsx     # thin; state via useTheme
app/
  page.tsx            # thin: useTodos + compose todo/* components
  feedback/page.tsx   # uses FEEDBACK_TYPES + StarRating (display mode)
  api/feedback/route.ts  # import FeedbackType + FEEDBACK_TYPES from lib
```

---

## Sequencing

Bottom-up, so each layer only depends on layers already refactored:

**types → lib constants → storage util → hooks → components → pages/route**

This keeps every phase small and lets `npm run build` catch breakage early.

---

## Phase 0 — Safety net

- [ ] Confirm clean tree: `git status` (only this file untracked is fine).
- [ ] Baseline build passes: `npm run build`.
- [ ] Record current behavior (manual smoke): add/toggle/delete/clear todo;
      reload persists; submit feedback; view `/feedback`; toggle theme.
- [ ] Create working branch: `git checkout -b refactor/modularize`.

## Phase 1 — Shared types (`lib/types.ts`)

- [ ] Create `lib/types.ts` exporting `Todo`, `Feedback`, `FeedbackType`.
- [ ] `lib/feedback.ts` re-exports/imports types from `types.ts` (keep its
      public `type Feedback` / `type FeedbackType` exports so importers don't break).
- [ ] Replace local `FeedbackType` in `app/components/FeedbackWidget.tsx:5` with an import.
- [ ] Replace `Todo` definition in `app/page.tsx:6` with an import.
- [ ] `npm run build` green.
- [ ] Commit: `refactor(types): centralize Todo and Feedback types in lib/types`.

## Phase 2 — Feedback metadata (`lib/feedback-meta.ts`)

- [ ] Create `FEEDBACK_TYPES: { value: FeedbackType; label: string }[]` (one copy of the emoji labels).
- [ ] Derive `VALID_TYPES` in `app/api/feedback/route.ts:10` from `FEEDBACK_TYPES`.
- [ ] `FeedbackWidget` chips consume `FEEDBACK_TYPES` (drop local `TYPES`).
- [ ] `app/feedback/page.tsx` builds its label lookup from `FEEDBACK_TYPES` (drop `TYPE_LABEL`).
- [ ] `npm run build` green; verify chips + review labels unchanged.
- [ ] Commit: `refactor(feedback): single source of truth for type metadata`.

## Phase 3 — Storage util (`lib/storage.ts`)

- [ ] Add `getStored<T>(key, fallback)` / `setStored<T>(key, value)` with SSR guard + try/catch.
- [ ] `npm run build` green (no consumers yet — util lands first).
- [ ] Commit: `refactor(storage): add SSR-safe localStorage helper`.

## Phase 4 — Hooks layer (`hooks/`)

- [ ] `useLocalStorage<T>(key, initial)` — persisted state on top of `lib/storage.ts`, `loaded` flag (mirrors `app/page.tsx:17-33`).
- [ ] `useTodos()` — returns `{ todos, add, toggle, remove, clearCompleted, remaining, loaded }` (moves logic from `app/page.tsx:35-60`).
- [ ] `useTheme()` — extract from `app/components/ThemeToggle.tsx:12-28`.
- [ ] `useFeedbackForm()` — state + `submit` + `reset` (moves logic from `FeedbackWidget.tsx:16-59`).
- [ ] `npm run build` green.
- [ ] Commit: `refactor(hooks): extract useTodos, useTheme, useFeedbackForm, useLocalStorage`.

## Phase 5 — Todo components (`app/components/todo/`)

- [ ] `TodoForm` (input + Add) — props: `value`, `onChange`, `onSubmit`.
- [ ] `TodoItem` (checkbox, label, delete) — props: `todo`, `onToggle`, `onDelete`.
- [ ] `TodoList` (maps `TodoItem`) + empty state.
- [ ] `TodoFooter` ("N left" + Clear completed).
- [ ] Rewrite `app/page.tsx` as thin composition: `useTodos()` + the four components (~30 lines).
- [ ] Class names unchanged so `globals.css` still applies.
- [ ] `npm run build` green; manual: add/toggle/delete/clear/reload all work.
- [ ] Commit: `refactor(todo): split page into TodoForm/List/Item/Footer`.

## Phase 6 — Feedback components (`app/components/feedback/`)

- [ ] `StarRating` — props: `value`, `onSelect?` (interactive when passed, display when omitted).
- [ ] `FeedbackTypePicker` — chips from `FEEDBACK_TYPES`; props `value`, `onChange`.
- [ ] `FeedbackLauncher` — floating button; props `open`, `onClick`.
- [ ] `FeedbackThanks` — success view; prop `onReset`.
- [ ] `FeedbackPanel` — dialog shell wrapping form/thanks.
- [ ] Rewrite `FeedbackWidget` as thin orchestrator using `useFeedbackForm()` + the above.
- [ ] Reuse `StarRating` (display mode) in `app/feedback/page.tsx` (replace `:40-46`).
- [ ] Class names unchanged; keep `role="dialog"` + aria labels.
- [ ] `npm run build` green; manual: submit each type, star select/deselect, error path, thanks, review page.
- [ ] Commit: `refactor(feedback): split widget into launcher/panel/picker/stars/thanks`.

## Phase 7 — Cleanup & docs

- [ ] Delete any now-dead code/constants; grep for orphan `TYPES`/`TYPE_LABEL`/local `FeedbackType`.
- [ ] `tsconfig` path alias check — confirm `@/lib`, `@/hooks` resolve.
- [ ] Update `CLAUDE.md` **Structure** section to match new tree.
- [ ] `npm run lint` + `npm run build` green.
- [ ] Full manual smoke pass (Phase 0 checklist) — behavior identical.
- [ ] Commit: `docs: update structure for modular refactor`; open PR.

---

## Guardrails

- **No behavior change.** If a phase tempts a fix/feature, note it and do it in a
  separate `fix:`/`feat:` commit — keep `refactor:` commits pure.
- **Keep CSS class names.** All styling is in `app/globals.css` (409 lines) keyed
  by class name; renaming a class is out of scope here.
- **Runtime contracts stay.** `app/api/feedback/route.ts` keeps `runtime = "nodejs"`;
  `app/feedback/page.tsx` keeps `dynamic = "force-dynamic"`; client components keep
  `"use client"`.
- **Conventional Commits** per `CLAUDE.md` — mostly `refactor:` (no version bump).
- **No test suite exists** — manual smoke test is the safety net each phase. Adding
  tests (e.g. Vitest for `useTodos`/`lib/storage`) is a good follow-up `test:` PR,
  out of scope for this refactor.
