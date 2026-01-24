// app/api/analyze/route.ts
export const runtime: "edge" = "edge"; // <-- MUST be first line

import { analyzeDomain } from "@/lib/analyzer"; // make sure the path is correct

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return Response.json({ error: "Invalid domain" }, { status: 400 });
    }

    const data = await analyzeDomain(domain);
    return Response.json(data);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

