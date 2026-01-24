// lib/analyzer.ts
"use server";

export interface DomainReport {
  domain: string;
  seoScore: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendedStrategy: string;
  waybackSnapshots: number;
  dnsResolves: boolean;
  httpsSupported: boolean;
  httpStatus: number;
  domainLength: number;
  tld: string;
  spamIndicators: boolean;
}

/**
 * Check DNS resolution (Edge-compatible fallback)
 */
async function checkDNS(domain: string): Promise<boolean> {
  try {
    // Use fetch to a dummy endpoint to see if domain resolves
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    return res.ok || res.status === 302;
  } catch {
    return false;
  }
}

/**
 * Check HTTPS support (Edge-compatible)
 */
async function checkHTTPS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    return res.ok || res.status === 302;
  } catch {
    return false;
  }
}

/**
 * Get number of Wayback Machine snapshots
 */
async function getWaybackCount(domain: string): Promise<number> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=timestamp&collapse=digest`
    );
    if (!res.ok) return 0;
    const data = await res.json();
    // first item is header, rest are snapshots
    return Math.max(0, data.length - 1);
  } catch {
    return 0;
  }
}

/**
 * Analyze a domain and return a DomainReport
 */
export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const dnsResolves = await checkDNS(domain);
  const httpsSupported = dnsResolves ? await checkHTTPS(domain) : false;
  const waybackSnapshots = dnsResolves ? await getWaybackCount(domain) : 0;

  // Domain length and TLD
  const domainParts = domain.split(".");
  const domainLength = domainParts[0]?.length || 0;
  const tld = domainParts[1] || "";

  // Score calculation
  let seoScore = 0;
  if (waybackSnapshots > 0) seoScore += Math.min(waybackSnapshots, 50); // max 50 points
  if (dnsResolves) seoScore += 20;
  if (httpsSupported) seoScore += 20;
  if (domainLength <= 12) seoScore += 10;

  // Determine risk level
  let riskLevel: DomainReport["riskLevel"] = "High";
  if (seoScore >= 80) riskLevel = "Low";
  else if (seoScore >= 50) riskLevel = "Medium";

  // Strategy recommendation
  const recommendedStrategy =
    seoScore >= 80
      ? "Authority Content Rebuild"
      : "Full Content & SEO Rebuild";

  // Spam indicators (placeholder, can expand later)
  const spamIndicators = false;

  return {
    domain,
    seoScore,
    riskLevel,
    recommendedStrategy,
    waybackSnapshots,
    dnsResolves,
    httpsSupported,
    httpStatus: dnsResolves ? 200 : 0,
    domainLength,
    tld,
    spamIndicators,
  };
}

