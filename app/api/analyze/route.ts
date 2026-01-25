// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeDomain } from "../../../lib/analyzer";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const domain = body?.domain;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Invalid domain" },
        { status: 400 }
      );
    }

    const report = await analyzeDomain(domain);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

