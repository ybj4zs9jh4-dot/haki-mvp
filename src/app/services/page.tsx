"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SERVICES_INCLUS = [
  {
    id: "diagnostic",
    emoji: "📋",
    nom: "Diagnostic DEI",
    sous: "SOCLE + Score MMI-CI",
    desc: "Évaluez votre conformité légale CI (SOCLE) et mesurez votre maturité DEI sur 100 points selon les 4 dimensions du MMI-CI. Rapport PDF exécutif et analytique inclus.",
    statut: "actif",
    lien: "/dashboard",
    color: "#1A237E",
    bg: "#E8EAF6",
  },
  {
    id: "barometre",
    emoji: "📊",
    nom: "Baromètre COLLABORATEURS",
    sous: "Enquête anonyme interne",
    desc: "Mesurez le sentiment d'inclusion de vos collaborateurs via des liens anonymes conformes ARTCI. Résultats agrégés disponibles dès 5 répondants.",
    statut: "actif",
    lien: "/dashboard",
    color: "#00695C",
    bg: "#E0F2F1",
  },
  {
    id: "managers",
    emoji: "🧭",
    nom: "Auto-diagnostic MANAGERS",
    sous: "Diagnostic confidentiel encadrants",
    desc: "Vos managers évaluent leurs pratiques managériales inclusives en toute confidentialité. Score /112 points, restitution individuelle.",
    statut: "actif",
    lien: "/dashboard",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    id: "benchmarks",
    emoji: "📈",
    nom: "Benchmarks & Veille DEI CI",
    sous: "Positionnement sectoriel",
    desc: "Comparez votre score MMI-CI aux entreprises de votre secteur en Côte d'Ivoire. Veille DEI mensuelle sur 339 entreprises CI suivies.",
    statut: "actif",
    lien: "/benchmarks",
    color: "#E65100",
    bg: "#FFF3E0",
  },
  {
    id: "calendrier",
    emoji: "📅",
    nom: "Calendrier DEI & Communication",
    sous: "Événements annuels + OSC CI",
    desc: "Identifiez les journées clés DEI nationales et internationales pertinentes pour la CI, avec activités suggérées, plans de communication et partenaires OSC recommandés.",
    statut: "actif",
    lien: "/dashboard",
    color: "#4A148C",
    bg: "#F3E5F5",
  },
];

const SERVICES_COMPLEMENTAIRES = [
  {
    id: "documents",
    emoji: "📄",
    nom: "Production Documentaire DEI",
    sous: "Stratégie · Charte · Politique · PAG",
    desc: "Production sur mesure de vos documents DEI internes : Stratégie Genre, Charte Diversité & Inclusion, Politique Genre, Plan d'Action Genre et Mécanisme de Suivi-Évaluation. Trois niveaux : Standard, Enrichi, Premium.",
    statut: "actif",
    lien: "/documents",
    color: "#1A237E",
    bg: "#E8EAF6",
  },
  {
    id: "formation",
    emoji: "🎓",
    nom: "Formation Haki MANAGERS",
    sous: "Présentiel & e-learning",
    desc: "Modules de formation DEI certifiants pour vos encadrants : diversité & inclusion en milieu professionnel CI, VIH/Sida Art. 4 CT CI, anti-tribalisme, management intergénérationnel. En présentiel à Abidjan ou en e-learning.",
    statut: "actif",
    lien: "/formation",
    color: "#F57F17",
    bg: "#FFFDE7",
  },
  {
    id: "comm",
    emoji: "📣",
    nom: "Accompagnement Communication Digitale",
    sous: "Stratégie · Contenu · Visibilité DEI",
    desc: "Haki vous accompagne dans votre stratégie de communication DEI externe : rédaction de contenus, gestion des journées clés, communication LinkedIn employeur, rapports RSE et positionnement DEI auprès de vos parties prenantes.",
    statut: "actif",
    lien: "/communication",
    color: "#00838F",
    bg: "#E0F7FA",
  },
  {
    id: "s3",
    emoji: "🤝",
    nom: "Forfait ONG & Bailleurs",
    sous: "Licence multi · Forfait projet",
    desc: "Solution dédiée aux organisations humanitaires, bailleurs de fonds et programmes de développement : licence multi-organisations, diagnostic DEI adapté aux critères ODD, reporting bailleurs (AFD, ONU Femmes, Banque Mondiale), benchmark CEDEAO.",
    statut: "bientot",
    lien: null,
    color: "#BF360C",
    bg: "#FBE9E7",
  },
];

const STATUT_CONFIG: Record<string,{label:string;color:string;bg:string}> = {
  actif:   { label:"Actif",   color:"#2E7D32", bg:"#E8F5E9" },
  bientot: { label:"Bientôt", color:"#E65100", bg:"#FFF3E0" },
};

