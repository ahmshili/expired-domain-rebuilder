export async function resolveDNS(domain: string) {
  const res = await fetch(
    `https://dns.google/resolve?name=${domain}&type=A`
  )
  const json = await res.json()
  return Boolean(json.Answer && json.Answer.length > 0)
}
