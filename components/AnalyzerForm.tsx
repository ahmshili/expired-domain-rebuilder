"use client";

import { useState } from "react";
import Report from "./Report";

export default function AnalyzerForm() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setCounter(0);

    // cosmetic counter (does NOT control logic)
    const counterTimer = setInterval(() => {
      setCounter((c) => (c < 4 ? c + 1 : c));
    }, 400);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();

      clearInterval(counterTimer);
      setResult(data);
    } catch (e) {
      clearInterval(counterTimer);
      setError("Failed to analyze domain.");
    } finally {
      setLoading(false); // ✅ only happens AFTER result or error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          onClick={analyze}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-medium"
        >
          Analyze
        </button>
      </div>

      {loading && (
        <div className="text-neutral-400 animate-pulse">
          Analyzing… {counter}/4
        </div>
      )}

      {error && <div className="text-red-400">{error}</div>}

      {result && <Report data={result} />}
    </div>
  );
}

