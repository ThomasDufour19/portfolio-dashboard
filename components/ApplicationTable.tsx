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
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="applied">Envoyées</option>
          <option value="external">Sites externes</option>
          <option value="pending">En attente</option>
          <option value="blocked">Bloquées</option>
        </select>
        <span className="text-white/40 text-sm self-center">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-white/50 uppercase text-xs tracking-wider">
              <th className="px-5 py-3 text-left">Poste</th>
              <th className="px-5 py-3 text-left">Entreprise</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Localisation</th>
              <th className="px-5 py-3 text-left">Statut</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Date</th>
              <th className="px-5 py-3 text-left">Lien</th>
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
                  className={`border-t border-white/5 hover:bg-white/5 transition ${
                    i % 2 === 0 ? "" : "bg-white/[0.02]"
                  }`}
                >
                  <td className="px-5 py-3 font-medium max-w-[200px] truncate">
                    {app.title}
                  </td>
                  <td className="px-5 py-3 text-white/70">{app.company}</td>
                  <td className="px-5 py-3 text-white/50 hidden md:table-cell">
                    {app.location ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/40 hidden md:table-cell whitespace-nowrap">
                    {new Date(app.dateApplied).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      Voir →
                    </a>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-white/30">
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
