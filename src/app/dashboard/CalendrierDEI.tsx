"use client";
import { useState } from "react";

const EVENTS = [
  {
    date: "6 février", mois: 2, emoji: "✂️", color: "#AD1457", bg: "#FCE4EC",
    titre: "Tolérance zéro MGF",
    activite: "Campagne contre les Mutilations Génitales Féminines · Information droits des femmes CI",
    comm: "Affichage · Email RH · Partenariat ONU Femmes CI",
    legal: "Art. 4 CT CI — non-discrimination",
    projetSocial: null, budget: null, flagship: false,
  },
  {
    date: "20 février", mois: 2, emoji: "⚖️", color: "#1565C0", bg: "#E3F2FD",
    titre: "Journée mondiale de la Justice Sociale",
    activite: "Bilan équité salariale et accès aux postes · Communication engagement DEI",
    comm: "Tribune DG · LinkedIn · Newsletter RH CI",
    legal: "ODD 10 — Inégalités réduites",
    projetSocial: "Publication du rapport équité interne de l'organisation",
    budget: "Très faible — fort impact institutionnel", flagship: false,
  },
  {
    date: "8 mars", mois: 3, emoji: "♀️", color: "#E57373", bg: "#FFEBEE",
    titre: "Journée Internationale des Femmes",
    activite: "Analyse écarts salariaux F/H · Conférence Femmes Leaders CI",
    comm: "Tribune DG · LinkedIn · Newsletter RH",
    legal: "Art. 23 CT CI — égalité de traitement",
    projetSocial: "Journée Femmes Leaders — conférence interne femmes cadres + engagement chiffré parité management",
    budget: "Faible — impact fort", flagship: false,
  },
  {
    date: "21 mars", mois: 3, emoji: "🤝", color: "#00838F", bg: "#E0F7FA",
    titre: "Journée contre la Discrimination Raciale",
    activite: "Atelier anti-tribalisme · Révision procédures de recrutement CI",
    comm: "Affichage · Webinaire DRH · Communiqué CGECI",
    legal: "Art. 4 CT CI — non-discrimination origine",
    projetSocial: "Audit recrutement : analyse des biais ethniques dans les CVs retenus",
    budget: "Faible — ancrage légal direct", flagship: false,
  },
  {
    date: "28 avril", mois: 4, emoji: "🦺", color: "#E65100", bg: "#FFF3E0",
    titre: "Journée mondiale Sécurité & Santé au Travail",
    activite: "Audit conditions de travail · Rapport médecine du travail CNPS · Formation sécurité",
    comm: "Rapport SST interne · Email managers · CNPS",
    legal: "Art. 41 CT CI — médecine du travail",
    projetSocial: "Journée sans accident : 0 incident reporté + formation gestes de premiers secours",
    budget: "Moyen — conformité SOCLE Haki", flagship: false,
  },
  {
    date: "1er mai", mois: 5, emoji: "✊", color: "#F9A825", bg: "#FFFDE7",
    titre: "Fête du Travail CI",
    activite: "Rapport Conformité Sociale Haki — état CNPS/CMU des entreprises CI",
    comm: "Rapport annuel Haki + presse + emailing DRH",
    legal: "Art. 18 CT CI — CNPS obligatoire",
    projetSocial: null, budget: null, flagship: false,
  },
  {
    date: "15 mai", mois: 5, emoji: "👨‍👩‍👧", color: "#2E7D32", bg: "#E8F5E9",
    titre: "Journée internationale des Familles",
    activite: "Communication congés parentaux · Politique télétravail parents · Crèche d'entreprise",
    comm: "Email collaborateurs · Intranet · Charte QVT",
    legal: "Art. 23.3 CT CI — protection maternité",
    projetSocial: "Programme Famille CI : aménagement horaires parents d'enfants malades ou PSH",
    budget: "Faible — fidélisation collaborateurs", flagship: false,
  },
  {
    date: "20 juin", mois: 6, emoji: "🌍", color: "#6A1B9A", bg: "#F3E5F5",
    titre: "Journée mondiale des Réfugiés",
    activite: "Communication sur la diversité des équipes · Programme intégration travailleurs étrangers CI",
    comm: "Témoignages collaborateurs · LinkedIn · OIM CI",
    legal: "Constitution CI Art. 4 — non-discrimination origine",
    projetSocial: "Programme Accueil Diversité : parrainage des nouveaux collaborateurs étrangers CEDEAO",
    budget: "Faible — ancrage multiculturalité CI", flagship: false,
  },
  {
    date: "15 juillet", mois: 7, emoji: "🎓", color: "#00695C", bg: "#E0F2F1",
    titre: "Journée des compétences des Jeunes",
    activite: "Lancement programme stagiaires / alternants zones défavorisées CI",
    comm: "Communication recrutement jeunes · AGEFOP · LinkedIn",
    legal: "Art. 12 CT CI — égalité accès emploi",
    projetSocial: "Programme Stagiaires Défavorisés : 10 jeunes de 3e issus d'établissements REP CI",
    budget: "Très faible — RSE mesurable", flagship: false,
  },
  {
    date: "31 juillet", mois: 7, emoji: "🌺", color: "#BF360C", bg: "#FBE9E7",
    titre: "Journée internationale de la Femme Africaine",
    activite: "Mise en avant femmes leaders CI · Communication parité cadres africaines",
    comm: "Tribune femmes cadres · LinkedIn Afrique · Presse CI",
    legal: null,
    projetSocial: "Publication de 3 portraits de femmes cadres dirigeantes de l'organisation",
    budget: "Très faible — positionnement Afrique fort", flagship: false,
  },
  {
    date: "Octobre Rose", mois: 10, emoji: "🎗️", color: "#E91E63", bg: "#FCE4EC",
    titre: "Octobre Rose — Cancer du sein",
    activite: "Sensibilisation dépistage cancer du sein · Partenariat clinique CI",
    comm: "Affichage · Email collaboratrices · CNPS",
    legal: null,
    projetSocial: null, budget: null, flagship: false,
  },
  {
    date: "Haki DEI Month", mois: 10, emoji: "🏆", color: "#1A237E", bg: "#E8EAF6",
    titre: "Haki DEI Month — Octobre",
    activite: "Challenge 30 jours + classement sectoriel CI + événement Abidjan",
    comm: "Social media · CGECI · RIGRH · Remise Label Haki DEI",
    legal: null,
    projetSocial: null, budget: null, flagship: true,
  },
  {
    date: "Novembre Bleu", mois: 11, emoji: "🔵", color: "#1565C0", bg: "#E3F2FD",
    titre: "Novembre Bleu — Cancer de la prostate",
    activite: "Sensibilisation masculine · Journée bien-être + médecin du travail CNPS",
    comm: "Affichage · Email · Médecin travail CNPS",
    legal: null,
    projetSocial: null, budget: null, flagship: false,
  },
  {
    date: "25 nov – 10 déc", mois: 11, emoji: "🟠", color: "#E65100", bg: "#FFF3E0",
    titre: "16 jours d'activisme — VBG",
    activite: "Orange the World : locaux orangés · 100% managers formés VSBG",
    comm: "Bâtiment orangé · Atelier VSBG · Communiqué",
    legal: null,
    projetSocial: "Entreprise Orange the World — locaux 25/11–10/12 + 100% managers formés anti-VSBG",
    budget: "Faible — visibilité maximale", flagship: false,
  },
  {
    date: "1er décembre", mois: 12, emoji: "🔴", color: "#C62828", bg: "#FFEBEE",
    titre: "Journée Mondiale Sida",
    activite: "Campagne Art. 4 CT CI · Test VIH confidentiel sur site",
    comm: "Affichage · Webinaire DRH · Espace Confiance",
    legal: "Art. 4 CT CI — non-discrimination PVVIH",
    projetSocial: "Journée Sida sans Stigmatisation — test VIH confidentiel + info droits Art. 4 CT CI",
    budget: "Faible — légalement requis", flagship: false,
  },
  {
    date: "3 décembre", mois: 12, emoji: "♿", color: "#00695C", bg: "#E0F2F1",
    titre: "Journée Int'l des Personnes en Situation de Handicap",
    activite: "Journée sans barrières · Bilan accessibilité publié",
    comm: "Vidéo · Communiqué · Rapport accessibilité",
    legal: "Art. 12 CT CI — accès locaux PSH",
    projetSocial: "Défi Accessibilité — audit locaux avec salariés PSH comme guides + 3 engagements",
    budget: "Moyen — conformité Art. 12 CT CI", flagship: false,
  },
  {
    date: "10 décembre", mois: 12, emoji: "🌐", color: "#4A148C", bg: "#F3E5F5",
    titre: "Journée des Droits de l'Homme",
    activite: "Bilan annuel DEI Haki — données agrégées de la plateforme",
    comm: "Rapport annuel Haki DEI CI · Presse",
    legal: null,
    projetSocial: null, budget: null, flagship: false,
  },
  {
    date: "18 décembre", mois: 12, emoji: "✈️", color: "#37474F", bg: "#ECEFF1",
    titre: "Journée Int'l des Migrants",
    activite: "Bilan politique non-discrimination multiculturelle · Rapport diversité nationalités",
    comm: "Rapport diversité CI · OIM · Presse",
    legal: "Constitution CI Art. 4 — égalité de traitement",
    projetSocial: "Rapport annuel Diversité CI : composition équipes par nationalité + engagement inclusion",
    budget: "Très faible — différenciation forte multinationales", flagship: false,
  },
];

