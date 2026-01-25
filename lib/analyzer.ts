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

/* ------------------ utils ------------------ */

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 4000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

/* ------------------ checks ------------------ */

export async function checkDNS(domain: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, {
      method: "HEAD",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkHTTPS(domain: string): Promise<{
  https: boolean;
  status: number;
}> {
  try {
    const res = await fetchWithTimeout(`https://${domain}`, {
      method: "HEAD",
    });
    return { https: res.ok, status: res.status };
  } catch {
    return { https: false, status: 0 };
  }
}

export async function getWaybackSnapshots(domain: string): Promise<number> {
  try {
    const res = await fetchWithTimeout(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=timestamp&limit=50`,
      {},
      5000
    );
    const data = await res.json();
    return Array.isArray(data) ? Math.max(0, data.length - 1) : 0;
  } catch {
    return 0;
  }
}

export function checkSpam(domain: string): boolean {
  const spamTlds = ["xyz", "top", "win", "click"];
  return spamTlds.includes(domain.split(".").pop() || "");
}

/* ------------------ scoring ------------------ */

export function calculateScore(input: {
  dns: boolean;
  https: boolean;
  snapshots: number;
  domain: string;
  spam: boolean;
}): number {
  // 🚨 If domain does not resolve → worthless
  if (!input.dns) return 0;

  let score = 40; // base value for resolving domains

  if (input.https) score += 20;
  if (input.snapshots > 0) score += 20;
  if (input.snapshots > 10) score += 10;
  if (input.domain.length < 15) score += 10;
  if (input.spam) score -= 30;

  return Math.max(0, Math.min(100, score));
}

export function assessRisk(score: number): "Low" | "Medium" | "High" {
  if (score >= 80) return "Low";
  if (score >= 40) return "Medium";
  return "High";
}

export function recommendStrategy(score: number): string {
  if (score >= 80) return "Authority Content Expansion";
  if (score >= 40) return "SEO & Content Rebuild";
  return "Full Content & SEO Rebuild";
}

/* ------------------ main ------------------ */

export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const [dns, httpsRes, snapshots] = await Promise.all([
    checkDNS(domain),
    checkHTTPS(domain),
    getWaybackSnapshots(domain),
  ]);

  const spam = checkSpam(domain);
  const length = domain.length;
  const tld = domain.split(".").pop() || "";

  const score = calculateScore({
    dns,
    https: httpsRes.https,
    snapshots,
    domain,
    spam,
  });

  const risk = assessRisk(score);
  const strategy = recommendStrategy(score);

  return {
    domain,
    score,
    risk,
    strategy,

    snapshots,
    dns,
    https: httpsRes.https,
    status: httpsRes.status,

    length,
    tld,
    spam,
  };
}

