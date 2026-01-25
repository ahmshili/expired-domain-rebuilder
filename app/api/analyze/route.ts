import { NextRequest, NextResponse } from "next/server";
import { analyzeDomain } from "../../../lib/analyzer";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { domain } = await req.json();
  const result = await analyzeDomain(domain);
  return NextResponse.json(result);
}

