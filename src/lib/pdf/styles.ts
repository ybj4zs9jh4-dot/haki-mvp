// src/lib/pdf/styles.ts
// Styles partagés pour les rapports Haki PDF

import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  indigo:    "#1A237E",
  indLt:     "#E8EAF6",
  indMd:     "#C5CAE9",
  safran:    "#FFC107",
  teal:      "#00695C",
  teaLt:     "#E0F2F1",
  orange:    "#E65100",
  oraLt:     "#FFF3E0",
  green:     "#2E7D32",
  grnLt:     "#E8F5E9",
  red:       "#B71C1C",
  redLt:     "#FFEBEE",
  grey:      "#F5F5F5",
  greyMd:    "#E0E0E0",
  greyDk:    "#757575",
  dark:      "#212121",
  white:     "#FFFFFF",
};

export const DIM_COLORS: Record<string, string> = {
  DIM1: COLORS.indigo,
  DIM2: COLORS.teal,
  DIM3: COLORS.orange,
  DIM4: COLORS.green,
};

export const NIVEAUX_MMI: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Non-conforme",    color: COLORS.red,    bg: COLORS.redLt },
  2: { label: "Conforme",        color: COLORS.orange, bg: COLORS.oraLt },
  3: { label: "Consciente",      color: "#F57F17",     bg: "#FFFDE7"    },
  4: { label: "Engagée",         color: COLORS.teal,   bg: COLORS.teaLt },
  5: { label: "Transformatrice", color: COLORS.indigo, bg: COLORS.indLt },
};

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  // Header de page
  pageHeader: {
    backgroundColor: COLORS.indigo,
    paddingHorizontal: 30,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageHeaderLogo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.safran,
    letterSpacing: 3,
  },
  pageHeaderSub: {
    fontSize: 8,
    color: COLORS.indMd,
  },
  pageHeaderRight: {
    fontSize: 8,
    color: COLORS.indMd,
    textAlign: "right",
  },
  // Contenu principal
  content: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  // Section title
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.greyDk,
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  // Cards
  card: {
    backgroundColor: COLORS.white,
    border: 1,
    borderColor: COLORS.greyMd,
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.greyDk,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  // Score global
  scoreHero: {
    fontSize: 42,
    fontFamily: "Helvetica-Bold",
    color: COLORS.indigo,
    lineHeight: 1,
  },
  scoreDenom: {
    fontSize: 16,
    color: COLORS.greyDk,
  },
  // Badge niveau
  niveauBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  niveauBadgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  // Barre de progression
  barTrack: {
    backgroundColor: COLORS.grey,
    borderRadius: 3,
    height: 6,
    flex: 1,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  // Alerte
  alertBox: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: "flex-start",
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    marginRight: 6,
  },
  alertText: {
    fontSize: 8,
    flex: 1,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.greyMd,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.greyDk,
  },
  // Textes
  h1: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.indigo, marginBottom: 6 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.indigo, marginBottom: 4 },
  h3: { fontSize: 10, fontFamily: "Helvetica-Bold", color: COLORS.dark, marginBottom: 3 },
  body: { fontSize: 9, color: COLORS.dark, lineHeight: 1.5 },
  small: { fontSize: 8, color: COLORS.greyDk, lineHeight: 1.4 },
  row: { flexDirection: "row", alignItems: "center" },
  spacer: { marginBottom: 12 },
});
