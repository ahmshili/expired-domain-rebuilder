// lib/analyzer.ts
/**
 * Analyzer for expired or active domains.
 * Compatible with Next.js Edge Runtime.
 */

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

// Utility: fetch number of Wayback Machine snapshots
export async function getWaybackCount(domain: string): Promise<number> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=timestamp&collapse=digest`
    );
    if (!res.ok) return 0;
    const data = await res.json();
    // First row is headers, ignore it
    return Math.max(0, data.length - 1);
  } catch {
    return 0;
  }
}

// Utility: check if domain resolves via DNS
export async function checkDNS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    if (!res.ok) return false;
    const data = await res.json();
    return data?.Answer?.length > 0;
  } catch {
    return false;
  }
}

// Utility: check if domain supports HTTPS
export async function supportsHTTPS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// Utility: get HTTP status
export async function fetchStatus(domain: string): Promise<number> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    return res.status;
  } catch {
    return 0;
  }
}

// Utility: detect basic spam indicators
export function spamIndicators(domain: string): boolean {
  const spamTLDs = [".xyz", ".top", ".club", ".online", ".info"];
  return spamTLDs.some((tld) => domain.endsWith(tld));
}

// Main function to analyze a domain
export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const snapshots = await getWaybackCount(domain);
  const dnsResolves = await checkDNS(domain);
  const https = await supportsHTTPS(domain);
  const status = await fetchStatus(domain);
  const length = domain.length;
  const tld = domain.split(".").pop() || "";
  const spam = spamIndicators(domain);

  let score = 0;

  if (snapshots >= 50) score += 25;
  else if (snapshots >= 20) score += 15;
  else if (snapshots >= 5) score += 5;

  if (dnsResolves) score += 20;
  if (https) score += 15;

  if (status === 200) score += 15;
  else if (status === 301) score += 10;
  else if (status === 302) score += 5;

  if (length <= 12) score += 10;
  else if (length <= 18) score += 5;

  if (spam) score -= 20;

  score = Math.max(0, Math.min(100, score));

  let risk: "Low" | "Medium" | "High" = "High";
  if (score >= 80) risk = "Low";
  else if (score >= 50) risk = "Medium";

  let strategy = "Full Content & SEO Rebuild";
  if (score >= 80) strategy = "Authority Content Rebuild";
  else if (score >= 50) strategy = "Partial Content & SEO Refresh";

  return {
    domain,
    score,
    risk,
    strategy,
    snapshots,
    dns: dnsResolves,
    https,
    status,
    length,
    tld,
    spam,
  };
}

