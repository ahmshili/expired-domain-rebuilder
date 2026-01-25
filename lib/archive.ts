// lib/archive.ts

export async function getWaybackSnapshots(domain: string): Promise<number> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${domain}&output=json&limit=1`
    );

    if (!res.ok) return 0;

    const data = await res.json();
    return Array.isArray(data) ? Math.max(0, data.length - 1) : 0;
  } catch {
    return 0;
  }
}

