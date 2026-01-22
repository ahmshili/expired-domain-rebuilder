"use client";

import { useParams } from "next/navigation";
import ReportClient from "./ReportClient";

export const dynamic = "force-dynamic";

export default function ReportPage() {
  const params = useParams<{ domain: string }>();
  const domain = params?.domain;

  if (!domain) return null;

  return <ReportClient domain={domain} />;
}

