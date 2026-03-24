// src/lib/catalogue-documents.ts
// Catalogue complet des 5 documents GIS Haki
// Tarification CI · Tables des matières · Proformas

export type TypeDocument =
  | "strategie_genre"
  | "charte_di"
  | "politique_genre"
  | "pag"
  | "mecanisme_se";

export type NiveauDocument = "standard" | "enrichi" | "premium";
export type TailleOrganisation = "pme" | "eti" | "grande";

// ─── TARIFS PAR DOCUMENT ET TAILLE ───────────────────────────
export const TARIFS: Record<TypeDocument, Record<TailleOrganisation, number>> = {
  strategie_genre:  { pme: 850000,  eti: 1200000, grande: 1800000 },
  charte_di:        { pme: 450000,  eti: 650000,  grande: 950000  },
  politique_genre:  { pme: 650000,  eti: 950000,  grande: 1400000 },
  pag:              { pme: 950000,  eti: 1400000, grande: 2100000 },
  mecanisme_se:     { pme: 750000,  eti: 1100000, grande: 1600000 },
};

// Majorations par niveau
export const MAJORATION_NIVEAU: Record<NiveauDocument, number> = {
  standard: 1.0,
  enrichi:  1.35,  // +35%
  premium:  1.75,  // +75%
};

// ─── PACKAGES ─────────────────────────────────────────────────
export const PACKAGES = [
  {
    id: "pack_essentiel",
    label: "Pack Essentiel",
    emoji: "📦",
    documents: ["charte_di", "politique_genre", "pag"] as TypeDocument[],
    remise: 0.20,
    description: "Les 3 documents fondamentaux pour démarrer votre démarche GIS",
    recommande: false,
  },
  {
    id: "pack_conformite",
    label: "Pack Conformité CI",
    emoji: "⚖️",
    documents: ["charte_di", "politique_genre", "pag", "mecanisme_se"] as TypeDocument[],
    remise: 0.25,
    description: "4 documents pour une conformité complète au CT CI 2025",
    recommande: true,
  },
  {
    id: "pack_transformation",
    label: "Pack Transformation GIS",
    emoji: "🚀",
    documents: ["strategie_genre", "charte_di", "politique_genre", "pag", "mecanisme_se"] as TypeDocument[],
    remise: 0.30,
    description: "Les 5 documents — transformation GIS complète · Éligible Label Haki GIS",
    recommande: false,
  },
];

