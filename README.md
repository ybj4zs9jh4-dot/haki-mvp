# HAKI MVP — Guide de démarrage

## Plateforme SaaS DEI pour la Côte d'Ivoire
**Score MMI-CI · 4 dimensions · Barème 100 pts · Conformité ARTCI**

---

## Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | Pages + API Routes |
| Styles | Tailwind CSS | Palette Haki (indigo / safran / teal) |
| Graphiques | Recharts | Donut · Radar · Barres composantes |
| PDF | @react-pdf/renderer | Rapports exécutif et analytique |
| Auth | NextAuth.js v5 | JWT + Rôles (admin_haki / drh / dg / lecteur) |
| ORM | Prisma | PostgreSQL 15 |
| Base de données | Supabase (PostgreSQL) | JSONB · UUID · Gratuit jusqu'à 500MB |
| Stockage PDF | Supabase Storage | URLs signées TTL 24h |
| Emails | Resend | Invitations · Liens tokens |
| Déploiement | Vercel | Gratuit tier hobby |

---

## Installation en 10 minutes

### 1. Prérequis
```bash
node --version  # ≥ 18
npm --version   # ≥ 9
```

### 2. Cloner et installer
```bash
git clone https://github.com/haki-ci/haki-mvp.git
cd haki-mvp
npm install
```

