"use client";

import { useEffect, useState } from "react";
import type { DomainReport } from "../../../lib/analyzer";

export default function ReportClient({ domain }: { domain: string }) {
  const [data, setData] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyze() {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    analyze();
  }, [domain]);

  if (loading) {
    return (
      <p className="mt-10 text-center text-gray-500">
        Analyzing domain…
      </p>
    );
  }

  if (!data) return null;

  return (
    <main className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-2">
        Domain Rebuild Report
      </h1>

      <p className="text-gray-500 mb-6">{data.domain}</p>

      <section className="mb-6">
        <p className="text-xl font-semibold">
          SEO Rebuild Score: {data.score} / 100
        </p>
        <p className="mt-1">
          Risk Level: <strong>{data.risk}</strong>
        </p>
        <p>
          Recommended Strategy:{" "}
          <strong>{data.strategy}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          Technical Signals
        </h2>

        <ul className="space-y-1 text-gray-700">
          <li>DNS Resolves: {data.dns ? "Yes" : "No"}</li>
          <li>HTTPS Supported: {data.https ? "Yes" : "No"}</li>
          <li>HTTP Status Code: {data.status}</li>
          <li>Wayback Snapshots: {data.snapshots}</li>
          <li>Spam Indicators: {data.spam ? "Yes" : "No"}</li>
          <li>Domain Length: {data.length}</li>
          <li>TLD: .{data.tld}</li>
        </ul>
      </section>
    </main>
  );
}