// ─── CATALOGUE DOCUMENTS ──────────────────────────────────────
export const CATALOGUE: Record<TypeDocument, {
  label: string;
  emoji: string;
  couleur: string;
  bg: string;
  dureeJours: Record<NiveauDocument, number>;
  objectifs: string[];
  livrables: string[];
  tableDesMatieres: string[];
  conditionsOptimales: string[];
  niveaux: Record<NiveauDocument, { label: string; description: string; inclus: string[] }>;
}> = {

  strategie_genre: {
    label: "Stratégie Genre",
    emoji: "🎯",
    couleur: "#1A237E",
    bg: "#E8EAF6",
    dureeJours: { standard: 10, enrichi: 15, premium: 21 },
    objectifs: [
      "Définir la vision genre de votre organisation à 5-10 ans",
      "Établir un cadre logique aligné sur les ODD 5 et le CT CI 2025",
      "Créer un document de référence pour vos bailleurs et partenaires",
      "Fixer des objectifs chiffrés de parité et d'égalité",
    ],
    livrables: [
      "Document Word + PDF · 25-35 pages",
      "Cadre logique genre (tableau Excel)",
      "Résumé exécutif 2 pages pour le DG",
      "Version synthétique pour communication externe",
    ],
    tableDesMatieres: [
      "1. Mot du Directeur Général",
      "2. Contexte et enjeux — Genre en Côte d'Ivoire (CT CI 2025 · CEDEF · ODD 5)",
      "3. Diagnostic de situation — Score MMI-CI DIM1 et analyse des gaps",
      "4. Vision et ambition à 5-10 ans",
      "5. Cadre logique genre (objectifs → résultats → impacts)",
      "6. Axes stratégiques prioritaires (4-5 axes)",
      "7. Principes directeurs et valeurs",
      "8. Gouvernance et pilotage de la stratégie",
      "9. Ressources et budget pluriannuel indicatif",
      "10. Annexes — Cadre légal CI et international de référence",
    ],
    conditionsOptimales: [
      "Avoir complété le questionnaire ORGANISATION Haki",
      "Score MMI-CI DIM1 disponible",
      "Niveau Enrichi : fournir rapport annuel ou RSE existant",
      "Niveau Premium : disponibilité DG/DRH pour entretien 1h",
    ],
    niveaux: {
      standard: {
        label: "Standard",
        description: "Basé sur vos données Haki uniquement",
        inclus: [
          "Contextualisation via les 67 réponses du diagnostic",
          "Score MMI-CI DIM1 intégré",
          "Plan d'actions prioritaires aligné",
          "Cadre légal CI automatique",
          "Livraison 10 jours ouvrés",
        ],
      },
      enrichi: {
        label: "Enrichi",
        description: "Diagnostic Haki + revue de vos documents existants",
        inclus: [
          "Tout le niveau Standard",
          "Revue documentaire de vos docs RH existants",
          "Analyse des cohérences avec votre règlement intérieur",
          "Intégration de vos pratiques déjà en place",
          "Recommandations personnalisées",
          "Livraison 15 jours ouvrés",
        ],
      },
      premium: {
        label: "Premium",
        description: "Accompagnement expert Haki complet",
        inclus: [
          "Tout le niveau Enrichi",
          "Entretien téléphonique 1h avec expert Haki",
          "Validation des orientations avant production",
          "Relecture et validation expert avant livraison",
          "1 cycle de révisions inclus",
          "Livraison 21 jours ouvrés",
        ],
      },
    },
  },

  charte_di: {
    label: "Charte Genre et Inclusion Sociale",
    emoji: "📜",
    couleur: "#00695C",
    bg: "#E0F2F1",
    dureeJours: { standard: 10, enrichi: 15, premium: 21 },
    objectifs: [
      "Formaliser l'engagement public de votre organisation en matière de GIS",
      "Créer un document signable par la direction et diffusable externement",
      "Répondre aux exigences des bailleurs (AFD, IFC, ONU Femmes CI)",
      "Renforcer votre marque employeur auprès des candidats",
    ],
    livrables: [
      "Document Word + PDF · 8-12 pages",
      "Version affichable A3 (mise en page graphique)",
      "Version digitale pour site web et intranet",
    ],
    tableDesMatieres: [
      "1. Préambule et engagement de la direction",
      "2. Définitions — Diversité, Équité, Inclusion au sens Haki CI",
      "3. Nos 7 engagements GIS signés",
      "4. Champ d'application et bénéficiaires",
      "5. Mécanismes de mise en œuvre",
      "6. Communication et diffusion interne/externe",
      "7. Révision annuelle et mise à jour",
      "8. Signatures — DG · DRH · Représentants du personnel",
      "9. Annexe — Textes légaux CI de référence (Art. 4 CT CI · CEDEF · ODD)",
    ],
    conditionsOptimales: [
      "Avoir complété le diagnostic SOCLE et ORGANISATION",
      "Score MMI-CI global disponible",
      "Niveau Enrichi : fournir charte ou engagements existants si disponibles",
    ],
    niveaux: {
      standard: {
        label: "Standard",
        description: "Basé sur vos données Haki",
        inclus: [
          "Engagements contextualisés à votre secteur CI",
          "Score MMI-CI intégré comme base de départ",
          "Références légales CT CI 2025 automatiques",
          "Livraison 10 jours ouvrés",
        ],
      },
      enrichi: {
        label: "Enrichi",
        description: "Diagnostic + revue documentaire",
        inclus: [
          "Tout le niveau Standard",
          "Cohérence avec votre règlement intérieur vérifié",
          "Intégration de vos engagements RSE existants",
          "Livraison 15 jours ouvrés",
        ],
      },
      premium: {
        label: "Premium",
        description: "Accompagnement expert complet",
        inclus: [
          "Tout le niveau Enrichi",
          "Entretien 1h avec expert Haki",
          "Validation DG avant production",
          "Mise en page graphique aux couleurs de votre organisation",
          "Livraison 21 jours ouvrés",
        ],
      },
    },
  },

  politique_genre: {
    label: "Politique Genre",
    emoji: "⚖️",
    couleur: "#1A237E",
    bg: "#E8EAF6",
    dureeJours: { standard: 10, enrichi: 15, premium: 21 },
    objectifs: [
      "Établir le cadre normatif interne obligatoire (Art. 4 CT CI 2025)",
      "Fixer les règles de non-discrimination applicables à tous",
      "Protéger l'organisation contre les risques juridiques prud'homaux",
      "Créer la référence interne pour tous les processus RH",
    ],
    livrables: [
      "Document Word + PDF · 20-28 pages",
      "Note de synthèse juridique pour le DRH",
      "Tableau des obligations légales CI vs pratiques actuelles",
    ],
    tableDesMatieres: [
      "1. Objet, champ d'application et définitions",
      "2. Fondements légaux (Art. 4 · 11 · 33 · 41 CT CI 2025 · CEDEF · ODD 5)",
      "3. Principes de non-discrimination et égalité de traitement",
      "4. Égalité de recrutement et d'accès aux postes à responsabilité",
      "5. Égalité salariale et de progression de carrière",
      "6. Politique parentalité (maternité 14 sem. · paternité 10 j · Art. 41 CT CI)",
      "7. Prévention et traitement du harcèlement et VSBG",
      "8. Non-discrimination VIH/Sida (Art. 4 CT CI — obligation légale absolue)",
      "9. Mesures d'accompagnement et dispositifs de soutien",
      "10. Responsabilités — Direction · DRH · Managers · Salariés",
      "11. Sanctions et voies de recours internes",
      "12. Entrée en vigueur, révision et communication",
    ],
    conditionsOptimales: [
      "Diagnostic SOCLE complété — alertes CNPS/CMU/VIH identifiées",
      "Score MMI-CI DIM1 disponible",
      "Niveau Enrichi : fournir règlement intérieur actuel",
      "Niveau Premium : entretien avec DRH pour cas particuliers sectoriels",
    ],
    niveaux: {
      standard: {
        label: "Standard",
        description: "Basé sur vos données Haki",
        inclus: [
          "Toutes les obligations CT CI 2025 intégrées",
          "Alertes SOCLE traitées dans le document",
          "Contextualisée à votre secteur et taille",
          "Livraison 10 jours ouvrés",
        ],
      },
      enrichi: {
        label: "Enrichi",
        description: "Diagnostic + revue règlement intérieur",
        inclus: [
          "Tout le niveau Standard",
          "Cohérence avec votre règlement intérieur actuel",
          "Identification des clauses à modifier",
          "Recommandations de mise à jour RI",
          "Livraison 15 jours ouvrés",
        ],
      },
      premium: {
        label: "Premium",
        description: "Accompagnement juridique complet",
        inclus: [
          "Tout le niveau Enrichi",
          "Entretien 1h avec expert Haki",
          "Validation juridique avant diffusion",
          "Note de risques prud'homaux",
          "Livraison 21 jours ouvrés",
        ],
      },
    },
  },

  pag: {
    label: "Plan d'Action Genre (PAG)",
    emoji: "📋",
    couleur: "#E65100",
    bg: "#FFF3E0",
    dureeJours: { standard: 10, enrichi: 15, premium: 21 },
    objectifs: [
      "Traduire la stratégie genre en actions concrètes et mesurables",
      "Allouer les ressources et responsabilités pour chaque action",
      "Fixer un calendrier réaliste basé sur vos gaps MMI-CI identifiés",
      "Fournir un outil de pilotage opérationnel au DRH",
    ],
    livrables: [
      "Document Word + PDF · 30-40 pages",
      "Matrice des actions Excel (action · responsable · délai · budget · KPI)",
      "Calendrier Gantt des 12/24 premiers mois",
      "Budget prévisionnel détaillé",
    ],
    tableDesMatieres: [
      "1. Résumé exécutif — Score MMI-CI de départ et objectifs cibles",
      "2. Méthodologie de priorisation basée sur le diagnostic Haki",
      "3. Axe 1 — Gouvernance et pilotage genre",
      "4. Axe 2 — Recrutement et promotion équitables",
      "5. Axe 3 — Conditions de travail et politique parentalité",
      "6. Axe 4 — Prévention VSBG et mécanismes de signalement",
      "7. Axe 5 — Non-discrimination VIH/Sida (Art. 4 CT CI)",
      "8. Matrice des actions (action · responsable · délai · budget · indicateur)",
      "9. Budget global et sources de financement (FDFP · bailleurs · budget propre)",
      "10. Calendrier de mise en œuvre — Gantt 24 mois",
      "11. Risques et mesures de mitigation",
      "12. Score MMI-CI cible à 12 et 24 mois",
    ],
    conditionsOptimales: [
      "Score MMI-CI calculé — plan d'actions prioritaires généré",
      "Données budgétaires indicatives de l'organisation",
      "Niveau Enrichi : fournir plans d'actions RH existants",
      "Niveau Premium : entretien avec DRH et DAF pour le budget",
    ],
    niveaux: {
      standard: {
        label: "Standard",
        description: "Basé sur le plan d'actions Haki généré",
        inclus: [
          "Top 10 actions prioritaires MMI-CI intégrées",
          "Gains potentiels chiffrés par action",
          "Délais réalistes par taille d'organisation",
          "Livraison 10 jours ouvrés",
        ],
      },
      enrichi: {
        label: "Enrichi",
        description: "Diagnostic + revue des plans existants",
        inclus: [
          "Tout le niveau Standard",
          "Intégration de vos actions déjà en cours",
          "Évitement des doublons avec vos programmes existants",
          "Budget contextualisé à votre secteur CI",
          "Livraison 15 jours ouvrés",
        ],
      },
      premium: {
        label: "Premium",
        description: "Co-construction avec votre équipe",
        inclus: [
          "Tout le niveau Enrichi",
          "Entretien 1h DRH + DAF pour le budget",
          "Matrice des actions validée avant finalisation",
          "Présentation PowerPoint du PAG incluse",
          "Livraison 21 jours ouvrés",
        ],
      },
    },
  },

  mecanisme_se: {
    label: "Mécanisme Suivi-Évaluation & Mitigation",
    emoji: "📊",
    couleur: "#2E7D32",
    bg: "#E8F5E9",
    dureeJours: { standard: 10, enrichi: 15, premium: 21 },
    objectifs: [
      "Mettre en place un système de mesure continue des progrès GIS",
      "Créer les tableaux de bord pour le reporting interne et externe",
      "Anticiper et gérer les risques GIS de votre organisation",
      "Répondre aux exigences GRI/CSRD/ODD de vos bailleurs",
    ],
    livrables: [
      "Document Word + PDF · 25-35 pages",
      "Tableau de bord Excel KPI GIS (mensuel/trimestriel/annuel)",
      "Matrice des risques GIS",
      "Modèle de rapport annuel GIS",
    ],
    tableDesMatieres: [
      "1. Objectifs et portée du mécanisme S&E",
      "2. Cadre de résultats et indicateurs clés (KPI GIS) par dimension MMI-CI",
      "3. Tableau de bord de suivi mensuel et trimestriel",
      "4. Collecte et gestion des données (conformité ARTCI · anonymisation)",
      "5. Processus de reporting interne (DRH → DG → CA)",
      "6. Reporting externe (GRI · CSRD · ODD · bailleurs)",
      "7. Revue annuelle du score MMI-CI",
      "8. Matrice des risques GIS et mesures de mitigation",
      "9. Plan de communication des résultats GIS",
      "10. Mécanisme de plainte et de remontée des alertes",
      "11. Révision et amélioration continue du mécanisme",
    ],
    conditionsOptimales: [
      "Score MMI-CI calculé sur au moins 1 année",
      "Rapport PDF Haki généré",
      "Niveau Enrichi : fournir rapports RSE ou annuels existants",
      "Niveau Premium : entretien avec DG pour les exigences bailleurs",
    ],
    niveaux: {
      standard: {
        label: "Standard",
        description: "Basé sur les indicateurs MMI-CI Haki",
        inclus: [
          "KPI alignés sur les 4 dimensions MMI-CI",
          "Tableau de bord Excel pré-rempli",
          "Matrice des risques GIS sectoriels CI",
          "Livraison 10 jours ouvrés",
        ],
      },
      enrichi: {
        label: "Enrichi",
        description: "Diagnostic + revue des systèmes existants",
        inclus: [
          "Tout le niveau Standard",
          "Cohérence avec vos systèmes de reporting existants",
          "Indicateurs GRI/CSRD/ODD intégrés",
          "Modèle rapport annuel GIS personnalisé",
          "Livraison 15 jours ouvrés",
        ],
      },
      premium: {
        label: "Premium",
        description: "Système S&E sur mesure",
        inclus: [
          "Tout le niveau Enrichi",
          "Entretien 1h avec DG et bailleurs si applicable",
          "Validation du cadre de résultats",
          "Formation DRH à l'utilisation du tableau de bord",
          "Livraison 21 jours ouvrés",
        ],
      },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────
export function calculerMontant(
  type: TypeDocument,
  niveau: NiveauDocument,
  taille: TailleOrganisation
): number {
  const base = TARIFS[type][taille];
  return Math.round(base * MAJORATION_NIVEAU[niveau]);
}

export function calculerMontantPackage(
  packageId: string,
  niveau: NiveauDocument,
  taille: TailleOrganisation
): { sansRemise: number; avecRemise: number; economie: number } {
  const pack = PACKAGES.find(p => p.id === packageId);
  if (!pack) return { sansRemise: 0, avecRemise: 0, economie: 0 };
  const sansRemise = pack.documents.reduce((sum, doc) => sum + calculerMontant(doc, niveau, taille), 0);
  const avecRemise = Math.round(sansRemise * (1 - pack.remise));
  return { sansRemise, avecRemise, economie: sansRemise - avecRemise };
}

export function getTailleFromEffectif(taille: string): TailleOrganisation {
  if (taille === "<20" || taille === "20-50" || taille === "50-200") return "pme";
  if (taille === "200-500") return "eti";
  return "grande";
}

export function genererRefProforma(type: string, orgNom: string): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const initiales = orgNom.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `HAK-${yy}${mm}-${initiales}-${rand}`;
}

export function formaterFcfa(montant: number): string {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
}
