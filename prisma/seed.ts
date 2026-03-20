// prisma/seed.ts
// Seed de base de données Haki — données de développement
// Usage : npm run db:seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding base de données Haki...\n");

  // ─── Organisation pilote 1 ────────────────────────────────
  const org1 = await prisma.organisation.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      nom: "Groupe Banque Atlantique CI",
      secteur: "banque",
      taille: "200-500",
      ville: "Abidjan",
      pays: "Côte d'Ivoire",
      statutArtci: "autorisé",
    },
  });
  console.log(`✅  Organisation : ${org1.nom}`);

  // ─── Organisation pilote 2 ────────────────────────────────
  const org2 = await prisma.organisation.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      nom: "ONG Femmes & Développement CI",
      secteur: "ong",
      taille: "20-50",
      ville: "Abidjan",
      pays: "Côte d'Ivoire",
      statutArtci: "en_cours",
    },
  });
  console.log(`✅  Organisation : ${org2.nom}`);

  // ─── Admin Haki ────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Haki@Admin2026!", 12);
  const admin = await prisma.utilisateur.upsert({
    where: { email: "admin@haki.ci" },
    update: {},
    create: {
      id: "00000000-0000-0000-0001-000000000001",
      organisationId: org1.id,
      email: "admin@haki.ci",
      passwordHash: adminHash,
      role: "admin_haki",
      prenom: "Admin",
      nom: "Haki",
      actif: true,
    },
  });
  console.log(`✅  Admin Haki : ${admin.email}`);

  // ─── DRH Organisation 1 ───────────────────────────────────
  const drhHash = await bcrypt.hash("Drh@Banque2026!", 12);
  const drh1 = await prisma.utilisateur.upsert({
    where: { email: "drh@banqueatlantique.ci" },
    update: {},
    create: {
      id: "00000000-0000-0000-0002-000000000001",
      organisationId: org1.id,
      email: "drh@banqueatlantique.ci",
      passwordHash: drhHash,
      role: "drh",
      prenom: "Adjoua",
      nom: "Koné",
      actif: true,
    },
  });
  console.log(`✅  DRH : ${drh1.email}`);

  // ─── DG Organisation 1 ────────────────────────────────────
  const dgHash = await bcrypt.hash("Dg@Banque2026!", 12);
  const dg1 = await prisma.utilisateur.upsert({
    where: { email: "dg@banqueatlantique.ci" },
    update: {},
    create: {
      id: "00000000-0000-0000-0002-000000000002",
      organisationId: org1.id,
      email: "dg@banqueatlantique.ci",
      passwordHash: dgHash,
      role: "dg",
      prenom: "Kouassi",
      nom: "Ouattara",
      actif: true,
    },
  });
  console.log(`✅  DG : ${dg1.email}`);

  // ─── DRH Organisation 2 ───────────────────────────────────
  const drh2Hash = await bcrypt.hash("Drh@ONG2026!", 12);
  const drh2 = await prisma.utilisateur.upsert({
    where: { email: "drh@femmesdeveloppement.ci" },
    update: {},
    create: {
      id: "00000000-0000-0000-0003-000000000001",
      organisationId: org2.id,
      email: "drh@femmesdeveloppement.ci",
      passwordHash: drh2Hash,
      role: "drh",
      prenom: "Mariam",
      nom: "Diabaté",
      actif: true,
    },
  });
  console.log(`✅  DRH ONG : ${drh2.email}`);

  // ─── Session diagnostic exemple (org1) ───────────────────
  const session1 = await prisma.sessionDiagnostic.upsert({
    where: { id: "00000000-0000-0000-0004-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0004-000000000001",
      organisationId: org1.id,
      creeePar: drh1.id,
      type: "complet",
      statut: "en_cours",
      anneeReference: "2026",
    },
  });
  console.log(`✅  Session diagnostic : ${session1.id}`);

  // ─── Quelques liens collaborateurs de test ────────────────
  const expireAt = new Date();
  expireAt.setDate(expireAt.getDate() + 30);

  for (let i = 0; i < 5; i++) {
    await prisma.lienCollaborateur.create({
      data: {
        sessionId: session1.id,
        expireAt,
      },
    }).catch(() => {}); // Ignorer si déjà créé
  }
  console.log(`✅  5 liens collaborateurs créés pour la session pilote`);

  // ─── Lien manager de test ────────────────────────────────
  const tokenManager = randomUUID();
  const tokenHash = createHash("sha256").update(tokenManager).digest("hex");

  await prisma.lienManager.upsert({
    where: { tokenPriveHash: tokenHash },
    update: {},
    create: {
      sessionId: session1.id,
      managerUserId: dg1.id,
      tokenPriveHash: tokenHash,
      expireAt,
    },
  });
  console.log(`✅  Lien manager test (token : ${tokenManager})`);

  // ─── Benchmarks sectoriels CI (données fictives) ─────────
  const benchmarks = [
    { secteur: "banque", dimension: "GLOBAL", annee: "2025", score: 52, p25: 40, p75: 64, n: 14 },
    { secteur: "banque", dimension: "DIM1", annee: "2025", score: 58, p25: 46, p75: 70, n: 14 },
    { secteur: "banque", dimension: "DIM2", annee: "2025", score: 42, p25: 34, p75: 55, n: 14 },
    { secteur: "banque", dimension: "DIM3", annee: "2025", score: 61, p25: 50, p75: 72, n: 14 },
    { secteur: "banque", dimension: "DIM4", annee: "2025", score: 55, p25: 44, p75: 66, n: 14 },
    { secteur: "ong", dimension: "GLOBAL", annee: "2025", score: 61, p25: 50, p75: 72, n: 11 },
    { secteur: "industrie", dimension: "GLOBAL", annee: "2025", score: 44, p25: 32, p75: 58, n: 10 },
  ];

  for (const b of benchmarks) {
    await prisma.benchmarkSectoriel.upsert({
      where: { secteur_dimension_composante_annee: {
  secteur: b.secteur,
  dimension: b.dimension,
  composante: "",
  annee: b.annee,
}},
      update: { scoreMoyen: b.score, scoreP25: b.p25, scoreP75: b.p75, nbEntreprises: b.n },
      create: {
        secteur: b.secteur,
        dimension: b.dimension,
        annee: b.annee,
        scoreMoyen: b.score,
        scoreP25: b.p25,
        scoreP75: b.p75,
        nbEntreprises: b.n,
      },
    });
  }
  console.log(`✅  ${benchmarks.length} benchmarks sectoriels CI créés`);

  console.log("\n✅  Seed terminé !");
  console.log("\n📋 Comptes de test :");
  console.log(`   Admin Haki  : admin@haki.ci            / Haki@Admin2026!`);
  console.log(`   DRH Banque  : drh@banqueatlantique.ci   / Drh@Banque2026!`);
  console.log(`   DG Banque   : dg@banqueatlantique.ci    / Dg@Banque2026!`);
  console.log(`   DRH ONG     : drh@femmesdeveloppement.ci / Drh@ONG2026!`);
  console.log(`\n   Token manager test : ${tokenManager}`);
}

main()
  .catch(e => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
