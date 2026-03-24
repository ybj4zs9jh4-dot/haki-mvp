"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const PROBLEMES = [
  {
    emoji: "⚠️",
    titre: "Une conformité légale difficile à maîtriser",
    desc: "Obligations sociales non respectées, clauses discriminatoires dans les contrats, absence de suivi médical des employés — les risques juridiques et financiers sont réels. La plupart des responsables RH ne savent pas précisément où ils en sont.",
    color: "#B71C1C",
    bg: "#FFEBEE",
  },
  {
    emoji: "📊",
    titre: "Aucun outil adapté à votre contexte local",
    desc: "Les outils existants sont conçus pour les entreprises européennes ou américaines. Ils ne tiennent pas compte de vos réalités culturelles, sociales et réglementaires. Résultat : des diagnostics inadaptés et des recommandations inapplicables.",
    color: "#E65100",
    bg: "#FFF3E0",
  },
  {
    emoji: "🤝",
    titre: "Une pression croissante des partenaires",
    desc: "Bailleurs de fonds, investisseurs, partenaires internationaux exigent des indicateurs mesurables sur l'inclusion et l'égalité. Sans outil certifiable, les organisations perdent des marchés et des financements.",
    color: "#1A237E",
    bg: "#E8EAF6",
  },
];

const SERVICES = [
  { emoji:"📋", titre:"Diagnostic Inclusion", desc:"Évaluez votre conformité et mesurez votre maturité sur 100 points", color:"#1A237E" },
  { emoji:"📊", titre:"Baromètre Collaborateurs", desc:"Enquête anonyme pour mesurer le sentiment d'inclusion de vos équipes", color:"#00695C" },
  { emoji:"🧭", titre:"Diagnostic Managers", desc:"Évaluation confidentielle des pratiques managériales inclusives", color:"#2E7D32" },
  { emoji:"📈", titre:"Benchmarks sectoriels", desc:"Comparez-vous aux organisations de votre secteur", color:"#E65100" },
  { emoji:"📄", titre:"Production Documentaire", desc:"Stratégie, Charte, Politique Genre, Plan d'Action sur mesure", color:"#4A148C" },
  { emoji:"📣", titre:"Communication Digitale", desc:"Contenus inclusion prêts à publier sur 5 réseaux — IA + Sur mesure", color:"#00838F" },
  { emoji:"🎓", titre:"Formation des Managers", desc:"33 thématiques · Présentiel, en ligne ou hybride", color:"#F57F17" },
];

const CHIFFRES = [
  { valeur:"5",  label:"Niveaux de maturité inclusive", icon:"⭐" },
  { valeur:"67", label:"Questions du diagnostic organisation", icon:"📋" },
  { valeur:"33", label:"Thématiques de formation disponibles", icon:"🎓" },
  { valeur:"4",  label:"Dimensions d'évaluation de l'inclusion", icon:"🔍" },
  { valeur:"7",  label:"Services intégrés dans une plateforme", icon:"💡" },
  { valeur:"3",  label:"Types d'organisations accompagnées", icon:"🏢" },
];

const TEMOIGNAGES = [
  {
    nom: "Directrice des Ressources Humaines",
    org: "Groupe bancaire international",
    texte: "Haki nous a permis de structurer notre démarche inclusion en moins de 3 mois. Le rapport a convaincu notre siège de financer notre programme égalité femmes-hommes.",
    score: 78,
  },
  {
    nom: "Directeur des Ressources Humaines",
    org: "PME industrielle",
    texte: "On ne savait pas qu'on avait des manquements sur le suivi médical de nos employés. Haki nous a évité une mise en demeure de l'inspection du travail.",
    score: 54,
  },
  {
    nom: "Responsable Responsabilité Sociale",
    org: "Filiale d'une multinationale",
    texte: "Le benchmark sectoriel est une vraie valeur ajoutée. On peut enfin se comparer à nos pairs locaux, pas à des entreprises dans un contexte complètement différent.",
    score: 82,
  },
];

