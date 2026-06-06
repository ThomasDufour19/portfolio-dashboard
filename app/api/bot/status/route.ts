import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const botStatus = await prisma.botStatus.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, command: "idle", status: "stopped" },
    });
    return NextResponse.json(botStatus);
  } catch (error) {
    return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
  }
}
