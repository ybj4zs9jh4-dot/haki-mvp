// src/lib/scoring/socle.ts
// Moteur de scoring SOCLE — Conformité légale CI
// Génère le badge synthétique + alertes priorisées + plan de remédiation

export type NiveauAlerte = "rouge" | "orange" | "vert";
export type BadgeSocle = "conforme" | "en_cours" | "non_conforme";

export interface AlerteSocle {
  composante: string;
  niveau: NiveauAlerte;
  message: string;
  remediation: string;
  articleLegal: string;
  delaiRecommande: string;
}

export interface ResultatSocle {
  badge: BadgeSocle;
  cnpsStatut: NiveauAlerte | "non_evalue";
  cmuStatut: NiveauAlerte | "non_evalue";
  medecinTravailStatut: NiveauAlerte | "non_evalue";
  prevoyanceStatut: NiveauAlerte | "non_evalue";
  alertes: AlerteSocle[];
  planRemediation: AlerteSocle[];
}

export interface ReponsesSocle {
  // CNPS
  cnpsImmatriculation: "conforme" | "regularisation" | "non_conforme";
  cnpsDeclarations: "conforme" | "partiel" | "non_conforme";
  cnpsAtMp: "conforme" | "arrieres" | "non_conforme";
  cnpsProcedureAtMp: "oui" | "sans_procedure" | "non";
  // CMU
  cmuInformation: "conforme" | "ponctuel" | "non_conforme";
  cmuPrecaires: "conforme" | "partiel" | "non_verifie";
  // Médecine du travail
  medecinConvention: "conforme" | "non_conforme";
  medecinVisites: "conforme" | "partiel" | "non";
  // Prévoyance
  prevoyanceMutuelle: "tous" | "cadres_seulement" | "non";
  prevoyanceDecesInvalidite: "tous" | "partiel" | "non";
  prevoyanceConventionCollective: "conforme" | "en_cours" | "non_conforme";
}

