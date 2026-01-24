// lib/analyzer.ts
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

// Helper: fetch JSON with timeout
async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Wayback Machine snapshots
export async function getWaybackSnapshots(domain: string) {
  try {
    const res = await fetchWithTimeout(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=timestamp&collapse=timestamp`
    );
    const data = await res.json();
    return Math.max(0, Array.isArray(data) ? data.length - 1 : 0);
  } catch {
    return 0;
  }
}

// Check DNS resolution
export async function checkDNS(domain: string) {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, 3000);
    return res.ok; // DNS resolves if fetch succeeds
  } catch {
    return false;
  }
}

// Check HTTPS support and get status code
export async function checkHTTPS(domain: string) {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, 5000);
    return { https: res.ok, status: res.status };
  } catch (err: any) {
    if (err.name === "AbortError") return { https: false, status: 0 };
    return { https: false, status: err?.status || 0 };
  }
}

// Basic spam indicator
export function checkSpam(domain: string) {
  const spamTlds = ["xyz", "top", "win"];
  return spamTlds.includes(domain.split(".").pop()!.toLowerCase());
}

// Score calculation
export function calculateScore(report: {
  dns: boolean;
  https: boolean;
  snapshots: number;
  domain: string;
}) {
  let score = 100;
  if (!report.dns) score -= 50;
  if (!report.https) score -= 20;
  if (report.snapshots === 0) score -= 10;
  if (report.domain.length > 20) score -= 10;
  if (checkSpam(report.domain)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

// Risk assessment
export function assessRisk(score: number) {
  if (score >= 80) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

// Strategy suggestion
export function recommendStrategy(risk: string) {
  if (risk === "Low") return "Partial SEO & Content Update";
  if (risk === "Medium") return "SEO Refresh & Minor Content Update";
  return "Full Content & SEO Rebuild";
}

// Full analyzer returning all data
export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const [snapshots, dns, httpsResult] = await Promise.all([
    getWaybackSnapshots(domain),
    checkDNS(domain),
    checkHTTPS(domain),
  ]);

  const https = httpsResult.https;
  const status = httpsResult.status;
  const spam = checkSpam(domain);
  const length = domain.length;
  const tld = domain.split(".").pop() || "";

  const report: DomainReport = {
    domain,
    snapshots,
    dns,
    https,
    status,
    spam,
    length,
    tld,
    score: 0, // temporary
    risk: "High", // temporary
    strategy: "",
  };

  report.score = calculateScore({ dns, https, snapshots, domain });
  report.risk = assessRisk(report.score);
  report.strategy = recommendStrategy(report.risk);

  return report;
}

