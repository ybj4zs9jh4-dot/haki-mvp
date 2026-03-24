// src/lib/pdf/RapportExecutif.tsx
// Rapport PDF Format Exécutif — 6 pages
// Haki · Plateforme GIS Côte d'Ivoire

import React from "react";
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";
import { COLORS, NIVEAUX_MMI, DIM_COLORS, styles } from "./styles";

// ─── Types ────────────────────────────────────────────────────
export interface DonnéesRapport {
  organisation: { nom: string; secteur: string; ville: string; annee: string; ref: string };
  score: {
    scoreGlobal: number; niveauMmi: number;
    scoreDim1Genre: number; scoreDim2Handicap: number;
    scoreDim3Multicult: number; scoreDim4Intergen: number;
    scoresComposantes?: Record<string, number>;
  };
  socle: {
    badgeGlobal: string;
    alertes: Array<{ composante: string; niveau: string; message: string; remediation: string; articleLegal: string }>;
  };
  planActions: Array<{
    itemCode: string; libelle: string; dimension: string;
    scoreObtenu: number; scoreMax: number; gainPotentiel: number;
    importance: string; priorite: number;
  }>;
  benchmark?: {
    scoreMoyen: number; scoreP25: number; scoreP75: number;
    nbEntreprises: number; secteur: string;
  };
  format: "executif" | "analytique";
  dateGeneration: string;
}

// ─── Helpers ──────────────────────────────────────────────────
function pct(score: number, max: number) {
  return Math.round((score / max) * 100);
}

function interpretationNiveau(niveau: number, orgNom: string, scoreGlobal: number): string {
  switch (niveau) {
    case 1: return `${orgNom} n'a pas encore de politique GIS formalisée. Un plan de mise en conformité d'urgence est recommandé.`;
    case 2: return `${orgNom} respecte les obligations GIS minimales. Les bases sont posées pour construire une politique structurée.`;
    case 3: return `${orgNom} dispose d'une politique GIS écrite et collecte ses premiers indicateurs. La systématisation des pratiques est la prochaine étape.`;
    case 4: return `${orgNom} a intégré la GIS dans ses processus RH clés. L'organisation est à ${75 - scoreGlobal > 0 ? 75 - scoreGlobal : 0} pts du Label Haki GIS.`;
    case 5: return `${orgNom} est une référence sectorielle CI en matière de GIS. Elle contribue aux benchmarks Haki et est éligible au Label Haki GIS.`;
    default: return "";
  }
}

const DIMS = [
  { key: "scoreDim1Genre",    label: "Genre & Égalité + VIH/Sida",        max: 38, color: COLORS.indigo, dim: "DIM1" },
  { key: "scoreDim2Handicap", label: "Handicap + Médecine du travail",     max: 26, color: COLORS.teal,   dim: "DIM2" },
  { key: "scoreDim3Multicult",label: "Multiculturalité & Anti-tribalisme", max: 25, color: COLORS.orange, dim: "DIM3" },
  { key: "scoreDim4Intergen", label: "Intergénérationnel + QVT",           max: 11, color: COLORS.green,  dim: "DIM4" },
];

const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  conforme:     { label: "Conforme",               color: COLORS.green,  bg: COLORS.grnLt, icon: "✓" },
  en_cours:     { label: "En cours de conformité", color: COLORS.orange, bg: COLORS.oraLt, icon: "⏳" },
  non_conforme: { label: "Non conforme",            color: COLORS.red,    bg: COLORS.redLt, icon: "!" },
};

// ─── Composants ───────────────────────────────────────────────

function PageHeader({ orgNom, pageLabel, ref }: { orgNom: string; pageLabel: string; ref: string }) {
  return (
    <View style={styles.pageHeader}>
      <View>
        <Text style={styles.pageHeaderLogo}>HAKI</Text>
        <Text style={styles.pageHeaderSub}>Plateforme GIS · Côte d'Ivoire</Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 9, color: COLORS.indMd, fontFamily: "Helvetica-Bold" }}>{orgNom}</Text>
        <Text style={styles.pageHeaderSub}>{pageLabel}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.pageHeaderRight}>Réf. {ref}</Text>
      </View>
    </View>
  );
}

