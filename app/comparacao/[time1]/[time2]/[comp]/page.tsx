import { Suspense } from "react"

import ComparisonStats from "../../../../components/comparison-stats";
import TeamHighlights from "../../../../components/team-highlights";
import LoadingComparison from "./loading"
import Link from "next/link";

export default async function ComparacaoPage({
  params,
}: {
  params: Promise<{ time1: string; time2: string, comp: string }>
}) {
  // Resolve a Promise params
  const { time1, time2, comp } = await params;

  // Decodificando os valores
  const time1Decoded = decodeURIComponent(time1);
  const time2Decoded = decodeURIComponent(time2);
  const compDecoded = decodeURIComponent(comp);

  // Transformando os nomes dos times em formato "Title Case"
  const time1Display = time1Decoded.replace(/-/g, " ");
  const time2Display = time2Decoded.replace(/-/g, " ");

  const toSlug = (name: string) => name.replace(/\s+/g, "-");

  const compDecodedDisplay = compDecoded;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time 1 Stats */}
          <div className="space-y-6">
            <Suspense fallback={<div className="h-64 bg-[#181818] animate-pulse rounded-lg"></div>}>
              <TeamHighlights team1Id={time1Display} team2Id={time2Display} compId={compDecodedDisplay} />
            </Suspense>
          </div>

          {/* Comparison Section */}
          <div className="space-y-6">
            <Suspense fallback={<LoadingComparison />}>
              <ComparisonStats team1Id={time1Display} team2Id={time2Display} round={compDecodedDisplay} />
            </Suspense>
          </div>

          {/* Time 2 Stats */}
          <div className="space-y-6">
            <Suspense fallback={<div className="h-64 bg-[#181818] animate-pulse rounded-lg"></div>}>
              <TeamHighlights team1Id={time2Display} team2Id={time1Display} compId={compDecodedDisplay} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
