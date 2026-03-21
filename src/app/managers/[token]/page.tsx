"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Etape = "verification" | "intro" | "module1" | "module2" | "module3" | "resultats" | "erreur";

const MODULE1 = [
  { code:"SC01", q:"Je suis capable d'identifier mes propres biais inconscients liés à l'origine ethnique ou régionale des candidats en Côte d'Ivoire (tribalisme, patronyme, accent...)." },
  { code:"SC02", q:"Lors d'un recrutement, l'origine régionale ou ethnique d'un candidat n'influence jamais mon évaluation, même inconsciemment." },
  { code:"SC03", q:"Je connais les principales formes de discrimination interdites par l'Art. 4 du Code du Travail CI 2025 (genre, handicap, VIH/Sida, origine, religion...)." },
  { code:"SC04", q:"Je sais reconnaître une situation de harcèlement moral ou de VSBG dans mon équipe et je sais comment réagir (Art. 33 CT CI)." },
  { code:"SC05", q:"Je suis capable d'adapter mon management au fait religieux (Ramadan, horaires de prière, fêtes Islam/Christianisme/Animisme) de façon équitable." },
  { code:"SC06", q:"Je traite de la même façon les collaborateurs de toutes origines nationales (ivoiriens, CEDEAO, expatriés)." },
  { code:"SC07", q:"Je connais les droits des personnes en situation de handicap dans mon entreprise (quota Art. 12.2 CT CI, aménagements de poste)." },
  { code:"SC08", q:"Je ne fais jamais de commentaires ou plaisanteries liés à l'origine ethnique, la religion, le genre ou le handicap d'un collaborateur." },
  { code:"SC09", q:"Je sais ce que dit l'Art. 4 CT CI sur la non-discrimination des PVVIH (personnes vivant avec le VIH/Sida) en milieu professionnel." },
];

const MODULE2 = [
  { code:"RC01", q:"Lors de mes recrutements, j'utilise une grille d'évaluation standardisée pour tous les candidats, indépendamment de leur profil." },
  { code:"RC02", q:"Je veille à ce que les offres d'emploi que je rédige ou valide utilisent un langage neutre (non genré, sans critères discriminatoires)." },
  { code:"RC03", q:"Je m'assure que les panels d'entretien incluent des évaluateurs de profils divers pour limiter les biais." },
  { code:"RC04", q:"Je diversifie mes canaux de sourcing pour attirer des candidats de toutes origines régionales CI (Abobo, Yopougon, Man, Korhogo, Bondoukou...)." },
  { code:"RC05", q:"Je ne pose jamais de questions sur la situation familiale, la religion, l'origine ethnique ou le statut sérologique lors d'un entretien." },
  { code:"RC06", q:"Je donne autant de chances aux candidats féminins qu'aux candidats masculins pour les postes de management." },
  { code:"RC07", q:"Je suis capable de justifier objectivement chaque décision de recrutement ou de refus avec des critères professionnels documentés." },
  { code:"RC08", q:"J'accueille des apprentis AGEFOP et des stagiaires issus de milieux défavorisés dans mon équipe." },
  { code:"RC09", q:"Lorsqu'un candidat PSH (personne en situation de handicap) postule, j'évalue sa candidature sur ses compétences et non sur son handicap." },
];

