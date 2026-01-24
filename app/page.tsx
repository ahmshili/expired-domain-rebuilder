"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export const dynamic = "force-static";
export const revalidate = false;

export default function Home() {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const domain = formData.get("domain")?.toString().trim();

    if (!domain) return;

    router.push(`/report/${encodeURIComponent(domain)}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={onSubmit}
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

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 w-full rounded"
        >
          Analyze Domain
        </button>
      </form>
    </main>
  );
}

