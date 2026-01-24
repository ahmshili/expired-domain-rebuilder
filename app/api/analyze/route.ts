import { NextRequest, NextResponse } from "next/server";
import { analyzeDomain } from "../../../lib/analyzer";

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain) return NextResponse.json({ error: "Domain is required" }, { status: 400 });

    const report = await analyzeDomain(domain);
    return NextResponse.json(report);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to analyze domain" }, { status: 500 });
  }
}

