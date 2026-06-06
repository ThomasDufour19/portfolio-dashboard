import { prisma } from "@/lib/db";
import Link from "next/link";
import ApplicationTable from "@/components/ApplicationTable";

export const dynamic = "force-dynamic";

async function getStats() {
  const [total, byStatus, byPlatform, recent] = await Promise.all([
    prisma.application.count(),
    prisma.application.groupBy({ by: ["status"], _count: true }),
    prisma.application.groupBy({ by: ["platform"], _count: true }),
    prisma.application.findMany({
      orderBy: { dateApplied: "desc" },
      take: 100,
    }),
  ]);
  return { total, byStatus, byPlatform, recent };
}

export default async function DashboardPage() {
  const { total, byStatus, byPlatform, recent } = await getStats();

  const statusMap: Record<string, { label: string; color: string }> = {
    applied:  { label: "Envoyée",  color: "bg-green-500/20 text-green-400" },
    pending:  { label: "En attente", color: "bg-yellow-500/20 text-yellow-400" },
    blocked:  { label: "Bloquée",  color: "bg-red-500/20 text-red-400" },
    external: { label: "Site externe", color: "bg-blue-500/20 text-blue-400" },
  };

  const statusCounts = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count])
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg hover:text-white/80 transition">
            ← Thomas Dufour
          </Link>
          <span className="text-white/50 text-sm">Dashboard candidatures</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-2">📊 Mes candidatures</h1>
        <p className="text-white/50 text-sm mb-10">
          Suivi automatique via le bot Job Hunter
        </p>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total envoyées" value={total} color="from-blue-600 to-purple-600" />
          <StatCard label="Easy Apply" value={statusCounts["applied"] ?? 0} color="from-green-600 to-emerald-600" />
          <StatCard label="Sites externes" value={statusCounts["external"] ?? 0} color="from-blue-600 to-cyan-600" />
          <StatCard label="En attente" value={statusCounts["pending"] ?? 0} color="from-yellow-600 to-orange-600" />
        </div>

        {/* ── PLATEFORMES ── */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {byPlatform.map((p) => (
            <span
              key={p.platform}
              className="px-3 py-1.5 bg-white/10 rounded-full text-sm"
            >
              {p.platform} <span className="text-white/50 ml-1">{p._count}</span>
            </span>
          ))}
        </div>

        {/* ── TABLEAU ── */}
        <ApplicationTable applications={recent} statusMap={statusMap} />
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <div className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>
        {value}
      </div>
      <div className="text-white/50 text-sm">{label}</div>
    </div>
  );
}
