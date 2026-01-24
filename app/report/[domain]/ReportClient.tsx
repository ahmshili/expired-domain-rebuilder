"use client";

import { useEffect, useState } from "react";

type Result = {
  snapshots: number;
  dns: boolean;
  score: number;
  risk: string;
  strategy: string;
};

export default function ReportClient({ domain }: { domain: string }) {
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;

    async function run() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        });

        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }

        const json = await res.json();

        if (!aborted) {
          setData(json);
        }
      } catch (err: any) {
        if (!aborted) {
          setError(err.message || "Failed to analyze domain");
        }
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [domain]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p>Analyzing domain…</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{domain}</h2>

      <ul className="border rounded p-4 space-y-2">
        <li>📸 Archive snapshots: {data.snapshots}</li>
        <li>🌐 DNS present: {data.dns ? "Yes" : "No"}</li>
        <li>📊 Score: {data.score}</li>
        <li>⚠️ Risk level: {data.risk}</li>
        <li>🛠 Strategy: {data.strategy}</li>
      </ul>
    </div>
  );
}

