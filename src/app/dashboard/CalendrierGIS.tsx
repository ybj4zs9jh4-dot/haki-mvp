"use client";
import { useState } from "react";

// ── Événements (réfugiés & migrants retirés) ──────────────────────
const EVENTS = [
  {
    date:"6 fév", mois:2, emoji:"✂️", color:"#AD1457", bg:"#FCE4EC",
    titre:"Tolérance zéro MGF",
    activite:"Campagne contre les Mutilations Génitales Féminines · Information droits des femmes CI",
    comm:"Affichage RH · Partenariat LIDF · Newsletter DRH",
    legal:"Art. 4 CT CI", projet:"Atelier sensibilisation équipes féminines", budget:"Très faible",
  },
  {
    date:"20 fév", mois:2, emoji:"⚖️", color:"#1565C0", bg:"#E3F2FD",
    titre:"Justice Sociale",
    activite:"Bilan équité salariale · Communication engagement GIS",
    comm:"Tribune DG · LinkedIn · Newsletter RH CI",
    legal:"ODD 10", projet:"Publication rapport équité interne", budget:"Très faible",
  },
  {
    date:"8 mars", mois:3, emoji:"♀️", color:"#E57373", bg:"#FFEBEE",
    titre:"Journée des Femmes",
    activite:"Analyse écarts salariaux F/H · Conférence Femmes Leaders CI",
    comm:"Tribune DG · LinkedIn · Newsletter RH",
    legal:"Art. 23 CT CI", projet:"Journée Femmes Leaders + engagement parité management", budget:"Faible",
  },
  {
    date:"21 mars", mois:3, emoji:"🤝", color:"#00838F", bg:"#E0F7FA",
    titre:"Contre la Discrimination Raciale",
    activite:"Atelier anti-tribalisme · Révision procédures recrutement CI",
    comm:"Webinaire DRH · Communiqué CGECI",
    legal:"Art. 4 CT CI", projet:"Audit biais ethniques dans recrutement", budget:"Faible",
  },
  {
    date:"28 avr", mois:4, emoji:"🦺", color:"#E65100", bg:"#FFF3E0",
    titre:"Sécurité & Santé au Travail",
    activite:"Audit conditions de travail · Rapport médecine du travail · Formation sécurité",
    comm:"Rapport SST interne · Email managers · CNPS",
    legal:"Art. 41 CT CI", projet:"Journée 0 accident + formation premiers secours", budget:"Moyen",
  },
  {
    date:"1er mai", mois:5, emoji:"✊", color:"#F9A825", bg:"#FFFDE7",
    titre:"Fête du Travail CI",
    activite:"Rapport Conformité Sociale Haki — état CNPS/CMU des entreprises CI",
    comm:"Rapport annuel Haki + presse + emailing DRH",
    legal:"Art. 18 CT CI", projet:null, budget:null,
  },
  {
    date:"15 mai", mois:5, emoji:"👨‍👩‍👧", color:"#2E7D32", bg:"#E8F5E9",
    titre:"Journée des Familles",
    activite:"Communication congés parentaux · Politique télétravail parents",
    comm:"Email collaborateurs · Intranet · Charte QVT",
    legal:"Art. 23.3 CT CI", projet:"Aménagement horaires parents d'enfants PSH ou malades", budget:"Faible",
  },
  {
    date:"15 juil", mois:7, emoji:"🎓", color:"#00695C", bg:"#E0F2F1",
    titre:"Compétences des Jeunes",
    activite:"Programme stagiaires zones défavorisées CI",
    comm:"Communication recrutement · AGEFOP · LinkedIn",
    legal:"Art. 12 CT CI", projet:"10 stagiaires de 3e issus d'établissements REP CI", budget:"Très faible",
  },
  {
    date:"31 juil", mois:7, emoji:"🌺", color:"#BF360C", bg:"#FBE9E7",
    titre:"Femme Africaine",
    activite:"Mise en avant femmes leaders CI · Communication parité cadres africaines",
    comm:"Tribune femmes cadres · LinkedIn Afrique · Presse CI",
    legal:null, projet:"3 portraits de femmes cadres dirigeantes de l'organisation", budget:"Très faible",
  },
  {
    date:"Oct. Rose", mois:10, emoji:"🎗️", color:"#E91E63", bg:"#FCE4EC",
    titre:"Octobre Rose",
    activite:"Sensibilisation dépistage cancer du sein · Partenariat clinique CI",
    comm:"Affichage · Email collaboratrices · CNPS",
    legal:null, projet:null, budget:null,
  },
  {
    date:"Haki Month", mois:10, emoji:"🏆", color:"#1A237E", bg:"#E8EAF6",
    titre:"Haki GIS Month",
    activite:"Challenge 30 jours + classement sectoriel CI + événement Abidjan",
    comm:"Social media · CGECI · RIGRH · Remise Label Haki GIS",
    legal:null, projet:null, budget:null, flagship:true,
  },
  {
    date:"Nov. Bleu", mois:11, emoji:"🔵", color:"#1565C0", bg:"#E3F2FD",
    titre:"Novembre Bleu",
    activite:"Sensibilisation masculine · Journée bien-être + médecin du travail CNPS",
    comm:"Affichage · Email · Médecin travail CNPS",
    legal:null, projet:null, budget:null,
  },
  {
    date:"25/11–10/12", mois:11, emoji:"🟠", color:"#E65100", bg:"#FFF3E0",
    titre:"16 jours — VBG",
    activite:"Orange the World · Locaux orangés · 100% managers formés VSBG",
    comm:"Bâtiment orangé · Atelier VSBG · Communiqué",
    legal:null, projet:"Entreprise Orange the World + 100% managers formés anti-VSBG", budget:"Faible",
  },
  {
    date:"1er déc", mois:12, emoji:"🔴", color:"#C62828", bg:"#FFEBEE",
    titre:"Journée Mondiale Sida",
    activite:"Campagne Art. 4 CT CI · Test VIH confidentiel sur site",
    comm:"Affichage · Webinaire DRH · Espace Confiance",
    legal:"Art. 4 CT CI", projet:"Test VIH confidentiel + info droits PVVIH en entreprise", budget:"Faible",
  },
  {
    date:"3 déc", mois:12, emoji:"♿", color:"#00695C", bg:"#E0F2F1",
    titre:"Journée Int'l PSH",
    activite:"Journée sans barrières · Bilan accessibilité publié",
    comm:"Vidéo · Communiqué · Rapport accessibilité",
    legal:"Art. 12 CT CI", projet:"Défi Accessibilité — audit locaux avec salariés PSH", budget:"Moyen",
  },
  {
    date:"10 déc", mois:12, emoji:"🌐", color:"#4A148C", bg:"#F3E5F5",
    titre:"Droits de l'Homme",
    activite:"Bilan annuel GIS Haki — données agrégées de la plateforme",
    comm:"Rapport annuel Haki GIS CI · Presse",
    legal:null, projet:null, budget:null,
  },
];