function PageFooter({ page, total, date }: { page: number; total: number; date: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>HAKI · contact@haki.ci · www.haki.ci · Abidjan, CI</Text>
      <Text style={styles.footerText}>Généré le {date} · Confidentiel</Text>
      <Text style={styles.footerText}>Page {page}/{total}</Text>
    </View>
  );
}

function BarreProgression({ score, max, color }: { score: number; max: number; color: string }) {
  const p = pct(score, max);
  return (
    <View style={[styles.barTrack, { marginVertical: 3 }]}>
      <View style={[styles.barFill, { width: `${p}%`, backgroundColor: color }]} />
    </View>
  );
}

// ─── PAGE 1 : COUVERTURE ──────────────────────────────────────
function PageCouverture({ data }: { data: DonnéesRapport }) {
  return (
    <Page size="A4" style={{ fontFamily: "Helvetica", backgroundColor: COLORS.white }}>
      {/* Fond indigo haut */}
      <View style={{ backgroundColor: COLORS.indigo, paddingHorizontal: 40, paddingTop: 60, paddingBottom: 50 }}>
        <Text style={{ fontSize: 36, fontFamily: "Helvetica-Bold", color: COLORS.safran, letterSpacing: 6, marginBottom: 6 }}>HAKI</Text>
        <Text style={{ fontSize: 11, color: COLORS.indMd, marginBottom: 40 }}>Plateforme GIS · Côte d'Ivoire</Text>
        <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: COLORS.white, marginBottom: 6 }}>{data.organisation.nom}</Text>
        <Text style={{ fontSize: 11, color: COLORS.indMd, marginBottom: 30 }}>
          Rapport de maturité GIS · {data.organisation.annee} · Réf. {data.organisation.ref}
        </Text>
        {/* Chips */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ backgroundColor: "#1565C0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
            <Text style={{ fontSize: 9, color: "#90CAF9" }}>{data.organisation.secteur}</Text>
          </View>
          <View style={{ backgroundColor: "#1565C0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
            <Text style={{ fontSize: 9, color: "#90CAF9" }}>{data.organisation.annee}</Text>
          </View>
          <View style={{ backgroundColor: COLORS.safran, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
            <Text style={{ fontSize: 9, color: COLORS.indigo, fontFamily: "Helvetica-Bold" }}>
              {data.format === "executif" ? "Format Exécutif" : "Format Analytique"}
            </Text>
          </View>
        </View>
      </View>
      {/* Contenu bas */}
      <View style={{ paddingHorizontal: 40, paddingTop: 30 }}>
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}>
          {/* Score aperçu */}
          <View style={{ flex: 1, backgroundColor: COLORS.indLt, padding: 16, borderRadius: 8 }}>
            <Text style={{ fontSize: 8, color: COLORS.greyDk, marginBottom: 6 }}>SCORE MMI-CI GLOBAL</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={styles.scoreHero}>{data.score.scoreGlobal}</Text>
              <Text style={{ fontSize: 14, color: COLORS.greyDk }}>/100</Text>
            </View>
            <View style={[styles.niveauBadge, { backgroundColor: NIVEAUX_MMI[data.score.niveauMmi]?.bg }]}>
              <Text style={[styles.niveauBadgeText, { color: NIVEAUX_MMI[data.score.niveauMmi]?.color }]}>
                Niveau {data.score.niveauMmi} — {NIVEAUX_MMI[data.score.niveauMmi]?.label}
              </Text>
            </View>
          </View>
          {/* Badge SOCLE aperçu */}
          <View style={{ flex: 1, backgroundColor: BADGE_CONFIG[data.socle.badgeGlobal]?.bg ?? COLORS.grey, padding: 16, borderRadius: 8 }}>
            <Text style={{ fontSize: 8, color: COLORS.greyDk, marginBottom: 6 }}>BADGE SOCLE</Text>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: BADGE_CONFIG[data.socle.badgeGlobal]?.color }}>
              {BADGE_CONFIG[data.socle.badgeGlobal]?.icon}  {BADGE_CONFIG[data.socle.badgeGlobal]?.label}
            </Text>
            <Text style={{ fontSize: 8, color: COLORS.greyDk, marginTop: 6 }}>
              {data.socle.alertes.filter(a => a.niveau === "rouge").length} alerte(s) rouge ·{" "}
              {data.socle.alertes.filter(a => a.niveau === "orange").length} alerte(s) orange
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 8, color: COLORS.greyDk, lineHeight: 1.5 }}>
          Document confidentiel — Usage interne et communication externe autorisée avec accord de l'organisation.
          Généré automatiquement par la plateforme Haki · contact@haki.ci · www.haki.ci · Abidjan, Côte d'Ivoire
        </Text>
      </View>
      <PageFooter page={1} total={data.format === "executif" ? 6 : 14} date={data.dateGeneration} />
    </Page>
  );
}

