# Feedback Widget

The feedback widget is a floating **Feedback** button mounted app-wide (from the
root layout). It lets testers send feedback without leaving the page.

## Submitting feedback

1. Click the floating **Feedback** button.
2. Choose a **type**: `bug`, `suggestion`, `praise`, or `other`.
3. Optionally set a **rating** (1–5 stars) and your **name**.
4. Write your **message** (required).
5. Submit.

On submit, the widget `POST`s to [`/api/feedback`](../api/feedback.md).

## What gets captured

Alongside your message, the widget attaches context automatically:

| Field       | Source                          | Notes                          |
| ----------- | ------------------------------- | ------------------------------ |
| `type`      | Your selection                  | Defaults to `other` if invalid.|
| `rating`    | Your selection                  | 1–5, or `0` when not provided. |
| `message`   | Your text                       | Required; trimmed, max 2000 chars. |
| `name`      | Your input                      | Optional; max 100 chars.       |
| `page`      | Current page path               | Max 300 chars.                 |
| `viewport`  | Browser viewport size           | Max 40 chars.                  |
| `userAgent` | Request `User-Agent` header     | Captured server-side.          |
| `createdAt` | Server timestamp (ISO 8601)     | Set on save.                   |
| `id`        | Server-generated UUID           | Set on save.                   |

!!! tip "Message limits"
    Messages are trimmed and capped at **2000 characters** server-side. Empty
    messages are rejected with `400 Message is required`.

## Reviewing feedback

Open `/feedback` to see all submissions, **newest first**. This is a
server-rendered, dynamic page that reads from the stored JSON file.

!!! warning "No authentication"
    `/feedback` is unprotected. Anyone who can reach the app can read every
    submission. Add an auth gate before exposing it. See
    [Deployment](../deployment.md).

## Where feedback is stored

Feedback persists server-side as a JSON file at `data/feedback.json`. The
`data/` directory is gitignored and created on the first successful `POST`.

!!! danger "Ephemeral hosts lose feedback"
    On serverless/ephemeral hosts (e.g. Vercel) the filesystem is **not
    persistent**. Move to a real datastore before collecting feedback from
    remote testers.
