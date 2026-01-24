// app/api/analyze/route.ts
export const runtime = "edge";

import {
  checkDNS,
  checkHTTPS,
  getWaybackSnapshots,
  calculateScore,
  assessRisk,
  recommendStrategy,
} from "@lib/analyzer";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    // Step 1: Fetch all signals in parallel
    const [dns, httpsResult, snapshots] = await Promise.all([
      checkDNS(domain),
      checkHTTPS(domain),
      getWaybackSnapshots(domain),
    ]);

    // Step 2: Extract https and status
    const https = httpsResult.https;
    const status = httpsResult.status;

    // Step 3: Calculate score, risk, and strategy
    const score = calculateScore({ dns, https, snapshots, domain });
    const risk = assessRisk(score);
    const strategy = recommendStrategy(risk);

    // Step 4: Return full report
    return new Response(
      JSON.stringify({
        domain,
        dns,
        https,
        status,
        snapshots,
        score,
        risk,
        strategy,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

