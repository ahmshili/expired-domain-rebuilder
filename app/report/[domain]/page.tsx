

import { analyzeDomain } from  '@lib/analyzer'
export async function generateMetadata({ params }: { params: { domain: string } }) {
  return {
    title: `SEO Report for ${params.domain}`,
    description: `Expired domain analysis and SEO rebuild score for ${params.domain}`
  }
}

export default async function Report({ params }: { params: { domain: string } }) {
  const data = await analyzeDomain(params.domain)

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{params.domain}</h1>

      <div className="grid gap-4">
        <div>Snapshot count: <strong>{data.snapshots}</strong></div>
        <div>DNS resolves: <strong>{data.dns ? 'Yes' : 'No'}</strong></div>
        <div>SEO Score: <strong>{data.score}</strong></div>
        <div>Risk Level: <strong>{data.risk}</strong></div>
        <div>Recommended Strategy: <strong>{data.strategy}</strong></div>
      </div>
    </main>
  )
}
// app/report/[domain]/page.tsx

// ... your existing imports and component

export async function generateStaticParams() {
  // Return empty array → page becomes client-side / dynamic for unknown params
  // Or return example domains if you want some pre-rendered
  return [];
  // Example with some pre-rendered pages:
  // return [{ domain: 'example.com' }, { domain: 'test.net' }];
}

// ... rest of your page component
