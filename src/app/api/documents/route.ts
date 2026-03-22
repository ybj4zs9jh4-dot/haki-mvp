import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  calculerMontant, calculerMontantPackage, getTailleFromEffectif,
  genererRefProforma, type TypeDocument, type NiveauDocument,
} from "@/lib/catalogue-documents";

const CommandeSchema = z.object({
  sessionId: z.string().uuid(),
  typeDocument: z.enum(["strategie_genre","charte_di","politique_genre","pag","mecanisme_se"]),
  niveau: z.enum(["standard","enrichi","premium"]).default("standard"),
  notesClient: z.string().max(1000).optional(),
  packageId: z.string().optional(),
  documentsPackage: z.array(z.enum(["strategie_genre","charte_di","politique_genre","pag","mecanisme_se"])).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({
      where: { email: session.user.email! },
      include: { organisation: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const body = await req.json();
    const data = CommandeSchema.parse(body);

    const sessionDiag = await prisma.sessionDiagnostic.findUnique({
      where: { id: data.sessionId },
      include: { scoreMmiCi: true, socleDiagnostic: true },
    });
    if (!sessionDiag) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    if (user.role !== "admin_haki" && user.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const taille = getTailleFromEffectif(user.organisation.taille);
    const montant = calculerMontant(data.typeDocument as TypeDocument, data.niveau as NiveauDocument, taille);
    const proformaRef = genererRefProforma(data.typeDocument, user.organisation.nom);

    // Construire le contexte de contextualisation
    const contexte = {
      organisationNom: user.organisation.nom,
      secteur: user.organisation.secteur,
      taille: user.organisation.taille,
      ville: user.organisation.ville,
      scoreGlobal: sessionDiag.scoreMmiCi?.scoreGlobal ?? null,
      niveauMmi: sessionDiag.scoreMmiCi?.niveauMmi ?? null,
      scoreDim1: sessionDiag.scoreMmiCi?.scoreDim1Genre ?? null,
      scoreDim2: sessionDiag.scoreMmiCi?.scoreDim2Handicap ?? null,
      scoreDim3: sessionDiag.scoreMmiCi?.scoreDim3Multicult ?? null,
      scoreDim4: sessionDiag.scoreMmiCi?.scoreDim4Intergen ?? null,
      badgeSocle: sessionDiag.socleDiagnostic?.badgeGlobal ?? null,
      alertesSocle: sessionDiag.socleDiagnostic?.alertes ?? [],
      annee: sessionDiag.anneeReference,
    };

    const livraisonPrevue = new Date();
    const joursLivraison = data.niveau === "premium" ? 21 : data.niveau === "enrichi" ? 15 : 10;
    livraisonPrevue.setDate(livraisonPrevue.getDate() + joursLivraison);

    const commande = await prisma.$executeRawUnsafe(`
      INSERT INTO commande_document (
        "organisationId", "sessionId", "typeDocument", "niveau", "taille",
        "statut", "montantFcfa", "contexte", "notesClient", "proformaRef", "livraisonPrevue"
      ) VALUES (
        '${user.organisationId}', '${data.sessionId}', '${data.typeDocument}',
        '${data.niveau}', '${taille}', 'en_attente', ${montant},
        '${JSON.stringify(contexte).replace(/'/g, "''")}',
        ${data.notesClient ? `'${data.notesClient.replace(/'/g, "''")}'` : "NULL"},
        '${proformaRef}', '${livraisonPrevue.toISOString()}'
      ) RETURNING id
    `);

    // Envoyer email notification à Haki
    // await notifierHakiNouvelleCommande(proformaRef, user.organisation.nom, data.typeDocument, montant);

    return NextResponse.json({
      success: true,
      proformaRef,
      montant,
      livraisonPrevue: livraisonPrevue.toISOString(),
      message: `Demande enregistrée — Référence ${proformaRef}. Vous recevrez votre proforma sous 24h.`,
    }, { status: 201 });

  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: "Données invalides", details: e.issues }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur", details: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const commandes = await prisma.$queryRawUnsafe(`
      SELECT * FROM commande_document
      WHERE "organisationId" = '${user.organisationId}'
      ORDER BY "commandeeLe" DESC
    `);

    return NextResponse.json({ commandes });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
