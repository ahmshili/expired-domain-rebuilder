// app/api/analyze/route.ts
export const runtime = "edge";

import { checkDNS, checkHTTPS, getWaybackSnapshots, calculateScore } from "@lib/analyzer";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return Response.json({ error: "Invalid domain" }, { status: 400 });
    }

    // Create a ReadableStream for streaming step results
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Step 1: DNS
        const dns = await checkDNS(domain);
        controller.enqueue(encoder.encode(JSON.stringify({ step: "dns", value: dns }) + "\n"));

        // Step 2: HTTPS
        const https = await checkHTTPS(domain);
        controller.enqueue(encoder.encode(JSON.stringify({ step: "https", value: https }) + "\n"));

        // Step 3: Wayback
        const snapshots = await getWaybackSnapshots(domain);
        controller.enqueue(encoder.encode(JSON.stringify({ step: "snapshots", value: snapshots }) + "\n"));

        // Step 4: Calculate score & risk
        const score = calculateScore({ dns, https, snapshots, domain });
        const risk = score < 50 ? "High" : score < 80 ? "Medium" : "Low";
        const strategy = score < 80 ? "Full Content & SEO Rebuild" : "Partial SEO & Content Update";

        controller.enqueue(
          encoder.encode(JSON.stringify({
            step: "final",
            value: {
              domain,
              score,
              risk,
              strategy,
              snapshots,
              dns,
              https,
              status: https ? 200 : 530,
              length: domain.length,
              tld: domain.split(".").pop() || "",
              spam: false,
            }
          }) + "\n")
        );

        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" }
    });

  } catch (err: any) {
    return Response.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