// ── OSC 100% société civile ivoirienne ───────────────────────────
const OSC = [
  {
    cat:"Organisations féministes & droits des femmes CI",
    orgs:"LIDF (Ligue Ivoirienne des Droits des Femmes) · Stop au Chat Noir · AFEF · REFCI · Réseau Synergie Femmes · AFJCI · ONG Bloom / Orchidées Rouges CI",
    mode:"Mécénat, bénévolat de compétences, financement hébergement survivantes VBG, plaidoyer légal féminicide",
    note:"LIDF (Mégane Boho) : 300+ cas VBG/an. Stop au Chat Noir (Bénédicte Joan) : Villa Kotonga Bingerville + app mobile VBG.",
    color:"#E57373",
  },
  {
    cat:"Hommes alliés & masculinité positive CI",
    orgs:"RHEEG-CI (Réseau des Hommes Engagés pour l'Égalité de Genre en CI) · Alliance Droits et Santé AO",
    mode:"Invitation panels internes, formation managers masculinité positive, co-animation ateliers VSBG",
    note:"RHEEG-CI fondé 2019 par Coulibaly Pélibien Ghislain. Marraine : Euphrasie Yao (conseillère Présidence CI).",
    color:"#1565C0",
  },
  {
    cat:"Associations PSH CI",
    orgs:"FIPAH · HOPE CI · AIPSH",
    mode:"Don matériel, recrutement inclusif, financement accessibilité, audit locaux guides PSH",
    note:null,
    color:"#00695C",
  },
  {
    cat:"Réseaux VIH/Sida en milieu professionnel",
    orgs:"RIP+ (Réseau Ivoirien PVVIH) · Alliance CI · COSCI · AIBEF · Enda Santé CI · REPMASCI",
    mode:"Kits dépistage sur site, campagnes Art. 4 CT CI en entreprise, formation DRH confidentialité médicale",
    note:"Homologues société civile CI — pas d'organisations onusiennes.",
    color:"#C62828",
  },
  {
    cat:"Lutte contre les VBG",
    orgs:"SOS Violences CI · CAVI CI · COFERV · WANEP-CI · Centre Akwaba Mousso (Abidjan)",
    mode:"Financement campagnes Orange the World, formations VSBG managers, hébergement d'urgence",
    note:null,
    color:"#E65100",
  },
  {
    cat:"Insertion jeunesse défavorisée",
    orgs:"Fondation EDUCI · Réseau Insertion CI · AGEFOP",
    mode:"Bourses, stages, formations qualifiantes, programme stagiaires zones défavorisées",
    note:null,
    color:"#1A237E",
  },
  {
    cat:"Droits des personnes discriminées en milieu professionnel",
    orgs:"Alternative CI · CNDH CI (Commission Nationale des Droits de l'Homme)",
    mode:"Soutien santé au travail (Art. 4 CT CI), accès aux soins sans discrimination — selon profil client",
    note:"Via prisme santé au travail et non-discrimination médicale. Pertinent pour multinationales avec politiques D&I mondiales.",
    color:"#546E7A",
  },
  {
    cat:"Activistes GIS indépendants CI",
    orgs:"Militants droits des femmes · Défenseurs PSH · Journalistes équité CI (Kessiya.com) · Blogueurs genre",
    mode:"Parrainage, invitation panels Haki GIS Month, co-production contenus sensibilisation",
    note:null,
    color:"#2E7D32",
  },
];

