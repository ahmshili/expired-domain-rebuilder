// lib/analyzer.ts
import { checkDNS } from "./dns";
import { getWaybackSnapshots } from "./archive";

export type DomainReport = {
  domain: string;
  dnsResolves: boolean;
  httpsSupported: boolean;
  httpStatus: number;
  waybackSnapshots: number;
  spam: boolean;
  score: number;
  risk: "Low" | "Medium" | "High";
  strategy: string;
};

export async function analyzeDomain(domain: string): Promise<DomainReport> {
  let dnsResolves = false;
  let httpsSupported = false;
  let httpStatus = 0;
  let waybackSnapshots = 0;
  let spam = false;

  try {
    dnsResolves = await checkDNS(domain);
  } catch {}

  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD", redirect: "manual" });
    httpsSupported = true;
    httpStatus = res.status;
  } catch {
    httpsSupported = false;
    httpStatus = 0;
  }

  try {
    waybackSnapshots = await getWaybackSnapshots(domain);
  } catch {
    waybackSnapshots = 0;
  }

  // ---- SCORING LOGIC ----
  let score = 0;
  if (dnsResolves) score += 30;
  if (httpsSupported && httpStatus === 200) score += 30;
  if (waybackSnapshots > 0) score += 40;
  score += !spam ? 30 : 0;  // Add points for clean spam signals

  let risk: DomainReport["risk"] = "High";
  let strategy = "Full Content & SEO Rebuild";
  if (score >= 80) {
    risk = "Low";
    strategy = "Partial SEO & Content Update";
  } else if (score >= 40) {
    risk = "Medium";
    strategy = "Selective Content Rebuild";
  }

  return {
    domain,
    dnsResolves,
    httpsSupported,
    httpStatus,
    waybackSnapshots,
    spam,
    score,
    risk,
    strategy,
  };
}
