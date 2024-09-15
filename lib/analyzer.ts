import { fetchArchive } from './archive'
import { resolveDNS } from './dns'

export async function analyzeDomain(domain: string) {
  const snapshots = await fetchArchive(domain)
  const dns = await resolveDNS(domain)

  const count = snapshots.length
  let score = count * 5
  if (dns) score += 20
  if (score > 100) score = 100

  let strategy = 'Avoid'
  if (score > 70) strategy = 'Rebuild content site'
  else if (score > 40) strategy = '301 redirect to money site'

  return {
    snapshots: count,
    dns,
    score,
    risk: score > 70 ? 'Low' : score > 40 ? 'Medium' : 'High',
    strategy
  }
}
