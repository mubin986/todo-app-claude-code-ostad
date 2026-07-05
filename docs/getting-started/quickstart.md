# Quickstart

This walkthrough assumes you've completed [Installation](installation.md).

## 1. Start the app

```bash
npm run dev
```

Visit <http://localhost:3000>.

## 2. Add a todo

Type into the input and press **Enter** (or click **Add**). Todos are saved to
your browser's `localStorage` — they survive a page reload but live only in that
browser.

## 3. Complete and delete

- Click a todo's checkbox to toggle it complete.
- Use the delete control to remove it.

See [Managing Todos](../user-guide/managing-todos.md) for the full behavior.

## 4. Submit feedback

Click the floating **Feedback** button, pick a type (bug / suggestion / praise /
other), optionally add a rating and your name, write a message, and submit. The
widget attaches context automatically (current page, viewport, user agent).

See [Feedback Widget](../user-guide/feedback-widget.md).

## 5. Review feedback

Open <http://localhost:3000/feedback> to see submissions, newest first.

!!! warning
    `/feedback` has **no authentication**. Anyone who can reach the app can read
    submissions. See [Deployment](../deployment.md).

## Next steps

- Understand the internals → [Architecture](../developer/architecture.md)
- Call the API directly → [API Overview](../api/overview.md)
