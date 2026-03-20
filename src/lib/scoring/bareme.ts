// src/lib/scoring/bareme.ts
// Barème de scoring MMI-CI v1.0
// Haki — Côte d'Ivoire
// Total : 100 pts sur 4 dimensions DEI (SOCLE hors score)

export type TypeItem =
  | "binaire"
  | "actions_multiples"
  | "indicateur_seuil"
  | "indicateur_seuil_inverse"
  | "indicateur_informatif";

export interface ItemBareme {
  code: string;
  libelle: string;
  dimension: "DIM1" | "DIM2" | "DIM3" | "DIM4";
  composante: string;          // A, B, C, D, E, F, G
  scoreMax: number;
  type: TypeItem;
  importance: "critique" | "important" | "standard" | "informatif";
  // Pour type "binaire"
  bareme?: Record<string, number>;
  // Pour type "actions_multiples"
  ptsByAction?: number;
  maxActions?: number;
  // Pour type "indicateur_seuil" ou "indicateur_seuil_inverse"
  seuils?: Array<[number, number]>; // [valeur_seuil, points]
}

export const BAREME: ItemBareme[] = [

  // ════════════════════════════════════════════════════════════
  // DIM 1 — GENRE & ÉGALITÉ + VIH/SIDA — 38 pts
  // ════════════════════════════════════════════════════════════

  // A — Gouvernance (9 pts)
  { code: "G-01", libelle: "Politique Genre formalisée et diffusée", dimension: "DIM1", composante: "A", scoreMax: 3.0, type: "binaire", importance: "critique",
    bareme: { "diffusee": 3.0, "elaboration": 1.0, "non": 0 } },
  { code: "G-02", libelle: "Résultats genre présentés aux instances dirigeantes", dimension: "DIM1", composante: "A", scoreMax: 2.0, type: "binaire", importance: "important",
    bareme: { "trimestriel": 2.0, "annuel": 1.0, "non": 0 } },
  { code: "G-03", libelle: "Référent·e ou comité DEI désigné·e", dimension: "DIM1", composante: "A", scoreMax: 2.0, type: "binaire", importance: "important",
    bareme: { "comite": 2.0, "referent": 1.0, "non": 0 } },
  { code: "G-03b", libelle: "Politique non-discrimination tous critères Art. 4 CT CI", dimension: "DIM1", composante: "A", scoreMax: 1.0, type: "binaire", importance: "standard",
    bareme: { "tous_criteres": 1.0, "partielle": 0.5, "non": 0 } },
  { code: "G-03c", libelle: "Mécanisme signalement confidentiel toute nature", dimension: "DIM1", composante: "A", scoreMax: 1.0, type: "actions_multiples", importance: "standard",
    ptsByAction: 0.5, maxActions: 2 },
  // G-04 Loi Climat 2025 — 0.5 pts dans composante A (ajusté pour total = 9)

  // B — Données & Parité (8 pts)
  { code: "G-05", libelle: "Effectif total renseigné", dimension: "DIM1", composante: "B", scoreMax: 1.0, type: "binaire", importance: "standard",
    bareme: { "renseigne": 1.0, "non": 0 } },
  { code: "G-06", libelle: "% femmes effectif total", dimension: "DIM1", composante: "B", scoreMax: 2.0, type: "indicateur_seuil", importance: "important",
    seuils: [[40, 2.0], [30, 1.2], [20, 0.6], [0, 0]] },
  { code: "G-07", libelle: "% femmes cadres supérieurs + direction", dimension: "DIM1", composante: "B", scoreMax: 2.0, type: "indicateur_seuil", importance: "critique",
    seuils: [[35, 2.0], [25, 1.2], [15, 0.5], [0, 0]] },
  { code: "G-08", libelle: "% femmes instances de gouvernance", dimension: "DIM1", composante: "B", scoreMax: 1.0, type: "indicateur_seuil", importance: "important",
    seuils: [[30, 1.0], [20, 0.6], [10, 0.2], [0, 0]] },
  { code: "G-09", libelle: "Écart salarial F/H (%)", dimension: "DIM1", composante: "B", scoreMax: 1.0, type: "indicateur_seuil_inverse", importance: "important",
    seuils: [[2, 1.0], [5, 0.6], [10, 0.3], [Infinity, 0]] },
  { code: "G-10", libelle: "Analyse écarts salariaux F/H par CSP réalisée", dimension: "DIM1", composante: "B", scoreMax: 1.0, type: "binaire", importance: "standard",
    bareme: { "annuel": 1.0, "ponctuel": 0.5, "non": 0 } },

  // C — Recrutement & Carrière (5 pts)
  { code: "G-11", libelle: "Offres d'emploi en langage non genré", dimension: "DIM1", composante: "C", scoreMax: 1.5, type: "binaire", importance: "important",
    bareme: { "systematique": 1.5, "partiel": 0.5, "non": 0 } },
  { code: "G-12", libelle: "Diversification canaux sourcing femmes", dimension: "DIM1", composante: "C", scoreMax: 1.5, type: "actions_multiples", importance: "standard",
    ptsByAction: 0.5, maxActions: 3 },
  { code: "G-13", libelle: "Programme promotion interne femmes vers management", dimension: "DIM1", composante: "C", scoreMax: 2.0, type: "binaire", importance: "critique",
    bareme: { "programme_actif": 2.0, "critere_genre": 1.0, "non": 0 } },

  // D — Parentalité (5 pts)
  { code: "G-14", libelle: "Congé maternité 14 sem. + retour garanti", dimension: "DIM1", composante: "D", scoreMax: 2.5, type: "binaire", importance: "critique",
    bareme: { "conforme_entretien": 2.5, "non_conforme": 0 } },
  { code: "G-15", libelle: "Congé paternité 10 jours accordé sans condition", dimension: "DIM1", composante: "D", scoreMax: 1.5, type: "binaire", importance: "important",
    bareme: { "conforme": 1.5, "non_conforme": 0 } },
  { code: "G-16", libelle: "Protection formelle contre licenciement grossesse", dimension: "DIM1", composante: "D", scoreMax: 0.75, type: "binaire", importance: "standard",
    bareme: { "politique_ecrite": 0.75, "suivi": 0.35, "non": 0 } },
  { code: "G-17", libelle: "% pères ayant pris le congé paternité", dimension: "DIM1", composante: "D", scoreMax: 0.25, type: "indicateur_seuil", importance: "standard",
    seuils: [[80, 0.25], [50, 0.15], [0, 0]] },

  // E — VSBG (4 pts)
  { code: "G-18", libelle: "Politique tolérance zéro harcèlement", dimension: "DIM1", composante: "E", scoreMax: 1.5, type: "binaire", importance: "critique",
    bareme: { "politique_diffusee": 1.5, "reglement_interieur": 0.5, "non": 0 } },
  { code: "G-19", libelle: "Mécanisme signalement VSBG confidentiel", dimension: "DIM1", composante: "E", scoreMax: 1.5, type: "actions_multiples", importance: "critique",
    ptsByAction: 0.5, maxActions: 3 },
  { code: "G-20", libelle: "Sensibilisation VSBG des collaborateurs", dimension: "DIM1", composante: "E", scoreMax: 1.0, type: "actions_multiples", importance: "important",
    ptsByAction: 0.33, maxActions: 3 },
  { code: "G-21", libelle: "Nb signalements reçus", dimension: "DIM1", composante: "E", scoreMax: 0, type: "indicateur_informatif", importance: "informatif" },
  { code: "G-22", libelle: "Nb sanctions prononcées", dimension: "DIM1", composante: "E", scoreMax: 0, type: "indicateur_informatif", importance: "informatif" },

  // F — VIH/Sida (4 pts)
  { code: "G-23", libelle: "Politique non-discrimination VIH Art. 4 CT CI", dimension: "DIM1", composante: "F", scoreMax: 2.5, type: "binaire", importance: "critique",
    bareme: { "art4_explicite": 2.5, "clause_generale": 1.0, "non": 0 } },
  { code: "G-24", libelle: "Confidentialité statut sérologique dans contrats", dimension: "DIM1", composante: "F", scoreMax: 0.75, type: "binaire", importance: "important",
    bareme: { "clause_explicite": 0.75, "secret_medical": 0.30, "non": 0 } },
  { code: "G-25", libelle: "Accompagnement PVVIH maintien emploi", dimension: "DIM1", composante: "F", scoreMax: 0.5, type: "binaire", importance: "standard",
    bareme: { "dispositif_formel": 0.5, "cas_par_cas": 0.2, "non": 0 } },
  { code: "G-26", libelle: "Sensibilisation VIH/Sida en milieu professionnel", dimension: "DIM1", composante: "F", scoreMax: 0.25, type: "actions_multiples", importance: "standard",
    ptsByAction: 0.08, maxActions: 3 },
  { code: "G-27", libelle: "Nb actions sensibilisation VIH (12 mois)", dimension: "DIM1", composante: "F", scoreMax: 0, type: "indicateur_informatif", importance: "informatif" },

  // G — Accompagnement carrière femmes (3 pts)
  { code: "G-28", libelle: "Programme mentorat/coaching dédié femmes", dimension: "DIM1", composante: "G", scoreMax: 1.0, type: "binaire", importance: "important",
    bareme: { "programme_actif": 1.0, "sur_demande": 0.4, "non": 0 } },
  { code: "G-29", libelle: "Entretiens carrière dédiés femmes", dimension: "DIM1", composante: "G", scoreMax: 1.0, type: "binaire", importance: "important",
    bareme: { "retour_plus_carriere": 1.0, "retour_seul": 0.4, "non": 0 } },
  { code: "G-30", libelle: "Soutien réseaux professionnels féminins CI", dimension: "DIM1", composante: "G", scoreMax: 0.5, type: "binaire", importance: "standard",
    bareme: { "reseau_interne": 0.5, "reseaux_externes": 0.3, "non": 0 } },
  { code: "G-31", libelle: "Objectifs chiffrés parité management", dimension: "DIM1", composante: "G", scoreMax: 0.5, type: "binaire", importance: "standard",
    bareme: { "objectifs_chiffres": 0.5, "declaratifs": 0.2, "non": 0 } },

  // ════════════════════════════════════════════════════════════
  // DIM 2 — HANDICAP + MÉDECINE DU TRAVAIL — 26 pts
  // ════════════════════════════════════════════════════════════

  // A — Gouvernance (10 pts)
  { code: "H-01", libelle: "Politique Handicap formalisée avec objectifs", dimension: "DIM2", composante: "A", scoreMax: 3.0, type: "binaire", importance: "critique",
    bareme: { "politique_ecrite": 3.0, "elaboration": 1.0, "non": 0 } },
  { code: "H-02", libelle: "Quota légal PSH Art. 12.2 CT CI respecté", dimension: "DIM2", composante: "A", scoreMax: 4.0, type: "binaire", importance: "critique",
    bareme: { "quota_atteint": 4.0, "en_progression": 2.0, "non_atteint": 0 } },
  { code: "H-03", libelle: "Référent·e Handicap désigné·e et connu·e", dimension: "DIM2", composante: "A", scoreMax: 2.0, type: "binaire", importance: "important",
    bareme: { "forme_et_connu": 2.0, "non": 0 } },
  { code: "H-04", libelle: "Taux d'emploi PSH direct (%)", dimension: "DIM2", composante: "A", scoreMax: 1.0, type: "indicateur_seuil", importance: "standard",
    seuils: [[6, 1.0], [4, 0.6], [2, 0.3], [0, 0]] },

  // B — Recrutement PSH (6 pts)
  { code: "H-05", libelle: "Nb PSH recrutées dans les 12 mois", dimension: "DIM2", composante: "B", scoreMax: 1.0, type: "binaire", importance: "standard",
    bareme: { "au_moins_1": 1.0, "zero": 0 } },
  { code: "H-06", libelle: "Dispositif maintien emploi PSH", dimension: "DIM2", composante: "B", scoreMax: 1.5, type: "actions_multiples", importance: "critique",
    ptsByAction: 0.5, maxActions: 3 },
  { code: "H-07", libelle: "Accessibilité locaux diagnostiquée + plan", dimension: "DIM2", composante: "B", scoreMax: 2.0, type: "binaire", importance: "important",
    bareme: { "diagnostic_plan": 2.0, "partiel": 0.8, "non": 0 } },
  { code: "H-09", libelle: "Nb aménagements postes réalisés (12 mois)", dimension: "DIM2", composante: "B", scoreMax: 1.5, type: "binaire", importance: "important",
    bareme: { "au_moins_1": 1.5, "zero": 0 } },

  // C — Sensibilisation (3 pts)
  { code: "H-08", libelle: "Sensibilisation formes de handicap CI", dimension: "DIM2", composante: "C", scoreMax: 1.5, type: "binaire", importance: "important",
    bareme: { "formation_managers": 1.5, "ponctuelle": 0.5, "non": 0 } },
  { code: "H-10", libelle: "Taux fréquence AT (plus bas = mieux)", dimension: "DIM2", composante: "C", scoreMax: 1.5, type: "indicateur_seuil_inverse", importance: "important",
    seuils: [[5, 1.5], [15, 0.8], [30, 0.3], [Infinity, 0]] },

  // D — Données PSH (7 pts)
  { code: "H-PSH-01", libelle: "% PSH déclarés / effectif total", dimension: "DIM2", composante: "D", scoreMax: 2.0, type: "indicateur_seuil", importance: "critique",
    seuils: [[6, 2.0], [4, 1.2], [2, 0.5], [0, 0]] },
  { code: "H-PSH-02", libelle: "Nb reclassements réussis suite inaptitude", dimension: "DIM2", composante: "D", scoreMax: 2.0, type: "binaire", importance: "important",
    bareme: { "deux_ou_plus": 2.0, "un": 1.0, "zero": 0 } },
  { code: "H-PSH-03", libelle: "Montant achats fournisseurs employant PSH (FCFA)", dimension: "DIM2", composante: "D", scoreMax: 2.0, type: "indicateur_seuil", importance: "important",
    seuils: [[5000000, 2.0], [1000000, 1.0], [0, 0]] },
  { code: "H-PSH-04", libelle: "Nb licenciements pour inaptitude (plus bas = mieux)", dimension: "DIM2", composante: "D", scoreMax: 1.0, type: "indicateur_seuil_inverse", importance: "standard",
    seuils: [[0, 1.0], [1, 0.5], [Infinity, 0]] },

  // ════════════════════════════════════════════════════════════
  // DIM 3 — MULTICULTURALITÉ & ANTI-TRIBALISME — 25 pts
  // ════════════════════════════════════════════════════════════

  // A — Gouvernance Anti-tribalisme (10 pts)
  { code: "M-01", libelle: "Politique non-discrimination ethnique, régionale, nationale", dimension: "DIM3", composante: "A", scoreMax: 3.0, type: "binaire", importance: "critique",
    bareme: { "politique_ecrite": 3.0, "reglement_interieur": 1.0, "non": 0 } },
  { code: "M-02", libelle: "Politique explicite anti-tribalisme dans les processus RH", dimension: "DIM3", composante: "A", scoreMax: 4.0, type: "binaire", importance: "critique",
    bareme: { "politique_ecrite": 4.0, "reglement_interieur": 1.5, "non": 0 } },
  { code: "M-05", libelle: "Nb nationalités différentes dans l'effectif", dimension: "DIM3", composante: "A", scoreMax: 2.0, type: "indicateur_seuil", importance: "standard",
    seuils: [[5, 2.0], [3, 1.0], [1, 0.5], [0, 0]] },
  { code: "M-08", libelle: "% recrutements communes défavorisées CI", dimension: "DIM3", composante: "A", scoreMax: 1.0, type: "indicateur_seuil", importance: "standard",
    seuils: [[10, 1.0], [5, 0.5], [0, 0]] },
  { code: "M-03", libelle: "% nationaux / CEDEAO / autres (informatif)", dimension: "DIM3", composante: "A", scoreMax: 0, type: "indicateur_informatif", importance: "informatif" },

  // B — Recrutement sans biais ethniques (10 pts)
  { code: "M-06", libelle: "Outils anti-biais ethniques/régionaux/patronyme (4 actions)", dimension: "DIM3", composante: "B", scoreMax: 6.0, type: "actions_multiples", importance: "critique",
    ptsByAction: 1.5, maxActions: 4 },
  { code: "M-07", libelle: "Actions recrutement ciblant zones défavorisées CI", dimension: "DIM3", composante: "B", scoreMax: 4.0, type: "actions_multiples", importance: "important",
    ptsByAction: 1.33, maxActions: 3 },

  // C — Gestion du fait religieux CI (5 pts)
  { code: "M-09", libelle: "Position formalisée sur management pratiques religieuses", dimension: "DIM3", composante: "C", scoreMax: 2.5, type: "binaire", importance: "critique",
    bareme: { "politique_equitable": 2.5, "reglement_interieur": 1.0, "non": 0 } },
  { code: "M-10", libelle: "Aménagements conditions de travail pratiques religieuses", dimension: "DIM3", composante: "C", scoreMax: 1.5, type: "binaire", importance: "important",
    bareme: { "formalises_equitables": 1.5, "informels": 0.5, "non": 0 } },
  { code: "M-11", libelle: "Managers formés gestion fait religieux", dimension: "DIM3", composante: "C", scoreMax: 1.0, type: "binaire", importance: "standard",
    bareme: { "formation_dediee": 1.0, "ponctuelle": 0.3, "non": 0 } },

  // ════════════════════════════════════════════════════════════
  // DIM 4 — INTERGÉNÉRATIONNEL + QVT + SÉCURITÉ — 11 pts
  // ════════════════════════════════════════════════════════════

  // A — Gouvernance intergénérationnelle (4 pts)
  { code: "I-01", libelle: "Politique intergénérationnelle formalisée", dimension: "DIM4", composante: "A", scoreMax: 2.5, type: "binaire", importance: "critique",
    bareme: { "politique_formelle": 2.5, "ponctuels": 0.8, "non": 0 } },
  { code: "I-04", libelle: "Dispositif transmission savoirs entre générations", dimension: "DIM4", composante: "A", scoreMax: 0.75, type: "binaire", importance: "standard",
    bareme: { "programme_mentoring": 0.75, "binomes_formalises": 0.45, "non": 0 } },
  { code: "I-08", libelle: "% collaborateurs formés dans l'année", dimension: "DIM4", composante: "A", scoreMax: 0.75, type: "indicateur_seuil", importance: "standard",
    seuils: [[70, 0.75], [40, 0.45], [20, 0.15], [0, 0]] },

  // B — Emploi des jeunes & AGEFOP (4 pts)
  { code: "I-02", libelle: "Accueil apprentis AGEFOP", dimension: "DIM4", composante: "B", scoreMax: 2.0, type: "binaire", importance: "critique",
    bareme: { "contrats_agefop": 2.0, "stages_longue_duree": 0.8, "non": 0 } },
  { code: "I-03", libelle: "Utilisation FDFP pour formation continue", dimension: "DIM4", composante: "B", scoreMax: 1.0, type: "binaire", importance: "important",
    bareme: { "plan_annuel_fdfp": 1.0, "ponctuel": 0.4, "non": 0 } },
  { code: "I-09", libelle: "Taux transformation apprentissage → CDI/CDD", dimension: "DIM4", composante: "B", scoreMax: 1.0, type: "indicateur_seuil", importance: "important",
    seuils: [[50, 1.0], [25, 0.5], [0, 0]] },

  // C — QVT & Sécurité (3 pts)
  { code: "I-05", libelle: "Évaluation risques professionnels documentée", dimension: "DIM4", composante: "C", scoreMax: 1.5, type: "binaire", importance: "critique",
    bareme: { "documentee_annuelle": 1.5, "en_cours": 0.5, "non": 0 } },
  { code: "I-06", libelle: "Actions prévention stress / RPS", dimension: "DIM4", composante: "C", scoreMax: 1.0, type: "actions_multiples", importance: "important",
    ptsByAction: 0.33, maxActions: 3 },
  { code: "I-07", libelle: "Taux absentéisme (plus bas = mieux)", dimension: "DIM4", composante: "C", scoreMax: 0.5, type: "indicateur_seuil_inverse", importance: "standard",
    seuils: [[3, 0.5], [6, 0.2], [Infinity, 0]] },
];