// ─── PAGE 2 : SCORE + SOCLE ───────────────────────────────────
function PageScoreSocle({ data }: { data: DonnéesRapport }) {
  const niveau = NIVEAUX_MMI[data.score.niveauMmi];
  const badge = BADGE_CONFIG[data.socle.badgeGlobal];
  const total = data.format === "executif" ? 6 : 14;
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader orgNom={data.organisation.nom} pageLabel="Synthèse exécutive" ref={data.organisation.ref} />
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>SYNTHÈSE EXÉCUTIVE</Text>
        <View style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}>
          {/* Score MMI-CI */}
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Score MMI-CI Global</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <Text style={styles.scoreHero}>{data.score.scoreGlobal}</Text>
              <Text style={styles.scoreDenom}>/100</Text>
            </View>
            <View style={[styles.niveauBadge, { backgroundColor: niveau?.bg }]}>
              <Text style={[styles.niveauBadgeText, { color: niveau?.color }]}>
                Niveau {data.score.niveauMmi} — {niveau?.label}
              </Text>
            </View>
            <Text style={[styles.body, { marginTop: 10, lineHeight: 1.6 }]}>
              {interpretationNiveau(data.score.niveauMmi, data.organisation.nom, data.score.scoreGlobal)}
            </Text>
          </View>
          {/* Badge SOCLE */}
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Badge SOCLE — Conformité Légale CI</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: badge?.color }}>
                {badge?.icon}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: badge?.color }}>
                {badge?.label}
              </Text>
            </View>
            {data.socle.alertes.slice(0, 3).map((a, i) => (
              <View key={i} style={[styles.alertBox, { backgroundColor: a.niveau === "rouge" ? COLORS.redLt : COLORS.oraLt }]}>
                <View style={[styles.alertDot, { backgroundColor: a.niveau === "rouge" ? COLORS.red : COLORS.orange }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertText, { fontFamily: "Helvetica-Bold", color: a.niveau === "rouge" ? COLORS.red : COLORS.orange }]}>
                    {a.composante}
                  </Text>
                  <Text style={[styles.alertText, { color: COLORS.dark }]}>{a.message}</Text>
                </View>
              </View>
            ))}
            {data.format === "analytique" && (
              <Text style={styles.small}>Plan de remédiation complet en page 15</Text>
            )}
          </View>
        </View>
        {/* Aperçu dimensions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aperçu par dimension</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {DIMS.map(dim => {
              const s = (data.score as any)[dim.key] ?? 0;
              const p = pct(s, dim.max);
              return (
                <View key={dim.key} style={{ flex: 1 }}>
                  <Text style={[styles.small, { color: dim.color, fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>{dim.dim}</Text>
                  <Text style={[styles.small, { marginBottom: 4 }]}>{dim.label}</Text>
                  <BarreProgression score={s} max={dim.max} color={dim.color} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
                    <Text style={[styles.small, { color: dim.color, fontFamily: "Helvetica-Bold" }]}>{s}/{dim.max}</Text>
                    <Text style={[styles.small, { color: dim.color }]}>{p}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      <PageFooter page={2} total={total} date={data.dateGeneration} />
    </Page>
  );
}

// ─── PAGE 3 : SCORES PAR DIMENSION ───────────────────────────
function PageDimensions({ data }: { data: DonnéesRapport }) {
  const total = data.format === "executif" ? 6 : 14;
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader orgNom={data.organisation.nom} pageLabel="Scores par dimension" ref={data.organisation.ref} />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>SCORES PAR DIMENSION MMI-CI</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {DIMS.map(dim => {
            const s = (data.score as any)[dim.key] ?? 0;
            const p = pct(s, dim.max);
            const dimBench = data.benchmark;
            return (
              <View key={dim.key} style={[styles.card, { width: "47%" }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={[styles.h3, { color: dim.color, fontSize: 9 }]}>{dim.dim} — {dim.label}</Text>
                </View>
                <Text style={{ fontSize: 7, color: COLORS.greyDk, marginBottom: 8 }}>
                  {dim.dim === "DIM1" ? "Art. 4, 11, 33, 41 CT CI · CEDEF · ODD 5" :
                   dim.dim === "DIM2" ? "Art. 12.1-12.3 CT CI · Quota PSH · CNPS" :
                   dim.dim === "DIM3" ? "Art. 4 CT CI · Constitution Art. 5 · Code pénal CI" :
                   "Art. 41 & 63 CT CI · AGEFOP · FDFP · ODD 8"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                  <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: dim.color }}>{s}</Text>
                  <Text style={{ fontSize: 10, color: COLORS.greyDk }}>/ {dim.max} pts</Text>
                </View>
                <BarreProgression score={s} max={dim.max} color={dim.color} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={[styles.small, { color: dim.color, fontFamily: "Helvetica-Bold" }]}>{p}%</Text>
                  {dimBench && (
                    <Text style={styles.small}>
                      Benchmark {data.organisation.secteur} CI : {dimBench.scoreMoyen}%
                      {p > dimBench.scoreMoyen ? ` · +${p - dimBench.scoreMoyen} pts` : ` · ${p - dimBench.scoreMoyen} pts`}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <PageFooter page={3} total={total} date={data.dateGeneration} />
    </Page>
  );
}

// ─── PAGE 4 : PLAN D'ACTIONS ──────────────────────────────────
function PagePlanActions({ data }: { data: DonnéesRapport }) {
  const total = data.format === "executif" ? 6 : 14;
  const top5 = data.planActions.slice(0, 5);
  const gainTotal = top5.reduce((s, a) => s + a.gainPotentiel, 0);
  const scoreApres = Math.min(100, data.score.scoreGlobal + gainTotal);
  const niveauApres = scoreApres >= 81 ? 5 : scoreApres >= 61 ? 4 : scoreApres >= 41 ? 3 : scoreApres >= 21 ? 2 : 1;

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader orgNom={data.organisation.nom} pageLabel="Plan d'actions prioritaires" ref={data.organisation.ref} />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>PLAN D'ACTIONS PRIORITAIRES — TOP 5</Text>
        <Text style={[styles.small, { marginBottom: 12 }]}>
          Actions classées par impact MMI-CI potentiel · Générées automatiquement à partir des gaps identifiés
        </Text>
        {top5.map((action, i) => {
          const prioColor = action.priorite === 0 ? COLORS.red : action.priorite === 1 ? COLORS.orange : COLORS.indigo;
          const prioBg = action.priorite === 0 ? COLORS.redLt : action.priorite === 1 ? COLORS.oraLt : COLORS.indLt;
          const prioLabel = action.priorite === 0 ? "Urgent — obligation légale" : action.priorite === 1 ? "Priorité haute" : "Important";
          const dimColor = DIM_COLORS[action.dimension] ?? COLORS.indigo;
          return (
            <View key={i} style={[styles.card, { marginBottom: 8, flexDirection: "row", gap: 10 }]}>
              <View style={{ width: 28, alignItems: "center", justifyContent: "flex-start", paddingTop: 2 }}>
                <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: COLORS.greyDk }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.h3, { marginBottom: 3 }]}>{action.libelle}</Text>
                <Text style={[styles.small, { marginBottom: 5 }]}>
                  {action.dimension} · {action.itemCode} · Gain potentiel : +{action.gainPotentiel.toFixed(1)} pts MMI-CI
                </Text>
                <View style={[styles.niveauBadge, { backgroundColor: prioBg, marginTop: 0 }]}>
                  <Text style={[styles.niveauBadgeText, { color: prioColor, fontSize: 8 }]}>{prioLabel}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: dimColor }}>
                  +{action.gainPotentiel.toFixed(1)}
                </Text>
                <Text style={[styles.small, { color: dimColor }]}>pts</Text>
              </View>
            </View>
          );
        })}
        {/* Résumé potentiel */}
        <View style={{ backgroundColor: COLORS.indLt, padding: 12, borderRadius: 6, marginTop: 4 }}>
          <Text style={[styles.body, { color: COLORS.indigo }]}>
            Potentiel si toutes ces actions sont menées : +{gainTotal.toFixed(1)} pts MMI-CI → Score {scoreApres.toFixed(1)}/100
            — Niveau {niveauApres} ({NIVEAUX_MMI[niveauApres]?.label})
          </Text>
        </View>
      </View>
      <PageFooter page={4} total={total} date={data.dateGeneration} />
    </Page>
  );
}

