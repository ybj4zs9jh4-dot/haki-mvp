// src/app/api/organisations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CreateOrgSchema = z.object({
  nom: z.string().min(2).max(255),
  secteur: z.enum(["banque","industrie","ong","telecoms","sante","distribution","btp","agriculture","autre"]),
  taille: z.enum(["<20","20-50","50-200","200-500","500+"]),
  ville: z.string().default("Abidjan"),
  // Compte DRH initial
  drhEmail: z.string().email(),
  drhPrenom: z.string().min(1),
  drhNom: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || user.role !== "admin_haki") {
      return NextResponse.json({ error: "Réservé à l'admin Haki" }, { status: 403 });
    }

    const body = await req.json();
    const data = CreateOrgSchema.parse(body);

    // Mot de passe temporaire — l'utilisateur devra le changer
    const tempPassword = `Haki@${Math.random().toString(36).slice(2, 10)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: { nom: data.nom, secteur: data.secteur, taille: data.taille, ville: data.ville },
      });
      const drh = await tx.utilisateur.create({
        data: {
          organisationId: org.id,
          email: data.drhEmail,
          passwordHash,
          role: "drh",
          prenom: data.drhPrenom,
          nom: data.drhNom,
        },
      });
      return { org, drh, tempPassword };
    });

    // TODO: envoyer email d'invitation via Resend
    // await envoyerEmailInvitation(result.drh.email, result.tempPassword, result.org.nom);

    return NextResponse.json({
      organisation: { id: result.org.id, nom: result.org.nom },
      drh: { email: result.drh.email },
      // En dev uniquement — retirer en production
      tempPassword: process.env.APP_ENV === "development" ? result.tempPassword : undefined,
    }, { status: 201 });

  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Cet email existe déjà" }, { status: 409 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || user.role !== "admin_haki") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const orgs = await prisma.organisation.findMany({
      include: {
        _count: { select: { utilisateurs: true, sessions: true } },
        sessions: { orderBy: { startedAt: "desc" }, take: 1, select: { statut: true, startedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ organisations: orgs });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
