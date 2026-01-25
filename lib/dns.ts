// lib/dns.ts

export async function checkDNS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}`, {
      headers: { accept: "application/dns-json" },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return false;
  }
}

