import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-auth");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error:"Non autorisé" }, { status:401 });
  }

  try {
    // Organisations
    const organisations = await prisma.organisation.findMany({
      include: {
        utilisateurs: { select:{ id:true, email:true, role:true, nom:true, prenom:true } },
        sessions: {
          orderBy:{ creeLe:"desc" },
          take:1,
          select:{
            id:true, creeLe:true, statut:true,
            scoreMmiCi:true, socleDiagnostic:true,
          }
        }
      },
      orderBy:{ creeLe:"desc" },
    });

    // Stats globales
    const totalOrgs = organisations.length;
    const totalSessions = await prisma.diagnosticSession.count();
    const sessionsAvecScore = await prisma.diagnosticSession.findMany({
      where:{ scoreMmiCi:{ not:null } },
      select:{ scoreMmiCi:true },
    });
    const scoresMoyen = sessionsAvecScore.length > 0
      ? Math.round(sessionsAvecScore.reduce((acc, s) => acc + ((s.scoreMmiCi as any)?.scoreGlobal ?? 0), 0) / sessionsAvecScore.length)
      : 0;

    // Commandes documents
    const commandes = await prisma.commandeDocument.findMany({
      include:{
        organisation:{ select:{ nom:true } },
      },
      orderBy:{ commandeeLe:"desc" },
    }).catch(() => []);

    const commandesEnAttente = commandes.filter((c:any) => c.statut === "en_attente").length;
    const revenuEstime = commandes.reduce((acc:number, c:any) => acc + (c.montantFcfa ?? 0), 0);

// Productions
    const productions: any[] = [];

    // Rapports PDF générés
    const sessionsAvecRapport = await prisma.diagnosticSession.findMany({
      where: { scoreMmiCi: { not: null } },
      include: { organisation: { select: { nom: true } } },
      orderBy: { creeLe: "desc" },
      take: 50,
    });
    sessionsAvecRapport.forEach((s: any) => {
      productions.push({
        type: "rapport_pdf",
        organisationNom: s.organisation?.nom ?? "—",
        creeLe: s.creeLe,
        statut: "genere",
        urlDocument: null,
      });
    });

    // Documents GIS commandés
    commandes.forEach((c: any) => {
      if (["en_production","livre"].includes(c.statut)) {
        productions.push({
          type: "document_gis",
          organisationNom: c.organisation?.nom ?? "—",
          typeDocument: c.typeDocument,
          creeLe: c.commandeeLe,
          statut: c.statut === "livre" ? "genere" : "en_cours",
          urlDocument: c.urlDocument ?? null,
        });
      }
    });
    return NextResponse.json({
      stats:{
        totalOrgs,
        totalSessions,
        scoresMoyen,
        commandesEnAttente,
        revenuEstime,
        sessionsAvecScore: sessionsAvecScore.length,
      },
      organisations: organisations.map((o:any) => ({
        id: o.id,
        nom: o.nom,
        secteur: o.secteur,
        taille: o.taille,
        ville: o.ville,
        creeLe: o.creeLe,
        utilisateurs: o.utilisateurs,
        dernierDiagnostic: o.sessions[0] ?? null,
      })),
      commandes: commandes.map((c:any) => ({
        id: c.id,
        organisationNom: c.organisation?.nom ?? "—",
        typeDocument: c.typeDocument,
        niveau: c.niveau,
        statut: c.statut,
        montantFcfa: c.montantFcfa,
        commandeeLe: c.commandeeLe,
        livreeLe: c.livreeLe,
      })),
    });
  } catch (e) {
    console.error("Admin dashboard error:", e);
    return NextResponse.json({ error:"Erreur serveur" }, { status:500 });
  }
}
