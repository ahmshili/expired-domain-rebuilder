"use client";

import { useEffect, useState } from "react";
import { DomainReport } from "@/lib/analyzer";

export default function ReportClient({ domain }: { domain: string }) {
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      setReport(data);
      setLoading(false);
    }
    run();
  }, [domain]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Analyzing domain…
      </p>
    );
  }

  if (!report) return null;

  return (
    <main className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        Domain Rebuild Report
      </h1>

      <p className="text-gray-600 mb-6">{report.domain}</p>

      <div className="mb-6">
        <p className="text-lg font-semibold">
          SEO Rebuild Score: {report.score} / 100
        </p>
        <p>Risk Level: <strong>{report.risk}</strong></p>
        <p>Recommended Strategy: <strong>{report.strategy}</strong></p>
      </div>

      <h2 className="text-lg font-semibold mb-2">
        Technical Signals
      </h2>

      <ul className="space-y-1 text-gray-700">
        <li>DNS Resolves: {report.dns ? "Yes" : "No"}</li>
        <li>HTTPS Supported: {report.https ? "Yes" : "No"}</li>
        <li>HTTP Status Code: {report.status}</li>
        <li>Wayback Snapshots: {report.snapshots}</li>
        <li>Spam Indicators: {report.spam ? "Yes" : "No"}</li>
        <li>Domain Length: {report.length}</li>
        <li>TLD: .{report.tld}</li>
      </ul>
    </main>
  );
}

