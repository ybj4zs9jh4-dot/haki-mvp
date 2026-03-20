// src/app/api/sessions/[id]/liens-collaborateur/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Réservé au DRH" }, { status: 403 });
    }

    const sessionDiag = await prisma.sessionDiagnostic.findUnique({ where: { id: params.id } });
    if (!sessionDiag) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    if (user.role !== "admin_haki" && user.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Vérification ARTCI : l'organisation doit avoir le statut autorisé
    const org = await prisma.organisation.findUnique({ where: { id: sessionDiag.organisationId } });
    if (org?.statutArtci === "en_cours") {
      return NextResponse.json({
        error: "Déclaration ARTCI en cours. Le baromètre COLLABORATEURS ne peut être déployé qu'après obtention de l'autorisation ARTCI (Loi n° 2013-450 CI).",
      }, { status: 403 });
    }

    const body = await req.json();
    const { nombre } = z.object({ nombre: z.number().int().min(1).max(5000) }).parse(body);

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 30);

    const liens = await prisma.$transaction(
      Array.from({ length: nombre }).map(() =>
        prisma.lienCollaborateur.create({ data: { sessionId: params.id, expireAt } })
      )
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const tokens = liens.map(l => ({
      id: l.id,
      url: `${baseUrl}/barometre/${l.tokenAnonyme}`,
      expireAt: l.expireAt,
    }));

    return NextResponse.json({ created: tokens.length, tokens }, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    const sessionDiag = await prisma.sessionDiagnostic.findUnique({ where: { id: params.id } });
    if (!sessionDiag || (user?.role !== "admin_haki" && user?.organisationId !== sessionDiag.organisationId)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const liens = await prisma.lienCollaborateur.findMany({
      where: { sessionId: params.id },
      select: { id: true, utilise: true, expireAt: true, tokenAnonyme: false }, // token jamais exposé
      orderBy: { expireAt: "asc" },
    });

    const stats = {
      total: liens.length,
      utilises: liens.filter(l => l.utilise).length,
      enAttente: liens.filter(l => !l.utilise && l.expireAt > new Date()).length,
      expires: liens.filter(l => l.expireAt <= new Date() && !l.utilise).length,
    };

    return NextResponse.json({ stats, seuilAffichage: 5 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