### 3. Créer le projet Supabase
1. Aller sur [supabase.com](https://supabase.com) → New Project
2. Nom : `haki-mvp` · Région : `eu-central-1` (Frankfurt, plus proche de CI)
3. Copier l'URL et la clé `service_role`

### 4. Configurer les variables d'environnement
```bash
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase, Resend, etc.
```

Variables minimales pour démarrer :
```bash
DATABASE_URL="postgresql://postgres:[MOT_DE_PASSE]@db.[PROJET].supabase.co:5432/postgres"
NEXTAUTH_SECRET="[openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Créer les tables et le schéma
```bash
npm run db:push    # Applique le schéma Prisma → PostgreSQL
npm run db:seed    # Crée les données de test initiales
```

### 6. Lancer en développement
```bash
npm run dev
# → http://localhost:3000
```

### 7. Se connecter
| Rôle | Email | Mot de passe |
|---|---|---|
| Admin Haki | admin@haki.ci | Haki@Admin2026! |
| DRH Banque Atlantique | drh@banqueatlantique.ci | Drh@Banque2026! |
| DG Banque Atlantique | dg@banqueatlantique.ci | Dg@Banque2026! |

---

## Structure du projet

```
haki-mvp/
├── prisma/
│   ├── schema.prisma          # 13 entités · PostgreSQL 15
│   └── seed.ts                # Données de test CI
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── organisations/ # CRUD organisations
│   │   │   ├── sessions/      # Sessions diagnostics
│   │   │   │   └── [id]/
│   │   │   │       ├── socle/     # POST badge + alertes SOCLE
│   │   │   │       ├── reponses/  # POST/GET réponses ORGANISATION
│   │   │   │       ├── score/     # POST calcul MMI-CI · GET résultat
│   │   │   │       ├── liens-collaborateur/
│   │   │   │       ├── score-collaborateur/
│   │   │   │       ├── liens-manager/
│   │   │   │       └── rapports/
│   │   │   ├── barometre/
│   │   │   │   └── [token]/   # GET accès anonyme · POST soumission + agrégation
│   │   │   ├── managers/
│   │   │   │   └── [token]/
│   │   │   │       └── score/ # GET/POST score confidentiel manager
│   │   │   └── benchmarks/    # GET benchmarks sectoriels CI (n≥10)
│   │   ├── dashboard/         # Tableau de bord DRH/DG
│   │   ├── barometre/         # Page questionnaire collaborateur
│   │   ├── managers/          # Page auto-diagnostic manager
│   │   └── connexion/         # Page de connexion
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma singleton
│   │   ├── auth.ts            # Config NextAuth + helpers rôles
│   │   ├── anonymisation.ts   # Règles ARTCI · agrégation COLLABORATEURS
│   │   └── scoring/
│   │       ├── bareme.ts      # Barème MMI-CI complet + moteur de scoring
│   │       └── socle.ts       # Moteur SOCLE + badge + alertes
│   ├── types/                 # Types TypeScript partagés
│   └── components/
│       ├── ui/                # Composants UI réutilisables
│       └── rapport/           # Composants PDF React
└── .env.example
```

---

## Architecture des données — Règles critiques

### 1. SOCLE hors score MMI-CI
```
SOCLE → badge (conforme / en_cours / non_conforme) + alertes priorisées
Score MMI-CI → 100 pts sur 4 dimensions DEI uniquement
```

### 2. Anonymisation COLLABORATEURS (ARTCI obligatoire)
```typescript
// ✅ CORRECT — agrégation avant stockage
const profilAgrege = aggregateProfil(profilBrut); // "F|26-35|cadre|3-7ans"
await prisma.reponseCollaborateur.create({ data: { profilAgrege, ... } });

// ❌ INTERDIT — jamais de données individuelles
await prisma.reponseCollaborateur.create({ data: { email, age: 32, salaire: 450000 } });
```

### 3. Scores MANAGERS — confidentialité absolue
```typescript
// ✅ CORRECT — accessible uniquement via token privé du manager
GET /api/managers/[token]/score  // token = hash SHA-256

// ❌ INTERDIT — aucune route organisation → scores managers
GET /api/organisations/[id]/scores-managers  // N'EXISTE PAS
```

### 4. Benchmarks — seuil n≥10
```typescript
// ✅ CORRECT
if (benchmark.nbEntreprises >= 10) return benchmark;

// ❌ INTERDIT — jamais publié si n < 10
return benchmark; // même si utile
```

---

## Déploiement sur Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Ajouter les variables d'environnement dans Vercel Dashboard
# Settings → Environment Variables → ajouter toutes les vars de .env.example
```

URL de production type : `https://haki-mvp.vercel.app`

---

## Roadmap MVP — Sprints

| Sprint | Durée | Objectif |
|---|---|---|
| S1 | 2 sem. | Auth + Organisations + Sessions + SOCLE |
| S2 | 2 sem. | Questionnaire ORGANISATION + Score MMI-CI |
| S3 | 2 sem. | Baromètre COLLABORATEURS (anonyme) |
| S4 | 2 sem. | Auto-diagnostic MANAGERS (confidentiel) |
| S5 | 2 sem. | Rapport PDF (exécutif + analytique) |
| S6 | 2 sem. | Benchmarks CI + Dashboard DG |
| M6 | — | Lancement pilotes (3 organisations CI) |

---

## Tests — Commandes utiles

```bash
# Vérifier le schéma Prisma
npx prisma validate

# Ouvrir Prisma Studio (interface visuelle base de données)
npm run db:studio

# Tester le moteur de scoring en isolation
npx tsx -e "
import { calculerScoreComplet } from './src/lib/scoring/bareme.ts';
const result = calculerScoreComplet([
  { itemCode: 'G-23', valeur: 'art4_explicite' },
  { itemCode: 'H-02', valeur: 'quota_atteint' },
  { itemCode: 'M-02', valeur: 'politique_ecrite' },
]);
console.log('Score global:', result.scoreGlobal);
console.log('Niveau MMI-CI:', result.niveauMmi);
"

# Tester l'anonymisation
npx tsx -e "
import { agregерProfil } from './src/lib/anonymisation.ts';
console.log(agregерProfil({ genre: 'F', trancheAge: '26-35', niveau: 'cadre', anciennete: '3-7' }));
// → 'F|26-35|cadre|3-7'
"
```

---

## Contacts

- **Plateforme** : www.haki.ci
- **Email** : contact@haki.ci
- **Abidjan, Côte d'Ivoire**
- **Conformité** : Déclaration ARTCI en cours (Loi n° 2013-450 CI)

---

*Haki MVP v0.1.0 — Mars 2026 — Document confidentiel*