const MODULE3 = [
  { code:"MG01", q:"Je traite les demandes d'aménagement d'horaires liées aux pratiques religieuses de façon équitable entre tous les collaborateurs." },
  { code:"MG02", q:"Je m'assure que les opportunités de formation et d'évolution sont accessibles équitablement à toutes les générations de mon équipe." },
  { code:"MG03", q:"Je suis attentif·ve aux signaux de mal-être ou de discrimination vécus par les membres de mon équipe et j'agis rapidement." },
  { code:"MG04", q:"Je valorise et transmets les savoirs des collaborateurs seniors vers les plus jeunes et vice versa." },
  { code:"MG05", q:"Je veille à ce que le congé maternité (14 semaines) et le congé paternité (10 jours) soient accordés sans pression ni préjudice de carrière." },
  { code:"MG06", q:"Je maintiens le lien avec les collaborateurs en arrêt maladie longue durée et facilite leur retour au travail." },
  { code:"MG07", q:"J'organise les réunions et événements d'équipe en tenant compte des contraintes religieuses et familiales de chacun." },
  { code:"MG08", q:"Je lutte activement contre les comportements de tribalisme ou de favoritisme basé sur l'origine dans mon équipe." },
  { code:"MG09", q:"En cas de comportement discriminatoire ou de harcèlement dans mon équipe, je sais comment intervenir et vers qui orienter la personne." },
  { code:"MG10", q:"Je me fixe des objectifs personnels d'amélioration de mes pratiques inclusives et je les suis dans le temps." },
];

const LIKERT = [
  { val:"1", label:"Pas du tout d'accord" },
  { val:"2", label:"Plutôt pas d'accord" },
  { val:"3", label:"Plutôt d'accord" },
  { val:"4", label:"Tout à fait d'accord" },
];

