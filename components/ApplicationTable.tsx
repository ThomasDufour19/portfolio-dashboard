"use client";

import { useState } from "react";

interface Application {
  id: number;
  platform: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  status: string;
  dateApplied: string;
  replyDate: string | null;
}

interface StatusInfo {
  label: string;
  color: string;
}

interface Props {
  applications: Application[];
  statusMap: Record<string, StatusInfo>;
}

export default function ApplicationTable({ applications, statusMap }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = applications.filter((app) => {
    const matchSearch =
      app.title.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500 w-60"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          style={{ colorScheme: "dark" }}
        >
          <option value="all"       className="bg-[#1a1a1a] text-white">Tous les statuts</option>
          <option value="interview" className="bg-[#1a1a1a] text-white">🎯 Entretien</option>
          <option value="replied"   className="bg-[#1a1a1a] text-white">💬 Réponse reçue</option>
          <option value="no_reply"  className="bg-[#1a1a1a] text-white">⏰ Sans réponse +7j</option>
          <option value="applied"   className="bg-[#1a1a1a] text-white">✅ Envoyée</option>
          <option value="external"  className="bg-[#1a1a1a] text-white">🌐 Site externe</option>
          <option value="rejected"  className="bg-[#1a1a1a] text-white">❌ Refus</option>
          <option value="pending"   className="bg-[#1a1a1a] text-white">⏳ En attente</option>
          <option value="blocked"   className="bg-[#1a1a1a] text-white">🔒 Bloquée</option>
        </select>
        <span className="text-white/40 text-sm self-center">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0f0f0f]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#161616] border-b border-white/10">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest border-r border-white/5 w-[28%]">Poste</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest border-r border-white/5 w-[18%]">Entreprise</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest border-r border-white/5 hidden lg:table-cell">Localisation</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest border-r border-white/5 w-[160px]">Statut</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest border-r border-white/5 hidden md:table-cell w-[160px]">Envoi / Réponse</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest w-[70px]">Lien</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app, i) => {
              const status = statusMap[app.status] ?? {
                label: app.status,
                color: "bg-white/10 text-white/50",
              };
              return (
                <tr
                  key={app.id}
                  className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors group ${
                    i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                  }`}
                >
                  <td className="px-4 py-3.5 border-r border-white/5">
                    <span className="font-medium text-white/90 block truncate max-w-[220px]" title={app.title}>
                      {app.title}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-r border-white/5">
                    <span className="text-white/65 font-medium">{app.company}</span>
                  </td>
                  <td className="px-4 py-3.5 border-r border-white/5 hidden lg:table-cell">
                    <span className="text-white/35 text-xs">
                      {app.location
                        ? app.location.split(",")[0]  // juste la ville
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-r border-white/5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-r border-white/5 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-xs whitespace-nowrap">
                        📤 {new Date(app.dateApplied).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "2-digit", year: "2-digit"
                        })}
                      </span>
                      {app.replyDate ? (
                        <span className="text-purple-400/80 text-xs whitespace-nowrap font-medium">
                          💬 {new Date(app.replyDate).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "2-digit"
                          })}
                        </span>
                      ) : (
                        <span className="text-white/15 text-xs">— pas de réponse</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400/70 hover:text-blue-300 transition-colors text-xs font-medium group-hover:text-blue-300"
                    >
                      Voir →
                    </a>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-white/25 text-sm">
                  Aucune candidature trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
