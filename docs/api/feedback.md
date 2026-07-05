# Feedback API

`app/api/feedback/route.ts` · **Node.js runtime**

Handles listing and saving tester feedback. Feedback is persisted to
`data/feedback.json`.

## The `Feedback` object

```ts
type FeedbackType = "bug" | "suggestion" | "praise" | "other";

type Feedback = {
  id: string;         // server-generated UUID
  type: FeedbackType;
  rating: number;     // 1–5, or 0 when not provided
  message: string;
  name: string;
  page: string;
  userAgent: string;
  viewport: string;
  createdAt: string;  // ISO 8601 timestamp
};
```

---

## `GET /api/feedback`

Returns all feedback entries, **newest first**.

=== "Request"

    ```bash
    curl http://localhost:3000/api/feedback
    ```

=== "Response `200`"

    ```json
    [
      {
        "id": "3f1c...",
        "type": "bug",
        "rating": 4,
        "message": "The delete button is hard to hit on mobile.",
        "name": "Sam",
        "page": "/",
        "userAgent": "Mozilla/5.0 ...",
        "viewport": "390x844",
        "createdAt": "2026-07-05T12:34:56.789Z"
      }
    ]
    ```

---

## `POST /api/feedback`

Creates a feedback entry. The server validates and normalizes the payload, then
stamps `id` and `createdAt`.

### Request body

| Field      | Type     | Required | Rules                                              |
| ---------- | -------- | -------- | -------------------------------------------------- |
| `message`  | string   | **Yes**  | Trimmed; must be non-empty; capped at 2000 chars.  |
| `type`     | string   | No       | One of `bug`/`suggestion`/`praise`/`other`; else `other`. |
| `rating`   | number   | No       | 1–5 (rounded); anything else becomes `0`.          |
| `name`     | string   | No       | Trimmed; capped at 100 chars.                      |
| `page`     | string   | No       | Capped at 300 chars.                               |
| `viewport` | string   | No       | Capped at 40 chars.                                |

!!! note "`userAgent` is server-captured"
    `userAgent` is read from the request's `User-Agent` header (capped at 300
    chars), not from the body.

=== "Request"

    ```bash
    curl -X POST http://localhost:3000/api/feedback \
      -H "Content-Type: application/json" \
      -d '{
        "type": "suggestion",
        "rating": 5,
        "message": "Add a dark mode toggle.",
        "name": "Alex",
        "page": "/",
        "viewport": "1440x900"
      }'
    ```

=== "Response `201`"

    ```json
    {
      "id": "b2e7...",
      "type": "suggestion",
      "rating": 5,
      "message": "Add a dark mode toggle.",
      "name": "Alex",
      "page": "/",
      "userAgent": "curl/8.4.0",
      "viewport": "1440x900",
      "createdAt": "2026-07-05T12:34:56.789Z"
    }
    ```

### Errors

| Status | Body                             | When                          |
| ------ | -------------------------------- | ----------------------------- |
| `400`  | `{ "error": "Invalid JSON" }`    | Body is not valid JSON.       |
| `400`  | `{ "error": "Message is required" }` | `message` is missing/empty. |

!!! danger "Storage is a local file"
    Entries are appended to `data/feedback.json`. On ephemeral/serverless hosts
    this file is not persistent. See [Deployment](../deployment.md).
