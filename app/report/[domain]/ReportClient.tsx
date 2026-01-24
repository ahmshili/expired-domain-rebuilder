"use client";

import { useEffect, useState } from "react";

type AnalyzeResult = {
  domain: string;
  score: number;
  risk: string;
  strategy: string;
  explanation: string[];
};

export default function ReportClient({ domain }: { domain: string }) {
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        });

        if (!res.ok) {
          const errorBody = await res.json();
          throw new Error(errorBody.error || "Failed to analyze domain");
        }

        const json: AnalyzeResult = await res.json();
        if (!canceled) setData(json);
      } catch (err: any) {
        if (!canceled) setError(err.message);
      }
    }

    fetchData();
    return () => {
      canceled = true;
    };
  }, [domain]);

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  if (!data) {
    return <p className="text-gray-600">Analyzing domain…</p>;
  }

  return (
    <main className="space-y-6 p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">
        Domain Rebuild Report: {data.domain}
      </h1>

      <p className="text-xl font-semibold">
        SEO Rebuild Score: {data.score} / 100
      </p>

      <p className="text-lg">
        <strong>Risk Level:</strong> {data.risk}
      </p>

      <p className="text-lg">
        <strong>Recommended Strategy:</strong> {data.strategy}
      </p>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">Signal Breakdown</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          {data.explanation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

