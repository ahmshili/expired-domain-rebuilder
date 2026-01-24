// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  checkDNS,
  checkHTTPS,
  getWaybackSnapshots,
  checkSpam,
  calculateScore,
  assessRisk,
  recommendStrategy,
} from "@lib/analyzer";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { domain } = await req.json();
  if (!domain) return NextResponse.json({ error: "Domain required" }, { status: 400 });

  const steps: Record<string, any> = {
    dns: null,
    https: null,
    snapshots: null,
    score: null,
    risk: null,
    strategy: null,
    spam: null,
  };

  try {
    // Run checks in parallel
    const [dns, httpsRes, snapshots] = await Promise.all([
      checkDNS(domain),
      checkHTTPS(domain),
      getWaybackSnapshots(domain),
    ]);

    const spam = checkSpam(domain);

    const score = calculateScore({ dns, https: httpsRes.https, snapshots, domain, spam });
    const risk = assessRisk(score);
    const strategy = recommendStrategy(risk);

    // Assign steps
    steps.dns = dns;
    steps.https = httpsRes;
    steps.snapshots = snapshots;
    steps.spam = spam;
    steps.score = score;
    steps.risk = risk;
    steps.strategy = strategy;

    return NextResponse.json({ domain, steps });
  } catch (err) {
    return NextResponse.json({ error: "Failed to analyze domain", details: err }, { status: 500 });
  }
}

