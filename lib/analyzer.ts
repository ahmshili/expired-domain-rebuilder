// lib/analyzer.ts
export interface DomainReport {
  domain: string;
  score: number;
  risk: 'Low' | 'Medium' | 'High';
  strategy: string;
  snapshots: number;
  dns: boolean;
  https: boolean;
  status: number;
  length: number;
  tld: string;
  spam: boolean;
}

async function fetchWaybackSnapshots(domain: string): Promise<number> {
  try {
    const res = await fetch(`https://archive.org/wayback/available?url=${domain}`);
    const data = await res.json();
    if (data.archived_snapshots && data.archived_snapshots.closest) {
      // Only count if snapshot has real content
      const snapRes = await fetch(data.archived_snapshots.closest.url);
      const html = await snapRes.text();
      return html.length > 200 ? 1 : 0; // count only meaningful snapshots
    }
    return 0;
  } catch {
    return 0;
  }
}

async function checkDNS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, { method: 'HEAD', redirect: 'manual' });
    return res.ok || res.status === 301 || res.status === 302;
  } catch {
    return false;
  }
}

async function supportsHTTPS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, { method: 'HEAD', redirect: 'manual' });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchStatus(domain: string): Promise<number> {
  try {
    const res = await fetch(`https://${domain}`, { method: 'HEAD', redirect: 'manual' });
    return res.status;
  } catch {
    return 0;
  }
}

function detectSpam(domain: string): boolean {
  // basic placeholder, can expand
  const blacklist = ['free', 'cheap', 'buy', 'click', 'offer'];
  return blacklist.some(word => domain.includes(word));
}

export async function analyzeDomain(domain: string): Promise<DomainReport> {
  const snapshots = await fetchWaybackSnapshots(domain);
  const dns = await checkDNS(domain);
  const https = await supportsHTTPS(domain);
  const status = await fetchStatus(domain);
  const length = domain.length;
  const tld = domain.slice(domain.lastIndexOf('.'));

  // Realistic scoring
  let score = 0;

  // Live content check
  if (dns && status === 200 && snapshots > 0) score += 40;

  // Wayback snapshots
  if (snapshots >= 5) score += 15;

  // DNS + HTTPS
  if (dns) score += 10;
  if (https) score += 10;

  // HTTP status
  if (status === 200) score += 10;

  // Domain length bonus (short and memorable)
  if (length <= 12) score += 10;
  else if (length <= 18) score += 5;

  // Favor common TLDs
  if (['.com', '.net', '.org'].includes(tld)) score += 5;

  // Spam indicators
  const spam = detectSpam(domain);
  if (spam) score -= 20;

  // Cap score at 100
  if (score > 100) score = 100;

  // Determine risk
  let risk: 'Low' | 'Medium' | 'High' = 'Low';
  if (!dns || status !== 200 || snapshots === 0) risk = 'High';
  else if (score < 50) risk = 'Medium';

  // Strategy
  const strategy = score >= 70 ? 'Authority Content Rebuild' : 'Full Content & SEO Rebuild';

  return {
    domain,
    score,
    risk,
    strategy,
    snapshots,
    dns,
    https,
    status,
    length,
    tld,
    spam,
  };
}

