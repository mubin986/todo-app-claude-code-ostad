# API Overview

The app exposes a small HTTP API under `/api`. All endpoints return JSON.

| Endpoint        | Methods      | Runtime | Purpose                          |
| --------------- | ------------ | ------- | -------------------------------- |
| `/api/feedback` | `GET`, `POST`| Node.js | List and save tester feedback.   |
| `/api/greeting` | `GET`        | default | Return a random greeting.        |

## Conventions

- **Content type:** requests and responses use `application/json`.
- **Base URL (local):** `http://localhost:3000`.
- **Runtime:** `/api/feedback` runs on the **Node.js runtime** because it writes
  to the filesystem. See [Architecture](../developer/architecture.md).

## Status codes

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 200  | Success (`GET`).                                   |
| 201  | Feedback created (`POST /api/feedback`).           |
| 400  | Bad request — invalid JSON or missing `message`.   |

## Endpoints

- [Feedback API](feedback.md) — list and submit feedback.
- [Greeting API](greeting.md) — random greeting.
