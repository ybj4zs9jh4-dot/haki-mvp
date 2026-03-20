// src/app/api/sessions/[id]/reponses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BAREME_INDEX } from "@/lib/scoring/bareme";
import { z } from "zod";

const ReponseItemSchema = z.object({
  itemCode: z.string(),
  valeurBrute: z.string(),
  nbActions: z.number().int().min(0).optional(),
});

const SoumissionSchema = z.object({
  reponses: z.array(ReponseItemSchema).min(1).max(100),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","dg","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Rôle insuffisant" }, { status: 403 });
    }

    const sessionDiag = await prisma.sessionDiagnostic.findUnique({ where: { id: params.id } });
    if (!sessionDiag) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    if (user.role !== "admin_haki" && user.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { reponses } = SoumissionSchema.parse(await req.json());

    // Valider chaque code item et récupérer les métadonnées du barème
    const reponsesValides = reponses.filter(r => BAREME_INDEX.has(r.itemCode));
    if (reponsesValides.length === 0) {
      return NextResponse.json({ error: "Aucun code item valide trouvé" }, { status: 422 });
    }

    // Upsert chaque réponse (permet la reprise et la modification)
    await prisma.$transaction(
      reponsesValides.map(r => {
        const item = BAREME_INDEX.get(r.itemCode)!;
        return prisma.reponseOrganisation.upsert({
          where: { sessionId_itemCode: { sessionId: params.id, itemCode: r.itemCode } },
          create: {
            sessionId: params.id,
            itemCode: r.itemCode,
            dimension: item.dimension,
            composante: item.composante,
            valeurBrute: r.valeurBrute,
            scoreObtenu: 0, // calculé lors du POST /score
            scoreMax: item.scoreMax,
          },
          update: { valeurBrute: r.valeurBrute },
        });
      })
    );

    // Compter la progression
    const totalRepondus = await prisma.reponseOrganisation.count({ where: { sessionId: params.id } });
    const totalItems = BAREME_INDEX.size;
    const progression = Math.round((totalRepondus / totalItems) * 100);

    return NextResponse.json({
      saved: reponsesValides.length,
      totalRepondus,
      progression,
      pret: progression >= 80, // Prêt pour le calcul si ≥80% répondus
    }, { status: 201 });

  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: "Données invalides", details: e.issues }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    const sessionDiag = await prisma.sessionDiagnostic.findUnique({ where: { id: params.id } });
    if (!sessionDiag) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    if (user?.role !== "admin_haki" && user?.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const reponses = await prisma.reponseOrganisation.findMany({
      where: { sessionId: params.id },
      orderBy: { itemCode: "asc" },
    });

    const totalItems = BAREME_INDEX.size;
    const progression = Math.round((reponses.length / totalItems) * 100);

    return NextResponse.json({ reponses, progression, totalItems });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