export function calculerSocle(reponses: ReponsesSocle): ResultatSocle {
  const alertes: AlerteSocle[] = [];

  // ── CNPS ──────────────────────────────────────────────────
  let cnpsStatut: NiveauAlerte = "vert";

  if (reponses.cnpsImmatriculation === "non_conforme") {
    cnpsStatut = "rouge";
    alertes.push({
      composante: "CNPS — Immatriculation",
      niveau: "rouge",
      message: "L'entreprise n'est pas immatriculée à la CNPS ou les cotisations sont en défaut.",
      remediation: "Contacter immédiatement la CNPS pour régularisation. Pénalités potentielles : 2 à 10M FCFA + risque de poursuite prud'homale.",
      articleLegal: "Loi n° 2018-984 · CNPS · Obligatoire",
      delaiRecommande: "Immédiat — 0 à 30 jours",
    });
  } else if (reponses.cnpsImmatriculation === "regularisation") {
    cnpsStatut = "orange";
    alertes.push({
      composante: "CNPS — Immatriculation",
      niveau: "orange",
      message: "Des arriérés de cotisations CNPS sont en cours d'apurement.",
      remediation: "S'assurer que le plan de régularisation signé avec la CNPS est respecté et documenté.",
      articleLegal: "Loi n° 2018-984 · CNPS",
      delaiRecommande: "30 à 60 jours",
    });
  }

  if (reponses.cnpsDeclarations === "non_conforme") {
    cnpsStatut = "rouge";
    alertes.push({
      composante: "CNPS — Déclarations salariés",
      niveau: "rouge",
      message: "Des salariés (CDI, CDD, journaliers réguliers) ne sont pas déclarés à la CNPS.",
      remediation: "Déclarer immédiatement tous les salariés à la CNPS. Risque pénal pour travail dissimulé.",
      articleLegal: "Loi n° 2018-984 · CNPS · [BLOQUANT]",
      delaiRecommande: "Immédiat — 0 à 15 jours",
    });
  }

  if (reponses.cnpsProcedureAtMp === "non") {
    if (cnpsStatut === "vert") cnpsStatut = "orange";
    alertes.push({
      composante: "CNPS — Procédure AT/MP",
      niveau: "orange",
      message: "Aucune procédure formalisée de déclaration des accidents du travail à la CNPS.",
      remediation: "Rédiger et diffuser une procédure AT/MP écrite. Nommer un responsable suivi CNPS.",
      articleLegal: "CNPS · AT/MP · Art. 12.3 CT CI",
      delaiRecommande: "30 à 45 jours",
    });
  }

  // ── CMU ───────────────────────────────────────────────────
  let cmuStatut: NiveauAlerte = "vert";

  if (reponses.cmuInformation === "non_conforme") {
    cmuStatut = "rouge";
    alertes.push({
      composante: "CMU — Information salariés",
      niveau: "rouge",
      message: "Les salariés ne sont pas informés de leurs droits à la CMU lors de l'embauche.",
      remediation: "Intégrer immédiatement l'information sur les droits CMU au processus d'onboarding. Obligation légale à l'embauche.",
      articleLegal: "Loi CMU n° 2014-131 · [BLOQUANT]",
      delaiRecommande: "Immédiat — 0 à 15 jours",
    });
  } else if (reponses.cmuInformation === "ponctuel") {
    cmuStatut = "orange";
    alertes.push({
      composante: "CMU — Information salariés",
      niveau: "orange",
      message: "L'information CMU est communiquée ponctuellement mais sans système formalisé.",
      remediation: "Formaliser l'information CMU dans le livret d'accueil et le processus d'onboarding.",
      articleLegal: "Loi CMU n° 2014-131",
      delaiRecommande: "30 jours",
    });
  }

  if (reponses.cmuPrecaires === "non_verifie") {
    if (cmuStatut === "vert") cmuStatut = "orange";
    alertes.push({
      composante: "CMU — Travailleurs précaires",
      niveau: "orange",
      message: "La couverture CMU des travailleurs précaires (stagiaires, CDD courts) n'est pas vérifiée.",
      remediation: "Mettre en place un suivi de la couverture maladie pour tous les travailleurs, y compris les contrats courts.",
      articleLegal: "Loi CMU n° 2014-131",
      delaiRecommande: "45 jours",
    });
  }

  // ── MÉDECINE DU TRAVAIL ───────────────────────────────────
  let medecinTravailStatut: NiveauAlerte = "vert";

  if (reponses.medecinConvention === "non_conforme") {
    medecinTravailStatut = "rouge";
    alertes.push({
      composante: "Médecine du travail — Convention CNPS",
      niveau: "rouge",
      message: "Aucune convention avec un service de médecine du travail agréé CNPS n'a été conclue.",
      remediation: "Signer immédiatement une convention avec un médecin du travail agréé CNPS. Obligation sans dérogation possible.",
      articleLegal: "CT CI Art. 12.3 · CNPS · [BLOQUANT]",
      delaiRecommande: "Immédiat — 0 à 30 jours",
    });
  }

  if (reponses.medecinVisites === "non") {
    if (medecinTravailStatut === "vert") medecinTravailStatut = "orange";
    alertes.push({
      composante: "Médecine du travail — Visites périodiques",
      niveau: "orange",
      message: "Les visites médicales périodiques ne sont pas réalisées pour tous les salariés.",
      remediation: "Organiser les visites médicales annuelles avec le médecin du travail CNPS pour tous les salariés.",
      articleLegal: "CT CI · CNPS · Art. 12.3",
      delaiRecommande: "60 jours",
    });
  }

  // ── PRÉVOYANCE ────────────────────────────────────────────
  let prevoyanceStatut: NiveauAlerte = "vert";

  if (reponses.prevoyanceConventionCollective === "non_conforme") {
    prevoyanceStatut = "orange";
    alertes.push({
      composante: "Prévoyance — Convention collective",
      niveau: "orange",
      message: "Les obligations de prévoyance fixées par la convention collective sectorielle CI ne sont pas respectées.",
      remediation: "Auditer la convention collective sectorielle applicable et mettre en conformité les garanties prévoyance.",
      articleLegal: "Convention collective sectorielle CI",
      delaiRecommande: "60 à 90 jours",
    });
  }

  // ── CALCUL DU BADGE GLOBAL ────────────────────────────────
  const tousStatuts = [cnpsStatut, cmuStatut, medecinTravailStatut, prevoyanceStatut];
  const badge: BadgeSocle =
    tousStatuts.includes("rouge") ? "non_conforme" :
    tousStatuts.includes("orange") ? "en_cours" : "conforme";

  // Trier alertes : rouge d'abord, puis orange
  const alertesTri = alertes.sort((a, b) => {
    if (a.niveau === "rouge" && b.niveau !== "rouge") return -1;
    if (b.niveau === "rouge" && a.niveau !== "rouge") return 1;
    return 0;
  });

  return {
    badge,
    cnpsStatut,
    cmuStatut,
    medecinTravailStatut,
    prevoyanceStatut,
    alertes: alertesTri,
    planRemediation: alertesTri.filter(a => a.niveau === "rouge"),
  };
}

export const BADGE_CONFIG = {
  conforme:     { label: "Conforme ✅",         color: "#2E7D32", bg: "#E8F5E9", icon: "✅" },
  en_cours:     { label: "En cours ⏳",          color: "#E65100", bg: "#FFF3E0", icon: "⏳" },
  non_conforme: { label: "Non-conforme ⚠️",      color: "#B71C1C", bg: "#FFEBEE", icon: "⚠️" },
} as const;
