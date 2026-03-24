"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BLOCS = [
  {
    id:"b1", emoji:"⚖️", titre:"Fondamentaux DEI & cadre légal CI", color:"#1A237E", bg:"#E8EAF6",
    themes:[
      { id:"b1t1", titre:"Introduction à la DEI en entreprise ivoirienne", duree:"3h", niveau:"Sensibilisation", public:"Tous" },
      { id:"b1t2", titre:"Code du Travail CI 2025 — obligations non-discrimination (Art. 4, 12, 23, 41)", duree:"7h", niveau:"Pratique", public:"DRH · Managers" },
      { id:"b1t3", titre:"Le score MMI-CI — comprendre et piloter sa maturité DEI", duree:"3h", niveau:"Pratique", public:"DRH · Dirigeants" },
      { id:"b1t4", titre:"Conformité CNPS/CMU/Médecine du travail — responsabilités du manager", duree:"3h", niveau:"Pratique", public:"Managers · DRH" },
    ]
  },
  {
    id:"b2", emoji:"♀️", titre:"Genre & Égalité professionnelle", color:"#AD1457", bg:"#FCE4EC",
    themes:[
      { id:"b2t1", titre:"Management inclusif genre — biais inconscients et pratiques équitables", duree:"7h", niveau:"Pratique", public:"Managers" },
      { id:"b2t2", titre:"Parité et promotion des femmes cadres en CI — leviers concrets", duree:"3h", niveau:"Pratique", public:"Dirigeants · DRH" },
      { id:"b2t3", titre:"Prévention du harcèlement sexuel en milieu professionnel CI", duree:"7h", niveau:"Pratique", public:"Managers · DRH" },
      { id:"b2t4", titre:"Congés maternité/paternité — droits, gestion RH, continuité d'équipe", duree:"3h", niveau:"Sensibilisation", public:"Managers · DRH" },
      { id:"b2t5", titre:"Équité salariale F/H — diagnostic, correction, communication", duree:"7h", niveau:"Expert", public:"DRH · Dirigeants" },
    ]
  },
  {
    id:"b3", emoji:"🔴", titre:"VIH/Sida en milieu professionnel", color:"#C62828", bg:"#FFEBEE",
    themes:[
      { id:"b3t1", titre:"Art. 4 CT CI — non-discrimination des PVVIH, droits et devoirs du manager", duree:"3h", niveau:"Sensibilisation", public:"Managers · DRH" },
      { id:"b3t2", titre:"Gestion de la confidentialité médicale en entreprise", duree:"3h", niveau:"Pratique", public:"DRH · Managers" },
      { id:"b3t3", titre:"Prévention VIH en milieu professionnel — campagnes, dépistage, Espace Confiance", duree:"3h", niveau:"Sensibilisation", public:"Tous" },
      { id:"b3t4", titre:"Stigmatisation et inclusion des PVVIH — posture managériale", duree:"7h", niveau:"Pratique", public:"Managers" },
    ]
  },
  {
    id:"b4", emoji:"♿", titre:"Handicap & accessibilité", color:"#00695C", bg:"#E0F2F1",
    themes:[
      { id:"b4t1", titre:"Art. 12 CT CI — obligations légales PSH, quotas, accessibilité", duree:"3h", niveau:"Sensibilisation", public:"DRH · Managers" },
      { id:"b4t2", titre:"Intégration et maintien dans l'emploi des PSH — pratiques RH", duree:"7h", niveau:"Pratique", public:"DRH · Managers" },
      { id:"b4t3", titre:"Aménagements raisonnables — cadre légal CI et mise en œuvre", duree:"3h", niveau:"Pratique", public:"DRH" },
      { id:"b4t4", titre:"Sensibilisation au handicap — changer le regard dans les équipes", duree:"3h", niveau:"Sensibilisation", public:"Tous" },
      { id:"b4t5", titre:"Médecine du travail et suivi des travailleurs vulnérables", duree:"7h", niveau:"Expert", public:"DRH · Médecin travail" },
    ]
  },
  {
    id:"b5", emoji:"🤝", titre:"Multiculturalité & anti-tribalisme", color:"#E65100", bg:"#FFF3E0",
    themes:[
      { id:"b5t1", titre:"Comprendre le tribalisme en entreprise ivoirienne — mécanismes et impacts", duree:"3h", niveau:"Sensibilisation", public:"Tous" },
      { id:"b5t2", titre:"Recrutement sans discrimination ethnique — grilles objectives, anonymisation", duree:"7h", niveau:"Pratique", public:"DRH · Managers" },
      { id:"b5t3", titre:"Management d'équipes multiculturelles en CI — CEDEAO, expatriés, diversité nationale", duree:"7h", niveau:"Pratique", public:"Managers" },
      { id:"b5t4", titre:"Communication interculturelle et cohésion d'équipe", duree:"3h", niveau:"Pratique", public:"Managers · Tous" },
      { id:"b5t5", titre:"Fait religieux en entreprise CI — cadre légal, gestion des pratiques", duree:"3h", niveau:"Pratique", public:"Managers · DRH" },
    ]
  },
  {
    id:"b6", emoji:"🌱", titre:"Intergénérationnel & QVT", color:"#2E7D32", bg:"#E8F5E9",
    themes:[
      { id:"b6t1", titre:"Management intergénérationnel — Baby-boomers, Gen X, Millennials, Gen Z en CI", duree:"7h", niveau:"Pratique", public:"Managers" },
      { id:"b6t2", titre:"Qualité de Vie et Conditions de Travail (QVCT) — diagnostic et plan d'action", duree:"7h", niveau:"Expert", public:"DRH · Dirigeants" },
      { id:"b6t3", titre:"Prévention des risques psychosociaux (RPS) en entreprise CI", duree:"7h", niveau:"Expert", public:"DRH · Managers" },
      { id:"b6t4", titre:"Onboarding inclusif — intégration des nouveaux collaborateurs", duree:"3h", niveau:"Pratique", public:"Managers · DRH" },
      { id:"b6t5", titre:"Mentorat et transmission des savoirs — programme structuré", duree:"3h", niveau:"Pratique", public:"Managers · Dirigeants" },
    ]
  },
  {
    id:"b7", emoji:"🧭", titre:"Leadership inclusif & pratiques managériales", color:"#1565C0", bg:"#E3F2FD",
    themes:[
      { id:"b7t1", titre:"Masculinité positive et leadership bienveillant — formation RHEEG-CI", duree:"7h", niveau:"Pratique", public:"Managers · Dirigeants" },
      { id:"b7t2", titre:"Feedback inclusif et entretiens d'évaluation équitables", duree:"3h", niveau:"Pratique", public:"Managers" },
      { id:"b7t3", titre:"Recrutement sans biais — techniques et outils pratiques", duree:"7h", niveau:"Pratique", public:"DRH · Managers" },
      { id:"b7t4", titre:"Animation de réunions inclusives — participation équitable", duree:"3h", niveau:"Sensibilisation", public:"Managers" },
      { id:"b7t5", titre:"Gestion des conflits liés à la discrimination — posture et protocole", duree:"7h", niveau:"Expert", public:"DRH · Managers" },
    ]
  },
  {
    id:"b8", emoji:"📣", titre:"Communication & engagement DEI", color:"#00838F", bg:"#E0F7FA",
    themes:[
      { id:"b8t1", titre:"Communiquer sa démarche DEI en interne — outils et messages clés", duree:"3h", niveau:"Pratique", public:"DRH · Comm" },
      { id:"b8t2", titre:"RSE et DEI — intégration dans la stratégie de communication externe", duree:"7h", niveau:"Expert", public:"Dirigeants · Comm" },
      { id:"b8t3", titre:"Réseaux sociaux employeur et marque employeur DEI", duree:"3h", niveau:"Pratique", public:"Comm · DRH" },
      { id:"b8t4", titre:"Reporting DEI pour les bailleurs et partenaires institutionnels", duree:"7h", niveau:"Expert", public:"DRH · Dirigeants" },
    ]
  },
  {
    id:"b9", emoji:"🎯", titre:"Formations spécialisées", color:"#4A148C", bg:"#F3E5F5",
    themes:[
      { id:"b9t1", titre:"VBG en milieu professionnel — prévention, détection, protocole Orange the World", duree:"7h", niveau:"Pratique", public:"Managers · DRH" },
      { id:"b9t2", titre:"Protection des données RH et ARTCI — conformité et bonnes pratiques", duree:"3h", niveau:"Pratique", public:"DRH · DSI" },
      { id:"b9t3", titre:"DEI pour les PME ivoiriennes — démarche simplifiée et ROI immédiat", duree:"3h", niveau:"Sensibilisation", public:"Dirigeants · DRH" },
      { id:"b9t4", titre:"DEI pour les ONG et bailleurs — critères ODD, reporting AFD/ONU Femmes", duree:"7h", niveau:"Expert", public:"Dirigeants · DRH" },
    ]
  },
];

