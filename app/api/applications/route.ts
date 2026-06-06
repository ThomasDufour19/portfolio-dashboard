import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/applications — liste toutes les candidatures
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { dateApplied: "desc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}

// POST /api/applications — ajoute une candidature (appelé par le bot)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const app = await prisma.application.upsert({
      where: { url: body.url },
      update: { status: body.status ?? "applied", updatedAt: new Date() },
      create: {
        platform: body.platform,
        title: body.title,
        company: body.company,
        location: body.location ?? null,
        url: body.url,
        status: body.status ?? "applied",
        dateApplied: body.date_applied ? new Date(body.date_applied) : new Date(),
      },
    });
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}