function ModuleQuestions({ questions, reponses, onChange, couleur }: {
  questions: {code:string;q:string}[];
  reponses: Record<string,string>;
  onChange: (code:string, val:string) => void;
  couleur: string;
}) {
  return (
    <div>
      {questions.map((q, i) => (
        <div key={q.code} style={{ background:"#fff", border:"1px solid #E0E0E0", borderRadius:10, padding:"18px 20px", marginBottom:14 }}>
          <div style={{ fontSize:13, color:"#9E9E9E", marginBottom:6 }}>Question {i+1}/{questions.length}</div>
          <div style={{ fontSize:14, color:"#212121", lineHeight:1.6, marginBottom:14, fontWeight:500 }}>{q.q}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {LIKERT.map(opt => (
              <label key={opt.val} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", border:`1.5px solid ${reponses[q.code]===opt.val?couleur:"#E0E0E0"}`, borderRadius:8, cursor:"pointer", background:reponses[q.code]===opt.val?`${couleur}15`:"#FAFAFA", flex:1, minWidth:120 }}>
                <input type="radio" name={q.code} value={opt.val} checked={reponses[q.code]===opt.val} onChange={() => onChange(q.code, opt.val)} style={{ accentColor:couleur }} />
                <span style={{ fontSize:12 }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ label, score, max, couleur }: { label:string; score:number; max:number; couleur:string }) {
  const pct = Math.round((score/max)*100);
  const niveau = pct>=75?"Fort":pct>=50?"Moyen":"À renforcer";
  const ncouleur = pct>=75?"#2E7D32":pct>=50?"#E65100":"#B71C1C";
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <div style={{ fontSize:13, fontWeight:500, color:"#424242" }}>{label}</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, padding:"2px 8px", borderRadius:99, background:`${ncouleur}15`, color:ncouleur, fontWeight:500 }}>{niveau}</span>
          <span style={{ fontSize:13, fontWeight:500, color:couleur }}>{score}/{max}</span>
        </div>
      </div>
      <div style={{ height:10, background:"#F5F5F5", borderRadius:5, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:couleur, borderRadius:5, transition:"width .5s" }}/>
      </div>
      <div style={{ fontSize:11, color:"#9E9E9E", marginTop:3, textAlign:"right" }}>{pct}%</div>
    </div>
  );
}

export default function ManagerPage() {
  const { token } = useParams() as { token:string };
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>("verification");
  const [orgNom, setOrgNom] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [reponses, setReponses] = useState<Record<string,string>>({});
  const [resultats, setResultats] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [planAction, setPlanAction] = useState<string[]>(["","",""]);

  useEffect(() => {
    fetch(`/api/managers/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setOrgNom(d.organisationNom); setEtape("intro"); }
        else { setErrMsg(d.error ?? "Lien invalide"); setEtape("erreur"); }
      })
      .catch(() => { setErrMsg("Erreur de connexion"); setEtape("erreur"); });
  }, [token]);

  function setReponse(code:string, val:string) {
    setReponses(r => ({...r, [code]: val}));
  }

  function nbRepondusMod(codes: string[]) {
    return codes.filter(c => reponses[c]).length;
  }

  async function soumettre() {
    const toutes = [...MODULE1,...MODULE2,...MODULE3].map(q=>q.code);
    const manquantes = toutes.filter(c => !reponses[c]);
    if (manquantes.length > 0) {
      alert(`Veuillez répondre à toutes les questions. Il manque ${manquantes.length} réponse(s).`);
      return;
    }
    setSubmitting(true);
    const body: any = {};
    toutes.forEach(c => { body[c] = parseInt(reponses[c]); });
    body.planAction = planAction.filter(p=>p.trim()).map(p => ({ action:p, delai:"3 mois", indicateur:"" }));

    const res = await fetch(`/api/managers/${token}/score`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) setResultats(data);
    else setErrMsg(data.error ?? "Erreur lors de la soumission");
    setSubmitting(false);
    setEtape(res.ok ? "resultats" : "erreur");
  }

  const s: Record<string,React.CSSProperties> = {
    wrap: { minHeight:"100vh", background:"#F5F5F5", fontFamily:"system-ui,sans-serif" },
    hdr: { background:"#E65100", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    card: { maxWidth:780, margin:"0 auto", padding:"24px 16px" },
  };

  if (etape === "verification") return (
    <div style={{...s.wrap, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{ color:"#E65100", fontSize:16 }}>Vérification du lien...</div>
    </div>
  );

  if (etape === "erreur") return (
    <div style={{...s.wrap, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{ background:"#fff", borderRadius:12, padding:32, maxWidth:420, textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
        <div style={{ fontSize:16, fontWeight:500, color:"#B71C1C", marginBottom:8 }}>Lien invalide</div>
        <div style={{ fontSize:13, color:"#757575" }}>{errMsg}</div>
      </div>
    </div>
  );

  if (etape === "resultats" && resultats) return (
    <div style={s.wrap}>
      <div style={s.hdr}>
        <span style={{ fontSize:18, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
        <span style={{ fontSize:12, color:"#FFCCBC" }}>Auto-diagnostic MANAGERS — Résultats</span>
      </div>
      <div style={s.card}>
        <div style={{ background:"#FFF3E0", border:"1px solid #FFCC80", borderRadius:12, padding:"20px 24px", marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:500, color:"#E65100", marginBottom:4 }}>🔒 Résultats strictement confidentiels</div>
          <div style={{ fontSize:12, color:"#BF360C", lineHeight:1.6 }}>{resultats.noteConfidentialite}</div>
        </div>

        <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#9E9E9E", letterSpacing:".05em", marginBottom:12 }}>SCORE TOTAL AUTO-DIAGNOSTIC</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:10 }}>
            <span style={{ fontSize:52, fontWeight:500, color:"#E65100", lineHeight:1 }}>{resultats.scoreTotal}</span>
            <span style={{ fontSize:18, color:"#9E9E9E" }}>/112</span>
          </div>
          <div style={{ display:"inline-block", padding:"6px 16px", borderRadius:99, background:"#FFF3E0", color:"#E65100", fontSize:13, fontWeight:500 }}>
            {resultats.niveauLabel}
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:16 }}>Scores par module</div>
          <ScoreBar label="Module 1 — Biais inconscients & Stéréotypes CI" score={resultats.scoreModule1} max={36} couleur="#1A237E"/>
          <ScoreBar label="Module 2 — Recrutement inclusif CI" score={resultats.scoreModule2} max={36} couleur="#00695C"/>
          <ScoreBar label="Module 3 — Management inclusif CI" score={resultats.scoreModule3} max={40} couleur="#E65100"/>
        </div>

        {resultats.axesForts?.length > 0 && (
          <div style={{ background:"#E8F5E9", borderRadius:12, padding:20, marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:500, color:"#2E7D32", marginBottom:10 }}>✅ Vos points forts</div>
            {resultats.axesForts.map((a:string,i:number) => <div key={i} style={{ fontSize:13, color:"#2E7D32", marginBottom:4 }}>· {a}</div>)}
          </div>
        )}

        {resultats.axesProgression?.length > 0 && (
          <div style={{ background:"#FFF3E0", borderRadius:12, padding:20, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:500, color:"#E65100", marginBottom:10 }}>🎯 Axes de progression</div>
            {resultats.axesProgression.map((a:string,i:number) => <div key={i} style={{ fontSize:13, color:"#E65100", marginBottom:4 }}>· {a}</div>)}
          </div>
        )}

        {resultats.planAction?.length > 0 && (
          <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:14 }}>📋 Votre plan d'action personnel — 3 mois</div>
            {resultats.planAction.map((p:any, i:number) => (
              <div key={i} style={{ padding:"10px 14px", background:"#F5F5F5", borderRadius:8, marginBottom:8, fontSize:13 }}>
                <span style={{ fontWeight:500, color:"#E65100" }}>{i+1}. </span>{p.action}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding:"14px 18px", background:"#FFEBEE", borderRadius:8, fontSize:12, color:"#B71C1C", lineHeight:1.6 }}>
          Ces résultats sont strictement personnels. Ils ne seront jamais transmis à votre organisation ni à Haki.
          Conservez ce lien pour accéder à vos résultats ultérieurement.
        </div>
      </div>
    </div>
  );

  if (etape === "intro") return (
    <div style={s.wrap}>
      <div style={s.hdr}>
        <span style={{ fontSize:18, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
        <span style={{ fontSize:12, color:"#FFCCBC" }}>Auto-diagnostic MANAGERS</span>
      </div>
      <div style={s.card}>
        <div style={{ background:"#E65100", borderRadius:12, padding:"24px 28px", marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:500, color:"#fff", marginBottom:6 }}>Auto-diagnostic Manager Inclusif CI</div>
          <div style={{ fontSize:13, color:"#FFCCBC", marginBottom:16 }}>{orgNom} · Confidentiel · ~12 minutes · 28 questions</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["Module 1 — Biais & Stéréotypes CI","Module 2 — Recrutement inclusif","Module 3 — Management inclusif"].map((m,i) => (
              <span key={i} style={{ fontSize:11, padding:"3px 10px", borderRadius:99, background:"rgba(255,255,255,0.2)", color:"#fff" }}>{m}</span>
            ))}
          </div>
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:12 }}>🔒 Confidentialité absolue</div>
          {["Vos réponses et votre score sont strictement personnels.",
            "Ils ne seront jamais transmis à votre organisation ni à Haki.",
            "Seul vous pouvez accéder à vos résultats via ce lien.",
            "Vous pouvez demander la suppression de vos données à tout moment."].map((m,i) => (
            <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:"#424242", marginBottom:8 }}>
              <span style={{ color:"#E65100" }}>✓</span><span>{m}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:10 }}>Comment répondre ?</div>
          <div style={{ fontSize:13, color:"#616161", lineHeight:1.7 }}>
            Pour chaque affirmation, indiquez votre niveau d'accord sur une échelle de 1 à 4.<br/>
            <strong>Répondez honnêtement</strong> — il n'y a pas de bonne ou mauvaise réponse.<br/>
            Les questions sont adaptées au contexte managérial ivoirien (tribalisme, fait religieux CI, VIH/Sida Art. 4 CT CI...).
          </div>
        </div>
        <button onClick={() => setEtape("module1")}
          style={{ width:"100%", padding:"14px 0", background:"#E65100", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer" }}>
          Commencer l'auto-diagnostic →
        </button>
      </div>
    </div>
  );

  const moduleConfig: Record<string,{questions:{code:string;q:string}[];titre:string;couleur:string;suivant:Etape;precedent:Etape|null;num:number}> = {
    module1: { questions:MODULE1, titre:"Module 1 — Biais inconscients & Stéréotypes CI", couleur:"#1A237E", suivant:"module2", precedent:null, num:1 },
    module2: { questions:MODULE2, titre:"Module 2 — Recrutement inclusif CI", couleur:"#00695C", suivant:"module3", precedent:"module1", num:2 },
    module3: { questions:MODULE3, titre:"Module 3 — Management inclusif CI", couleur:"#E65100", suivant:"resultats", precedent:"module2", num:3 },
  };

  if (etape === "module1" || etape === "module2" || etape === "module3") {
    const cfg = moduleConfig[etape];
    const repondus = nbRepondusMod(cfg.questions.map(q=>q.code));
    const pct = Math.round((repondus/cfg.questions.length)*100);

    return (
      <div style={s.wrap}>
        <div style={{ background:cfg.couleur, padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:18, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{cfg.titre}</span>
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>Module {cfg.num}/3</span>
        </div>
        <div style={{ height:4, background:"rgba(0,0,0,0.2)" }}>
          <div style={{ height:"100%", background:"#FFC107", width:`${pct}%`, transition:"width .3s" }}/>
        </div>

        <div style={s.card}>
          <div style={{ background:cfg.couleur, borderRadius:12, padding:"16px 20px", marginBottom:20 }}>
            <div style={{ fontSize:16, fontWeight:500, color:"#fff", marginBottom:4 }}>{cfg.titre}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{repondus}/{cfg.questions.length} questions répondues</div>
            <div style={{ display:"flex", gap:6, marginTop:10 }}>
              {["Module 1","Module 2","Module 3"].map((m,i) => (
                <div key={i} style={{ padding:"3px 10px", borderRadius:99, background:cfg.num===i+1?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.1)", fontSize:11, color:cfg.num===i+1?"#fff":"rgba(255,255,255,0.5)", fontWeight:cfg.num===i+1?500:400 }}>{m}</div>
              ))}
            </div>
          </div>

          <div style={{ background:"#F5F5F5", borderRadius:8, padding:"8px 12px", marginBottom:16, fontSize:12, color:"#616161" }}>
            Échelle : <strong>1</strong> = Pas du tout d'accord · <strong>2</strong> = Plutôt pas d'accord · <strong>3</strong> = Plutôt d'accord · <strong>4</strong> = Tout à fait d'accord
          </div>

          <ModuleQuestions questions={cfg.questions} reponses={reponses} onChange={setReponse} couleur={cfg.couleur}/>

          {etape === "module3" && (
            <div style={{ background:"#fff", borderRadius:12, padding:22, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:12 }}>📋 Votre plan d'action personnel (optionnel)</div>
              <div style={{ fontSize:12, color:"#757575", marginBottom:12 }}>Notez 1 à 3 actions concrètes que vous vous engagez à mettre en place dans les 3 prochains mois :</div>
              {[0,1,2].map(i => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                  <span style={{ fontSize:13, color:"#E65100", fontWeight:500, minWidth:20 }}>{i+1}.</span>
                  <input value={planAction[i]} onChange={e => { const p=[...planAction]; p[i]=e.target.value; setPlanAction(p); }}
                    placeholder={`Action ${i+1}...`}
                    style={{ flex:1, padding:"9px 12px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13 }}/>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, paddingTop:16, borderTop:"1px solid #E0E0E0" }}>
            {cfg.precedent ? (
              <button onClick={() => setEtape(cfg.precedent as Etape)}
                style={{ padding:"10px 20px", background:"#fff", color:"#424242", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>
                ← Précédent
              </button>
            ) : <div/>}

            {etape !== "module3" ? (
              <button onClick={() => setEtape(cfg.suivant)}
                style={{ padding:"11px 24px", background:cfg.couleur, color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>
                Module suivant →
              </button>
            ) : (
              <button onClick={soumettre} disabled={submitting}
                style={{ padding:"11px 24px", background:submitting?"#9FA8DA":"#E65100", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:500, cursor:submitting?"default":"pointer" }}>
                {submitting ? "Calcul en cours..." : "Terminer & voir mes résultats →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
