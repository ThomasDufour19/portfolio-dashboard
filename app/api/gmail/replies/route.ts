/**
 * GET /api/gmail/replies
 * Retourne l'historique des emails détectés avec leur candidature associée.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("dashboard_session");
  if (session?.value !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const replies = await prisma.emailReply.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
    include: {
      application: {
        select: { company: true, title: true, status: true },
      },
    },
  });

  return NextResponse.json(replies);
}
