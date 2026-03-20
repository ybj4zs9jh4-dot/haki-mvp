"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BAREME, type ItemBareme } from "@/lib/scoring/bareme";

const ETAPES = [
  { dim: "DIM1", comp: "A", label: "Genre — Gouvernance & Politique", couleur: "#1A237E" },
  { dim: "DIM1", comp: "B", label: "Genre — Données & Parité", couleur: "#1A237E" },
  { dim: "DIM1", comp: "C", label: "Genre — Recrutement & Carrière", couleur: "#1A237E" },
  { dim: "DIM1", comp: "D", label: "Genre — Parentalité", couleur: "#1A237E" },
  { dim: "DIM1", comp: "E", label: "Genre — VSBG", couleur: "#1A237E" },
  { dim: "DIM1", comp: "F", label: "Genre — VIH/Sida (Art. 4 CT CI)", couleur: "#1A237E" },
  { dim: "DIM1", comp: "G", label: "Genre — Accompagnement carrière femmes", couleur: "#1A237E" },
  { dim: "DIM2", comp: "A", label: "Handicap — Gouvernance & Politique", couleur: "#00695C" },
  { dim: "DIM2", comp: "B", label: "Handicap — Recrutement inclusif PSH", couleur: "#00695C" },
  { dim: "DIM2", comp: "C", label: "Handicap — Sensibilisation", couleur: "#00695C" },
  { dim: "DIM2", comp: "D", label: "Handicap — Données PSH", couleur: "#00695C" },
  { dim: "DIM3", comp: "A", label: "Multiculturalité — Anti-tribalisme", couleur: "#E65100" },
  { dim: "DIM3", comp: "B", label: "Multiculturalité — Recrutement sans biais", couleur: "#E65100" },
  { dim: "DIM3", comp: "C", label: "Multiculturalité — Fait religieux CI", couleur: "#E65100" },
  { dim: "DIM4", comp: "A", label: "Intergénérationnel — Gouvernance", couleur: "#2E7D32" },
  { dim: "DIM4", comp: "B", label: "Intergénérationnel — AGEFOP", couleur: "#2E7D32" },
  { dim: "DIM4", comp: "C", label: "Intergénérationnel — QVT & Sécurité", couleur: "#2E7D32" },
];

function getItems(dim: string, comp: string): ItemBareme[] {
  return BAREME.filter(item => item.dimension === dim && item.composante === comp && item.type !== "indicateur_informatif");
}

