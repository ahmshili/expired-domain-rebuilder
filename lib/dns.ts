export async function checkDNS(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=1`, {
      headers: { accept: "application/dns-json" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return false;
  }
}
