"use client";

import { useEffect, useState } from "react";

type WrongItem = {
  questionId: string;
  stem: string;
  tag: string;
  userAnswerIndex: number;
  correctAnswerIndex: number;
  timestamp: string;
};

const KEY = "ssat_wrongbook";

export default function WrongBookPage() {
  const [items, setItems] = useState<WrongItem[]>([]);

  function load() {
    const raw = localStorage.getItem(KEY);
    setItems(raw ? JSON.parse(raw) : []);
  }

  useEffect(() => {
    load();
  }, []);

  function clearAll() {
    localStorage.removeItem(KEY);
    setItems([]);
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial", maxWidth: 900 }}>
      <a href="/" style={{ textDecoration: "none" }}>
        ← Home
      </a>

      <h1 style={{ fontSize: 28, marginTop: 16 }}>Wrong Book</h1>

      <button
        onClick={clearAll}
        style={{
          marginTop: 10,
          padding: "10px 14px",
          fontSize: 16,
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Clear All
      </button>

      {items.length === 0 ? (
        <p style={{ marginTop: 16, fontSize: 18 }}>No wrong answers yet ✅</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {items
            .slice()
            .reverse()
            .map((it, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  border: "1px solid #ddd",
                  borderRadius: 12,
                }}
              >
                <div style={{ opacity: 0.7, marginBottom: 6 }}>
                  {it.tag} • {new Date(it.timestamp).toLocaleString()}
                </div>
                <div style={{ fontSize: 18 }}>{it.stem}</div>
                <div style={{ marginTop: 8 }}>
                  Your: {String.fromCharCode(65 + it.userAnswerIndex)} | Correct:{" "}
                  {String.fromCharCode(65 + it.correctAnswerIndex)}
                </div>
              </div>
            ))}
        </div>
      )}
    </main>
  );
}