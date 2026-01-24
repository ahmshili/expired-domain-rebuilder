"use client";

import { useEffect, useState } from "react";
import { analyzeDomain, DomainReport } from "../../../lib/analyzer";

interface ReportClientProps {
  domain: string;
}

export default function ReportClient({ domain }: ReportClientProps) {
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const result = await analyzeDomain(domain);
        setReport(result);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch domain report.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [domain]);

  if (loading) return <p className="text-center mt-8">Analyzing domain...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!report) return <p className="text-center mt-8">No data available.</p>;

  return (
    <main className="max-w-2xl mx-auto p-8 bg-white shadow rounded mt-8">
      <h1 className="text-2xl font-bold mb-4">Domain Rebuild Report: {report.domain}</h1>
      <p className="mb-2 font-medium">SEO Rebuild Score: {report.seoScore} / 100</p>
      <p className="mb-2 font-medium">Risk Level: {report.riskLevel}</p>
      <p className="mb-4 font-medium">Recommended Strategy: {report.recommendedStrategy}</p>

      <h2 className="text-xl font-semibold mb-2">Signal Breakdown</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>Wayback snapshots: {report.waybackSnapshots}</li>
        <li>DNS resolves: {report.dnsResolves ? "Yes" : "No"}</li>
        <li>HTTPS supported: {report.httpsSupported ? "Yes" : "No"}</li>
        <li>HTTP status: {report.httpStatus}</li>
        <li>Domain length: {report.domainLength}</li>
        <li>TLD: {report.tld}</li>
        <li>Spam indicators: {report.spamIndicators ? "Yes" : "No"}</li>
      </ul>
    </main>
  );
}

