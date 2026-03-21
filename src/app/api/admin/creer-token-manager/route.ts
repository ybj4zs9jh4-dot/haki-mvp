import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = randomUUID();
  const hash = createHash("sha256").update(token).digest("hex");
  const expireAt = new Date();
  expireAt.setDate(expireAt.getDate() + 30);
  const session = await prisma.sessionDiagnostic.findFirst();
  const manager = await prisma.utilisateur.findFirst({ where: { role: "dg" } });
  if (!session || !manager) return NextResponse.json({ error: "Données manquantes" }, { status: 404 });
  await prisma.lienManager.create({ data: { sessionId: session.id, managerUserId: manager.id, tokenPriveHash: hash, expireAt } });
  return NextResponse.json({ token, url: `${process.env.NEXT_PUBLIC_APP_URL}/managers/${token}` });
}
