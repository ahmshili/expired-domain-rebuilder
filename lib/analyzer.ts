export async function analyzeDomain(domain: string) {
  let dns = false;
  let httpsStatus: number | null = null;
  let snapshots = 0;
  let spam = false;

  try {
    const res = await fetch(`https://${domain}`, { method: "HEAD" });
    httpsStatus = res.status;
    dns = true;
  } catch {}

  try {
    const wb = await fetch(
      `https://archive.org/wayback/available?url=${domain}`
    );
    const data = await wb.json();
    snapshots = data?.archived_snapshots ? 1 : 0;
  } catch {}

  // HARD RULE: dead domains get zero
  if (!dns && snapshots === 0) {
    return {
      domain,
      dns: false,
      httpsStatus,
      snapshots: 0,
      spam: false,
      score: 0,
      risk: "High",
      strategy: "Discard — no authority or history detected",
    };
  }

  const score = Math.min(
    100,
    (dns ? 30 : 0) + snapshots * 40 + (httpsStatus === 200 ? 30 : 0)
  );

  return {
    domain,
    dns,
    httpsStatus,
    snapshots,
    spam,
    score,
    risk: score > 60 ? "Low" : score > 30 ? "Medium" : "High",
    strategy:
      score > 60
        ? "Partial rebuild & link preservation"
        : "Full content rebuild with SEO reset",
  };
}