const RESSOURCES = [
  { emoji:"📘", titre:"Guide obligations sociales & non-discrimination", desc:"Les points clés que tout responsable RH doit maîtriser pour éviter les risques juridiques", tag:"Légal" },
  { emoji:"📗", titre:"Référentiel de maturité inclusive", desc:"Comprendre les 5 niveaux d'évaluation et les 4 dimensions mesurées par Haki", tag:"Méthode" },
  { emoji:"📙", titre:"Checklist conformité sociale", desc:"30 points à vérifier avant votre prochain contrôle ou audit social", tag:"Outil" },
  { emoji:"📕", titre:"Inclusion & partenaires institutionnels", desc:"Ce qu'attendent les bailleurs de fonds et investisseurs de vos indicateurs d'inclusion", tag:"Partenaires" },
];

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    .land-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    .land-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
    .land-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
    .land-btn { border: none; border-radius: 8px; font-family: system-ui; cursor: pointer; font-weight: 600; transition: all .2s; }
    .land-btn:hover { opacity: .9; transform: translateY(-1px); }
    .srv-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
    .srv-card { transition: all .2s; }
    @media(max-width:900px){
      .land-grid-3 { grid-template-columns: 1fr; }
      .land-grid-4 { grid-template-columns: 1fr 1fr; }
      .land-grid-2 { grid-template-columns: 1fr; }
    }
    @media(max-width:600px){
      .land-grid-4 { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", color:"#212121" }}>
      <style>{css}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(13,13,43,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        padding:"0 40px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"all .3s",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22, fontWeight:700, color:"#FFC107", letterSpacing:4 }}>HAKI</span>
          <span style={{ fontSize:10, color:"#9FA8DA", letterSpacing:".1em", textTransform:"uppercase" as const }}>Genre & Inclusion Sociale</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button className="land-btn" onClick={() => router.push("/connexion")}
            style={{ padding:"8px 18px", background:"transparent", color:"#C5CAE9", border:"1px solid rgba(255,255,255,0.15)", fontSize:13 }}>
            Connexion
          </button>
          <button className="land-btn" onClick={() => router.push("/inscription")}
            style={{ padding:"8px 20px", background:"#FFC107", color:"#1A237E", fontSize:13 }}>
            Démarrer →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background:"linear-gradient(135deg, #0D0D2B 0%, #1A237E 60%, #0D47A1 100%)",
        minHeight:"100vh", display:"flex", alignItems:"center",
        padding:"100px 40px 80px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:.04, backgroundImage:"repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize:"30px 30px" }}/>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", position:"relative" }}>

          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"rgba(255,193,7,0.15)", border:"1px solid rgba(255,193,7,0.3)", borderRadius:99, marginBottom:28 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"#FFC107", letterSpacing:".12em", textTransform:"uppercase" as const }}>
              ✨ Plateforme Genre et Inclusion Sociale — 7 services intégrés
            </span>
          </div>

          <h1 style={{ fontSize:"clamp(36px, 5vw, 64px)", fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:20, maxWidth:800 }}>
            Redonner à chacun<br/>
            <span style={{ color:"#FFC107" }}>sa juste part.</span>
          </h1>

          <p style={{ fontSize:"clamp(15px, 2vw, 18px)", color:"#C5CAE9", lineHeight:1.7, marginBottom:36, maxWidth:580 }}>
            Haki mesure, pilote et améliore la maturité inclusive de votre organisation.
            Conformité sociale · Score d'inclusion · Benchmarks sectoriels · Formation des managers.
          </p>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap" as const, marginBottom:52 }}>
            <button className="land-btn" onClick={() => router.push("/inscription")}
              style={{ padding:"14px 32px", background:"#FFC107", color:"#1A237E", fontSize:15 }}>
              Démarrer gratuitement →
            </button>
            <button className="land-btn" onClick={() => router.push("/connexion")}
              style={{ padding:"14px 28px", background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", fontSize:15 }}>
              Se connecter
            </button>
          </div>

          <div style={{ display:"flex", gap:32, flexWrap:"wrap" as const }}>
            {[
              { val:"Score /100", label:"Niveau de maturité inclusive" },
              { val:"7 services", label:"Intégrés dans une plateforme" },
              { val:"33 formations", label:"Thématiques disponibles" },
              { val:"3 segments", label:"Entreprises, PME, ONG" },
            ].map(s => (
              <div key={s.val}>
                <div style={{ fontSize:18, fontWeight:700, color:"#FFC107" }}>{s.val}</div>
                <div style={{ fontSize:11, color:"#9FA8DA", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 PROBLÈMES ── */}
      <section style={{ background:"#F8F9FA", padding:"80px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center" as const, marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".15em", textTransform:"uppercase" as const, marginBottom:10 }}>Pourquoi Haki ?</div>
            <h2 style={{ fontSize:"clamp(24px, 3vw, 36px)", fontWeight:700, color:"#1A237E", marginBottom:12 }}>
              3 défis que chaque organisation doit relever
            </h2>
            <p style={{ fontSize:15, color:"#757575", maxWidth:560, margin:"0 auto", lineHeight:1.7 }}>
              Des réalités que chaque responsable RH et dirigeant connaît — mais auxquelles aucun outil intégré n'avait encore répondu.
            </p>
          </div>
          <div className="land-grid-3">
            {PROBLEMES.map((p,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:28, border:`1px solid ${p.color}20`, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ width:48, height:48, borderRadius:12, background:p.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>
                  {p.emoji}
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:p.color, marginBottom:10 }}>{p.titre}</h3>
                <p style={{ fontSize:13, color:"#616161", lineHeight:1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHIFFRES ── */}
      <section style={{ background:"#1A237E", padding:"64px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center" as const, marginBottom:40 }}>
            <h2 style={{ fontSize:"clamp(22px, 3vw, 32px)", fontWeight:700, color:"#fff", marginBottom:8 }}>
              Haki en chiffres
            </h2>
            <p style={{ fontSize:14, color:"#9FA8DA" }}>La plateforme inclusion la plus complète pour votre contexte</p>
          </div>
          <div className="land-grid-3">
            {CHIFFRES.map((c,i) => (
              <div key={i} style={{ textAlign:"center" as const, padding:"24px 16px", background:"rgba(255,255,255,0.06)", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontSize:40, fontWeight:700, color:"#FFC107", lineHeight:1, marginBottom:6 }}>{c.valeur}</div>
                <div style={{ fontSize:12, color:"#9FA8DA", lineHeight:1.5 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 SERVICES ── */}
      <section style={{ background:"#fff", padding:"80px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center" as const, marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".15em", textTransform:"uppercase" as const, marginBottom:10 }}>Nos services</div>
            <h2 style={{ fontSize:"clamp(24px, 3vw, 36px)", fontWeight:700, color:"#1A237E", marginBottom:12 }}>
              7 services intégrés dans une seule plateforme
            </h2>
            <p style={{ fontSize:15, color:"#757575", maxWidth:500, margin:"0 auto", lineHeight:1.7 }}>
              Du diagnostic à la communication, en passant par la formation — tout ce dont votre organisation a besoin pour piloter son inclusion.
            </p>
          </div>
          <div className="land-grid-4">
            {SERVICES.map((s,i) => (
              <div key={i} className="srv-card" style={{ padding:"22px 18px", borderRadius:12, border:`1px solid ${s.color}20`, background:"#FAFAFA", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{s.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700, color:s.color, marginBottom:6 }}>{s.titre}</div>
                <div style={{ fontSize:11, color:"#757575", lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center" as const, marginTop:32 }}>
            <button className="land-btn" onClick={() => router.push("/inscription")}
              style={{ padding:"13px 32px", background:"#1A237E", color:"#fff", fontSize:14 }}>
              Accéder à tous les services →
            </button>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{ background:"#F8F9FA", padding:"80px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center" as const, marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".15em", textTransform:"uppercase" as const, marginBottom:10 }}>Témoignages</div>
            <h2 style={{ fontSize:"clamp(24px, 3vw, 36px)", fontWeight:700, color:"#1A237E" }}>
              Ce que disent nos clients
            </h2>
          </div>
          <div className="land-grid-3">
            {TEMOIGNAGES.map((t,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:28, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div style={{ fontSize:28, color:"#FFC107" }}>"</div>
                  <div style={{ textAlign:"center" as const, background:"#E8EAF6", borderRadius:10, padding:"8px 14px" }}>
                    <div style={{ fontSize:20, fontWeight:700, color:"#1A237E" }}>{t.score}</div>
                    <div style={{ fontSize:9, color:"#9E9E9E" }}>Score /100</div>
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#424242", lineHeight:1.7, marginBottom:16, fontStyle:"italic" }}>
                  {t.texte}
                </p>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1A237E" }}>{t.nom}</div>
                  <div style={{ fontSize:11, color:"#9E9E9E" }}>{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── À PROPOS ── */}
      <section style={{ background:"#fff", padding:"80px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="land-grid-2" style={{ alignItems:"center", gap:60 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".15em", textTransform:"uppercase" as const, marginBottom:12 }}>À propos de Haki</div>
              <h2 style={{ fontSize:"clamp(24px, 3vw, 36px)", fontWeight:700, color:"#1A237E", marginBottom:16, lineHeight:1.2 }}>
                Un référentiel d'inclusion construit pour votre réalité
              </h2>
              <p style={{ fontSize:14, color:"#616161", lineHeight:1.8, marginBottom:16 }}>
                <strong style={{ color:"#1A237E" }}>Haki</strong> signifie "le droit" et "la part légitime". C'est cette conviction qui fonde notre mission : chaque collaborateur a droit à sa juste place dans l'organisation.
              </p>
              <p style={{ fontSize:14, color:"#616161", lineHeight:1.8, marginBottom:16 }}>
                Nous avons construit un <strong>modèle de maturité inclusive propriétaire</strong> — un référentiel rigoureux qui mesure votre niveau d'inclusion sur 100 points, à travers 4 dimensions clés : égalité de genre, inclusion des personnes en situation de handicap, diversité culturelle et cohésion intergénérationnelle.
              </p>
              <p style={{ fontSize:14, color:"#616161", lineHeight:1.8 }}>
                Haki s'adresse aux <strong>grandes entreprises et multinationales</strong>, aux <strong>PME et entreprises de taille intermédiaire</strong> et aux <strong>organisations non gouvernementales et bailleurs de fonds</strong> qui veulent transformer leurs obligations sociales en leviers de performance.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
              {[
                { emoji:"📐", titre:"Rigueur méthodologique", desc:"Modèle basé sur les standards internationaux de mesure de la maturité organisationnelle" },
                { emoji:"🌍", titre:"Adapté à votre contexte", desc:"Référentiel construit pour les réalités culturelles, sociales et réglementaires de votre environnement" },
                { emoji:"🤝", titre:"Partenaires de terrain", desc:"Réseau d'experts RH, juristes du travail, spécialistes inclusion et formateurs certifiés" },
                { emoji:"🔒", titre:"Confidentialité garantie", desc:"Données des collaborateurs anonymisées · Aucune information individuelle partagée · Hébergement sécurisé" },
              ].map((v,i) => (
                <div key={i} style={{ display:"flex", gap:14, padding:"14px 16px", background:"#F8F9FA", borderRadius:10 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{v.emoji}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginBottom:3 }}>{v.titre}</div>
                    <div style={{ fontSize:12, color:"#757575", lineHeight:1.5 }}>{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESSOURCES ── */}
      <section style={{ background:"#F8F9FA", padding:"80px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center" as const, marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".15em", textTransform:"uppercase" as const, marginBottom:10 }}>Ressources</div>
            <h2 style={{ fontSize:"clamp(24px, 3vw, 36px)", fontWeight:700, color:"#1A237E", marginBottom:12 }}>
              Guides & outils gratuits pour les responsables RH
            </h2>
            <p style={{ fontSize:15, color:"#757575", maxWidth:500, margin:"0 auto" }}>
              Disponibles dès votre inscription sur la plateforme Haki.
            </p>
          </div>
          <div className="land-grid-2">
            {RESSOURCES.map((r,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:12, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", display:"flex", gap:14, alignItems:"flex-start" }}>
                <span style={{ fontSize:28, flexShrink:0 }}>{r.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1A237E" }}>{r.titre}</div>
                    <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99, background:"#E8EAF6", color:"#1A237E" }}>{r.tag}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#757575", lineHeight:1.6 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center" as const, marginTop:32 }}>
            <button className="land-btn" onClick={() => router.push("/inscription")}
              style={{ padding:"12px 28px", background:"#1A237E", color:"#fff", fontSize:13 }}>
              Accéder aux ressources gratuitement →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background:"linear-gradient(135deg, #0D0D2B 0%, #1A237E 100%)", padding:"80px 40px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" as const }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🚀</div>
          <h2 style={{ fontSize:"clamp(26px, 4vw, 42px)", fontWeight:700, color:"#fff", marginBottom:16, lineHeight:1.2 }}>
            Prêt à mesurer votre niveau d'inclusion ?
          </h2>
          <p style={{ fontSize:15, color:"#C5CAE9", lineHeight:1.7, marginBottom:32 }}>
            Commencez par notre diagnostic de conformité sociale. Résultats immédiats. Aucune carte bancaire requise.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" as const, marginBottom:24 }}>
            <button className="land-btn" onClick={() => router.push("/inscription")}
              style={{ padding:"15px 36px", background:"#FFC107", color:"#1A237E", fontSize:15 }}>
              Démarrer gratuitement →
            </button>
            <a href="mailto:contact@haki.ci"
              style={{ padding:"15px 28px", background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, fontSize:15, fontWeight:600, textDecoration:"none", display:"inline-flex", alignItems:"center" }}>
              Nous contacter
            </a>
          </div>
          <div style={{ fontSize:12, color:"#4A5568" }}>contact@haki.ci</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#080820", padding:"40px 40px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:32, marginBottom:32 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:"#FFC107", letterSpacing:4, marginBottom:8 }}>HAKI</div>
              <div style={{ fontSize:12, color:"#4A5568", lineHeight:1.7, maxWidth:260 }}>
                Plateforme Genre et Inclusion Sociale. Mesurez, pilotez et améliorez la maturité inclusive de votre organisation.
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:".12em", textTransform:"uppercase" as const, marginBottom:12 }}>Plateforme</div>
              {["Diagnostic inclusion","Baromètre équipes","Benchmarks","Documents","Formation","Communication"].map(l => (
                <div key={l} style={{ fontSize:12, color:"#4A5568", marginBottom:6, cursor:"pointer" }} onClick={() => router.push("/connexion")}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:".12em", textTransform:"uppercase" as const, marginBottom:12 }}>Ressources</div>
              {["Guide obligations sociales","Référentiel d'inclusion","Checklist conformité","Inclusion & partenaires"].map(l => (
                <div key={l} style={{ fontSize:12, color:"#4A5568", marginBottom:6, cursor:"pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:".12em", textTransform:"uppercase" as const, marginBottom:12 }}>Contact</div>
              <div style={{ fontSize:12, color:"#4A5568", marginBottom:6 }}>contact@haki.ci</div>
              <div style={{ fontSize:12, color:"#4A5568", marginBottom:16 }}>www.haki.ci</div>
              <button className="land-btn" onClick={() => router.push("/inscription")}
                style={{ padding:"9px 18px", background:"#FFC107", color:"#1A237E", fontSize:12 }}>
                Démarrer →
              </button>
            </div>
          </div>
          <div style={{ borderTop:"1px solid #1A1A3E", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:10 }}>
            <div style={{ fontSize:11, color:"#2D3748" }}>© 2026 Haki · Tous droits réservés</div>
            <div style={{ fontSize:11, color:"#2D3748" }}>Données confidentielles · Hébergement sécurisé</div>
          </div>
        </div>
      </footer>
    </div>
  );
}