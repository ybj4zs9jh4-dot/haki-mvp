"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const QUESTIONS = [
  {
    section: "CNPS — Immatriculation & Cotisations",
    couleur: "#1A237E",
    questions: [
      { key: "cnpsImmatriculation", label: "Votre entreprise est-elle immatriculée à la CNPS et les cotisations sont-elles à jour ?", options: [{ val: "conforme", label: "Oui — immatriculée et cotisations à jour" }, { val: "regularisation", label: "En cours de régularisation" }, { val: "non_conforme", label: "Non" }] },
      { key: "cnpsDeclarations", label: "Tous vos salariés (CDI, CDD, journaliers réguliers) sont-ils déclarés à la CNPS ?", options: [{ val: "conforme", label: "Oui — tous déclarés" }, { val: "partiel", label: "Partiellement" }, { val: "non_conforme", label: "Non" }] },
      { key: "cnpsAtMp", label: "Les cotisations AT/MP (Accidents du Travail / Maladies Professionnelles) sont-elles à jour ?", options: [{ val: "conforme", label: "Oui — à jour" }, { val: "arrieres", label: "Des arriérés existent" }, { val: "non_conforme", label: "Non" }] },
      { key: "cnpsProcedureAtMp", label: "Avez-vous une procédure formalisée de déclaration des accidents du travail à la CNPS ?", options: [{ val: "oui", label: "Oui — procédure écrite et diffusée" }, { val: "sans_procedure", label: "Nous déclarons mais sans procédure formalisée" }, { val: "non", label: "Non" }] },
    ]
  },
  {
    section: "CMU — Couverture Maladie Universelle",
    couleur: "#00695C",
    questions: [
      { key: "cmuInformation", label: "Informez-vous systématiquement vos salariés de leurs droits à la CMU lors de l'embauche ?", options: [{ val: "conforme", label: "Oui — systématiquement à l'embauche" }, { val: "ponctuel", label: "Ponctuellement" }, { val: "non_conforme", label: "Non" }] },
      { key: "cmuPrecaires", label: "Les travailleurs précaires (stagiaires, CDD courts) sont-ils accompagnés pour leur couverture CMU ?", options: [{ val: "conforme", label: "Oui — tous accompagnés" }, { val: "partiel", label: "Partiellement" }, { val: "non_verifie", label: "Non vérifié" }] },
    ]
  },
  {
    section: "Médecine du Travail",
    couleur: "#E65100",
    questions: [
      { key: "medecinConvention", label: "Avez-vous signé une convention avec un médecin du travail agréé CNPS ?", options: [{ val: "conforme", label: "Oui — convention signée" }, { val: "non_conforme", label: "Non" }] },
      { key: "medecinVisites", label: "Les visites médicales périodiques sont-elles réalisées pour tous vos salariés ?", options: [{ val: "conforme", label: "Oui — pour tous les salariés" }, { val: "partiel", label: "Partiellement" }, { val: "non", label: "Non" }] },
    ]
  },
  {
    section: "Prévoyance & Convention Collective",
    couleur: "#2E7D32",
    questions: [
      { key: "prevoyanceMutuelle", label: "Vos salariés bénéficient-ils d'une mutuelle santé complémentaire ?", options: [{ val: "tous", label: "Oui — tous les salariés" }, { val: "cadres_seulement", label: "Cadres seulement" }, { val: "non", label: "Non" }] },
      { key: "prevoyanceDecesInvalidite", label: "Une assurance décès/invalidité est-elle en place pour vos salariés ?", options: [{ val: "tous", label: "Oui — tous les salariés" }, { val: "partiel", label: "Partiellement" }, { val: "non", label: "Non" }] },
      { key: "prevoyanceConventionCollective", label: "Les obligations de prévoyance de votre convention collective sectorielle CI sont-elles respectées ?", options: [{ val: "conforme", label: "Oui — entièrement respectées" }, { val: "en_cours", label: "En cours de mise en conformité" }, { val: "non_conforme", label: "Non" }] },
    ]
  },
];

const BADGE_CONFIG: Record<string, { label: string; couleur: string; bg: string; icon: string }> = {
  conforme:     { label: "Conforme",             couleur: "#2E7D32", bg: "#E8F5E9", icon: "✅" },
  en_cours:     { label: "En cours de conformité", couleur: "#E65100", bg: "#FFF3E0", icon: "⏳" },
  non_conforme: { label: "Non conforme",          couleur: "#B71C1C", bg: "#FFEBEE", icon: "⚠️" },
};

