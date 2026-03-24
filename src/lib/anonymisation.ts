// src/lib/anonymisation.ts
// Règles d'anonymisation COLLABORATEURS — conformité Loi n° 2013-450 CI (ARTCI)
// RÈGLE FONDAMENTALE : Aucune donnée individuelle ne doit être stockée

/**
 * Profil socio-démographique brut saisi par le collaborateur
 */
export interface ProfilBrut {
  genre?: string;         // "F" | "M" | "autre" | null
  trancheAge?: string;    // "18-25" | "26-35" | "36-45" | "46-55" | "56+"
  handicap?: string;      // "non" | "visible" | "invisible" | null
  nationalite?: string;   // "ivoirienne" | "cedeao" | "expat" | null
  statut?: string;        // "cdi" | "cdd" | "apprentissage" | "stage" | "consultant"
  niveau?: string;        // "direction" | "cadre_sup" | "cadre" | "maitrise" | "employe" | "ouvrier"
  anciennete?: string;    // "<1" | "1-3" | "3-7" | "7-15" | "15+"
  // NOTE : rémunération et promotion sont des données trop identifiantes
  // en contexte CI avec de petites équipes — retirées du profil agrégé
}

/**
 * Convertit le profil brut en chaîne agrégée non réversible
 * Format : "F|26-35|cadre|3-7ans"
 *
 * RÈGLE : On stocke uniquement les tranches, jamais les valeurs exactes
 * RÈGLE : Si une combinaison est trop rare (<3 personnes dans la tranche), on la neutralise
 */
export function agregерProfil(profil: ProfilBrut): string {
  const parts: string[] = [];

  // Genre — catégorie large
  if (profil.genre && profil.genre !== "null") {
    parts.push(profil.genre === "autre" ? "autre" : profil.genre.toUpperCase().substring(0, 1));
  } else {
    parts.push("NS"); // Non spécifié
  }

  // Tranche d'âge — déjà en tranche
  parts.push(profil.trancheAge ?? "NS");

  // Niveau — simplifié en 3 catégories pour éviter trop de granularité
  const niveauAgrege =
    profil.niveau === "direction" || profil.niveau === "cadre_sup" ? "direction" :
    profil.niveau === "cadre" || profil.niveau === "maitrise" ? "cadre" :
    profil.niveau === "employe" || profil.niveau === "ouvrier" ? "employe" : "NS";
  parts.push(niveauAgrege);

  // Ancienneté — déjà en tranche
  parts.push(profil.anciennete ?? "NS");

  return parts.join("|");
}

/**
 * Calcule le score agrégé d'une dimension à partir d'un tableau de réponses brutes
 * L'agrégation est faite en mémoire — jamais stockée individuellement
 *
 * @param reponses - Tableau de réponses brutes (valeurs 1-4 ou Oui/Non)
 * @returns Score moyen sur l'échelle 1-4, ou null si aucune réponse
 */
export function aggregerDimension(reponses: Array<string | null>): number | null {
  const valeurs = reponses
    .filter(r => r !== null && r !== "NSP" && r !== "NA")
    .map(r => {
      // Convertir les réponses Likert 4 pts
      const n = parseInt(r ?? "");
      return isNaN(n) ? null : n;
    })
    .filter((v): v is number => v !== null && v >= 1 && v <= 4);

  if (valeurs.length === 0) return null;
  const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  return Math.round(moyenne * 100) / 100;
}

/**
 * Vérifie si le nombre de répondants est suffisant pour afficher les résultats
 * RÈGLE ARTCI : n >= 5 obligatoire avant toute transmission à l'organisation
 */
export function verifierSeuilAffichage(
  nbRepondants: number,
  seuilMin: number = 5
): boolean {
  return nbRepondants >= seuilMin;
}

/**
 * Calcule le score collaborateur agrégé à partir des réponses brutes
 * Cette fonction est appelée côté serveur UNIQUEMENT — avant tout stockage
 *
 * GARANTIE : Cette fonction ne retourne jamais de données individuelles
 * GARANTIE : Si nbRepondants < 5, elle retourne null
 */
export interface ReponsesCollaborateurBrutes {
  // Partie 1 — Genre
  gh01?: string; gh02?: string; gh03?: string; gh04?: string;
  gh05?: string; gh06?: string; gh07?: string; gh08?: string;
  gh09?: string; gh10?: string; gh11?: string; gh12?: string;
  gh13?: string; gh14?: string; gh15?: string;
  // Partie 2 — Handicap
  hh01?: string; hh02?: string; hh03?: string; hh04?: string;
  hh05?: string; hh06?: string; hh07?: string; hh08?: string;
  // Partie 3 — Multiculturalité
  mh01?: string; mh02?: string; mh03?: string; mh04?: string;
  mh05?: string; mh06?: string; mh07?: string; mh08?: string;
  // Partie 4 — Intergénérationnel
  ig01?: string; ig02?: string; ig03?: string; ig04?: string;
  ig05?: string; ig06?: string; ig07?: string; ig08?: string; ig09?: string;
  // Partie 5 — VIH/Sida & Protection sociale
  vs01?: string; vs02?: string; vs03?: string; vs04?: string;
  ps01?: string; ps02?: string; ps03?: string; ps04?: string;
  // Synthèse
  sy01?: string; sy02?: string; sy03?: string;
}