const OSC = [
  {
    cat: "Organisations féministes & droits des femmes CI",
    orgs: "LIDF (Ligue Ivoirienne des Droits des Femmes) · Stop au Chat Noir · AFEF · REFCI · Réseau Synergie Femmes · AFJCI · ONG Bloom / Orchidées Rouges CI",
    mode: "Mécénat, bénévolat de compétences, financement hébergement survivantes VBG, bourses, plaidoyer légal féminicide",
    note: "LIDF (prés. Mégane Boho) : 300+ cas VBG/an, plaidoyer données féminicides CI. Stop au Chat Noir (fondée 2019, Bénédicte Joan) : Villa Kotonga (centre hébergement Bingerville) + app mobile VBG.",
    color: "#E57373",
  },
  {
    cat: "Hommes alliés & masculinité positive CI",
    orgs: "RHEEG-CI (Réseau des Hommes Engagés pour l'Égalité de Genre en CI) · Alliance Droits et Santé (ADS) — réseau Afrique de l'Ouest",
    mode: "Invitation panels internes, formation managers 'masculinité positive', co-animation ateliers VBG, sensibilisation communautés hommes",
    note: "RHEEG-CI fondé 2019 par Coulibaly Pélibien Ghislain, sociologue expert genre. Marraine : Euphrasie Yao (conseillère Présidence CI). Partenaire ONU Femmes CI.",
    color: "#1565C0",
  },
  {
    cat: "Associations PSH CI",
    orgs: "FIPAH · HOPE CI · AIPSH",
    mode: "Don matériel, recrutement inclusif, financement accessibilité, audit locaux avec guides PSH",
    note: null,
    color: "#00695C",
  },
  {
    cat: "Réseaux VIH/Sida & non-discrimination en milieu professionnel",
    orgs: "ONUSIDA CI · Espace Confiance · AIBEF · RIP+ (Réseau PVVIH CI) · Alliance CI · REPMASCI",
    mode: "Kits dépistage sur site, campagnes Art. 4 CT CI en entreprise, formation DRH confidentialité médicale",
    note: "Ancrage légal direct : Art. 4 CT CI — non-discrimination PVVIH. Composante SOCLE Haki.",
    color: "#C62828",
  },
  {
    cat: "Lutte contre les VBG",
    orgs: "SOS Violences CI · CAVI CI · COFERV · WANEP-CI · Centre Akwaba Mousso (Abidjan)",
    mode: "Financement campagnes Orange the World, formations VSBG managers, hébergement d'urgence",
    note: null,
    color: "#E65100",
  },
  {
    cat: "Insertion jeunesse défavorisée",
    orgs: "Fondation EDUCI · Réseau Insertion CI · AGEFOP",
    mode: "Bourses, stages, formations qualifiantes, programme stagiaires zones défavorisées",
    note: null,
    color: "#1A237E",
  },
  {
    cat: "Droits des personnes discriminées en milieu professionnel",
    orgs: "Alternative CI · CNDH CI (Commission Nationale des Droits de l'Homme)",
    mode: "Soutien via programmes santé en entreprise (VIH/IST), plaidoyer accès aux soins sans discrimination — à activer selon profil client et politique groupe",
    note: "Approche : intégration via prisme santé au travail et non-discrimination médicale (Art. 4 CT CI), sans communication externe explicite. Pertinent pour multinationales avec politiques globales D&I.",
    color: "#546E7A",
  },
  {
    cat: "Activistes DEI indépendants CI",
    orgs: "Militants droits des femmes, défenseurs PSH, journalistes équité CI (Kessiya.com, médias genre CI), blogueurs genre",
    mode: "Parrainage, invitation panels internes, prise de parole Haki DEI Month, co-production contenus sensibilisation",
    note: null,
    color: "#2E7D32",
  },
];

