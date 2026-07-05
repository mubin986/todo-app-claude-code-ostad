# Greeting API

`app/api/greeting/route.ts`

Returns a single random greeting string as JSON. Stateless — no input, no
storage.

## `GET /api/greeting`

=== "Request"

    ```bash
    curl http://localhost:3000/api/greeting
    ```

=== "Response `200`"

    ```json
    { "greeting": "Hey, great to see you!" }
    ```

### Response body

| Field      | Type   | Description                          |
| ---------- | ------ | ------------------------------------ |
| `greeting` | string | One greeting picked at random.       |

The greeting is chosen uniformly at random from a fixed list, so repeated calls
may return the same value.
