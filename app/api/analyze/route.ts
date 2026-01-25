// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeDomain } from "@/lib/analyzer";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    const report = await analyzeDomain(domain);
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

