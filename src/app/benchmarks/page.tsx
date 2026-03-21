"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DIM_CONFIG = [
  { key:"DIM1", label:"Genre & Égalité + VIH/Sida",        max:38, color:"#1A237E" },
  { key:"DIM2", label:"Handicap + Médecine du travail",     max:26, color:"#00695C" },
  { key:"DIM3", label:"Multiculturalité & Anti-tribalisme", max:25, color:"#E65100" },
  { key:"DIM4", label:"Intergénérationnel + QVT",           max:11, color:"#2E7D32" },
];

const SCORE_KEYS: Record<string,string> = {
  DIM1:"scoreDim1Genre", DIM2:"scoreDim2Handicap", DIM3:"scoreDim3Multicult", DIM4:"scoreDim4Intergen"
};

const DIM_MAX: Record<string,number> = { DIM1:38, DIM2:26, DIM3:25, DIM4:11 };

function ConfidenceBadge({ score }: { score: number }) {
  const c = score >= 75 ? { bg:"#E8F5E9", color:"#2E7D32", label:"Fiable" }
           : score >= 50 ? { bg:"#FFF3E0", color:"#E65100", label:"Modéré" }
           : { bg:"#FFEBEE", color:"#B71C1C", label:"Non vérifié" };
  return (
    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:c.bg, color:c.color, fontWeight:500 }}>
      {c.label} {score}%
    </span>
  );
}