// ─── PAGE 5 : BENCHMARKS ─────────────────────────────────────
function PageBenchmarks({ data }: { data: DonnéesRapport }) {
  const total = data.format === "executif" ? 6 : 14;
  const bench = data.benchmark;
  const scoreGlobalPct = data.score.scoreGlobal;

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader orgNom={data.organisation.nom} pageLabel="Positionnement sectoriel CI" ref={data.organisation.ref} />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>POSITIONNEMENT SECTORIEL CI — {data.organisation.secteur.toUpperCase()}</Text>
        {bench ? (
          <>
            <Text style={[styles.small, { marginBottom: 14 }]}>
              n = {bench.nbEntreprises} organisations · Données {data.organisation.annee} · Secteur {data.organisation.secteur}
            </Text>
            {/* Score global */}
            <View style={[styles.card, { marginBottom: 14 }]}>
              <Text style={styles.cardTitle}>Score global MMI-CI</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Text style={[styles.h2, { color: COLORS.indigo, minWidth: 60 }]}>{scoreGlobalPct}/100</Text>
                <View style={{ flex: 1 }}>
                  {/* Barre benchmark */}
                  <View style={{ position: "relative", height: 14, backgroundColor: COLORS.greyMd, borderRadius: 4, overflow: "hidden" }}>
                    {/* Zone P25-P75 */}
                    <View style={{ position: "absolute", left: `${bench.scoreP25}%`, width: `${bench.scoreP75 - bench.scoreP25}%`, height: "100%", backgroundColor: COLORS.indMd }} />
                    {/* Barre score */}
                    <View style={{ position: "absolute", left: 0, width: `${scoreGlobalPct}%`, height: "100%", backgroundColor: COLORS.indigo, borderRadius: 4 }} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
                    <Text style={styles.small}>0</Text>
                    <Text style={styles.small}>Médiane : {bench.scoreMoyen}</Text>
                    <Text style={styles.small}>100</Text>
                  </View>
                </View>
                <Text style={[styles.small, { color: scoreGlobalPct >= bench.scoreMoyen ? COLORS.green : COLORS.orange }]}>
                  {scoreGlobalPct >= bench.scoreMoyen ? "+" : ""}{scoreGlobalPct - bench.scoreMoyen} vs médiane
                </Text>
              </View>
            </View>
            {/* Par dimension */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Par dimension</Text>
              {DIMS.map(dim => {
                const s = (data.score as any)[dim.key] ?? 0;
                const p = pct(s, dim.max);
                return (
                  <View key={dim.key} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                      <Text style={[styles.small, { color: dim.color, fontFamily: "Helvetica-Bold" }]}>{dim.label}</Text>
                      <Text style={[styles.small, { color: dim.color, fontFamily: "Helvetica-Bold" }]}>{p}%</Text>
                    </View>
                    <View style={{ height: 10, backgroundColor: COLORS.greyMd, borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ position: "absolute", left: `${bench.scoreP25}%`, width: `${bench.scoreP75 - bench.scoreP25}%`, height: "100%", backgroundColor: COLORS.greyMd }} />
                      <View style={{ width: `${p}%`, height: "100%", backgroundColor: dim.color, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.small, { marginTop: 8 }]}>
              Zone grisée = intervalle P25–P75 sectoriel CI · Données publiées si n ≥ 10 organisations
            </Text>
          </>
        ) : (
          <View style={[styles.card, { alignItems: "center", paddingVertical: 30 }]}>
            <Text style={[styles.body, { color: COLORS.greyDk, textAlign: "center" }]}>
              Données sectorielles CI non disponibles pour votre secteur cette année.{"\n"}
              Résultats disponibles à partir de 10 organisations diagnostiquées.
            </Text>
          </View>
        )}
      </View>
      <PageFooter page={5} total={total} date={data.dateGeneration} />
    </Page>
  );
}

// ─── PAGE 6 : LABEL + PIED ────────────────────────────────────
function PageLabel({ data }: { data: DonnéesRapport }) {
  const total = data.format === "executif" ? 6 : 14;
  const eligible = data.score.scoreGlobal >= 75 && data.socle.badgeGlobal === "conforme";
  const manque = Math.max(0, 75 - data.score.scoreGlobal);

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader orgNom={data.organisation.nom} pageLabel="Label Haki GIS" ref={data.organisation.ref} />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>ÉLIGIBILITÉ LABEL HAKI GIS</Text>
        <View style={[styles.card, { backgroundColor: eligible ? COLORS.grnLt : COLORS.indLt, marginBottom: 14 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {/* Badge circulaire */}
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.indigo, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.safran, textAlign: "center" }}>HAKI{"\n"}GIS{"\n"}CI</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.h2, { color: eligible ? COLORS.green : COLORS.indigo }]}>
                {eligible ? "✓ Éligible au Label Haki GIS" : "Pas encore éligible"}
              </Text>
              <Text style={[styles.body, { marginTop: 4 }]}>
                {eligible
                  ? `Score ${data.score.scoreGlobal}/100 ≥ 75 · Badge SOCLE Conforme · Félicitations !`
                  : `Score requis : 75/100 · Score actuel : ${data.score.scoreGlobal}/100 · Manque : ${manque.toFixed(1)} pts`
                }
              </Text>
              {!eligible && (
                <Text style={[styles.small, { marginTop: 4 }]}>
                  Les actions prioritaires 2, 3 et 4 de ce plan permettent d'atteindre l'éligibilité
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* Méthodologie */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Méthodologie MMI-CI</Text>
          <Text style={[styles.body, { marginBottom: 6 }]}>
            Le Score MMI-CI (Maturity Index for Inclusion CI) est calculé sur 100 points répartis en 4 dimensions GIS
            ancrées dans le Code du Travail CI 2025, la Constitution CI et les conventions internationales ratifiées.
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {DIMS.map(dim => (
              <View key={dim.key} style={{ backgroundColor: COLORS.grey, padding: 6, borderRadius: 4, marginBottom: 4 }}>
                <Text style={[styles.small, { color: dim.color, fontFamily: "Helvetica-Bold" }]}>
                  {dim.dim} · {dim.max} pts · {dim.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {/* Contact */}
        <View style={[styles.card, { backgroundColor: COLORS.indigo }]}>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: COLORS.safran, marginBottom: 6, textAlign: "center" }}>
            HAKI · Plateforme GIS Côte d'Ivoire
          </Text>
          <Text style={{ fontSize: 8, color: COLORS.indMd, textAlign: "center" }}>
            contact@haki.ci · www.haki.ci · Abidjan, Côte d'Ivoire
          </Text>
        </View>
      </View>
      <PageFooter page={6} total={total} date={data.dateGeneration} />
    </Page>
  );
}

// ─── DOCUMENT EXÉCUTIF COMPLET ────────────────────────────────
export function RapportExecutif({ data }: { data: DonnéesRapport }) {
  return (
    <Document title={`Rapport Haki GIS — ${data.organisation.nom} — ${data.organisation.annee}`} author="Haki CI">
      <PageCouverture data={data} />
      <PageScoreSocle data={data} />
      <PageDimensions data={data} />
      <PagePlanActions data={data} />
      <PageBenchmarks data={data} />
      <PageLabel data={data} />
    </Document>
  );
}
