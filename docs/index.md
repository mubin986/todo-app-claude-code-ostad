# Todo App

A simple **Next.js todo app** with a built-in **tester feedback tool**. Testers
add, complete, and delete todos, and submit feedback through a floating widget
that captures their message along with context (page, viewport, user agent). The
developer reviews everything that comes in at `/feedback`.

<div class="grid cards" markdown>

-   :material-rocket-launch: **Getting Started**

    ---

    Install dependencies and run the app locally in minutes.

    [:octicons-arrow-right-24: Installation](getting-started/installation.md)

-   :material-book-open-variant: **User Guide**

    ---

    Manage todos and submit feedback through the in-app widget.

    [:octicons-arrow-right-24: Managing Todos](user-guide/managing-todos.md)

-   :material-sitemap: **Developer**

    ---

    Architecture, project structure, and contribution conventions.

    [:octicons-arrow-right-24: Architecture](developer/architecture.md)

-   :material-api: **API Reference**

    ---

    HTTP endpoints, request/response shapes, and status codes.

    [:octicons-arrow-right-24: API Overview](api/overview.md)

</div>

## What's inside

| Route           | What it is                                              |
| --------------- | ------------------------------------------------------ |
| `/`             | The todo app (client component, `localStorage`).       |
| `/feedback`     | Review page for collected feedback (server, dynamic).  |
| `/api/feedback` | `GET` lists feedback, `POST` saves it. Node.js runtime. |
| `/api/greeting` | `GET` returns a random greeting as JSON.               |

## Tech stack

- **Next.js 14.2.35** (App Router) with **React 18** and **TypeScript** (strict mode).
- **Node 18.17.1.** Pinned to Next 14 because Next 15/16 require Node ≥ 18.18 —
  do not bump Next past 14.2.x unless Node is upgraded.
- **No database.** Todos persist in the browser via `localStorage`; tester
  feedback persists server-side as a JSON file at `data/feedback.json`.

!!! warning "Not production-hardened"
    Feedback is stored in a local JSON file and `/feedback` has **no auth**. See
    [Deployment](deployment.md) before exposing this app to real testers.
