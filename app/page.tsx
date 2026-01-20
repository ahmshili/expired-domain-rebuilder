export const dynamic = 'force-static';
export const revalidate = false; // fully static, no revalidation

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        action="/report"
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-4">
          Expired Domain Analyzer
        </h1>
        <input
          name="domain"
          placeholder="example.com"
          className="border p-2 w-full mb-4"
          required
        />
        <button className="bg-black text-white px-4 py-2 w-full rounded">
          Analyze Domain
        </button>
      </form>
    </main>
  )
}