const MODALITES = [
  { id:"presentiel", label:"Présentiel",  emoji:"🏢", desc:"Formation en salle, interactions directes" },
  { id:"enligne",    label:"En ligne",    emoji:"💻", desc:"Visioconférence — Zoom ou Teams" },
  { id:"hybride",    label:"Hybride",     emoji:"🔀", desc:"Participants en salle + à distance" },
];
const LIEUX = [
  { id:"entreprise", label:"Dans vos locaux",      emoji:"🏛️", desc:"Haki se déplace chez vous" },
  { id:"hors",       label:"Hors entreprise",       emoji:"🏨", desc:"Salle louée par Haki" },
  { id:"haki",       label:"Site Haki — Abidjan",   emoji:"📍", desc:"Nos locaux à Abidjan" },
];
const PARTICIPANTS = [
  { id:"p10",  label:"Moins de 10",  coef:1.0 },
  { id:"p30",  label:"10 à 30",      coef:1.3 },
  { id:"p60",  label:"30 à 60",      coef:1.6 },
  { id:"p60p", label:"Plus de 60",   coef:2.0 },
];
const INTERVENANTS = [
  { id:"haki",   label:"Formateur Haki",                  desc:"Expert DEI Haki certifié",                      coef:1.0 },
  { id:"expert", label:"Formateur Haki + Expert invité",  desc:"Juriste CI, médecin travail, RHEEG-CI…",         coef:1.5 },
  { id:"seul",   label:"Expert invité coordonné Haki",    desc:"Spécialiste externe, logistique Haki",           coef:1.3 },
];
const DUREES = [
  { id:"demi",  label:"Demi-journée",     heures:"3h",   coef:1.0 },
  { id:"jour",  label:"Journée complète", heures:"7h",   coef:1.8 },
  { id:"multi", label:"Multi-sessions",   heures:"2-5j", coef:3.5 },
];
const LANGUES = [
  { id:"fr",  label:"Français",         coef:1.0 },
  { id:"bil", label:"Bilingue FR / EN", coef:1.2 },
];
const CERTIFICATIONS = [
  { id:"none",   label:"Sans attestation",               coef:1.00 },
  { id:"attest", label:"Attestation de participation",   coef:1.05 },
  { id:"certif", label:"Certification Haki DEI Manager", coef:1.15 },
];
const LIVRABLES = [
  { id:"none",    label:"Sans livrable",                            coef:1.00 },
  { id:"rapport", label:"Rapport + évaluation des acquis",          coef:1.10 },
  { id:"plan",    label:"Rapport + Plan d'action DEI personnalisé", coef:1.20 },
];

