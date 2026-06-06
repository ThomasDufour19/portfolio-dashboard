"use client";

import { useState, useEffect } from "react";

interface BotStatus {
  id: number;
  command: string;
  status: string;
  message: string | null;
  updatedAt: string;
}

export default function BotControl() {
  const [bot, setBot]         = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/bot/status");
      if (res.ok) setBot(await res.json());
    } catch {}
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // poll toutes les 5s
    return () => clearInterval(interval);
  }, []);

  async function sendCommand(cmd: "start" | "stop") {
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/${cmd}`, { method: "POST" });
      if (res.ok) setBot(await res.json());
    } catch {}
    setLoading(false);
  }

  const isRunning = bot?.status === "running";
  const lastUpdate = bot?.updatedAt
    ? new Date(bot.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
          <h2 className="font-semibold text-white">Bot Job Hunter</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isRunning
              ? "bg-green-500/20 text-green-400"
              : "bg-white/10 text-white/40"
          }`}>
            {isRunning ? "En cours" : "Arrêté"}
          </span>
        </div>
        <span className="text-white/30 text-xs">Mis à jour {lastUpdate}</span>
      </div>

      {/* Message de statut */}
      {bot?.message && (
        <p className="text-sm text-white/50 bg-white/5 rounded-lg px-4 py-2.5 mb-4 font-mono truncate">
          {bot.message}
        </p>
      )}

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          onClick={() => sendCommand("start")}
          disabled={loading || isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition"
        >
          <span>🚀</span>
          Lancer la recherche
        </button>

        <button
          onClick={() => sendCommand("stop")}
          disabled={loading || !isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition"
        >
          <span>🛑</span>
          Arrêter
        </button>
      </div>

      <p className="text-white/20 text-xs mt-3">
        Le daemon doit tourner sur ton PC pour que les commandes soient exécutées.
      </p>
    </div>
  );
}
