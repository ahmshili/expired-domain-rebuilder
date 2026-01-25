export default function Report({ data }: { data: any }) {
  return (
    <div className="mt-8 border border-neutral-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        Domain Rebuild Report: {data.domain}
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>DNS Resolves</div>
        <div>{data.dns ? "Yes" : "No"}</div>

        <div>HTTPS Status</div>
        <div>{data.httpsStatus ?? "N/A"}</div>

        <div>Wayback Snapshots</div>
        <div>{data.snapshots}</div>

        <div>Spam Signals</div>
        <div>{data.spam ? "Detected" : "Clean"}</div>

        <div className="font-semibold">Score</div>
        <div className="font-semibold">{data.score}/100</div>

        <div>Risk Level</div>
        <div>{data.risk}</div>
      </div>

      <div className="pt-4 border-t border-neutral-800">
        <p className="text-neutral-300 font-medium">Recommended Strategy</p>
        <p className="text-neutral-400">{data.strategy}</p>
      </div>
    </div>
  );
}

