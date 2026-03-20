// src/app/api/sessions/[id]/socle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculerSocle, type ReponsesSocle } from "@/lib/scoring/socle";
import { z } from "zod";

const SocleSchema = z.object({
  cnpsImmatriculation: z.enum(["conforme","regularisation","non_conforme"]),
  cnpsDeclarations: z.enum(["conforme","partiel","non_conforme"]),
  cnpsAtMp: z.enum(["conforme","arrieres","non_conforme"]),
  cnpsProcedureAtMp: z.enum(["oui","sans_procedure","non"]),
  cmuInformation: z.enum(["conforme","ponctuel","non_conforme"]),
  cmuPrecaires: z.enum(["conforme","partiel","non_verifie"]),
  medecinConvention: z.enum(["conforme","non_conforme"]),
  medecinVisites: z.enum(["conforme","partiel","non"]),
  prevoyanceMutuelle: z.enum(["tous","cadres_seulement","non"]),
  prevoyanceDecesInvalidite: z.enum(["tous","partiel","non"]),
  prevoyanceConventionCollective: z.enum(["conforme","en_cours","non_conforme"]),
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

    const reponses = SocleSchema.parse(await req.json()) as ReponsesSocle;
    const resultat = calculerSocle(reponses);

    const socle = await prisma.socleDiagnostic.upsert({
      where: { sessionId: params.id },
      create: {
        sessionId: params.id,
        cnpsStatut: resultat.cnpsStatut,
        cmuStatut: resultat.cmuStatut,
        medecinTravailStatut: resultat.medecinTravailStatut,
        prevoyanceStatut: resultat.prevoyanceStatut,
        badgeGlobal: resultat.badge,
        alertes: resultat.alertes as any,
        planRemediation: resultat.planRemediation as any,
      },
      update: {
        cnpsStatut: resultat.cnpsStatut,
        cmuStatut: resultat.cmuStatut,
        medecinTravailStatut: resultat.medecinTravailStatut,
        prevoyanceStatut: resultat.prevoyanceStatut,
        badgeGlobal: resultat.badge,
        alertes: resultat.alertes as any,
        planRemediation: resultat.planRemediation as any,
        evaluatedAt: new Date(),
      },
    });

    return NextResponse.json({ badge: socle.badgeGlobal, alertes: resultat.alertes, nbAlertes: resultat.alertes.length }, { status: 201 });
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
    const sessionDiag = await prisma.sessionDiagnostic.findUnique({
      where: { id: params.id },
      include: { socleDiagnostic: true },
    });
    if (!sessionDiag) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    if (user?.role !== "admin_haki" && user?.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (!sessionDiag.socleDiagnostic) return NextResponse.json({ error: "SOCLE non évalué" }, { status: 404 });

    return NextResponse.json({ socle: sessionDiag.socleDiagnostic });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
