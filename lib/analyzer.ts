// lib/analyzer.ts
import dns from "dns/promises";

/**
 * Get number of Wayback Machine snapshots for a domain
 */
export async function getWaybackCount(domain: string): Promise<number> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=timestamp&collapse=digest`
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      // First entry is header row
      return data.length - 1;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Check if DNS resolves
 */
export async function checkDNS(domain: string): Promise<boolean> {
  try {
    const result = await dns.resolveAny(domain);
    return result && result.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if HTTPS is supported
 */
export async function supportsHTTPS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get HTTP status code
 */
export async function fetchStatus(domain: string): Promise<number> {
  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    return res.status;
  } catch {
    return 0;
  }
}

/**
 * Simple spam check placeholder (can be expanded later)
 */
export function spamIndicators(domain: string): boolean {
  // Placeholder: mark domains with random gibberish TLDs as spam
  return /[0-9]{6,}/.test(domain);
}

/**
 * Main analysis function
 */
export async function analyzeDomain(domain: string) {
  // Get all signals
  const snapshots = await getWaybackCount(domain);
  const dnsResolves = await checkDNS(domain);
  const https = await supportsHTTPS(domain);
  const status = await fetchStatus(domain);
  const length = domain.length;
  const tld = domain.split(".").pop() || "";
  const spam = spamIndicators(domain);

  // SEO Scoring (0-100)
  let score = 0;

  // Wayback snapshot scoring
  if (snapshots >= 50) score += 25;
  else if (snapshots >= 20) score += 15;
  else if (snapshots >= 5) score += 5;

  // DNS scoring
  if (dnsResolves) score += 20;

  // HTTPS scoring
  if (https) score += 15;

  // HTTP status scoring
  if (status === 200) score += 15;
  else if (status === 301) score += 10;
  else if (status === 302) score += 5;

  // Domain length scoring
  if (length <= 12) score += 10;
  else if (length <= 18) score += 5;

  // Spam penalty
  if (spam) score -= 20;

  // Cap score between 0-100
  score = Math.max(0, Math.min(100, score));

  // Risk level
  let risk: "Low" | "Medium" | "High" = "High";
  if (score >= 80) risk = "Low";
  else if (score >= 50) risk = "Medium";

  // Recommended strategy
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