export default function SoclePage() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();
  const { status } = useSession();
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [resultat, setResultat] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/sessions/${sessionId}/socle`)
      .then(r => r.json())
      .then(d => { if (d.socle) setResultat(d.socle); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId, status]);

  const totalQuestions = QUESTIONS.flatMap(s => s.questions).length;
  const totalRepondues = Object.keys(reponses).length;
  const pct = Math.round((totalRepondues / totalQuestions) * 100);

  async function soumettre() {
    if (totalRepondues < totalQuestions) {
      alert("Veuillez répondre à toutes les questions avant de soumettre.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/sessions/${sessionId}/socle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reponses),
    });
    const data = await res.json();
    if (res.ok) {
      const detail = await fetch(`/api/sessions/${sessionId}/socle`).then(r => r.json());
      setResultat(detail.socle);
    }
    setSaving(false);
  }

  if (status === "unauthenticated") { router.push("/connexion"); return null; }
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui" }}>
      <div style={{ color: "#1A237E" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#F5F5F5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#B71C1C", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#FFC107", letterSpacing: 2 }}>HAKI</span>
          <span style={{ fontSize: 12, color: "#FFCDD2" }}>Diagnostic SOCLE — Conformité Légale CI</span>
        </div>
        <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", border: "1px solid #E57373", color: "#FFCDD2", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
          ← Retour au tableau de bord
        </button>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px" }}>

        {/* Intro */}
        <div style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#B71C1C", marginBottom: 8 }}>
            ⚖️ Conformité légale — Hors score MMI-CI
          </div>
          <div style={{ fontSize: 13, color: "#C62828", lineHeight: 1.6 }}>
            Ce diagnostic évalue vos obligations légales en Côte d'Ivoire (CNPS, CMU, Médecine du travail, Prévoyance).
            Il génère un <strong>badge synthétique</strong> et un <strong>plan de remédiation priorisé</strong>.
            Les résultats ne sont pas inclus dans le score MMI-CI — ils apparaissent en tête de votre rapport DEI.
          </div>
        </div>

        {/* Résultat si déjà évalué */}
        {resultat && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#424242", marginBottom: 12 }}>RÉSULTAT ACTUEL</div>
            <div style={{ background: BADGE_CONFIG[resultat.badgeGlobal]?.bg ?? "#F5F5F5", border: `1px solid ${BADGE_CONFIG[resultat.badgeGlobal]?.couleur ?? "#E0E0E0"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{BADGE_CONFIG[resultat.badgeGlobal]?.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: BADGE_CONFIG[resultat.badgeGlobal]?.couleur }}>
                  {BADGE_CONFIG[resultat.badgeGlobal]?.label}
                </div>
                <div style={{ fontSize: 12, color: "#757575", marginTop: 2 }}>Badge SOCLE — mis à jour à chaque soumission</div>
              </div>
            </div>
            {Array.isArray(resultat.alertes) && resultat.alertes.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#424242", marginBottom: 8 }}>ALERTES PRIORITAIRES</div>
                {(resultat.alertes as any[]).map((a: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderRadius: 8, background: a.niveau === "rouge" ? "#FFEBEE" : "#FFF3E0", marginBottom: 8, border: `1px solid ${a.niveau === "rouge" ? "#EF9A9A" : "#FFCC80"}` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.niveau === "rouge" ? "#B71C1C" : "#E65100", flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: a.niveau === "rouge" ? "#B71C1C" : "#E65100", marginBottom: 2 }}>{a.composante}</div>
                      <div style={{ fontSize: 12, color: "#424242", marginBottom: 4 }}>{a.message}</div>
                      <div style={{ fontSize: 11, color: "#757575" }}>→ {a.remediation}</div>
                      <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 2 }}>{a.articleLegal} · {a.delaiRecommande}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ height: 1, background: "#E0E0E0", margin: "20px 0" }} />
            <div style={{ fontSize: 13, color: "#757575", marginBottom: 16 }}>Vous pouvez mettre à jour vos réponses ci-dessous :</div>
          </div>
        )}

        {/* Questionnaire */}
        {!resultat && (
          <div style={{ background: "#E8EAF6", borderRadius: 8, padding: "8px 14px", marginBottom: 20, fontSize: 12, color: "#1A237E" }}>
            Progression : {totalRepondues} / {totalQuestions} questions · {pct}%
            <div style={{ marginTop: 6, height: 4, background: "#C5CAE9", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "#1A237E", transition: "width .3s" }} />
            </div>
          </div>
        )}

        {QUESTIONS.map(section => (
          <div key={section.section} style={{ marginBottom: 24 }}>
            <div style={{ background: section.couleur, borderRadius: "10px 10px 0 0", padding: "12px 18px" }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{section.section}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #E0E0E0", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "16px 18px" }}>
              {section.questions.map(q => (
                <div key={q.key} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #F5F5F5" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#212121", marginBottom: 10, lineHeight: 1.5 }}>{q.label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {q.options.map(opt => (
                      <label key={opt.val} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: `1.5px solid ${reponses[q.key] === opt.val ? section.couleur : "#E0E0E0"}`, borderRadius: 8, cursor: "pointer", background: reponses[q.key] === opt.val ? (section.couleur === "#1A237E" ? "#E8EAF6" : section.couleur === "#00695C" ? "#E0F2F1" : section.couleur === "#E65100" ? "#FFF3E0" : "#E8F5E9") : "#FAFAFA" }}>
                        <input type="radio" name={q.key} value={opt.val} checked={reponses[q.key] === opt.val} onChange={() => setReponses(r => ({ ...r, [q.key]: opt.val }))} style={{ accentColor: section.couleur }} />
                        <span style={{ fontSize: 13 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bouton soumettre */}
        <button onClick={soumettre} disabled={saving || totalRepondues < totalQuestions}
          style={{ width: "100%", padding: "14px 0", background: saving || totalRepondues < totalQuestions ? "#9E9E9E" : "#B71C1C", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: saving || totalRepondues < totalQuestions ? "default" : "pointer", marginBottom: 12 }}>
          {saving ? "Calcul en cours..." : totalRepondues < totalQuestions ? `Répondez aux ${totalQuestions - totalRepondues} question(s) restante(s)` : "Calculer mon badge SOCLE →"}
        </button>

        <div style={{ padding: "12px 16px", background: "#FFEBEE", borderRadius: 8, fontSize: 11, color: "#C62828", lineHeight: 1.6 }}>
          <strong>Référence légale :</strong> Loi n° 2018-984 (CNPS) · Loi CMU n° 2014-131 · Art. 12.3 CT CI (Médecine du travail) · Convention collective sectorielle CI.
          Ces obligations sont indépendantes du score MMI-CI.
        </div>
      </div>
    </div>
  );
}