const MOIS_LABELS = ["","Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

export default function CalendrierDEI() {
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedOsc, setSelectedOsc] = useState<number | null>(null);
  const [tab, setTab] = useState<"calendrier" | "osc">("calendrier");

  const now = new Date();
  const moisCourant = now.getMonth() + 1;
  const prochainEvent = EVENTS.find(e => e.mois >= moisCourant) || EVENTS[0];

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: 24,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      marginBottom: 16,
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9E9E9E", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>
            Calendrier DEI & Communication
          </div>
          <div style={{ fontSize: 13, color: "#424242" }}>
            {EVENTS.length} événements annuels · {OSC.length} catégories OSC · Activités & communication suggérées
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setTab("calendrier")}
            style={{
              padding: "6px 14px",
              background: tab === "calendrier" ? "#1A237E" : "#F5F5F5",
              color: tab === "calendrier" ? "#fff" : "#424242",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>
            📅 Calendrier
          </button>
          <button
            onClick={() => setTab("osc")}
            style={{
              padding: "6px 14px",
              background: tab === "osc" ? "#1A237E" : "#F5F5F5",
              color: tab === "osc" ? "#fff" : "#424242",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>
            🤝 OSC & Partenaires
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════
          TAB CALENDRIER
      ══════════════════════════════════ */}
      {tab === "calendrier" && (
        <>
          {/* Prochain événement */}
          <div style={{
            background: prochainEvent.bg,
            borderLeft: `3px solid ${prochainEvent.color}`,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{prochainEvent.emoji}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: prochainEvent.color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
                Prochain événement
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#212121" }}>
                {prochainEvent.date} — {prochainEvent.titre}
              </div>
              <div style={{ fontSize: 11, color: "#757575", marginTop: 1 }}>{prochainEvent.activite}</div>
            </div>
          </div>

          {/* Liste événements */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {EVENTS.map((ev, i) => (
              <div key={i}>
                <div
                  onClick={() => setSelected(selected === i ? null : i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: selected === i ? ev.bg : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: `1px solid ${selected === i ? ev.color + "50" : "#F0F0F0"}`,
                    transition: "all .12s",
                  }}>
                  {/* Mois pill */}
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    padding: "3px 7px", borderRadius: 99,
                    background: ev.bg, color: ev.color,
                    minWidth: 42, textAlign: "center" as const,
                    flexShrink: 0,
                  }}>
                    {MOIS_LABELS[ev.mois]}
                  </span>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{ev.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: ev.flagship ? 700 : 500,
                      color: ev.flagship ? ev.color : "#212121",
                    }}>
                      {ev.titre}
                    </span>
                    {ev.flagship && (
                      <span style={{
                        fontSize: 9, background: ev.color, color: "#fff",
                        padding: "2px 6px", borderRadius: 99, marginLeft: 6,
                        fontWeight: 700, letterSpacing: ".04em",
                      }}>
                        ÉVÉNEMENT HAKI
                      </span>
                    )}
                  </div>
                  {ev.legal && (
                    <span style={{
                      fontSize: 9, color: "#E65100", background: "#FFF3E0",
                      padding: "2px 7px", borderRadius: 99, flexShrink: 0,
                      display: "none",
                    }}
                      className="haki-legal-badge"
                    >
                      ⚖️
                    </span>
                  )}
                  {ev.legal && (
                    <span style={{
                      fontSize: 9, color: "#E65100", background: "#FFF3E0",
                      padding: "2px 7px", borderRadius: 99, flexShrink: 0,
                    }}>
                      ⚖️ Légal CI
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: "#BDBDBD", flexShrink: 0, marginLeft: 4 }}>
                    {selected === i ? "▲" : "▼"}
                  </span>
                </div>

                {/* Détail déplié */}
                {selected === i && (
                  <div style={{
                    padding: "14px 14px 16px 14px",
                    background: ev.bg,
                    borderRadius: "0 0 8px 8px",
                    marginTop: -3,
                    border: `1px solid ${ev.color}30`,
                    borderTop: "none",
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: ev.color, textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 5 }}>
                          Activité proposée aux clients
                        </div>
                        <div style={{ fontSize: 12, color: "#424242", lineHeight: 1.65 }}>{ev.activite}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: ev.color, textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 5 }}>
                          Plan de communication
                        </div>
                        <div style={{ fontSize: 12, color: "#424242", lineHeight: 1.65 }}>{ev.comm}</div>
                      </div>
                    </div>

                    {ev.projetSocial && (
                      <div style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.75)",
                        borderRadius: 6,
                        borderLeft: `2px solid ${ev.color}`,
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: ev.color, textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 3 }}>
                          💡 Projet social suggéré · {ev.budget}
                        </div>
                        <div style={{ fontSize: 12, color: "#424242" }}>{ev.projetSocial}</div>
                      </div>
                    )}

                    {ev.legal && (
                      <div style={{
                        marginTop: 8,
                        padding: "6px 10px",
                        background: "#FFF3E0",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#E65100",
                      }}>
                        ⚖️ Ancrage légal CI : <strong>{ev.legal}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Légende compteur */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #F0F0F0", display: "flex", gap: 16, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 11, color: "#9E9E9E" }}>
              📅 {EVENTS.length} événements annuels
            </span>
            <span style={{ fontSize: 11, color: "#E65100" }}>
              ⚖️ {EVENTS.filter(e => e.legal).length} avec ancrage légal CT CI
            </span>
            <span style={{ fontSize: 11, color: "#2E7D32" }}>
              💡 {EVENTS.filter(e => e.projetSocial).length} projets sociaux suggérés
            </span>
          </div>
        </>
      )}

      {/* ══════════════════════════════════
          TAB OSC
      ══════════════════════════════════ */}
      {tab === "osc" && (
        <>
          <div style={{ fontSize: 12, color: "#757575", marginBottom: 12, lineHeight: 1.6 }}>
            OSC et partenaires CI que Haki recommande aux clients dans leur démarche RSE/DEI.
            Chaque partenariat renforce la crédibilité de l'organisation et son ancrage dans l'écosystème social ivoirien.
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {OSC.map((o, i) => (
              <div key={i}>
                <div
                  onClick={() => setSelectedOsc(selectedOsc === i ? null : i)}
                  style={{
                    border: `1px solid ${o.color}30`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    background: selectedOsc === i ? `${o.color}0D` : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all .12s",
                  }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: o.color, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: o.color }}>
                      {o.cat}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: "#BDBDBD", flexShrink: 0 }}>
                    {selectedOsc === i ? "▲" : "▼"}
                  </span>
                </div>

                {selectedOsc === i && (
                  <div style={{
                    border: `1px solid ${o.color}30`,
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    padding: "12px 14px 14px 14px",
                    background: `${o.color}06`,
                    marginTop: -3,
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: o.color, textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 4 }}>
                        Organisations
                      </div>
                      <div style={{ fontSize: 12, color: "#212121", lineHeight: 1.65 }}>{o.orgs}</div>
                    </div>
                    <div style={{ marginBottom: o.note ? 8 : 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: o.color, textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 4 }}>
                        Mode de soutien recommandé
                      </div>
                      <div style={{ fontSize: 12, color: "#424242", lineHeight: 1.65 }}>{o.mode}</div>
                    </div>
                    {o.note && (
                      <div style={{
                        padding: "7px 10px",
                        background: "rgba(255,255,255,0.8)",
                        borderRadius: 6,
                        borderLeft: `2px solid ${o.color}`,
                        fontSize: 11,
                        color: "#616161",
                        lineHeight: 1.6,
                        fontStyle: "italic",
                      }}>
                        {o.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #F0F0F0" }}>
            <div style={{ fontSize: 11, color: "#9E9E9E" }}>
              🤝 {OSC.length} catégories · Sélectionner les partenaires selon le profil et la politique RSE du client
            </div>
          </div>
        </>
      )}
    </div>
  );
}
