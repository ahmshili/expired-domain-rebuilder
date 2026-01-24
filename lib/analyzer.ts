// lib/analyzer.ts
export async function analyzeDomain(domain: string) {
  // Simple signals
  const snapshots = await getWaybackCount(domain); // your existing logic
  const dns = await checkDNS(domain);              // your existing logic
  const https = await supportsHTTPS(domain);       // your existing logic
  const status = await fetchStatus(domain);        // your existing logic

  // Domain properties
  const cleanDomain = domain.replace(/^https?:\/\//, "").toLowerCase();
  const length = cleanDomain.replace(/\./g, "").length;
  const tld = cleanDomain.split(".").pop() ?? "";

  // Spam check (simple, edge‑safe)
  const spamKeywords = ["seo", "cheap", "free"];
  const spam = spamKeywords.some((kw) => cleanDomain.includes(kw));

  // Scoring
  let score = 0;

  if (snapshots >= 50) score += 30;
  else if (snapshots >= 20) score += 24;
  else if (snapshots >= 10) score += 18;
  else if (snapshots >= 5) score += 10;

  if (dns) score += 20;
  if (https) score += 10;

  if ([200, 301].includes(status)) score += 15;
  else if (status === 302) score += 10;

  if (length <= 12) score += 10;
  else if (length <= 18) score += 6;
  else score += 2;

  if (["com", "net", "org"].includes(tld)) score += 10;
  else if (tld.length === 2) score += 6;
  else score += 3;

  if (!spam) score += 5;

  const risk = score >= 70 ? "Low" : score >= 40 ? "Medium" : "High";
  const strategy =
    score >= 80
      ? "Authority Content Rebuild"
      : score >= 50
      ? "Partial Content & Redirect"
      : "Brand New Build";

  const explanation = [
    `Wayback snapshots: ${snapshots}`,
    `DNS resolves: ${dns ? "Yes" : "No"}`,
    `HTTPS supported: ${https ? "Yes" : "No"}`,
    `HTTP status: ${status}`,
    `Domain length: ${length}`,
    `TLD: .${tld}`,
    `Spam indicators: ${spam ? "Yes" : "No"}`,
  ];

  return { domain, score, risk, strategy, explanation };
}

