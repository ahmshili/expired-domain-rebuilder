// lib/analyzer.ts
import fetch from "node-fetch";

export interface DomainReport {
  domain: string;
  score: number;
  risk: "Low" | "Medium" | "High";
  strategy: string;
  snapshots: number;
  dns: boolean;
  https: boolean;
  status: number;
  length: number;
  tld: string;
  spam: boolean;
}

function getTLD(domain: string) {
  const parts = domain.split(".");
  return parts[parts.length - 1] || "";
}

export async function analyzeDomain(domain: string): Promise<DomainReport> {
  // Basic signals
  const length = domain.length;
  const tld = getTLD(domain);

  // DNS check (Node-only)
  let dnsResolves = false;
  try {
    const { lookup } = await import("dns/promises");
    await lookup(domain);
    dnsResolves = true;
  } catch {
    dnsResolves = false;
  }

  // HTTP/HTTPS check
  let httpsSupported = false;
  let httpStatus = 0;
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD", redirect: "manual" });
    httpsSupported = true;
    httpStatus = res.status;
  } catch {
    httpsSupported = false;
    try {
      const res = await fetch(`http://${domain}`, { method: "HEAD", redirect: "manual" });
      httpStatus = res.status;
    } catch {
      httpStatus = 0;
    }
  }

  // Wayback Machine snapshots
  let snapshots = 0;
  try {
    const res = await fetch(`https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&limit=1`);
    const data = await res.json();
    snapshots = Array.isArray(data) ? data.length - 1 : 0; // first row is header
  } catch {
    snapshots = 0;
  }

  // Spam indicators (simplified)
  const spam = domain.includes("spam") || domain.includes("xxx");

  // Compute simple SEO score
  let score = 0;
  if (dnsResolves) score += 10;
  if (httpsSupported) score += 10;
  if (snapshots > 0) score += 10;
  if (!spam) score += 5;

  const risk: DomainReport["risk"] = score >= 20 ? "Medium" : score > 0 ? "High" : "High";
  const strategy = "Full Content & SEO Rebuild";

  return {
    domain,
    score,
    risk,
    strategy,
    snapshots,
    dns: dnsResolves,
    https: httpsSupported,
    status: httpStatus,
    length,
    tld,
    spam,
  };
}

