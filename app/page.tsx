"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load todos from the API on first render.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/todos");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTodos(await res.json());
      } catch {
        setError("Could not load todos.");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: Todo = await res.json();
      setTodos((prev) => [...prev, created]);
    } catch {
      setError("Could not add todo.");
    }
  }

  async function toggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const done = !todo.done;
    // Optimistic update, reverted on failure.
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !done } : t))
      );
      setError("Could not update todo.");
    }
  }

  async function deleteTodo(id: string) {
    const prevTodos = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setTodos(prevTodos);
      setError("Could not delete todo.");
    }
  }

  async function clearCompleted() {
    const prevTodos = todos;
    setTodos((prev) => prev.filter((t) => !t.done));
    try {
      const res = await fetch("/api/todos", { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setTodos(prevTodos);
      setError("Could not clear completed todos.");
    }
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="container">
      <header className="app-header">
        <h1>📝 Todo</h1>
        <div className="chat-header-actions">
          <Link href="/chat" className="chat-back">
            💬 Brainstorm
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="New todo"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {!loaded ? (
        <p className="empty">Loading…</p>
      ) : todos.length === 0 ? (
        <p className="empty">Nothing here yet. Add your first todo above.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item${todo.done ? " done" : ""}`}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.text}" as ${
                  todo.done ? "not done" : "done"
                }`}
              />
              <span className="label">{todo.text}</span>
              <button
                className="delete"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete "${todo.text}"`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {loaded && todos.length > 0 && (
        <div className="footer">
          <span>
            {remaining} item{remaining !== 1 ? "s" : ""} left
          </span>
          <button onClick={clearCompleted}>Clear completed</button>
        </div>
      )}
    </main>
  );
}
