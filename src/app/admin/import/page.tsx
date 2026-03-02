'use client';

import { useState } from 'react';

type ImportResponse = {
  insertedCount: number;
  validationErrors?: { index: number; message: string }[];
};

type ImportError = {
  error: string;
  details?: string;
  validationErrors?: { index: number; message: string }[];
};

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<ImportError | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError({ error: 'Please choose a vocabulary.json file.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const response = await fetch('/api/vocabulary/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: 720,
        margin: '0 auto',
        fontFamily: 'var(--font-geist-sans, Arial)',
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Vocabulary Import</h1>
      <p style={{ marginBottom: 24 }}>
        Upload a <code>vocabulary.json</code> file that matches the required schema. The server will
        validate entries and insert valid rows into Supabase.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Select JSON file</span>
          <input type="file" accept="application/json" onChange={handleFileChange} />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 12,
            border: 'none',
            backgroundColor: '#111827',
            color: '#fff',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Importing...' : 'Start Import'}
        </button>
      </form>

      {result && (
        <section style={{ marginTop: 32, padding: 16, borderRadius: 12, background: '#ecfdf5' }}>
          <h2 style={{ marginTop: 0 }}>Import Summary</h2>
          <p>Inserted rows: <strong>{result.insertedCount}</strong></p>
          {result.validationErrors && result.validationErrors.length > 0 && (
            <details>
              <summary>View validation warnings ({result.validationErrors.length})</summary>
              <ul>
                {result.validationErrors.map((err) => (
                  <li key={`${err.index}-${err.message}`}>
                    Row {err.index + 1}: {err.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {error && (
        <section style={{ marginTop: 32, padding: 16, borderRadius: 12, background: '#fef2f2' }}>
          <h2 style={{ marginTop: 0 }}>Import Failed</h2>
          <p>{error.error}</p>
          {error.details && <p>Details: {error.details}</p>}
          {error.validationErrors && error.validationErrors.length > 0 && (
            <details>
              <summary>View validation issues ({error.validationErrors.length})</summary>
              <ul>
                {error.validationErrors.map((err) => (
                  <li key={`${err.index}-${err.message}`}>
                    Row {err.index + 1}: {err.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </main>
  );
}
