# Managing Todos

The todo list is the app's home page (`/`). It's a client component that stores
everything in your browser via `localStorage` — there is no server or account.

## Add a todo

1. Type a task into the input at the top.
2. Press **Enter** or click **Add**.

## Complete a todo

Click the todo's checkbox to toggle it between active and complete. Completed
todos are shown with a strike-through.

## Delete a todo

Use the delete control on a todo row to remove it permanently.

## Where todos live

- **Storage:** browser `localStorage`.
- **Scope:** per browser, per origin. Todos in Chrome won't appear in Firefox,
  and incognito windows start empty.
- **Persistence:** they survive reloads and restarts, but clearing site data
  (or `localStorage`) erases them.

!!! note "No sync"
    Because todos are local to the browser, there is no syncing across devices
    and no server copy. This is intentional for a lightweight tester build.

## Troubleshooting

| Symptom                     | Likely cause / fix                              |
| --------------------------- | ----------------------------------------------- |
| Todos vanished              | Site data / `localStorage` was cleared.         |
| Todos missing on another device | Storage is per-browser; there is no sync.   |
| Nothing persists            | Private/incognito mode may discard storage on close. |
