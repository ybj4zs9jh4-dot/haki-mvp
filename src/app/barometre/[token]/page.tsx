"use client";
// src/app/barometre/[token]/page.tsx
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Etat = "verification" | "intro" | "questionnaire" | "merci" | "erreur";

export default function BarometrePage() {
  const { token } = useParams() as { token: string };
  const [etat, setEtat] = useState<Etat>("verification");
  const [orgNom, setOrgNom] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [profil, setProfil] = useState<Record<string,string>>({});
  const [reponses, setReponses] = useState<Record<string,string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/barometre/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setOrgNom(d.organisationNom); setEtat("intro"); }
        else { setErrMsg(d.error ?? "Lien invalide"); setEtat("erreur"); }
      })
      .catch(() => { setErrMsg("Erreur de connexion"); setEtat("erreur"); });
  }, [token]);

  async function soumettre() {
    setSubmitting(true);
    const res = await fetch(`/api/barometre/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profil, reponses }),
    });
    if (res.ok) setEtat("merci");
    else {
      const d = await res.json();
      setErrMsg(d.error ?? "Erreur lors de la soumission");
      setEtat("erreur");
    }
    setSubmitting(false);
  }

  const s: Record<string, React.CSSProperties> = {
    wrap: { minHeight:"100vh", background:"#F5F5F5", fontFamily:"system-ui, sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
    card: { background:"#fff", borderRadius:14, padding:32, maxWidth:680, width:"100%", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" },
    hdr: { background:"#00695C", borderRadius:10, padding:"20px 24px", marginBottom:24 },
    q: { marginBottom:20 },
    qlabel: { fontSize:14, color:"#212121", marginBottom:8, display:"block", lineHeight:1.5 },
    sel: { width:"100%", padding:"9px 12px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, background:"#fff" },
    btn: { background:"#00695C", color:"#fff", border:"none", borderRadius:8, padding:"12px 28px", fontSize:14, fontWeight:500, cursor:"pointer", marginTop:8 },
  };

  if (etat === "verification") return <div style={s.wrap}><div style={{ color:"#00695C", fontSize:16 }}>Vérification du lien...</div></div>;

  if (etat === "erreur") return (
    <div style={s.wrap}><div style={{...s.card, textAlign:"center"}}>
      <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
      <div style={{ fontSize:16, fontWeight:500, color:"#B71C1C", marginBottom:8 }}>Lien invalide</div>
      <div style={{ fontSize:13, color:"#757575" }}>{errMsg}</div>
    </div></div>
  );

  if (etat === "merci") return (
    <div style={s.wrap}><div style={{...s.card, textAlign:"center"}}>
      <div style={{ fontSize:40, marginBottom:16 }}>🙏</div>
      <div style={{ fontSize:20, fontWeight:500, color:"#00695C", marginBottom:10 }}>Merci pour votre participation !</div>
      <div style={{ fontSize:14, color:"#616161", lineHeight:1.6 }}>
        Vos réponses ont bien été enregistrées de façon anonyme.<br/>
        Elles contribuent à améliorer l'inclusion dans votre entreprise.
      </div>
      <div style={{ marginTop:20, padding:"12px 16px", background:"#E0F2F1", borderRadius:8, fontSize:12, color:"#00695C" }}>
        Les résultats seront présentés à votre direction de manière agrégée,<br/>uniquement si au moins 5 personnes ont répondu.
      </div>
    </div></div>
  );

  if (etat === "intro") return (
    <div style={s.wrap}><div style={s.card}>
      <div style={s.hdr}>
        <div style={{ fontSize:22, fontWeight:600, color:"#FFC107", marginBottom:4 }}>HAKI</div>
        <div style={{ fontSize:15, color:"#fff", marginBottom:4 }}>Baromètre d'inclusion — {orgNom}</div>
        <div style={{ fontSize:12, color:"#B2DFDB" }}>Anonyme · Confidentiel · ~20 minutes</div>
      </div>
      <div style={{ fontSize:14, color:"#424242", lineHeight:1.7, marginBottom:20 }}>
        Ce questionnaire mesure votre sentiment d'inclusion au travail. Il est strictement anonyme et confidentiel.
      </div>
      <div style={{ background:"#E0F2F1", borderRadius:8, padding:"14px 16px", marginBottom:24 }}>
        {["Vos réponses sont traitées de façon strictement agrégée.", "Aucune donnée individuelle ne sera transmise à votre employeur.", "Les résultats ne sont communiqués que si au moins 5 personnes ont répondu.", "Ce lien est à usage unique et ne contient aucune information sur votre identité."].map((m,i) => (
          <div key={i} style={{ display:"flex", gap:8, fontSize:12, color:"#00695C", marginBottom:4 }}>
            <span>✓</span><span>{m}</span>
          </div>
        ))}
      </div>
      <button style={s.btn} onClick={() => setEtat("questionnaire")}>Commencer le baromètre →</button>
    </div></div>
  );

  // Questionnaire simplifié — version MVP (profil + 5 questions de synthèse)
  return (
    <div style={s.wrap}><div style={s.card}>
      <div style={s.hdr}>
        <div style={{ fontSize:15, color:"#fff", fontWeight:500 }}>Baromètre Haki — {orgNom}</div>
        <div style={{ fontSize:11, color:"#B2DFDB", marginTop:2 }}>Toutes les questions sont facultatives</div>
      </div>

      {/* Profil */}
      <div style={{ fontSize:12, fontWeight:500, color:"#9E9E9E", letterSpacing:".05em", marginBottom:14, borderBottom:"1px solid #F5F5F5", paddingBottom:10 }}>PROFIL ANONYMISÉ</div>
      {([
        ["genre", "Votre genre", ["F — Femme", "M — Homme", "autre — Autre / Non-binaire"]],
        ["trancheAge", "Votre tranche d'âge", ["18-25", "26-35", "36-45", "46-55", "56+"]],
        ["niveau", "Votre niveau dans l'entreprise", ["direction — Direction générale / Cadre supérieur", "cadre — Cadre / Manager", "employe — Employé / Agent de maîtrise / Ouvrier"]],
        ["anciennete", "Votre ancienneté", ["<1 — Moins d'1 an", "1-3 — 1 à 3 ans", "3-7 — 3 à 7 ans", "7-15 — 7 à 15 ans", "15+ — Plus de 15 ans"]],
      ] as [string, string, string[]][]).map(([key, label, opts]) => (
        <div key={key} style={s.q}>
          <label style={s.qlabel}>{label}</label>
          <select style={s.sel} value={profil[key] ?? ""} onChange={e => setProfil(p => ({...p, [key]: e.target.value}))}>
            <option value="">— Facultatif —</option>
            {opts.map(o => { const [v, l] = o.includes(" — ") ? o.split(" — ") : [o, o]; return <option key={v} value={v}>{l}</option>; })}
          </select>
        </div>
      ))}

      <div style={{ fontSize:12, fontWeight:500, color:"#9E9E9E", letterSpacing:".05em", margin:"20px 0 14px", borderBottom:"1px solid #F5F5F5", paddingBottom:10 }}>SENTIMENT D'INCLUSION</div>
      <div style={{ fontSize:12, color:"#9E9E9E", marginBottom:14 }}>Échelle : 1 = Pas du tout d'accord · 4 = Tout à fait d'accord</div>

      {([
        ["sy01", "Globalement, vous sentez-vous inclus·e et respecté·e dans votre diversité (genre, origine, âge, handicap, religion…) au sein de votre entreprise ?"],
        ["gh03", "Les engagements de la direction en faveur de l'égalité Femmes/Hommes vous semblent-ils sincères et traduits en actions concrètes ?"],
        ["hh05", "Avez-vous le sentiment que les personnes en situation de handicap sont bien intégrées et respectées dans les équipes ?"],
        ["mh04", "Pensez-vous que les personnes de toutes origines ont autant de chances d'évoluer vers des postes à responsabilités ?"],
        ["ig02", "Les opportunités de formation et d'évolution vous paraissent-elles équitablement réparties entre les générations ?"],
      ] as [string, string][]).map(([key, question]) => (
        <div key={key} style={s.q}>
          <label style={s.qlabel}>{question}</label>
          <select style={s.sel} value={reponses[key] ?? ""} onChange={e => setReponses(r => ({...r, [key]: e.target.value}))}>
            <option value="">— Sans objet / Préfère ne pas répondre —</option>
            <option value="1">1 — Pas du tout d'accord</option>
            <option value="2">2 — Plutôt pas d'accord</option>
            <option value="3">3 — Plutôt d'accord</option>
            <option value="4">4 — Tout à fait d'accord</option>
          </select>
        </div>
      ))}

      <button style={s.btn} onClick={soumettre} disabled={submitting}>
        {submitting ? "Envoi en cours..." : "Soumettre mes réponses →"}
      </button>
      <div style={{ fontSize:11, color:"#BDBDBD", marginTop:12 }}>
        Vos réponses seront agrégées immédiatement et ne pourront jamais être associées à votre identité.
      </div>
    </div></div>
  );
}
