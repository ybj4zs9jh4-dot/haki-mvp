// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSessionSchema = z.object({
  organisationId: z.string().uuid(),
  type: z.enum(["organisation","collaborateurs","managers","complet"]).default("complet"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","dg","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Rôle insuffisant" }, { status: 403 });
    }

    const { organisationId, type } = CreateSessionSchema.parse(await req.json());

    if (user.role !== "admin_haki" && user.organisationId !== organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const sessionDiag = await prisma.sessionDiagnostic.create({
      data: { organisationId, creeePar: user.id, type },
    });

    return NextResponse.json({ sessionId: sessionDiag.id, statut: sessionDiag.statut }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const sessions = await prisma.sessionDiagnostic.findMany({
      where: user.role === "admin_haki" ? {} : { organisationId: user.organisationId },
      include: {
        scoreMmiCi: { select: { scoreGlobal: true, niveauMmi: true } },
        socleDiagnostic: { select: { badgeGlobal: true } },
        _count: { select: { reponsesOrg: true, liensCollaborateur: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
