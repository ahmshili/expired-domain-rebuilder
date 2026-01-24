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
async function getWaybackSnapshots(domain: string) {
  try {
    const res = await fetchWithTimeout(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=timestamp&collapse=timestamp`
    );
    const data = await res.json();
    // First row is header, so subtract 1, but never negative
    return Math.max(0, Array.isArray(data) ? data.length - 1 : 0);
  } catch {
    return 0;
  }
}

// Check DNS resolution
async function checkDNS(domain: string) {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, 3000);
    return res.ok; // DNS resolves if fetch succeeds
  } catch {
    return false;
  }
}

// Check HTTPS support and get status code
async function checkHTTPS(domain: string) {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, 5000);
    return { https: res.ok, status: res.status };
  } catch (err: any) {
    if (err.name === "AbortError") return { https: false, status: 0 };
    return { https: false, status: err?.status || 0 };
  }
}

// Basic spam indicator (placeholder, extend as needed)
function checkSpam(domain: string) {
  const spamTlds = ["xyz", "top", "win"];
  return spamTlds.includes(domain.split(".").pop()!.toLowerCase());
}

// Score calculation
function calculateScore(report: DomainReport) {
  let score = 100;
  if (!report.dns) score -= 50;
  if (!report.https) score -= 20;
  if (report.snapshots === 0) score -= 10;
  if (report.length > 20) score -= 10;
  if (report.spam) score -= 20;
  return Math.max(0, Math.min(100, score));
}

// Risk assessment
function assessRisk(score: number) {
  if (score >= 80) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

// Strategy suggestion
function recommendStrategy(risk: string) {
  if (risk === "Low") return "Partial SEO & Content Update";
  if (risk === "Medium") return "SEO Refresh & Minor Content Update";
  return "Full Content & SEO Rebuild";
}

// Main analyzer
export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const snapshots = await getWaybackSnapshots(domain);
  const dns = await checkDNS(domain);
  const { https, status } = await checkHTTPS(domain);
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

  report.score = calculateScore(report);
  report.risk = assessRisk(report.score);
  report.strategy = recommendStrategy(report.risk);

  return report;
}