// ── Regroupement par mois pour le carrousel ───────────────────────
const MOIS_NOMS = ["","Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function getMoisAvecEvents() {
  const map: Record<number, typeof EVENTS> = {};
  for (const ev of EVENTS) {
    if (!map[ev.mois]) map[ev.mois] = [];
    map[ev.mois].push(ev);
  }
  return Object.entries(map)
    .sort((a,b) => Number(a[0]) - Number(b[0]))
    .map(([mois, evts]) => ({ mois: Number(mois), evts }));
}

export default function CalendrierGIS() {
  const moisList = getMoisAvecEvents();
  const now = new Date();
  const moisCourant = now.getMonth() + 1;

  // Trouver l'index du mois courant ou le prochain
  const initIdx = Math.max(0, moisList.findIndex(m => m.mois >= moisCourant));
  const [moisIdx, setMoisIdx] = useState(initIdx);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedOsc, setSelectedOsc] = useState<number | null>(null);
  const [tab, setTab] = useState<"calendrier"|"osc">("calendrier");

  const current = moisList[moisIdx];

  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:16 }}>

      {/* ── Header + onglets ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".1em", textTransform:"uppercase" as const }}>
          Calendrier GIS & Communication
        </div>
        <div style={{ display:"flex", gap:5 }}>
          <button onClick={() => setTab("calendrier")} style={{ padding:"5px 12px", background:tab==="calendrier"?"#1A237E":"#F5F5F5", color:tab==="calendrier"?"#fff":"#424242", border:"none", borderRadius:5, fontSize:11, fontWeight:500, cursor:"pointer" }}>
            📅 Calendrier
          </button>
          <button onClick={() => setTab("osc")} style={{ padding:"5px 12px", background:tab==="osc"?"#1A237E":"#F5F5F5", color:tab==="osc"?"#fff":"#424242", border:"none", borderRadius:5, fontSize:11, fontWeight:500, cursor:"pointer" }}>
            🤝 OSC & Partenaires
          </button>
        </div>
      </div>

      {/* ══════════ CALENDRIER ══════════ */}
      {tab === "calendrier" && (
        <>
          {/* Carrousel — navigation mois */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <button
              onClick={() => { setMoisIdx(i => Math.max(0, i-1)); setSelected(null); }}
              disabled={moisIdx === 0}
              style={{ width:28, height:28, border:"1px solid #E0E0E0", borderRadius:6, background:moisIdx===0?"#F5F5F5":"#fff", color:moisIdx===0?"#BDBDBD":"#424242", cursor:moisIdx===0?"default":"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              ‹
            </button>

            {/* Pills mois — scroll horizontal */}
            <div style={{ display:"flex", gap:5, overflowX:"auto" as const, flex:1, scrollbarWidth:"none" as const }}>
              {moisList.map((m, i) => (
                <button key={m.mois}
                  onClick={() => { setMoisIdx(i); setSelected(null); }}
                  style={{
                    padding:"4px 10px", border:"none", borderRadius:99, fontSize:10, fontWeight:600, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" as const,
                    background: i===moisIdx ? "#1A237E" : m.mois===moisCourant ? "#E8EAF6" : "#F5F5F5",
                    color: i===moisIdx ? "#fff" : m.mois===moisCourant ? "#1A237E" : "#757575",
                  }}>
                  {MOIS_NOMS[m.mois].slice(0,4)} · {m.evts.length}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setMoisIdx(i => Math.min(moisList.length-1, i+1)); setSelected(null); }}
              disabled={moisIdx === moisList.length-1}
              style={{ width:28, height:28, border:"1px solid #E0E0E0", borderRadius:6, background:moisIdx===moisList.length-1?"#F5F5F5":"#fff", color:moisIdx===moisList.length-1?"#BDBDBD":"#424242", cursor:moisIdx===moisList.length-1?"default":"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              ›
            </button>
          </div>

          {/* Titre mois courant */}
          <div style={{ fontSize:12, fontWeight:700, color:"#1A237E", marginBottom:8, letterSpacing:".02em" }}>
            {MOIS_NOMS[current.mois]} — {current.evts.length} événement{current.evts.length>1?"s":""}
          </div>

          {/* Liste événements du mois */}
          <div style={{ display:"flex", flexDirection:"column" as const, gap:4 }}>
            {current.evts.map((ev, i) => (
              <div key={i}>
                {/* Ligne compacte */}
                <div
                  onClick={() => setSelected(selected===i?null:i)}
                  style={{
                    display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
                    background: selected===i ? ev.bg : "transparent",
                    borderRadius:7, cursor:"pointer",
                    border:`1px solid ${selected===i ? ev.color+"40" : "#F0F0F0"}`,
                    transition:"all .1s",
                  }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>{ev.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontSize:12, fontWeight: (ev as any).flagship?700:500, color:(ev as any).flagship?ev.color:"#212121" }}>
                      {ev.titre}
                    </span>
                    {(ev as any).flagship && (
                      <span style={{ fontSize:9, background:ev.color, color:"#fff", padding:"1px 5px", borderRadius:99, marginLeft:5, fontWeight:700 }}>HAKI</span>
                    )}
                    {!selected && (
                      <div style={{ fontSize:10, color:"#9E9E9E", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                        {ev.activite}
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                    {ev.legal && (
                      <span style={{ fontSize:9, color:"#E65100", background:"#FFF3E0", padding:"2px 6px", borderRadius:99 }}>⚖️</span>
                    )}
                    <span style={{ fontSize:9, color:"#BDBDBD" }}>{selected===i?"▲":"▼"}</span>
                  </div>
                </div>

                {/* Détail déplié */}
                {selected === i && (
                  <div style={{ padding:"10px 12px 12px", background:ev.bg, borderRadius:"0 0 7px 7px", marginTop:-3, border:`1px solid ${ev.color}30`, borderTop:"none" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:ev.projet||ev.legal?8:0 }}>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:ev.color, textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:3 }}>Activité proposée</div>
                        <div style={{ fontSize:11, color:"#424242", lineHeight:1.6 }}>{ev.activite}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:ev.color, textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:3 }}>Communication</div>
                        <div style={{ fontSize:11, color:"#424242", lineHeight:1.6 }}>{ev.comm}</div>
                      </div>
                    </div>
                    {ev.projet && (
                      <div style={{ padding:"6px 10px", background:"rgba(255,255,255,0.75)", borderRadius:5, borderLeft:`2px solid ${ev.color}`, marginBottom:ev.legal?6:0 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:ev.color, textTransform:"uppercase" as const, letterSpacing:".06em" }}>💡 Projet social · {ev.budget} — </span>
                        <span style={{ fontSize:11, color:"#424242" }}>{ev.projet}</span>
                      </div>
                    )}
                    {ev.legal && (
                      <div style={{ fontSize:10, color:"#E65100", background:"#FFF3E0", padding:"4px 8px", borderRadius:5 }}>
                        ⚖️ <strong>{ev.legal}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pied compteur */}
          <div style={{ marginTop:10, paddingTop:8, borderTop:"1px solid #F0F0F0", display:"flex", gap:14, flexWrap:"wrap" as const }}>
            <span style={{ fontSize:10, color:"#9E9E9E" }}>📅 {EVENTS.length} événements annuels</span>
            <span style={{ fontSize:10, color:"#E65100" }}>⚖️ {EVENTS.filter(e=>e.legal).length} ancrages légaux CT CI</span>
            <span style={{ fontSize:10, color:"#2E7D32" }}>💡 {EVENTS.filter(e=>e.projet).length} projets sociaux</span>
          </div>
        </>
      )}

      {/* ══════════ OSC ══════════ */}
      {tab === "osc" && (
        <>
          <div style={{ fontSize:11, color:"#757575", marginBottom:10, lineHeight:1.6 }}>
            Partenaires société civile ivoirienne recommandés dans la démarche RSE/GIS.
          </div>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:4 }}>
            {OSC.map((o, i) => (
              <div key={i}>
                <div
                  onClick={() => setSelectedOsc(selectedOsc===i?null:i)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", border:`1px solid ${o.color}30`, borderRadius:7, background:selectedOsc===i?`${o.color}0D`:"transparent", cursor:"pointer", transition:"all .1s" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:o.color, flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:12, fontWeight:600, color:o.color }}>{o.cat}</span>
                  <span style={{ fontSize:9, color:"#BDBDBD" }}>{selectedOsc===i?"▲":"▼"}</span>
                </div>
                {selectedOsc === i && (
                  <div style={{ border:`1px solid ${o.color}30`, borderTop:"none", borderRadius:"0 0 7px 7px", padding:"10px 12px 12px", background:`${o.color}06`, marginTop:-3 }}>
                    <div style={{ marginBottom:6 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:o.color, textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:3 }}>Organisations</div>
                      <div style={{ fontSize:11, color:"#212121", lineHeight:1.65 }}>{o.orgs}</div>
                    </div>
                    <div style={{ marginBottom:o.note?6:0 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:o.color, textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:3 }}>Mode de soutien</div>
                      <div style={{ fontSize:11, color:"#424242", lineHeight:1.65 }}>{o.mode}</div>
                    </div>
                    {o.note && (
                      <div style={{ padding:"5px 8px", background:"rgba(255,255,255,0.8)", borderRadius:5, borderLeft:`2px solid ${o.color}`, fontSize:10, color:"#616161", fontStyle:"italic" as const, lineHeight:1.5 }}>
                        {o.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, paddingTop:8, borderTop:"1px solid #F0F0F0", fontSize:10, color:"#9E9E9E" }}>
            🤝 {OSC.length} catégories · 100% société civile ivoirienne · Activer selon profil client
          </div>
        </>
      )}
    </div>
  );
}
