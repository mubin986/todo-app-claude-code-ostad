"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./components/ThemeToggle";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "todos";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load todos from localStorage on first render.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(JSON.parse(saved));
    } catch {
      // ignore malformed storage
    }
    setLoaded(true);
  }, []);

  // Persist todos whenever they change (after the initial load).
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="container">
      <header className="app-header">
        <h1>📝 Todo</h1>
        <ThemeToggle />
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

      {todos.length === 0 ? (
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

      {todos.length > 0 && (
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
