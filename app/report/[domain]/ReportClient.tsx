"use client";

import { useEffect, useState } from "react";
import { analyzeDomain } from "@lib/analyzer";

type Props = {
  domain: string;
};

export default function ReportClient({ domain }: Props) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    analyzeDomain(domain).then(setData);
  }, [domain]);

  if (!data) return <p>Analyzing domain…</p>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{domain}</h1>

      <div className="grid gap-4">
        <div>Snapshot count: <strong>{data.snapshots}</strong></div>
        <div>DNS resolves: <strong>{data.dns ? "Yes" : "No"}</strong></div>
        <div>SEO Score: <strong>{data.score}</strong></div>
        <div>Risk Level: <strong>{data.risk}</strong></div>
        <div>Recommended Strategy: <strong>{data.strategy}</strong></div>
      </div>
    </main>
  );
}

