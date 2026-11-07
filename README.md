<div align="center">

# 🏥 ClinicFlow

### Système de Gestion de Clinique — PERN Stack

*Application web complète pour la gestion des patients, rendez-vous et utilisateurs d'une petite clinique*

---

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

</div>

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Stack technique](#-stack-technique)
- [Conception de la base de données](#-conception-de-la-base-de-données-erd)
- [Architecture du projet](#-architecture-du-projet)
- [API REST — Documentation complète](#-api-rest--documentation-complète)
- [Fonctionnalités](#-fonctionnalités)
- [Installation et démarrage](#-installation-et-démarrage)
- [Tests](#-tests)
- [Identifiants de test](#-identifiants-de-test)

---

## 🌐 Vue d'ensemble

ClinicFlow est une application web full-stack conçue pour aider les petites cliniques à gérer :

- 👤 **Patients** — Création, modification, suppression douce, recherche paginée
- 📅 **Rendez-vous** — Planification avec règle anti-conflit de 30 minutes
- 🔐 **Utilisateurs** — Authentification JWT avec rôles admin/staff
- 📊 **Dashboard** — Statistiques agrégées en temps réel

---

## 🛠 Stack technique

### Backend

| Technologie | Rôle |
|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20"/> **Node.js v22** | Runtime JavaScript côté serveur |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="20"/> **Express.js 4** | Framework HTTP — routing, middleware |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20"/> **TypeScript 5** | Typage statique, sécurité à la compilation |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="20"/> **PostgreSQL 15** | Base de données relationnelle |
| <img src="https://avatars.githubusercontent.com/u/17219288?s=20" width="20"/> **Prisma ORM** | Client DB typé, migrations, schema-as-code |
| 🛡️ **Zod** | Validation des entrées avec schémas TypeScript |
| 🔑 **JWT (jsonwebtoken)** | Authentification stateless — tokens 24h |
| 🔒 **bcryptjs** | Hachage des mots de passe (cost factor 10) |
| 🌐 **CORS** | Gestion des origines cross-domain |

### Frontend

| Technologie | Rôle |
|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="20"/> **React 18** | UI avec hooks, context, composants fonctionnels |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20"/> **TypeScript 5** | Typage des props, API calls, state |
| ⚡ **Vite 8** | Build tool ultra-rapide avec HMR |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" width="20"/> **Tailwind CSS 3** | Utility-first styling |
| 🔀 **React Router v6** | Navigation SPA avec routes protégées |
| 📡 **Axios** | Client HTTP avec intercepteurs JWT/401 |
| 🔓 **jwt-decode** | Décodage client-side du JWT |

### Tests

| Technologie | Rôle |
|---|---|
| 🃏 **Jest 29** | Test runner avec ts-jest |
| 🧪 **Supertest** | Tests d'intégration HTTP sans serveur |
| 🎲 **fast-check** | Tests basés sur les propriétés (PBT) — 100 runs/test |

### Infrastructure

| Technologie | Rôle |
|---|---|
| ☁️ **Neon** | PostgreSQL serverless cloud |
| 🐙 **GitHub** | Contrôle de version |

---

## 🗄 Conception de la base de données (ERD)

### Schéma Entité-Relation

```mermaid
erDiagram
    users {
        UUID        id          PK
        VARCHAR     email       UK
        VARCHAR     passwordHash
        user_role   role        "admin | staff"
        TIMESTAMPTZ createdAt
    }

    patients {
        UUID        id          PK
        VARCHAR     fullName
        VARCHAR     cin         UK
        DATE        birthDate
        VARCHAR     phone
        VARCHAR     address     "nullable"
        TIMESTAMPTZ createdAt
        TIMESTAMPTZ deletedAt   "nullable - soft delete"
    }

    appointments {
        UUID        id              PK
        UUID        patientId       FK
        UUID        createdBy       FK
        TIMESTAMPTZ appointmentDate
        appt_status status          "pending | confirmed | cancelled"
        TEXT        notes           "nullable"
        TIMESTAMPTZ createdAt
    }

    users      ||--o{ appointments : "createdBy (crée par)"
    patients   ||--o{ appointments : "patientId (appartient à)"
```

### Justification des relations

#### `users` → `appointments` (1-N)
> Un utilisateur (admin ou staff) peut créer **plusieurs** rendez-vous.
> Un rendez-vous est créé par **un seul** utilisateur.
> → **FK** `appointments.createdBy → users.id` avec `ON DELETE SET NULL`
> *Raison du SET NULL : si un staff est supprimé, l'historique des rendez-vous doit rester intact pour la traçabilité médicale.*

#### `patients` → `appointments` (1-N)
> Un patient peut avoir **plusieurs** rendez-vous au fil du temps.
> Un rendez-vous concerne **un seul** patient.
> → **FK** `appointments.patientId → patients.id` avec `ON DELETE CASCADE`
> *Raison du CASCADE : si un patient est physiquement supprimé (cas exceptionnel), ses rendez-vous orphelins n'ont plus de sens.*

#### Relations N-N
> Il n'y a **pas de relation N-N** dans ce schéma — la conception est intentionnellement simple pour une petite clinique.
> Une table de liaison `doctor_patient` ou `doctor_appointment` pourrait être ajoutée pour gérer plusieurs médecins.

### Contraintes de la base de données

```mermaid
graph LR
    subgraph "Contraintes d'intégrité"
        A["patients.cin UNIQUE"] 
        B["users.email UNIQUE"]
        C["appointments.status CHECK<br/>pending | confirmed | cancelled"]
        D["patients.deletedAt NULLABLE<br/>Soft Delete"]
    end

    subgraph "Index de performance"
        E["INDEX patients(fullName)"]
        F["INDEX patients(cin)"]
        G["INDEX appointments(appointmentDate)"]
    end

    subgraph "Clés étrangères"
        H["appointments.patientId → patients.id<br/>CASCADE DELETE"]
        I["appointments.createdBy → users.id<br/>SET NULL DELETE"]
    end
```

### Règle métier : Anti-conflit 30 minutes

```mermaid
flowchart TD
    A[Nouvelle demande de RDV\ndate T pour patient P] --> B{Chercher RDV confirmés\npour patient P}
    B --> C{Existe T' tel que\nT-30min < T' < T+30min ?}
    C -->|OUI 💥| D[HTTP 409 Conflict\nIndique le RDV conflictuel]
    C -->|NON ✅| E{Transaction Serializable}
    E --> F[Re-vérification en DB\nanti-concurrence]
    F --> G[Création RDV\nstatus: pending]

    style D fill:#ff6b6b,color:#fff
    style G fill:#51cf66,color:#fff
```

---

## 🏗 Architecture du projet

### Structure des dossiers

```
clinicflow-pern/
├── 📂 backend/
│   ├── 📂 prisma/
│   │   ├── schema.prisma        # Schéma DB (source de vérité)
│   │   ├── seed.ts              # Données de test initiales
│   │   └── migrations/          # Historique des migrations SQL
│   ├── 📂 src/
│   │   ├── app.ts               # Express app (sans listen)
│   │   ├── server.ts            # Point d'entrée (app.listen)
│   │   ├── 📂 routes/           # Définition des routes par domaine
│   │   ├── 📂 controllers/      # Extraction params → appel service
│   │   ├── 📂 services/         # Logique métier + Prisma
│   │   ├── 📂 middleware/       # auth, role, validate, error
│   │   ├── 📂 schemas/          # Schémas Zod de validation
│   │   ├── 📂 utils/            # AppError, jwt helpers
│   │   └── 📂 __tests__/        # Unit, integration, properties
│   └── .env.example
├── 📂 frontend/
│   └── 📂 src/
│       ├── App.tsx              # Router root + providers
│       ├── 📂 pages/            # LoginPage, Dashboard, Patients...
│       ├── 📂 components/
│       │   ├── layout/          # AppLayout, Sidebar
│       │   ├── shared/          # Spinner, ErrorBanner, Pagination...
│       │   ├── patients/        # PatientTable, PatientForm
│       │   └── appointments/    # AppointmentTable, StatusBadge...
│       ├── 📂 context/          # AuthContext (JWT + rôles)
│       ├── 📂 api/              # Axios instance + intercepteurs
│       └── 📂 routes/           # ProtectedRoute
└── README.md
```

### Architecture en couches (Backend)

```mermaid
graph TD
    Client["🌐 React SPA\n(Axios)"]
    
    subgraph "Express App"
        MW["Middleware Stack\nCORS · JSON · Auth · Role · Error"]
        R["Routes\nauth · patients · appointments · dashboard"]
        C["Controllers\nExtraction params + Format réponse"]
        S["Services\nLogique métier pure"]
        P["Prisma Client\nORM typé"]
    end
    
    DB[("🐘 PostgreSQL\nNeon Cloud")]
    
    Client -->|"HTTP/JSON + JWT Bearer"| MW
    MW --> R --> C --> S --> P --> DB
    
    style Client fill:#61DAFB,color:#000
    style DB fill:#4169E1,color:#fff
```

### Flux d'authentification

```mermaid
sequenceDiagram
    participant FE as React Frontend
    participant BE as Express API
    participant DB as PostgreSQL (Neon)

    FE->>BE: POST /api/auth/login {email, password}
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: {id, email, passwordHash, role}
    BE->>BE: bcrypt.compare(password, hash)
    BE->>BE: jwt.sign({id, email, role}, secret, 24h)
    BE-->>FE: {token: "eyJ...", user: {id, email, role}}
    FE->>FE: localStorage.setItem("token", ...)
    
    Note over FE,BE: Requêtes suivantes
    FE->>BE: GET /api/patients\nAuthorization: Bearer eyJ...
    BE->>BE: jwt.verify(token) → {id, email, role}
    BE->>DB: SELECT patients WHERE deletedAt IS NULL
    DB-->>BE: [patients...]
    BE-->>FE: {data: [...], total, page, totalPages}
```

---

## 📡 API REST — Documentation complète

### Base URL
```
http://localhost:5000/api
```

### Authentification

Toutes les routes protégées nécessitent le header :
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 🔐 Auth

#### `POST /api/auth/login`
Authentifie un utilisateur et retourne un JWT valide 24h.

**Body**
```json
{
  "email": "admin@clinicflow.com",
  "password": "Admin123!"
}
```

**Réponse 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5ff2a4d1-0eb6-46f3-baf6-10d6d2ae4b8f",
    "email": "admin@clinicflow.com",
    "role": "admin"
  }
}
```

**Erreurs**
| Code | Description |
|------|-------------|
| `400` | Email ou password manquant (Zod validation) |
| `401` | Identifiants incorrects |

---

#### `GET /api/auth/me`
🔒 *Requiert JWT*

Retourne l'utilisateur courant sans le hash du mot de passe.

**Réponse 200**
```json
{
  "id": "5ff2a4d1-0eb6-46f3-baf6-10d6d2ae4b8f",
  "email": "admin@clinicflow.com",
  "role": "admin"
}
```

---

### 👤 Patients

#### `POST /api/patients`
🔒 *Requiert JWT*

Crée un nouveau patient.

**Body**
```json
{
  "fullName": "Mohammed Alami",
  "cin": "BE123456",
  "birthDate": "1990-04-15",
  "phone": "+212661234567",
  "address": "12 Rue Hassan II, Casablanca"
}
```

**Réponse 201**
```json
{
  "id": "a1b2c3d4-...",
  "fullName": "Mohammed Alami",
  "cin": "BE123456",
  "birthDate": "1990-04-15T00:00:00.000Z",
  "phone": "+212661234567",
  "address": "12 Rue Hassan II, Casablanca",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "deletedAt": null
}
```

**Erreurs**
| Code | Description |
|------|-------------|
| `400` | Champ requis manquant ou format invalide |
| `409` | CIN déjà enregistré |

---

#### `GET /api/patients`
🔒 *Requiert JWT*

Liste paginée des patients actifs (non supprimés).

**Query params**
| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `page` | number | `1` | Numéro de page |
| `limit` | number | `10` | Résultats par page |
| `search` | string | — | Recherche sur fullName ou CIN (insensible à la casse) |

**Exemple**
```
GET /api/patients?page=1&limit=10&search=ali
```

**Réponse 200**
```json
{
  "data": [
    {
      "id": "...",
      "fullName": "Mohammed Alami",
      "cin": "BE123456",
      ...
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

#### `GET /api/patients/:id`
🔒 *Requiert JWT*

Récupère un patient par son UUID.

**Réponse 200** — Objet patient complet

**Erreurs**
| Code | Description |
|------|-------------|
| `404` | Patient introuvable ou soft-deleted |

---

#### `PUT /api/patients/:id`
🔒 *Requiert JWT*

Met à jour les informations d'un patient. Tous les champs sont optionnels.

**Body** (partiel)
```json
{
  "phone": "+212699999999",
  "address": "Nouvelle adresse"
}
```

**Erreurs**
| Code | Description |
|------|-------------|
| `404` | Patient introuvable ou soft-deleted |
| `409` | Nouveau CIN appartient à un autre patient |

---

#### `DELETE /api/patients/:id`
🔒 *Requiert JWT* | 👑 *Admin uniquement*

Soft-delete du patient (pose `deletedAt = NOW()`). Les données ne sont pas physiquement supprimées.

**Réponse 200**
```json
{ "message": "Patient soft-deleted" }
```

**Erreurs**
| Code | Description |
|------|-------------|
| `403` | Rôle insuffisant (staff) |
| `404` | Patient introuvable |

---

### 📅 Appointments

#### `POST /api/appointments`
🔒 *Requiert JWT*

Crée un nouveau rendez-vous avec `status: "pending"` par défaut.

**Body**
```json
{
  "patientId": "a1b2c3d4-...",
  "appointmentDate": "2024-07-15T09:00:00.000Z",
  "notes": "Consultation de suivi post-opératoire"
}
```

**Réponse 201**
```json
{
  "id": "...",
  "patientId": "a1b2c3d4-...",
  "createdBy": "5ff2a4d1-...",
  "appointmentDate": "2024-07-15T09:00:00.000Z",
  "status": "pending",
  "notes": "Consultation de suivi post-opératoire",
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

**Erreurs**
| Code | Description |
|------|-------------|
| `400` | UUID patient invalide, date mal formatée |
| `404` | Patient introuvable ou soft-deleted |
| `409` | Conflit : RDV confirmé dans la fenêtre ±30 min |

---

#### `GET /api/appointments`
🔒 *Requiert JWT*

Liste paginée des rendez-vous avec filtres optionnels.

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page (défaut: 1) |
| `limit` | number | Résultats/page (défaut: 10) |
| `date` | YYYY-MM-DD | Filtre par jour calendaire (UTC) |
| `status` | pending\|confirmed\|cancelled | Filtre par statut |

**Exemple**
```
GET /api/appointments?date=2024-07-15&status=confirmed
```

**Réponse 200**
```json
{
  "data": [...],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Erreurs**
| Code | Description |
|------|-------------|
| `400` | Valeur de status invalide |

---

#### `PATCH /api/appointments/:id/status`
🔒 *Requiert JWT*

Met à jour le statut d'un rendez-vous.

**Body**
```json
{ "status": "confirmed" }
```

Valeurs acceptées : `pending` · `confirmed` · `cancelled`

**Réponse 200** — Objet appointment mis à jour

**Erreurs**
| Code | Description |
|------|-------------|
| `400` | Valeur de status invalide |
| `404` | Rendez-vous introuvable |
| `409` | Confirmation impossible : conflit ±30 min avec un autre RDV confirmé |

---

### 📊 Dashboard

#### `GET /api/dashboard/stats`
🔒 *Requiert JWT*

Retourne les 4 statistiques agrégées en une seule requête.

**Réponse 200**
```json
{
  "totalPatients": 42,
  "appointmentsToday": 7,
  "pendingCount": 12,
  "confirmedCount": 8
}
```

| Champ | Calcul |
|-------|--------|
| `totalPatients` | `COUNT patients WHERE deletedAt IS NULL` |
| `appointmentsToday` | `COUNT WHERE date BETWEEN 00:00:00 AND 23:59:59 UTC` |
| `pendingCount` | `COUNT WHERE status = 'pending'` (toutes dates) |
| `confirmedCount` | `COUNT WHERE status = 'confirmed'` (toutes dates) |

---

### 📐 Format des erreurs

Toutes les erreurs suivent ce format JSON uniforme :

```json
{
  "error": "Message descriptif",
  "details": [
    { "field": "email", "message": "Invalid email" },
    { "field": "cin",   "message": "cin is required" }
  ]
}
```

> `details` est présent uniquement pour les erreurs de validation (HTTP 400).

### Codes HTTP utilisés

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Validation échouée |
| `401` | Non authentifié (token manquant ou expiré) |
| `403` | Non autorisé (rôle insuffisant) |
| `404` | Ressource introuvable |
| `409` | Conflit (CIN dupliqué, RDV conflictuel) |
| `500` | Erreur serveur interne |

---

## ✨ Fonctionnalités

### Sécurité
- ✅ Mots de passe hachés avec **bcrypt** (cost factor 10)
- ✅ **JWT** avec expiration 24h — payload : `{ id, email, role }`
- ✅ Middleware `auth` sur toutes les routes protégées
- ✅ Middleware `role` pour les actions admin uniquement
- ✅ Validation **Zod** sur tous les inputs (body + query params)
- ✅ Stack traces jamais exposées en réponse HTTP

### Gestion des patients
- ✅ CRUD complet avec validation CIN unique
- ✅ **Soft delete** — `deletedAt` timestamp, données préservées
- ✅ Recherche insensible à la casse sur `fullName` et `CIN`
- ✅ Pagination avec metadata (`total`, `page`, `totalPages`)

### Gestion des rendez-vous
- ✅ Création avec `status: pending` par défaut
- ✅ **Règle anti-conflit 30 minutes** (boundaries exclusives)
- ✅ Transaction **Serializable** pour la concurrence
- ✅ Filtres combinés : date (UTC) + statut
- ✅ Mise à jour de statut avec re-vérification du conflit

### Dashboard
- ✅ 4 métriques en une seule requête parallèle Prisma
- ✅ `appointmentsToday` calculé en UTC

### Frontend
- ✅ Authentification persistante via `localStorage`
- ✅ Expiration JWT détectée au chargement et sur 401
- ✅ Routes protégées avec redirect vers `/login`
- ✅ Bouton "Supprimer" visible uniquement pour les admins
- ✅ Erreurs de validation affichées champ par champ
- ✅ Indicateur de chargement sur toutes les requêtes

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** v18+
- **npm** v9+
- Un projet **Neon** (ou PostgreSQL local)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Ayoub-glitsh/clinicflow-pern.git
cd clinicflow-pern
```

### 2. Installer les dépendances

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configurer les variables d'environnement

```bash
cd backend
cp .env.example .env
```

Éditez `backend/.env` :

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@direct-host/dbname?sslmode=require"
JWT_SECRET="votre-secret-jwt-fort"
JWT_EXPIRES_IN="24h"
PORT=5000
```

> **Neon** : `DATABASE_URL` = pooler URL, `DIRECT_URL` = direct URL (sans `-pooler` dans le hostname)

### 4. Migrations et seed

```bash
cd backend

# Générer le client Prisma
PRISMA_GENERATE_SKIP_AUTOINSTALL=true npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# Peupler la base de données
npx ts-node prisma/seed.ts
```

### 5. Démarrer les serveurs

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

---

## 🧪 Tests

```bash
cd backend
npm test
```

### Résultats

```
Test Suites: 11 passed, 11 total
Tests:       45 passed, 45 total
Time:        ~12s
```

### Couverture des tests

| Type | Fichiers | Ce qui est testé |
|------|----------|-----------------|
| **Unit — Middleware** | `middleware.test.ts` | authMiddleware, requireRole, validate, errorMiddleware |
| **Unit — Auth** | `auth.service.test.ts` | login valide/invalide, getMe sans passwordHash |
| **Unit — Patients** | `patients.service.test.ts` | conflit CIN, soft-delete, pagination |
| **Unit — Appointments** | `appointments.service.test.ts` | conflit 29min, boundary 30min, 31min, self-exclusion |
| **Integration — Auth** | `auth.test.ts` | POST /login, GET /me |
| **Integration — Patients** | `patients.test.ts` | CRUD + rôles |
| **Integration — Appointments** | `appointments.test.ts` | POST, GET, PATCH status |
| **Integration — Dashboard** | `dashboard.test.ts` | GET /stats, 401 sans token |
| **PBT P1** | `conflict.test.ts` | Rejet garanti si offset ∈ [1,29] min — 100 runs |
| **PBT P2** | `conflict.test.ts` | Accepté si offset = 30 min exactement — 100 runs |
| **PBT P3** | `patients.test.ts` | Patients soft-deleted absents de toutes les listes — 100 runs |
| **PBT P4** | `patients.test.ts` | `data.length ≤ limit` toujours — 100 runs |
| **PBT P5** | `auth.test.ts` | Tout token invalide → 401 — 50 runs |
| **PBT P6** | `auth.test.ts` | Staff → toujours 403 sur DELETE patient — 50 runs |

---

## 🔑 Identifiants de test

Après le seed :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 👑 **Admin** | `admin@clinicflow.com` | `Admin123!` |
| 👤 **Staff 1** | `staff1@clinicflow.com` | `Staff123!` |
| 👤 **Staff 2** | `staff2@clinicflow.com` | `Staff123!` |

**Données seedées :**
- 5 patients (CIN : BE123456, BK789012, CD345678, HH901234, JA567890)
- 10 rendez-vous : 4 pending · 3 confirmed · 3 cancelled

---

<div align="center">

Built with ❤️ using the PERN stack + TypeScript

</div>
