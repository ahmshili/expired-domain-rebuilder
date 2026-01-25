import AnalyzerForm from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Expired Domain Rebuilder & SEO Analyzer
        </h1>
        <p className="text-neutral-400 mb-8">
          Analyze expired or aged domains for SEO rebuild potential.
        </p>

        <AnalyzerForm />
      </div>
    </main>
  );
}