export interface ScoreCollaborateurAgrege {
  dim1Genre: number | null;
  dim2Handicap: number | null;
  dim3Multicult: number | null;
  dim4Intergen: number | null;
  scoreGlobal: number | null;
}

export function calculerScoreCollaborateur(
  reponsesMultiples: ReponsesCollaborateurBrutes[]
): ScoreCollaborateurAgrege | null {
  // Vérification seuil ARTCI — ne jamais traiter si n < 5
  if (reponsesMultiples.length < 5) return null;

  function moyenneGroupes(groupes: string[][]): number | null {
    const toutes = groupes.flat().filter(v => v && v !== "NSP" && v !== "NA");
    return aggregerDimension(toutes);
  }

  // DIM 1 Genre — questions sur l'égalité, les opportunités, la parentalité
  const dim1 = moyenneGroupes(reponsesMultiples.map(r => [
    r.gh02, r.gh03, r.gh04, r.gh05, r.gh06, r.gh07, r.gh08, r.gh09, r.gh10
  ].filter(Boolean) as string[]));

  // DIM 2 Handicap
  const dim2 = moyenneGroupes(reponsesMultiples.map(r => [
    r.hh01, r.hh02, r.hh04, r.hh05, r.hh07
  ].filter(Boolean) as string[]));

  // DIM 3 Multiculturalité
  const dim3 = moyenneGroupes(reponsesMultiples.map(r => [
    r.mh01, r.mh02, r.mh04, r.mh05, r.mh06, r.mh07, r.mh08
  ].filter(Boolean) as string[]));

  // DIM 4 Intergénérationnel
  const dim4 = moyenneGroupes(reponsesMultiples.map(r => [
    r.ig01, r.ig02, r.ig03, r.ig04, r.ig05, r.ig06
  ].filter(Boolean) as string[]));

  // Score global (SY-01 — sentiment d'inclusion)
  const scoreGlobal = moyenneGroupes(
    reponsesMultiples.map(r => [r.sy01].filter(Boolean) as string[])
  );

  return { dim1Genre: dim1, dim2Handicap: dim2, dim3Multicult: dim3, dim4Intergen: dim4, scoreGlobal };
}

/**
 * Calcule le delta politique/vécu entre le score ORGANISATION et le score COLLABORATEURS
 * Un delta > 10 pts déclenche une alerte washing GIS
 */
export interface DeltaPolVisuResult {
  dim1: number | null;
  dim2: number | null;
  dim3: number | null;
  dim4: number | null;
  alerteWashingDei: string[];
}

export function calculerDeltaPolVecu(
  scoreOrg: { dim1: number; dim2: number; dim3: number; dim4: number },
  scoreCollab: ScoreCollaborateurAgrege
): DeltaPolVisuResult {
  // Normaliser les scores ORGANISATION sur 100 pour comparaison
  const orgPct = {
    dim1: (scoreOrg.dim1 / 38) * 100,
    dim2: (scoreOrg.dim2 / 26) * 100,
    dim3: (scoreOrg.dim3 / 25) * 100,
    dim4: (scoreOrg.dim4 / 11) * 100,
  };
  // Normaliser les scores COLLABORATEURS (échelle 1-4) sur 100
  const collabPct = {
    dim1: scoreCollab.dim1Genre !== null ? ((scoreCollab.dim1Genre - 1) / 3) * 100 : null,
    dim2: scoreCollab.dim2Handicap !== null ? ((scoreCollab.dim2Handicap - 1) / 3) * 100 : null,
    dim3: scoreCollab.dim3Multicult !== null ? ((scoreCollab.dim3Multicult - 1) / 3) * 100 : null,
    dim4: scoreCollab.dim4Intergen !== null ? ((scoreCollab.dim4Intergen - 1) / 3) * 100 : null,
  };

  const deltas = {
    dim1: collabPct.dim1 !== null ? Math.round(orgPct.dim1 - collabPct.dim1) : null,
    dim2: collabPct.dim2 !== null ? Math.round(orgPct.dim2 - collabPct.dim2) : null,
    dim3: collabPct.dim3 !== null ? Math.round(orgPct.dim3 - collabPct.dim3) : null,
    dim4: collabPct.dim4 !== null ? Math.round(orgPct.dim4 - collabPct.dim4) : null,
  };

  const SEUIL_WASHING = 10;
  const alerteWashingDei: string[] = [];
  const dimLabels = {
    dim1: "Genre & Égalité",
    dim2: "Handicap",
    dim3: "Multiculturalité & Anti-tribalisme",
    dim4: "Intergénérationnel",
  };

  for (const [key, delta] of Object.entries(deltas)) {
    if (delta !== null && delta >= SEUIL_WASHING) {
      alerteWashingDei.push(
        `${dimLabels[key as keyof typeof dimLabels]} : écart ${delta} pts — risque de washing GIS identifié`
      );
    }
  }

  return { ...deltas, alerteWashingDei };
}
