/**
 * lib/gmail.ts
 * Utilitaires pour l'intégration Gmail API (OAuth2 + scan des emails)
 */

import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenSet {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  email: string;
}

export type EmailCategory = "interview" | "rejected" | "replied";

export interface DetectedEmail {
  gmailId: string;
  subject: string;
  from: string;
  snippet: string;
  category: EmailCategory;
  receivedAt: Date;
  matchedCompany: string;
  applicationId: number;
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

export function buildAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    access_type: "offline",
    prompt: "consent", // force refresh_token à chaque fois
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenSet> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  const data = await res.json();

  // Récupère l'email associé
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${data.access_token}` } }
  );
  const profile = await profileRes.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
    email: profile.email,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expiry_date: number;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }
  const data = await res.json();
  return {
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

export async function saveTokens(tokens: TokenSet) {
  await prisma.gmailToken.upsert({
    where: { id: 1 },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: BigInt(tokens.expiry_date),
      email: tokens.email,
    },
    create: {
      id: 1,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: BigInt(tokens.expiry_date),
      email: tokens.email,
    },
  });
}

/**
 * Retourne un access_token valide (rafraîchit automatiquement si expiré).
 * Throws si aucun token n'est stocké (= pas encore connecté).
 */
export async function getValidAccessToken(): Promise<string> {
  const record = await prisma.gmailToken.findUnique({ where: { id: 1 } });
  if (!record) throw new Error("NOT_CONNECTED");

  const expiryDate = Number(record.expiryDate);
  // Marge de 2 minutes avant l'expiration
  if (Date.now() < expiryDate - 2 * 60 * 1000) {
    return record.accessToken;
  }

  // Refresh
  const refreshed = await refreshAccessToken(record.refreshToken);
  await prisma.gmailToken.update({
    where: { id: 1 },
    data: {
      accessToken: refreshed.access_token,
      expiryDate: BigInt(refreshed.expiry_date),
    },
  });
  return refreshed.access_token;
}

// ─── Classification des emails ────────────────────────────────────────────────

const INTERVIEW_KEYWORDS = [
  // FR
  "entretien",
  "rencontrer",
  "rencontre",
  "convocation",
  "visioconférence",
  "visio",
  "rdv",
  "rendez-vous",
  "souhaitons vous rencontrer",
  "vous proposons un entretien",
  "planifier un échange",
  "prendre contact avec vous",
  "votre profil correspond",
  "votre candidature a retenu",
  "retenu votre candidature",
  "sélectionné",
  "selectionne",
  "avons retenu",
  // EN
  "interview",
  "phone screen",
  "we'd like to meet",
  "meet with you",
  "schedule a call",
  "schedule a meeting",
  "invite you to",
];

const REJECTION_KEYWORDS = [
  // FR
  "ne correspond pas",
  "ne retient pas",
  "n'a pas été retenue",
  "n'a pas retenu",
  "sans suite",
  "n'avons pas pu donner une suite",
  "pas pu donner suite",
  "ne donner pas suite",
  "ne pas retenir",
  "poursuivre sans",
  "profil ne correspond",
  "sommes dans l'obligation de",
  "dans l'impossibilité",
  "n'avons pas retenu",
  "nous avons décidé de ne pas",
  "décision de ne pas",
  "nous ne donnons pas",
  "poste est désormais pourvu",
  "poste a été pourvu",
  "avons fait le choix",
  "nous informons que",
  "malheureusement",
  "d'autres candidats",
  "d'autres profils",
  "ne sommes pas en mesure",
  "refus",
  // EN
  "unfortunately",
  "other candidates",
  "not moving forward",
  "we will not be",
  "decided not to",
  "not selected",
];

export function classifyEmail(
  subject: string,
  snippet: string
): EmailCategory {
  const text = `${subject} ${snippet}`.toLowerCase();

  for (const kw of INTERVIEW_KEYWORDS) {
    if (text.includes(kw)) return "interview";
  }

  for (const kw of REJECTION_KEYWORDS) {
    if (new RegExp(kw, "i").test(text)) return "rejected";
  }

  return "replied";
}

// ─── Gmail API calls ──────────────────────────────────────────────────────────

interface GmailMessage {
  id: string;
  threadId: string;
}

/**
 * Cherche les messages Gmail correspondant à une entreprise dans les N derniers jours.
 * Retourne les IDs des messages.
 */
export async function searchGmailMessages(
  accessToken: string,
  query: string,
  maxResults = 20
): Promise<GmailMessage[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Gmail list failed: ${await res.text()}`);
  const data = await res.json();
  return data.messages ?? [];
}

/**
 * Récupère les métadonnées d'un message Gmail (sujet, expéditeur, snippet, date).
 */