export default function BenchmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [monScore, setMonScore] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [secteursDispo, setSecteursDispo] = useState<any[]>([]);
  const [veilles, setVeilles] = useState<any[]>([]);
  const [statsSecteurs, setStatsSecteurs] = useState<any[]>([]);
  const [derniereVeille, setDerniereVeille] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [veilleLoading, setVeilleLoading] = useState(false);
  const [veilleResult, setVeilleResult] = useState<any>(null);
  const [onglet, setOnglet] = useState<"benchmark"|"veille">("benchmark");
  const [secteurFiltre, setSecteurFiltre] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/sessions").then(r => r.json()),
      fetch("/api/benchmarks").then(r => r.json()),
      fetch("/api/benchmarks/veille").then(r => r.json()),
    ]).then(([sessions, bench, veille]) => {
      if (sessions.sessions?.[0]?.scoreMmiCi) setMonScore(sessions.sessions[0]);
      setBenchmarks(bench.benchmarks ?? []);
      setSecteursDispo(bench.secteursDispo ?? []);
      setVeilles(veille.veilles ?? []);
      setStatsSecteurs(veille.statsSecteurs ?? []);
      if (veille.derniereVeille) setDerniereVeille(new Date(veille.derniereVeille.dateVeille).toLocaleDateString("fr-FR"));
      setLoading(false);
    });
  }, [status]);

  async function lancerVeille() {
    setVeilleLoading(true);
    setVeilleResult(null);
    const res = await fetch("/api/benchmarks/veille", { method: "POST" });
    const data = await res.json();
    setVeilleResult(data);
    setVeilleLoading(false);
    if (data.success) {
      const v = await fetch("/api/benchmarks/veille").then(r => r.json());
      setVeilles(v.veilles ?? []);
      setStatsSecteurs(v.statsSecteurs ?? []);
      if (v.derniereVeille) setDerniereVeille(new Date(v.derniereVeille.dateVeille).toLocaleDateString("fr-FR"));
    }
  }

  const benchGlobal = benchmarks.find(b => b.dimension === "GLOBAL");
  const monScoreGlobal = monScore?.scoreMmiCi?.scoreGlobal ?? 0;
  const veillesFiltrees = secteurFiltre ? veilles.filter(v => v.secteur === secteurFiltre) : veilles;

  if (status === "loading" || loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"system-ui" }}>
      <div style={{ color:"#1A237E" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:"#F5F5F5", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"#1A237E", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Benchmarks sectoriels CI</span>
        </div>
        <button onClick={() => router.push("/dashboard")}
          style={{ background:"transparent", border:"1px solid #3949AB", color:"#90CAF9", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>
          ← Tableau de bord
        </button>
      </div>

      {/* Onglets */}
      <div style={{ background:"#fff", borderBottom:"2px solid #E0E0E0", padding:"0 28px", display:"flex", gap:0 }}>
        {[
          { id:"benchmark", label:"📊 Benchmarks sectoriels CI" },
          { id:"veille",    label:"🔍 Veille web DEI CI" },
        ].map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id as any)}
            style={{ padding:"12px 20px", border:"none", background:"transparent", fontSize:13, fontWeight:500, cursor:"pointer",
              color: onglet === o.id ? "#1A237E" : "#9E9E9E",
              borderBottom: onglet === o.id ? "2px solid #1A237E" : "2px solid transparent",
              marginBottom: -2 }}>
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* ═══ ONGLET BENCHMARKS ═══ */}
        {onglet === "benchmark" && (
          <>
            {/* Mon positionnement global */}
            {monScore && benchGlobal && (
              <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:16 }}>
                  Mon positionnement — Score global vs secteur CI
                </div>
                <div style={{ display:"flex", gap:20, marginBottom:16, fontSize:11, color:"#9E9E9E" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:12, height:12, background:"#1A237E", borderRadius:2, display:"inline-block" }}></span>
                    Mon score
                  </span>
                  <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:12, height:12, background:"#C5CAE9", borderRadius:2, display:"inline-block" }}></span>
                    Zone P25–P75 secteur CI
                  </span>
                  <span>| Médiane sectorielle · n={benchGlobal.nbEntreprises} organisations</span>
                </div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>Score global MMI-CI</span>
                    <span style={{ fontSize:13, fontWeight:500, color:"#1A237E" }}>
                      {monScoreGlobal}/100
                      <span style={{ fontSize:11, color: monScoreGlobal >= benchGlobal.scoreMoyen ? "#2E7D32" : "#E65100", marginLeft:8 }}>
                        {monScoreGlobal >= benchGlobal.scoreMoyen ? "+" : ""}{Math.round(monScoreGlobal - benchGlobal.scoreMoyen)} vs médiane
                      </span>
                    </span>
                  </div>
                  <div style={{ position:"relative", height:20, background:"#F5F5F5", borderRadius:5, overflow:"hidden" }}>
                    <div style={{ position:"absolute", left:`${benchGlobal.scoreP25}%`, width:`${benchGlobal.scoreP75 - benchGlobal.scoreP25}%`, height:"100%", background:"#C5CAE9" }}/>
                    <div style={{ position:"absolute", left:`${benchGlobal.scoreMoyen}%`, width:2, height:"100%", background:"#757575", opacity:.6 }}/>
                    <div style={{ position:"absolute", left:0, width:`${monScoreGlobal}%`, height:"100%", background:"#1A237E", borderRadius:5, opacity:.85 }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#9E9E9E", marginTop:3 }}>
                    <span>0</span><span>Médiane : {Math.round(benchGlobal.scoreMoyen)}</span><span>100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Par dimension */}
            {monScore && (
              <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:16 }}>Comparaison par dimension</div>
                {DIM_CONFIG.map(dim => {
                  const bench = benchmarks.find(b => b.dimension === dim.key);
                  const s = monScore.scoreMmiCi?.[SCORE_KEYS[dim.key]] ?? 0;
                  const pct = Math.round((s / dim.max) * 100);
                  return (
                    <div key={dim.key} style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:500, color:dim.color }}>{dim.label}</span>
                        <span style={{ fontSize:12, fontWeight:500, color:dim.color }}>
                          {pct}%
                          {bench && <span style={{ fontSize:11, color: pct >= bench.scoreMoyen ? "#2E7D32" : "#E65100", marginLeft:8 }}>
                            {pct >= bench.scoreMoyen ? "+" : ""}{Math.round(pct - bench.scoreMoyen)} vs médiane
                          </span>}
                        </span>
                      </div>
                      <div style={{ position:"relative", height:14, background:"#F5F5F5", borderRadius:4, overflow:"hidden" }}>
                        {bench && <>
                          <div style={{ position:"absolute", left:`${bench.scoreP25}%`, width:`${bench.scoreP75 - bench.scoreP25}%`, height:"100%", background:"#E0E0E0" }}/>
                          <div style={{ position:"absolute", left:`${bench.scoreMoyen}%`, width:2, height:"100%", background:"#757575", opacity:.5 }}/>
                        </>}
                        <div style={{ width:`${pct}%`, height:"100%", background:dim.color, borderRadius:4, opacity:.85 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Secteurs disponibles */}
            <div style={{ background:"#fff", borderRadius:12, padding:24 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:14 }}>Secteurs CI dans le benchmark Haki</div>
              {secteursDispo.length > 0 ? (
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {secteursDispo.map((s: any) => (
                    <div key={s.secteur} style={{ padding:"8px 16px", background:"#E8EAF6", borderRadius:8, fontSize:12 }}>
                      <span style={{ fontWeight:500, color:"#1A237E" }}>{s.secteur}</span>
                      <span style={{ color:"#9E9E9E", marginLeft:8 }}>n={s.nbEntreprises}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:13, color:"#9E9E9E" }}>
                  Les benchmarks sectoriels CI seront disponibles à partir de 10 organisations diagnostiquées par secteur.
                </div>
              )}
              <div style={{ marginTop:14, fontSize:11, color:"#9E9E9E" }}>
                Données publiées uniquement si n ≥ 10 organisations · Mise à jour mensuelle automatique
              </div>
            </div>
          </>
        )}

        {/* ═══ ONGLET VEILLE ═══ */}
        {onglet === "veille" && (
          <>
            {/* Contrôles veille */}
            <div style={{ background:"#fff", borderRadius:12, padding:22, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:4 }}>
                    Veille web DEI CI — Recherche automatisée mensuelle
                  </div>
                  <div style={{ fontSize:12, color:"#9E9E9E" }}>
                    Scan des sources publiques CI (sites entreprises, CGECI, AFD, ONU Femmes, presse économique CI)
                  </div>
                  {derniereVeille && (
                    <div style={{ fontSize:12, color:"#2E7D32", marginTop:4 }}>
                      Dernière veille : {derniereVeille}
                    </div>
                  )}
                </div>
                <button onClick={lancerVeille} disabled={veilleLoading}
                  style={{ padding:"10px 20px", background:veilleLoading?"#9FA8DA":"#1A237E", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:veilleLoading?"default":"pointer", flexShrink:0 }}>
                  {veilleLoading ? "⏳ Veille en cours..." : "🔍 Lancer la veille CI"}
                </button>
              </div>

              {veilleLoading && (
                <div style={{ padding:"12px 16px", background:"#E8EAF6", borderRadius:8, fontSize:12, color:"#1A237E" }}>
                  Recherche en cours sur les sources CI publiques — cela peut prendre 30 à 60 secondes...
                </div>
              )}

              {veilleResult && (
                <div style={{ padding:"12px 16px", borderRadius:8, background:veilleResult.success?"#E8F5E9":"#FFF3E0", fontSize:13, color:veilleResult.success?"#2E7D32":"#E65100" }}>
                  {veilleResult.success
                    ? `✓ ${veilleResult.signauxTrouves} signaux DEI CI détectés et ajoutés`
                    : veilleResult.message ?? "Veille déjà effectuée ce mois-ci"
                  }
                </div>
              )}

              {/* Stats secteurs */}
              {statsSecteurs.length > 0 && (
                <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {statsSecteurs.map((s: any) => (
                    <button key={s.secteur} onClick={() => setSecteurFiltre(secteurFiltre === s.secteur ? "" : s.secteur)}
                      style={{ padding:"5px 12px", borderRadius:99, border:"1.5px solid", fontSize:12, cursor:"pointer",
                        background: secteurFiltre === s.secteur ? "#1A237E" : "#F5F5F5",
                        color: secteurFiltre === s.secteur ? "#fff" : "#424242",
                        borderColor: secteurFiltre === s.secteur ? "#1A237E" : "#E0E0E0" }}>
                      {s.secteur} ({s._count.id})
                    </button>
                  ))}
                  {secteurFiltre && (
                    <button onClick={() => setSecteurFiltre("")}
                      style={{ padding:"5px 12px", borderRadius:99, border:"1.5px solid #E0E0E0", fontSize:12, cursor:"pointer", background:"#FFEBEE", color:"#B71C1C", borderColor:"#EF9A9A" }}>
                      × Effacer filtre
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Résultats veille */}
            {veillesFiltrees.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:12, padding:32, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
                <div style={{ fontSize:15, fontWeight:500, color:"#1A237E", marginBottom:8 }}>
                  Aucun signal DEI CI disponible
                </div>
                <div style={{ fontSize:13, color:"#9E9E9E", marginBottom:20 }}>
                  Lancez une première veille pour scanner les sources publiques CI.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:12, color:"#9E9E9E", marginBottom:12 }}>
                  {veillesFiltrees.length} signal(s) DEI CI détecté(s)
                  {secteurFiltre ? ` · Secteur : ${secteurFiltre}` : ""}
                </div>
                {veillesFiltrees.map((v: any, i: number) => (
                  <div key={i} style={{ background:"#fff", borderRadius:10, padding:"16px 20px", marginBottom:10,
                    borderLeft:`4px solid ${v.scoreConfiance >= 75 ? "#2E7D32" : v.scoreConfiance >= 50 ? "#E65100" : "#B71C1C"}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div>
                        <span style={{ fontSize:13, fontWeight:500, color:"#212121" }}>{v.entreprise}</span>
                        <span style={{ fontSize:11, color:"#9E9E9E", marginLeft:8 }}>{v.secteur}</span>
                        {v.dimension && (
                          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"#E8EAF6", color:"#1A237E", marginLeft:6, fontWeight:500 }}>
                            {v.dimension}
                          </span>
                        )}
                      </div>
                      <ConfidenceBadge score={v.scoreConfiance} />
                    </div>
                    <div style={{ fontSize:13, color:"#424242", marginBottom:8, lineHeight:1.5 }}>{v.signalDei}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:11, color:"#1A237E", textDecoration:"none" }}>
                        {v.sourceTitre || v.sourceUrl} →
                      </a>
                      <span style={{ fontSize:11, color:"#9E9E9E" }}>
                        {new Date(v.dateVeille).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