const TARIF_BASE = 150000;
const NIVEAU_COLOR: Record<string,{color:string;bg:string}> = {
  "Sensibilisation":{ color:"#2E7D32", bg:"#E8F5E9" },
  "Pratique":       { color:"#E65100", bg:"#FFF3E0" },
  "Expert":         { color:"#1A237E", bg:"#E8EAF6" },
};

function calculerDevis(config: any): number {
  const p = PARTICIPANTS.find(x=>x.id===config.participants);
  const i = INTERVENANTS.find(x=>x.id===config.intervenants);
  const d = DUREES.find(x=>x.id===config.duree);
  const l = LANGUES.find(x=>x.id===config.langue);
  const c = CERTIFICATIONS.find(x=>x.id===config.certification);
  const lv = LIVRABLES.find(x=>x.id===config.livrable);
  const lieu = config.lieu==="hors"?1.2:config.lieu==="haki"?0.9:1.0;
  const coef=(p?.coef??1)*(i?.coef??1)*(d?.coef??1)*(l?.coef??1)*(c?.coef??1)*(lv?.coef??1)*lieu;
  return Math.round(TARIF_BASE*coef/5000)*5000;
}

function fmt(n:number){ return n.toLocaleString("fr-FR")+" FCFA"; }

export default function FormationPage() {
  const { data:session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [blocOuvert, setBlocOuvert] = useState<string|null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [config, setConfig] = useState({
    modalite:"presentiel", lieu:"entreprise", participants:"p10",
    intervenants:"haki", duree:"demi", langue:"fr",
    certification:"none", livrable:"none",
  });
  const [contexte, setContexte] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(()=>{
    if(status==="unauthenticated") router.push("/connexion");
  },[status,router]);

  if(status==="loading") return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>
      <div style={{color:"#1A237E",fontSize:15}}>Chargement...</div>
    </div>
  );

  const devis = calculerDevis(config);
  const nb = sel.length;

  function toggleTheme(id:string){
    setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  }
  function set(k:string,v:string){ setConfig(p=>({...p,[k]:v})); }

  function soumettre(){
    if(nb===0){ setErreur("Sélectionnez au moins une thématique."); return; }
    setEnvoye(true);
  }

  const css=`
    *{box-sizing:border-box;}
    .fg{display:grid;grid-template-columns:1fr 380px;gap:20px;align-items:start;}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
    .hb{border:none;border-radius:8px;font-family:system-ui;cursor:pointer;font-weight:500;transition:opacity .15s;}
    .hb:hover{opacity:.88;}
    .hb:disabled{opacity:.5;cursor:default;}
    @media(max-width:1024px){.fg{grid-template-columns:1fr;}.g3{grid-template-columns:1fr 1fr;}}
    @media(max-width:600px){.g2{grid-template-columns:1fr;}.g3{grid-template-columns:1fr;}}
  `;

  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",background:"#F0F2F5",minHeight:"100vh"}}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{background:"#1A237E",padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:20,fontWeight:700,color:"#FFC107",letterSpacing:3}}>HAKI</span>
          <div style={{width:1,height:18,background:"#3949AB"}}/>
          <span style={{fontSize:12,color:"#9FA8DA"}}>Formation Haki MANAGERS</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>router.push("/dashboard")} style={{background:"#283593",color:"#90CAF9",border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,fontWeight:500,cursor:"pointer"}}>← Tableau de bord</button>
          <button onClick={()=>router.push("/services")} style={{background:"transparent",color:"#FFC107",border:"1px solid #FFC107",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Nos services</button>
          <button onClick={()=>signOut({callbackUrl:"/connexion"})} style={{background:"transparent",color:"#9FA8DA",border:"1px solid #3949AB",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>Déconnexion</button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 20px"}}>

        {/* INTRO */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".12em",textTransform:"uppercase" as const,marginBottom:4}}>Formation Haki MANAGERS</div>
          <h1 style={{fontSize:22,fontWeight:700,color:"#1A237E",margin:"0 0 6px"}}>Formations DEI sur mesure pour vos encadrants</h1>
          <p style={{fontSize:13,color:"#757575",margin:0,lineHeight:1.6,maxWidth:680}}>
            33 thématiques ancrées dans le Code du Travail CI 2025 · Formats adaptés à votre contexte · Formateurs experts DEI CI · Certification disponible
          </p>
        </div>

        {/* COMPTEUR */}
        {nb>0&&(
          <div style={{background:"#1A237E",borderRadius:10,padding:"10px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:"#fff",fontWeight:500}}>✓ {nb} thématique{nb>1?"s":""} sélectionnée{nb>1?"s":""}</span>
            <button className="hb" onClick={()=>setSel([])} style={{padding:"4px 10px",background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:11}}>Tout désélectionner</button>
          </div>
        )}

        <div className="fg">

          {/* GAUCHE — Catalogue */}
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#424242",marginBottom:12,letterSpacing:".05em"}}>ÉTAPE 1 — Choisissez vos thématiques</div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {BLOCS.map(bloc=>(
                <div key={bloc.id} style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                  <button className="hb"
                    onClick={()=>setBlocOuvert(blocOuvert===bloc.id?null:bloc.id)}
                    style={{width:"100%",padding:"14px 18px",textAlign:"left" as const,background:blocOuvert===bloc.id?bloc.bg:"#fff",borderRadius:0,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>{bloc.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:bloc.color}}>{bloc.titre}</div>
                      <div style={{fontSize:10,color:"#9E9E9E",marginTop:1}}>
                        {bloc.themes.length} thématiques
                        {bloc.themes.filter(t=>sel.includes(t.id)).length>0&&(
                          <span style={{color:bloc.color,fontWeight:600}}> · {bloc.themes.filter(t=>sel.includes(t.id)).length} sélectionnée{bloc.themes.filter(t=>sel.includes(t.id)).length>1?"s":""}</span>
                        )}
                      </div>
                    </div>
                    <span style={{fontSize:11,color:"#BDBDBD"}}>{blocOuvert===bloc.id?"▲":"▼"}</span>
                  </button>
                  {blocOuvert===bloc.id&&(
                    <div style={{padding:"8px 14px 14px",borderTop:`1px solid ${bloc.color}20`}}>
                      {bloc.themes.map(theme=>{
                        const isSel=sel.includes(theme.id);
                        const niv=NIVEAU_COLOR[theme.niveau];
                        return(
                          <div key={theme.id} onClick={()=>toggleTheme(theme.id)}
                            style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:8,cursor:"pointer",marginBottom:4,
                              background:isSel?bloc.bg:"#F8F9FA",border:`1.5px solid ${isSel?bloc.color:"transparent"}`,transition:"all .1s"}}>
                            <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,background:isSel?bloc.color:"#E0E0E0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                              {isSel&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:isSel?600:400,color:isSel?bloc.color:"#212121",lineHeight:1.4}}>{theme.titre}</div>
                              <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap" as const}}>
                                <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:niv.bg,color:niv.color,fontWeight:600}}>{theme.niveau}</span>
                                <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#F5F5F5",color:"#757575"}}>⏱ {theme.duree}</span>
                                <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#F5F5F5",color:"#757575"}}>👤 {theme.public}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DROITE — Configurateur */}
          <div style={{position:"sticky" as const,top:70}}>
            {!envoye?(
              <>
                <div style={{fontSize:12,fontWeight:700,color:"#424242",marginBottom:12,letterSpacing:".05em"}}>ÉTAPE 2 — Configurez votre formation</div>
                <div style={{background:"#fff",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column" as const,gap:16}}>

                  {/* Modalité */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Modalité</div>
                    <div className="g3">
                      {MODALITES.map(m=>(
                        <button key={m.id} className="hb" onClick={()=>set("modalite",m.id)}
                          style={{padding:"10px 8px",textAlign:"center" as const,fontSize:11,fontWeight:600,
                            background:config.modalite===m.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.modalite===m.id?"#1A237E":"transparent"}`,
                            color:config.modalite===m.id?"#1A237E":"#424242"}}>
                          <div style={{fontSize:16,marginBottom:3}}>{m.emoji}</div>
                          {m.label}
                          <div style={{fontSize:9,color:"#9E9E9E",marginTop:2}}>{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lieu */}
                  {config.modalite!=="enligne"&&(
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Lieu</div>
                      <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
                        {LIEUX.map(l=>(
                          <button key={l.id} className="hb" onClick={()=>set("lieu",l.id)}
                            style={{padding:"9px 12px",textAlign:"left" as const,fontSize:12,
                              background:config.lieu===l.id?"#E8EAF6":"#F5F5F5",
                              border:`1.5px solid ${config.lieu===l.id?"#1A237E":"transparent"}`,
                              color:config.lieu===l.id?"#1A237E":"#424242",fontWeight:config.lieu===l.id?600:400}}>
                            {l.emoji} {l.label} <span style={{fontSize:10,color:"#9E9E9E"}}>{l.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Participants */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Participants</div>
                    <div className="g2">
                      {PARTICIPANTS.map(p=>(
                        <button key={p.id} className="hb" onClick={()=>set("participants",p.id)}
                          style={{padding:"9px 8px",textAlign:"center" as const,fontSize:11,fontWeight:600,
                            background:config.participants===p.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.participants===p.id?"#1A237E":"transparent"}`,
                            color:config.participants===p.id?"#1A237E":"#424242"}}>
                          👥 {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intervenants */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Intervenants</div>
                    <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
                      {INTERVENANTS.map(i=>(
                        <button key={i.id} className="hb" onClick={()=>set("intervenants",i.id)}
                          style={{padding:"9px 12px",textAlign:"left" as const,fontSize:12,
                            background:config.intervenants===i.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.intervenants===i.id?"#1A237E":"transparent"}`,
                            color:config.intervenants===i.id?"#1A237E":"#424242",fontWeight:config.intervenants===i.id?600:400}}>
                          🎓 {i.label}
                          <div style={{fontSize:10,color:"#9E9E9E",marginTop:1}}>{i.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Durée */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Durée</div>
                    <div className="g3">
                      {DUREES.map(d=>(
                        <button key={d.id} className="hb" onClick={()=>set("duree",d.id)}
                          style={{padding:"9px 8px",textAlign:"center" as const,fontSize:11,fontWeight:600,
                            background:config.duree===d.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.duree===d.id?"#1A237E":"transparent"}`,
                            color:config.duree===d.id?"#1A237E":"#424242"}}>
                          <div style={{fontSize:13,marginBottom:2}}>⏱</div>
                          <div>{d.label}</div>
                          <div style={{fontSize:10,color:"#9E9E9E"}}>{d.heures}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Langue */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Langue</div>
                    <div className="g2">
                      {LANGUES.map(l=>(
                        <button key={l.id} className="hb" onClick={()=>set("langue",l.id)}
                          style={{padding:"9px 8px",textAlign:"center" as const,fontSize:11,fontWeight:600,
                            background:config.langue===l.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.langue===l.id?"#1A237E":"transparent"}`,
                            color:config.langue===l.id?"#1A237E":"#424242"}}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Certification */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Certification</div>
                    <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
                      {CERTIFICATIONS.map(c=>(
                        <button key={c.id} className="hb" onClick={()=>set("certification",c.id)}
                          style={{padding:"8px 12px",textAlign:"left" as const,fontSize:11,
                            background:config.certification===c.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.certification===c.id?"#1A237E":"transparent"}`,
                            color:config.certification===c.id?"#1A237E":"#424242",fontWeight:config.certification===c.id?600:400}}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Livrable */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>Livrable post-formation</div>
                    <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
                      {LIVRABLES.map(l=>(
                        <button key={l.id} className="hb" onClick={()=>set("livrable",l.id)}
                          style={{padding:"8px 12px",textAlign:"left" as const,fontSize:11,
                            background:config.livrable===l.id?"#E8EAF6":"#F5F5F5",
                            border:`1.5px solid ${config.livrable===l.id?"#1A237E":"transparent"}`,
                            color:config.livrable===l.id?"#1A237E":"#424242",fontWeight:config.livrable===l.id?600:400}}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contexte */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#9E9E9E",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:8}}>
                      Contexte <span style={{fontWeight:400,textTransform:"none" as const,fontSize:10}}>(optionnel)</span>
                    </div>
                    <textarea value={contexte} onChange={e=>setContexte(e.target.value)}
                      placeholder="Ex : Formation pour 25 managers suite à notre diagnostic Haki (score 58/100). Accent particulier souhaité sur le tribalisme dans le recrutement..."
                      rows={3} style={{width:"100%",padding:"10px 12px",border:"1px solid #E0E0E0",borderRadius:8,fontSize:12,fontFamily:"system-ui",resize:"vertical" as const,boxSizing:"border-box" as const}}/>
                  </div>

                  {/* Devis */}
                  <div style={{background:"linear-gradient(135deg,#1A237E 0%,#283593 100%)",borderRadius:10,padding:"16px 18px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#9FA8DA",letterSpacing:".1em",textTransform:"uppercase" as const,marginBottom:6}}>Devis estimatif</div>
                    <div style={{fontSize:28,fontWeight:700,color:"#FFC107",marginBottom:2}}>{fmt(devis)}</div>
                    <div style={{fontSize:10,color:"#7986CB",lineHeight:1.5}}>
                      Estimation indicative · Devis définitif sous 48h
                      {nb>1&&` · ${nb} thématiques`}
                    </div>
                  </div>

                  {erreur&&(
                    <div style={{padding:"8px 12px",background:"#FFEBEE",borderRadius:7,color:"#B71C1C",fontSize:12}}>⚠️ {erreur}</div>
                  )}

                  <button className="hb" onClick={soumettre}
                    style={{padding:"14px",background:"#1A237E",color:"#fff",fontSize:14,fontWeight:700}}>
                    Soumettre ma demande →
                  </button>

                  <div style={{fontSize:10,color:"#BDBDBD",textAlign:"center" as const}}>Aucun engagement avant validation du devis définitif</div>
                </div>
              </>
            ):(
              <div style={{background:"#fff",borderRadius:12,padding:32,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",textAlign:"center" as const}}>
                <div style={{fontSize:48,marginBottom:14}}>✅</div>
                <div style={{fontSize:16,fontWeight:700,color:"#2E7D32",marginBottom:8}}>Demande envoyée</div>
                <div style={{fontSize:13,color:"#757575",lineHeight:1.7,marginBottom:16}}>
                  L'équipe Haki a reçu votre demande pour <strong>{user?.organisationNom}</strong>.
                  Vous recevrez un devis définitif sous <strong>48h</strong>.
                </div>
                <div style={{background:"#E8EAF6",borderRadius:8,padding:"12px 16px",marginBottom:20,textAlign:"left" as const}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#1A237E",marginBottom:6}}>Récapitulatif</div>
                  <div style={{fontSize:11,color:"#424242",lineHeight:1.8}}>
                    📋 {nb} thématique{nb>1?"s":""}<br/>
                    🏢 {MODALITES.find(m=>m.id===config.modalite)?.label} · {config.modalite!=="enligne"?LIEUX.find(l=>l.id===config.lieu)?.label:""}<br/>
                    👥 {PARTICIPANTS.find(p=>p.id===config.participants)?.label} participants<br/>
                    🎓 {INTERVENANTS.find(i=>i.id===config.intervenants)?.label}<br/>
                    ⏱ {DUREES.find(d=>d.id===config.duree)?.label}<br/>
                    💰 Devis estimatif : <strong style={{color:"#1A237E"}}>{fmt(devis)}</strong>
                  </div>
                </div>
                <button className="hb" onClick={()=>{setEnvoye(false);setSel([]);setContexte("");setErreur("");}}
                  style={{padding:"10px 20px",background:"#F5F5F5",color:"#424242",border:"1px solid #E0E0E0",fontSize:12}}>
                  Nouvelle demande
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
