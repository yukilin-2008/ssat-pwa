"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QUESTIONS, Question } from "../../data/questions";
type Result = "idle" | "correct" | "wrong";

function pickRandom(arr: Question[], excludeId?: string) {
  const filtered = excludeId ? arr.filter((q) => q.id !== excludeId) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default function PracticePage() {
  const [current, setCurrent] = useState<Question>(() => pickRandom(QUESTIONS));
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result>("idle");
  const [wrongChainCount, setWrongChainCount] = useState(0);

  const sameTagPool = useMemo(
    () => QUESTIONS.filter((q) => q.tag === current.tag),
    [current.tag]
  );

  function recordWrong(q: Question, userAnswerIndex: number) {
    const key = "ssat_wrongbook";
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      questionId: q.id,
      stem: q.stem,
      tag: q.tag,
      userAnswerIndex,
      correctAnswerIndex: q.answerIndex,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(list));
  }

  function submit(answerIndex: number) {
    if (result !== "idle") return;
    setSelected(answerIndex);

    const isCorrect = answerIndex === current.answerIndex;
    if (isCorrect) {
      setResult("correct");
      setWrongChainCount(0);
    } else {
      setResult("wrong");
      recordWrong(current, answerIndex);
      setWrongChainCount((n) => n + 1);
    }
  }

  function nextQuestion() {
    const shouldDoVariant = result === "wrong" && wrongChainCount < 3;
    let next: Question | undefined;

    if (shouldDoVariant) {
      if (sameTagPool.length > 1) {
        next = pickRandom(sameTagPool, current.id);
      } else {
        const sameType = QUESTIONS.filter((q) => q.type === current.type);
        next = pickRandom(sameType, current.id);
      }
    } else {
      next = pickRandom(QUESTIONS, current.id);
    }

    setCurrent(next);
    setSelected(null);
    setResult("idle");
    if (result !== "wrong") setWrongChainCount(0);
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial", maxWidth: 760 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Home
        </Link>
        <Link href="/wrongbook" style={{ textDecoration: "none" }}>
          Wrong Book →
        </Link>
      </div>

      <h1 style={{ fontSize: 28, marginTop: 16 }}>Practice</h1>

      <div style={{ marginTop: 12, fontSize: 18 }}>
        <div style={{ opacity: 0.7, marginBottom: 6 }}>
          {current.type.toUpperCase()} • {current.tag}
        </div>
        <div style={{ fontSize: 22, lineHeight: 1.35 }}>{current.stem}</div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {current.choices.map((c, idx) => (
          <button
            key={idx}
            onClick={() => submit(idx)}
            style={{
              padding: "16px 14px",
              fontSize: 18,
              borderRadius: 14,
              border: "1px solid #ccc",
              textAlign: "left",
              cursor: "pointer",
              opacity: result !== "idle" && selected !== idx ? 0.7 : 1,
            }}
          >
            {String.fromCharCode(65 + idx)}. {c}
          </button>
        ))}
      </div>

      {result !== "idle" && (
        <div style={{ marginTop: 18, fontSize: 18 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>
            {result === "correct" ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          <div style={{ opacity: 0.9 }}>
            <b>Explanation:</b> {current.explanation}
          </div>

          <button
            onClick={nextQuestion}
            style={{
              marginTop: 14,
              padding: "14px 18px",
              fontSize: 18,
              borderRadius: 12,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}