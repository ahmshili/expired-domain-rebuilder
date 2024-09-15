export async function fetchArchive(domain: string) {
  const res = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${domain}&output=json&limit=20`
  )
  const json = await res.json()
  return Array.isArray(json) ? json.slice(1) : []
}