function ServiceCard({ s, onNavigate }: { s: any; onNavigate: (lien:string|null)=>void }) {
  const st = STATUT_CONFIG[s.statut];
  return (
    <div style={{
      background:"#fff", borderRadius:12, border:`1px solid ${s.color}20`,
      padding:"20px", display:"flex", flexDirection:"column" as const, gap:10,
      boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
          {s.emoji}
        </div>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:st.bg, color:st.color }}>
          {st.label}
        </span>
      </div>
      <div>
        <div style={{ fontSize:14, fontWeight:700, color:"#1A237E", marginBottom:2 }}>{s.nom}</div>
        <div style={{ fontSize:11, color:s.color, fontWeight:500 }}>{s.sous}</div>
      </div>
      <div style={{ fontSize:12, color:"#616161", lineHeight:1.65, flex:1 }}>{s.desc}</div>
      <button
        onClick={() => onNavigate(s.lien)}
        disabled={!s.lien}
        style={{
          padding:"8px 16px",
          background: s.lien ? s.color : "#F5F5F5",
          color: s.lien ? "#fff" : "#BDBDBD",
          border:"none", borderRadius:7, fontSize:12, fontWeight:600,
          cursor: s.lien ? "pointer" : "default",
          textAlign:"center" as const,
        }}>
        {s.lien ? "Accéder →" : "Disponible prochainement"}
      </button>
    </div>
  );
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  if (status === "loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div style={{ color:"#1A237E", fontSize:15 }}>Chargement...</div>
    </div>
  );

  const css = `
    .srv-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .srv-grid-3 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media (max-width: 1024px) {
      .srv-grid   { grid-template-columns: repeat(2, 1fr); }
      .srv-grid-3 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .srv-grid   { grid-template-columns: 1fr; }
      .srv-grid-3 { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#F0F2F5", minHeight:"100vh" }}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"#1A237E", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:20, fontWeight:700, color:"#FFC107", letterSpacing:3 }}>HAKI</span>
          <div style={{ width:1, height:18, background:"#3949AB" }}/>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Plateforme DEI · Côte d'Ivoire</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => router.push("/dashboard")}
            style={{ background:"#283593", color:"#90CAF9", border:"none", borderRadius:6, padding:"6px 14px", fontSize:11, fontWeight:500, cursor:"pointer" }}>
            ← Tableau de bord
          </button>
          <div style={{ textAlign:"right" as const }}>
            <div style={{ fontSize:11, color:"#fff", fontWeight:500 }}>{user?.organisationNom}</div>
            <div style={{ fontSize:10, color:"#7986CB" }}>{user?.role?.toUpperCase()}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl:"/connexion" })}
            style={{ background:"transparent", color:"#9FA8DA", border:"1px solid #3949AB", borderRadius:6, padding:"5px 12px", fontSize:11, cursor:"pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 20px" }}>

        {/* ── Intro ── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".12em", textTransform:"uppercase" as const, marginBottom:6 }}>
            Nos Services
          </div>
          <h1 style={{ fontSize:26, fontWeight:700, color:"#1A237E", margin:"0 0 8px", lineHeight:1.2 }}>
            Tout ce que Haki fait pour votre organisation
          </h1>
          <p style={{ fontSize:14, color:"#757575", maxWidth:620, lineHeight:1.7, margin:0 }}>
            Haki est une plateforme SaaS DEI ancrée dans le Code du Travail CI 2025.
            Votre abonnement donne accès à l'ensemble des outils de diagnostic, de mesure et de pilotage DEI.
            Des services complémentaires sont disponibles pour aller plus loin.
          </p>
        </div>

        {/* ── Segments ── */}
        <div style={{ display:"flex", gap:8, marginBottom:32, flexWrap:"wrap" as const }}>
          {[
            { label:"S1 — Grandes Entreprises & Multinationales", color:"#1A237E", bg:"#E8EAF6" },
            { label:"S2 — PME formelles CI", color:"#00695C", bg:"#E0F2F1" },
            { label:"S3 — ONG & Bailleurs", color:"#BF360C", bg:"#FBE9E7" },
          ].map(s => (
            <span key={s.label} style={{ fontSize:11, fontWeight:600, padding:"5px 14px", borderRadius:99, background:s.bg, color:s.color, border:`1px solid ${s.color}30` }}>
              {s.label}
            </span>
          ))}
        </div>

        {/* ══ BLOC 1 : INCLUS ══ */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:"#1A237E" }}/>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#1A237E" }}>Inclus dans votre abonnement</div>
              <div style={{ fontSize:11, color:"#9E9E9E" }}>5 outils · Accès immédiat · S1 et S2</div>
            </div>
          </div>
          <div className="srv-grid">
            {SERVICES_INCLUS.map(s => <ServiceCard key={s.id} s={s} onNavigate={(l) => l && router.push(l)}/>)}
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:32 }}>
          <div style={{ flex:1, height:1, background:"#E0E0E0" }}/>
          <span style={{ fontSize:11, color:"#BDBDBD", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase" as const }}>Services complémentaires</span>
          <div style={{ flex:1, height:1, background:"#E0E0E0" }}/>
        </div>

        {/* ══ BLOC 2 : COMPLÉMENTAIRES ══ */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:"#FFC107" }}/>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#212121" }}>Services complémentaires</div>
              <div style={{ fontSize:11, color:"#9E9E9E" }}>4 services · Sur commande · Tous segments</div>
            </div>
          </div>
          <div className="srv-grid-3">
            {SERVICES_COMPLEMENTAIRES.map(s => <ServiceCard key={s.id} s={s} onNavigate={(l) => l && router.push(l)}/>)}
          </div>
        </div>

        {/* ── Contact ── */}
        <div style={{ background:"#1A237E", borderRadius:14, padding:"28px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#FFC107", marginBottom:4 }}>
              Un projet spécifique ? Une question sur nos offres ?
            </div>
            <div style={{ fontSize:13, color:"#C5CAE9" }}>
              Contactez l'équipe Haki pour un accompagnement personnalisé.
            </div>
          </div>
          <a href="mailto:contact@haki.ci"
            style={{ padding:"11px 24px", background:"#FFC107", color:"#1A237E", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none", flexShrink:0 }}>
            contact@haki.ci →
          </a>
        </div>
      </div>
    </div>
  );
}