export async function getGmailMessage(
  accessToken: string,
  messageId: string
): Promise<{
  id: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: Date;
}> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Gmail get failed: ${await res.text()}`);
  const data = await res.json();

  const headers: { name: string; value: string }[] = data.payload?.headers ?? [];
  const get = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  return {
    id: data.id,
    subject: get("Subject"),
    from: get("From"),
    snippet: data.snippet ?? "",
    receivedAt: new Date(Number(data.internalDate)),
  };
}

// ─── Scan principal ───────────────────────────────────────────────────────────

/**
 * Nouvelle approche : UNE SEULE recherche Gmail large → on cherche tous
 * les emails de recrutement reçus, puis on matche localement avec les candidatures.
 * Beaucoup plus efficace que 52 recherches séparées.
 *
 * En plus : marque automatiquement comme "no_reply" les candidatures
 * envoyées il y a plus de 7 jours sans réponse.
 */
export async function scanGmailReplies(): Promise<DetectedEmail[]> {
  const accessToken = await getValidAccessToken();

  // Candidatures sans réponse confirmée
  const applications = await prisma.application.findMany({
    where: { status: { notIn: ["interview", "rejected"] } },
    select: { id: true, company: true, title: true, status: true, dateApplied: true },
  });

  // IDs Gmail déjà traités
  const existingGmailIds = new Set(
    (await prisma.emailReply.findMany({ select: { gmailId: true } }))
      .map((r) => r.gmailId)
  );

  const detected: DetectedEmail[] = [];
  const processed  = new Set<string>();

  // Date depuis laquelle chercher (date de la 1ère candidature - 2 jours)
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const afterStr = `${since.getFullYear()}/${since.getMonth() + 1}/${since.getDate()}`;

  // ── ÉTAPE 1 : 2 recherches larges couvrant tous les cas ──────────────────
  const queries = [
    // Emails avec réponse positive (entretien, convocation…)
    `(candidature OR alternance OR recrutement) (entretien OR convocation OR "nous avons retenu" OR "votre profil" OR sélectionné OR rdv OR "rendez-vous") after:${afterStr}`,
    // Emails avec réponse négative (refus, sans suite…)
    `(candidature OR alternance OR recrutement) (refus OR "sans suite" OR malheureusement OR "ne retient pas" OR "n'avons pas retenu" OR "pourvu") after:${afterStr}`,
    // Accusés de réception et autres réponses
    `(candidature OR alternance) ("bien reçu" OR "avons bien reçu" OR "pris en compte" OR "bonne réception") after:${afterStr}`,
  ];

  const allMessages: GmailMessage[] = [];
  for (const q of queries) {
    try {
      const msgs = await searchGmailMessages(accessToken, q, 50);
      allMessages.push(...msgs);
    } catch {}
  }

  // ── ÉTAPE 2 : pour chaque email, récupère les métadonnées ────────────────
  for (const msg of allMessages) {
    if (existingGmailIds.has(msg.id)) continue;
    if (processed.has(msg.id)) continue;
    processed.add(msg.id);

    let details: Awaited<ReturnType<typeof getGmailMessage>>;
    try {
      details = await getGmailMessage(accessToken, msg.id);
    } catch {
      continue;
    }

    // ── ÉTAPE 3 : match avec une candidature ─────────────────────────────
    const textLower = `${details.subject} ${details.snippet} ${details.from}`.toLowerCase();

    // Cherche l'entreprise dont le nom apparaît dans l'email
    const matchedApp = applications.find((app) => {
      const words = app.company
        .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, " ")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3); // ignore mots courts type "SAS", "SNC"…
      return words.length > 0 && words.some((w) => textLower.includes(w));
    });

    if (!matchedApp) continue;

    const category = classifyEmail(details.subject, details.snippet);

    try {
      await prisma.emailReply.create({
        data: {
          applicationId: matchedApp.id,
          gmailId:       details.id,
          subject:       details.subject,
          from:          details.from,
          snippet:       details.snippet.slice(0, 500),
          category,
          receivedAt:    details.receivedAt,
        },
      });
    } catch {
      continue; // gmailId déjà en DB (race condition)
    }

    const newStatus =
      category === "interview" ? "interview" :
      category === "rejected"  ? "rejected"  : "replied";

    await prisma.application.update({
      where: { id: matchedApp.id },
      data:  { status: newStatus },
    });

    detected.push({
      gmailId:        details.id,
      subject:        details.subject,
      from:           details.from,
      snippet:        details.snippet,
      category,
      receivedAt:     details.receivedAt,
      matchedCompany: matchedApp.company,
      applicationId:  matchedApp.id,
    });
  }

  // ── ÉTAPE 4 : marque "no_reply" les candidatures sans réponse > 7 jours ──
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const noReply = applications.filter(
    (app) =>
      app.status === "applied" &&
      new Date(app.dateApplied) < sevenDaysAgo
  );

  if (noReply.length > 0) {
    await prisma.application.updateMany({
      where: {
        id:     { in: noReply.map((a) => a.id) },
        status: "applied",
      },
      data: { status: "no_reply" },
    });
  }

  return detected;
}
