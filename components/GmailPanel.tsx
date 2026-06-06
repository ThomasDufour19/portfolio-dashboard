"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface GmailStatus {
  connected: boolean;
  email?: string;
  updatedAt?: string;
}

interface EmailReply {
  id: number;
  gmailId: string;
  subject: string;
  from: string;
  snippet: string;
  category: "interview" | "rejected" | "replied";
  receivedAt: string;
  application: {
    company: string;
    title: string;
    status: string;
  };
}

interface ScanResult {
  success: boolean;
  count: number;
  detected: Array<{
    matchedCompany: string;
    category: string;
    subject: string;
    receivedAt: string;
  }>;
}

// ─── Config affichage par catégorie ────────────────────────────────────────

const CATEGORY_CONFIG = {
  interview: {
    label: "Entretien",
    color: "bg-green-500/20 text-green-400 border border-green-500/30",
    icon: "🎯",
  },
  rejected: {
    label: "Refus",
    color: "bg-red-500/20 text-red-400 border border-red-500/30",
    icon: "✕",
  },
  replied: {
    label: "Réponse",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    icon: "✉",
  },
} as const;

// ─── Composant principal ────────────────────────────────────────────────────

export default function GmailPanel() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [replies, setReplies] = useState<EmailReply[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Lit les query params pour afficher les messages de callback OAuth
  const [oauthMsg, setOauthMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected") === "1") {
      setOauthMsg({ type: "success", text: "Gmail connecté avec succès !" });
      // Nettoie l'URL
      window.history.replaceState({}, "", "/dashboard");
    } else if (params.get("gmail_error")) {
      setOauthMsg({
        type: "error",
        text: `Erreur OAuth : ${params.get("gmail_error")}`,
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status");
      if (res.ok) setStatus(await res.json());
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchReplies = useCallback(async () => {
    const res = await fetch("/api/gmail/replies");
    if (res.ok) setReplies(await res.json());
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchReplies();
  }, [fetchStatus, fetchReplies]);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setScanError(null);
    try {
      const res = await fetch("/api/gmail/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error ?? "Erreur lors du scan");
      } else {
        setScanResult(data);
        fetchReplies(); // rafraîchit la liste
        fetchStatus();
      }
    } catch {
      setScanError("Erreur réseau");
    } finally {
      setScanning(false);
    }
  };

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <section className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>Gmail</span>
            {loadingStatus ? (
              <span className="text-white/30 text-sm font-normal">
                Chargement...
              </span>
            ) : status?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Connecté — {status.email}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/40">
                Non connecté
              </span>
            )}
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            Détection automatique des réponses aux candidatures
          </p>
        </div>

        <div className="flex gap-2">
          {!status?.connected && !loadingStatus && (
            <a
              href="/api/gmail/connect"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition flex items-center gap-2"
            >
              Connecter Gmail
            </a>
          )}
          {status?.connected && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {scanning ? (
                <>
                  <Spinner />
                  Scan en cours...
                </>
              ) : (
                "Scanner les emails"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Message OAuth */}
      {oauthMsg && (
        <div
          className={`rounded-lg px-4 py-3 mb-4 text-sm ${
            oauthMsg.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {oauthMsg.text}
        </div>
      )}

      {/* Résultat du scan */}
      {scanResult && (
        <div className="rounded-lg px-4 py-3 mb-4 text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20">
          Scan terminé —{" "}
          {scanResult.count === 0
            ? "aucune nouvelle réponse détectée."
            : `${scanResult.count} nouvelle${scanResult.count > 1 ? "s" : ""} réponse${scanResult.count > 1 ? "s" : ""} détectée${scanResult.count > 1 ? "s" : ""}.`}
        </div>
      )}

      {/* Erreur scan */}
      {scanError && (
        <div className="rounded-lg px-4 py-3 mb-4 text-sm bg-red-500/10 text-red-400 border border-red-500/20">
          {scanError}
        </div>
      )}

      {/* Liste des réponses */}
      {replies.length > 0 ? (
        <div className="space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
            {replies.length} réponse{replies.length > 1 ? "s" : ""} détectée{replies.length > 1 ? "s" : ""}
          </p>
          {replies.map((reply) => {
            const cfg =
              CATEGORY_CONFIG[reply.category] ?? CATEGORY_CONFIG.replied;
            return (
              <div
                key={reply.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition"
              >
                {/* Catégorie */}
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
                >
                  {cfg.icon} {cfg.label}
                </span>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {reply.application.company}
                    </span>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="text-white/50 text-xs truncate">
                      {reply.application.title}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mt-0.5 truncate">
                    {reply.subject || "(pas de sujet)"}
                  </p>
                  <p className="text-white/30 text-xs mt-1 line-clamp-2">
                    {reply.snippet}
                  </p>
                </div>

                {/* Date */}
                <span className="shrink-0 text-white/30 text-xs whitespace-nowrap">
                  {new Date(reply.receivedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        !loadingStatus && (
          <p className="text-white/30 text-sm text-center py-6">
            {status?.connected
              ? "Aucune réponse détectée pour l'instant. Lancez un scan !"
              : "Connectez votre Gmail pour détecter les réponses automatiquement."}
          </p>
        )
      )}
    </section>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