// Totaux attendus par dimension
export const TOTAUX_DIMENSIONS = {
  DIM1: 38,
  DIM2: 26,
  DIM3: 25,
  DIM4: 11,
} as const;

// Index par code pour accès O(1)
export const BAREME_INDEX = new Map<string, ItemBareme>(
  BAREME.map(item => [item.code, item])
);

// ─── MOTEUR DE SCORING ────────────────────────────────────────

/**
 * Calcule le score d'un item selon son type et la valeur fournie
 * @param item - L'item du barème
 * @param valeur - La valeur brute de la réponse (clé du barème ou nombre)
 * @param nbActions - Pour les actions multiples : nombre d'actions cochées
 */
export function calculerScoreItem(
  item: ItemBareme,
  valeur: string | number,
  nbActions?: number
): number {
  if (item.type === "indicateur_informatif") return 0;
  if (item.scoreMax === 0) return 0;

  switch (item.type) {
    case "binaire": {
      if (!item.bareme) return 0;
      const score = item.bareme[String(valeur)] ?? 0;
      return Math.min(score, item.scoreMax);
    }

    case "actions_multiples": {
      if (!item.ptsByAction || !item.maxActions) return 0;
      const n = Math.min(nbActions ?? 0, item.maxActions);
      return Math.min(n * item.ptsByAction, item.scoreMax);
    }

    case "indicateur_seuil": {
      if (!item.seuils) return 0;
      const val = Number(valeur);
      // Seuils triés décroissants : on prend le premier seuil ≤ val
      for (const [seuil, points] of item.seuils) {
        if (val >= seuil) return points;
      }
      return 0;
    }

    case "indicateur_seuil_inverse": {
      if (!item.seuils) return 0;
      const val = Number(valeur);
      // Seuils triés croissants : on prend le premier seuil ≥ val
      for (const [seuil, points] of item.seuils) {
        if (val <= seuil) return points;
      }
      return 0;
    }

    default:
      return 0;
  }
}

