import { analyzeDomain } from  '@lib/analyzer'
// export const runtime = 'edge'

export async function POST(req: Request) {
  const { domain } = await req.json()
  const data = await analyzeDomain(domain)
  return Response.json(data)
}