function QuestionItem({ item, valeur, nbActions, onChange, onActionsChange }: {
  item: ItemBareme; valeur: string; nbActions: number;
  onChange: (v: string) => void; onActionsChange: (n: number) => void;
}) {
  return (
    <div style={{ border: "1px solid #E0E0E0", borderRadius: 10, padding: "18px 20px", marginBottom: 14, background: "#fff" }}>
      <div style={{ fontSize: 14, color: "#212121", marginBottom: 14, lineHeight: 1.5, fontWeight: 500 }}>
        {item.libelle}
      </div>
      {item.type === "binaire" && item.bareme && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(item.bareme).map(([key]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1.5px solid ${valeur === key ? "#1A237E" : "#E0E0E0"}`, borderRadius: 8, cursor: "pointer", background: valeur === key ? "#E8EAF6" : "#FAFAFA" }}>
              <input type="radio" name={item.code} value={key} checked={valeur === key} onChange={() => onChange(key)} style={{ accentColor: "#1A237E" }} />
              <span style={{ fontSize: 13 }}>{key.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      )}
      {item.type === "actions_multiples" && (
        <div>
          <div style={{ fontSize: 13, color: "#616161", marginBottom: 10 }}>Nombre d'actions mises en place :</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: (item.maxActions ?? 0) + 1 }, (_, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: `1.5px solid ${nbActions === i ? "#1A237E" : "#E0E0E0"}`, borderRadius: 8, cursor: "pointer", background: nbActions === i ? "#E8EAF6" : "#FAFAFA" }}>
                <input type="radio" name={`${item.code}_n`} checked={nbActions === i} onChange={() => onActionsChange(i)} style={{ accentColor: "#1A237E" }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{i}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {(item.type === "indicateur_seuil" || item.type === "indicateur_seuil_inverse") && (
        <div>
          <div style={{ fontSize: 13, color: "#616161", marginBottom: 8 }}>
            {item.type === "indicateur_seuil_inverse" ? "Renseignez votre valeur (plus elle est basse, mieux c'est)" : "Renseignez votre valeur en %"}
          </div>
          <input type="number" value={valeur} onChange={e => onChange(e.target.value)} placeholder="Ex : 35" min={0} max={100}
            style={{ padding: "10px 14px", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 14, width: 160 }} />
        </div>
      )}
    </div>
  );
}

export default function QuestionnairePage() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();
  const { status } = useSession();
  const [etapeIndex, setEtapeIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [nbActions, setNbActions] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading] = useState(true);

  const etape = ETAPES[etapeIndex];
  const items = getItems(etape.dim, etape.comp);
  const isLast = etapeIndex === ETAPES.length - 1;

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/sessions/${sessionId}/reponses`).then(r => r.json()).then(data => {
      if (data.reponses) {
        const rm: Record<string, string> = {};
        const am: Record<string, number> = {};
        data.reponses.forEach((r: any) => {
          rm[r.itemCode] = r.valeurBrute;
          if (r.valeurBrute.includes(",")) am[r.itemCode] = r.valeurBrute.split(",").filter(Boolean).length;
        });
        setReponses(rm); setNbActions(am); setProgression(data.progression ?? 0);
        const repSet = new Set(Object.keys(rm));
        for (let i = 0; i < ETAPES.length; i++) {
          if (!getItems(ETAPES[i].dim, ETAPES[i].comp).every(it => repSet.has(it.code))) { setEtapeIndex(i); break; }
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sessionId, status]);

  const sauvegarder = useCallback(async () => {
    setSaving(true);
    const reps = items.filter(item => reponses[item.code] !== undefined || nbActions[item.code] !== undefined).map(item => ({
      itemCode: item.code,
      valeurBrute: item.type === "actions_multiples"
        ? Array.from({ length: nbActions[item.code] ?? 0 }, (_, i) => `action_${i+1}`).join(",")
        : reponses[item.code] ?? "",
      nbActions: item.type === "actions_multiples" ? nbActions[item.code] ?? 0 : undefined,
    })).filter(r => r.valeurBrute !== "");
    if (reps.length > 0) {
      const d = await fetch(`/api/sessions/${sessionId}/reponses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reponses: reps }) }).then(r => r.json());
      if (d.progression) setProgression(d.progression);
    }
    setSaving(false);
  }, [items, reponses, nbActions, sessionId]);

  async function suivant() {
    await sauvegarder();
    if (isLast) {
      setSaving(true);
      await fetch(`/api/sessions/${sessionId}/score`, { method: "POST" });
      setSaving(false);
      router.push("/dashboard");
    } else { setEtapeIndex(i => i + 1); window.scrollTo(0, 0); }
  }

  async function precedent() {
    await sauvegarder(); setEtapeIndex(i => i - 1); window.scrollTo(0, 0);
  }

  if (status === "unauthenticated") { router.push("/connexion"); return null; }
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui" }}><div style={{ color: "#1A237E" }}>Chargement...</div></div>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#F5F5F5", minHeight: "100vh" }}>
      <div style={{ background: "#1A237E", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#FFC107", letterSpacing: 2 }}>HAKI</span>
          <span style={{ fontSize: 12, color: "#9FA8DA" }}>Questionnaire ORGANISATION</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#C5CAE9" }}>Étape {etapeIndex + 1} / {ETAPES.length}</span>
          <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", border: "1px solid #3949AB", color: "#90CAF9", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
            Sauvegarder & quitter
          </button>
        </div>
      </div>
      <div style={{ height: 4, background: "#283593" }}>
        <div style={{ height: "100%", background: "#FFC107", width: `${Math.round(((etapeIndex + 1) / ETAPES.length) * 100)}%`, transition: "width .3s" }} />
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ background: etape.couleur, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{etape.dim.replace("DIM", "DIMENSION ")} · COMPOSANTE {etape.comp}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "#fff" }}>{etape.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#FFC107" }}>{etapeIndex + 1}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>/ {ETAPES.length}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            {["DIM1","DIM2","DIM3","DIM4"].map((dim, i) => (
              <div key={dim} style={{ padding: "4px 10px", borderRadius: 99, background: etape.dim === dim ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", fontSize: 11, color: etape.dim === dim ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: etape.dim === dim ? 500 : 400 }}>
                {["Genre","Handicap","Multiculturalité","Intergénérationnel"][i]}
              </div>
            ))}
          </div>
        </div>
        {progression > 0 && (
          <div style={{ background: "#E8F5E9", borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: 12, color: "#2E7D32" }}>
            ✓ Session en cours — {progression}% complété · Réponses sauvegardées automatiquement
          </div>
        )}
        {items.map(item => (
          <QuestionItem key={item.code} item={item} valeur={reponses[item.code] ?? ""} nbActions={nbActions[item.code] ?? 0}
            onChange={v => setReponses(r => ({ ...r, [item.code]: v }))}
            onActionsChange={n => setNbActions(a => ({ ...a, [item.code]: n }))} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #E0E0E0" }}>
          <button onClick={precedent} disabled={etapeIndex === 0 || saving}
            style={{ padding: "11px 22px", background: etapeIndex === 0 ? "#F5F5F5" : "#fff", color: etapeIndex === 0 ? "#BDBDBD" : "#424242", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 14, cursor: etapeIndex === 0 ? "default" : "pointer", fontWeight: 500 }}>
            ← Précédent
          </button>
          <div style={{ fontSize: 12, color: "#9E9E9E" }}>{saving ? "Sauvegarde en cours..." : `${items.filter(i => reponses[i.code] || nbActions[i.code]).length} / ${items.length} répondues`}</div>
          <button onClick={suivant} disabled={saving}
            style={{ padding: "11px 22px", background: saving ? "#9FA8DA" : etape.couleur, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: saving ? "default" : "pointer", fontWeight: 500 }}>
            {saving ? "Sauvegarde..." : isLast ? "Terminer & calculer le score →" : "Suivant →"}
          </button>
        </div>
        <div style={{ marginTop: 20, padding: "12px 16px", background: "#E8EAF6", borderRadius: 8, fontSize: 11, color: "#3949AB", lineHeight: 1.6 }}>
          Répondez en vous basant sur la situation réelle de votre organisation. Vos réponses sont sauvegardées automatiquement à chaque étape.
        </div>
      </div>
    </div>
  );
}