/**
 * Calcule le score complet à partir d'un tableau de réponses
 */
export interface ReponseInput {
  itemCode: string;
  valeur: string | number;
  nbActions?: number;
}

export interface ResultatScore {
  scoreGlobal: number;
  niveauMmi: number;
  scoreDim1Genre: number;
  scoreDim2Handicap: number;
  scoreDim3Multicult: number;
  scoreDim4Intergen: number;
  scoresComposantes: Record<string, number>;
  scoresItems: Record<string, { obtenu: number; max: number; pct: number }>;
  planActions: PlanAction[];
}

export interface PlanAction {
  itemCode: string;
  libelle: string;
  dimension: string;
  composante: string;
  scoreObtenu: number;
  scoreMax: number;
  gainPotentiel: number;
  importance: string;
  priorite: 0 | 1 | 2;
}

export function calculerScoreComplet(reponses: ReponseInput[]): ResultatScore {
  const scoresItems: Record<string, { obtenu: number; max: number; pct: number }> = {};
  const scoresDim = { DIM1: 0, DIM2: 0, DIM3: 0, DIM4: 0 };
  const scoresComposantes: Record<string, number> = {};

  for (const reponse of reponses) {
    const item = BAREME_INDEX.get(reponse.itemCode);
    if (!item || item.type === "indicateur_informatif") continue;

    const score = calculerScoreItem(item, reponse.valeur, reponse.nbActions);
    scoresItems[item.code] = {
      obtenu: score,
      max: item.scoreMax,
      pct: item.scoreMax > 0 ? Math.round((score / item.scoreMax) * 100) : 0,
    };

    scoresDim[item.dimension] += score;

    const compKey = `${item.dimension}-${item.composante}`;
    scoresComposantes[compKey] = (scoresComposantes[compKey] ?? 0) + score;
  }

  const scoreGlobal = Math.min(
    scoresDim.DIM1 + scoresDim.DIM2 + scoresDim.DIM3 + scoresDim.DIM4,
    100
  );

  // Niveau MMI-CI
  const niveauMmi =
    scoreGlobal >= 81 ? 5 :
    scoreGlobal >= 61 ? 4 :
    scoreGlobal >= 41 ? 3 :
    scoreGlobal >= 21 ? 2 : 1;

  // Plan d'actions — classement par gain potentiel
  const planActions: PlanAction[] = BAREME
    .filter(item => item.type !== "indicateur_informatif" && item.scoreMax > 0)
    .map(item => {
      const result = scoresItems[item.code];
      const obtenu = result?.obtenu ?? 0;
      const gainPotentiel = item.scoreMax - obtenu;
      return {
        itemCode: item.code,
        libelle: item.libelle,
        dimension: item.dimension,
        composante: item.composante,
        scoreObtenu: obtenu,
        scoreMax: item.scoreMax,
        gainPotentiel,
        importance: item.importance,
        priorite: (item.importance === "critique" ? 0 :
                   item.importance === "important" ? 1 : 2) as 0 | 1 | 2,
      };
    })
    .filter(a => a.gainPotentiel > 0)
    .sort((a, b) => a.priorite - b.priorite || b.gainPotentiel - a.gainPotentiel)
    .slice(0, 10);

  return {
    scoreGlobal: Math.round(scoreGlobal * 10) / 10,
    niveauMmi,
    scoreDim1Genre: Math.round(scoresDim.DIM1 * 10) / 10,
    scoreDim2Handicap: Math.round(scoresDim.DIM2 * 10) / 10,
    scoreDim3Multicult: Math.round(scoresDim.DIM3 * 10) / 10,
    scoreDim4Intergen: Math.round(scoresDim.DIM4 * 10) / 10,
    scoresComposantes,
    scoresItems,
    planActions,
  };
}

// Niveaux MMI-CI
export const NIVEAUX_MMI = {
  1: { label: "Non-conforme", dioula: "Kuntigi tɛ", color: "#B71C1C", bg: "#FFEBEE", min: 0, max: 20 },
  2: { label: "Conforme", dioula: "Sariya kɔrɔ", color: "#E65100", bg: "#FFF3E0", min: 21, max: 40 },
  3: { label: "Consciente", dioula: "Haki lɔn", color: "#F57F17", bg: "#FFFDE7", min: 41, max: 60 },
  4: { label: "Engagée", dioula: "Haki kɛ", color: "#00695C", bg: "#E0F2F1", min: 61, max: 80 },
  5: { label: "Transformatrice", dioula: "Haki baara", color: "#1A237E", bg: "#E8EAF6", min: 81, max: 100 },
} as const;
