"use client";

import { useEffect, useState } from "react";

interface DomainReport {
  domain: string;
  score: number;
  risk: string;
  strategy: string;
  snapshots: number;
  dns: boolean;
  https: boolean;
  status: number;
  length: number;
  tld: string;
  spam: boolean;
}

interface Step {
  label: string;
  done: boolean;
}

interface ReportClientProps {
  domain: string;
}

export default function ReportClient({ domain }: ReportClientProps) {
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([
    { label: "Checking DNS", done: false },
    { label: "Checking HTTPS", done: false },
    { label: "Fetching Wayback snapshots", done: false },
    { label: "Calculating score & risk", done: false },
  ]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);

    async function fetchReport() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({ domain }),
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line) continue;
            const parsed = JSON.parse(line);
            if (parsed.step === "dns") {
              setSteps((prev) => prev.map((s, i) => i === 0 ? { ...s, done: parsed.value } : s));
            }
            if (parsed.step === "https") {
              setSteps((prev) => prev.map((s, i) => i === 1 ? { ...s, done: parsed.value } : s));
            }
            if (parsed.step === "snapshots") {
              setSteps((prev) => prev.map((s, i) => i === 2 ? { ...s, done: parsed.value > 0 } : s));
            }
            if (parsed.step === "final") {
              setSteps((prev) => prev.map((s, i) => i === 3 ? { ...s, done: true } : s));
              setReport(parsed.value);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        clearInterval(interval);
      }
    }

    fetchReport();

    return () => clearInterval(interval);
  }, [domain]);

  return (
    <main className="max-w-2xl mx-auto p-8 bg-white shadow rounded mt-8">
      <h1 className="text-2xl font-bold mb-4">Domain Rebuild Report: {domain}</h1>
      <ul className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border ${
                step.done ? "bg-green-600 border-green-600 animate-pulse" : "border-gray-400"
              }`}
            />
            <span className={`${step.done ? "text-green-600" : "text-gray-500"}`}>
              {step.label}
            </span>
          </li>
        ))}
      </ul>

      {loading && <p className="text-gray-500">Please wait... {elapsed}s</p>}

      {report && (
        <div className="mt-6">
          <p className="mb-2 font-medium">SEO Rebuild Score: {report.score} / 100</p>
          <p className="mb-2 font-medium">Risk Level: {report.risk}</p>
          <p className="mb-4 font-medium">Recommended Strategy: {report.strategy}</p>

          <h2 className="text-xl font-semibold mb-2">Signal Breakdown</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Wayback snapshots: {report.snapshots}</li>
            <li>DNS resolves: {report.dns ? "Yes" : "No"}</li>
            <li>HTTPS supported: {report.https ? "Yes" : "No"}</li>
            <li>HTTP status: {report.status}</li>
            <li>Domain length: {report.length}</li>
            <li>TLD: {report.tld}</li>
            <li>Spam indicators: {report.spam ? "Yes" : "No"}</li>
          </ul>
        </div>
      )}
    </main>
  );
}

