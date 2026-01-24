"use client";

import { useState } from "react";

interface StepResults {
  dns: boolean | null;
  https: { https: boolean; status: number } | null;
  snapshots: number | null;
  score: number | null;
  risk: string | null;
  strategy: string | null;
  spam: boolean | null;
}

export default function Page() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StepResults | null>(null);
  const [counter, setCounter] = useState(0);

  const analyze = async () => {
    setLoading(true);
    setResults(null);
    setCounter(0);

    const interval = setInterval(() => setCounter((c) => c + 1), 1000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      setResults(data.steps);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Expired Domain Rebuilder</h1>
      <input
        className="border p-2 w-full mb-4"
        placeholder="Enter domain"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={analyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Domain"}
      </button>

      {loading && (
        <p className="mt-4 text-gray-500">Please wait... {counter}s</p>
      )}

      {results && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Domain Rebuild Report: {domain}</h2>
          <ul className="space-y-1">
            <li>Checking DNS: {results.dns !== null ? results.dns.toString() : "..."}</li>
            <li>
              Checking HTTPS:{" "}
              {results.https !== null ? `${results.https.https} (status ${results.https.status})` : "..."}
            </li>
            <li>Fetching Wayback snapshots: {results.snapshots ?? "..."}</li>
            <li>Spam check: {results.spam !== null ? results.spam.toString() : "..."}</li>
            <li>Score: {results.score ?? "..."}</li>
            <li>Risk: {results.risk ?? "..."}</li>
            <li>Strategy: {results.strategy ?? "..."}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

