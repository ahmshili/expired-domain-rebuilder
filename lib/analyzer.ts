// lib/analyzer.ts
export interface DomainReport {
  domain: string;
  score: number;
  risk: "Low" | "Medium" | "High";
  strategy: string;
  snapshots: number;
  dns: boolean; // we'll fake DNS via fetch
  https: boolean;
  status: number;
  length: number;
  tld: string;
  spam: boolean;
}

// Wayback snapshots
async function getWaybackSnapshots(domain: string): Promise<number> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&limit=1`
    );
    const data = await res.json();
    return Array.isArray(data) ? data.length - 1 : 0;
  } catch {
    return 0;
  }
}

// HTTPS + status
async function checkHTTPS(domain: string): Promise<{ https: boolean; status: number }> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD", redirect: "manual" });
    return { https: true, status: res.status };
  } catch {
    return { https: false, status: 0 };
  }
}

// Fake DNS check by trying HTTPS or HTTP request
async function checkDNS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD", redirect: "manual" });
    return res.ok || res.status === 301 || res.status === 302;
  } catch {
    return false;
  }
}

export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const length = domain.length;
  const tld = domain.split(".").pop() || "";
  const spam = false;

  const [dnsResolves, httpsRes, snapshots] = await Promise.all([
    checkDNS(domain),
    checkHTTPS(domain),
    getWaybackSnapshots(domain),
  ]);

  let score = 0;
  if (dnsResolves) score += 30;
  if (httpsRes.https) score += 20;
  if (snapshots > 0) score += 20;
  if (length <= 12) score += 10;
  if (!spam) score += 20;

  const risk = score < 50 ? "High" : score < 75 ? "Medium" : "Low";
  const strategy = score < 50 ? "Full Content & SEO Rebuild" : "Partial SEO & Content Update";

  return {
    domain,
    score,
    risk,
    strategy,
    snapshots,
    dns: dnsResolves,
    https: httpsRes.https,
    status: httpsRes.status,
    length,
    tld,
    spam,
  };
}

