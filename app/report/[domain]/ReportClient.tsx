"use client";

import { useEffect, useState } from "react";
import type { DomainReport } from "../../../lib/analyzer";

export default function ReportClient({ domain }: { domain: string }) {
  const [data, setData] = useState<DomainReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Analysis failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to analyze domain"));
  }, [domain]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-2 text-gray-600">
        <p>Analyzing domain…</p>
        <ul className="list-disc pl-5 animate-pulse">
          <li>Checking DNS</li>
          <li>Checking HTTPS</li>
          <li>Fetching Wayback snapshots</li>
          <li>Calculating score & risk</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Domain Rebuild Report: {data.domain}
      </h2>

      <ul className="space-y-1 text-gray-700">
        <li>DNS Resolves: {data.dnsResolves ? "Yes" : "No"}</li>
        <li>HTTPS Supported: {data.httpsSupported ? "Yes" : "No"}</li>
        <li>HTTP Status Code: {data.httpStatus || "N/A"}</li>
        <li>Wayback Snapshots: {data.waybackSnapshots}</li>
        <li>Risk Level: {data.risk}</li>
        <li>Score: {data.score}/100</li>
      </ul>

      <div className="rounded border p-3 bg-gray-50">
        <strong>Recommended Strategy:</strong>
        <p>{data.strategy}</p>
      </div>
    </div>
  );
}

