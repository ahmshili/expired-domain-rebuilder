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

// --- Exported step functions ---
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

export async function checkDNS(domain: string) {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, 3000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkHTTPS(domain: string) {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, 5000);
    return { https: res.ok, status: res.status };
  } catch (err: any) {
    if (err.name === "AbortError") return { https: false, status: 0 };
    return { https: false, status: err?.status || 0 };
  }
}

export function checkSpam(domain: string) {
  const spamTlds = ["xyz", "top", "win"];
  return spamTlds.includes(domain.split(".").pop()!.toLowerCase());
}

export function calculateScore(report: DomainReport) {
  let score = 100;
  if (!report.dns) score -= 50;
  if (!report.https) score -= 20;
  if (report.snapshots === 0) score -= 10;
  if (report.length > 20) score -= 10;
  if (report.spam) score -= 20;
  return Math.max(0, Math.min(100, score));
}

export function assessRisk(score: number) {
  if (score >= 80) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

export function recommendStrategy(risk: string) {
  if (risk === "Low") return "Partial SEO & Content Update";
  if (risk === "Medium") return "SEO Refresh & Minor Content Update";
  return "Full Content & SEO Rebuild";
}

// Full domain analysis (optional)
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
    score: 0,
    risk: "High",
    strategy: "",
  };

  report.score = calculateScore(report);
  report.risk = assessRisk(report.score);
  report.strategy = recommendStrategy(report.risk);

  return report;
}

