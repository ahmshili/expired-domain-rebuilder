export const runtime = "edge"; // MUST be first

import { analyzeDomain } from "../../../lib/analyzer";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return new Response(JSON.stringify({ error: "Invalid domain" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await analyzeDomain(domain);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

