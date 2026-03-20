// src/app/api/benchmarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SEUIL_MIN = 10; // Règle confidentialité — jamais publié si n < 10

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const secteur = searchParams.get("secteur");
    const dimension = searchParams.get("dimension");
    const annee = searchParams.get("annee") ?? new Date().getFullYear().toString();

    const where: any = {
      annee,
      nbEntreprises: { gte: SEUIL_MIN }, // RÈGLE CRITIQUE : jamais publié si n < 10
    };
    if (secteur) where.secteur = secteur;
    if (dimension) where.dimension = dimension;

    const benchmarks = await prisma.benchmarkSectoriel.findMany({
      where,
      orderBy: [{ secteur: "asc" }, { dimension: "asc" }],
    });

    // Secteurs disponibles (avec n ≥ 10)
    const secteursDispo = await prisma.benchmarkSectoriel.findMany({
      where: { dimension: "GLOBAL", nbEntreprises: { gte: SEUIL_MIN } },
      select: { secteur: true, nbEntreprises: true, annee: true },
      distinct: ["secteur"],
      orderBy: { secteur: "asc" },
    });

    return NextResponse.json({
      benchmarks,
      secteursDispo,
      note: `Benchmarks publiés uniquement si n ≥ ${SEUIL_MIN} organisations dans la cellule secteur×dimension×année`,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
