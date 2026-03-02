export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>SSAT Practice for Grade 3-7</h1>
      <p style={{ fontSize: 18, marginTop: 0 }}>
        Tap “Start Practice” to begin.
      </p>

      <a
        href="/practice"
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "14px 18px",
          fontSize: 18,
          borderRadius: 12,
          border: "1px solid #ccc",
          textDecoration: "none",
        }}
      >
        Start Practice
      </a>

      <div style={{ marginTop: 16 }}>
        <a href="/wrongbook" style={{ fontSize: 16 }}>
          View Wrong Book
        </a>
      </div>
    </main>
  );
}