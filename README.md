<div align="center">

# ClinicFlow

### Système de Gestion de Clinique — Stack PERN

*Application web full-stack pour la gestion des patients, rendez-vous et utilisateurs d'une petite clinique.*

---

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Jest](https://img.shields.io/badge/Jest-29.x-C21325?style=flat&logo=jest&logoColor=white)](https://jestjs.io)

</div>

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Stack technique](#stack-technique)
- [Conception de la base de données (ERD)](#conception-de-la-base-de-données-erd)
- [Architecture du projet](#architecture-du-projet)
- [Référence API](#référence-api)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Tests](#tests)
- [Identifiants de test](#identifiants-de-test)

---

## Vue d'ensemble

ClinicFlow est une application web full-stack conçue pour aider les petites cliniques à gérer :

- **Patients** — Création, modification, suppression douce, recherche paginée
- **Rendez-vous** — Planification avec règle anti-conflit de 30 minutes
- **Utilisateurs** — Authentification JWT avec rôles admin/staff
- **Dashboard** — Statistiques agrégées en temps réel

---

## Stack technique

### Backend

| | Technologie | Rôle |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18"/> | **Node.js v22** | Runtime JavaScript côté serveur |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="18"/> | **Express.js 4** | Framework HTTP — routage et middleware |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18"/> | **TypeScript 5** | Typage statique, sécurité à la compilation |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18"/> | **PostgreSQL 15** | Base de données relationnelle |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="18"/> | **Prisma ORM** | Client DB typé, migrations, schéma en code |
| <img src="https://zod.dev/logo.svg" width="18"/> | **Zod** | Validation des entrées avec schémas TypeScript |
| <img src="https://jwt.io/img/favicon/favicon-16x16.png" width="18"/> | **JWT** | Authentification stateless — tokens 24h |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18"/> | **bcryptjs** | Hachage des mots de passe (facteur de coût 10) |

### Frontend

| | Technologie | Rôle |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18"/> | **React 18** | Interface avec hooks, context, composants fonctionnels |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18"/> | **TypeScript 5** | Typage des props, appels API, état |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="18"/> | **Vite 8** | Outil de build rapide avec HMR |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" width="18"/> | **Tailwind CSS 3** | Stylisation utility-first |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18"/> | **React Router v6** | Navigation SPA avec routes protégées |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" width="18"/> | **Axios** | Client HTTP avec intercepteurs JWT/401 |

### Tests

| | Technologie | Rôle |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg" width="18"/> | **Jest 29** | Lanceur de tests avec ts-jest |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18"/> | **Supertest** | Tests d'intégration HTTP sans serveur actif |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18"/> | **fast-check** | Tests basés sur les propriétés — 100 exécutions par propriété |

---

## Conception de la base de données (ERD)

### Diagramme Entité-Relation

```mermaid
erDiagram
    users {
        UUID        id
        VARCHAR     email
        VARCHAR     passwordHash
        user_role   role
        TIMESTAMPTZ createdAt
    }

    patients {
        UUID        id
        VARCHAR     fullName
        VARCHAR     cin
        DATE        birthDate
        VARCHAR     phone
        VARCHAR     address
        TIMESTAMPTZ createdAt
        TIMESTAMPTZ deletedAt
    }

    appointments {
        UUID        id
        UUID        patientId
        UUID        createdBy
        TIMESTAMPTZ appointmentDate
        appt_status status
        TEXT        notes
        TIMESTAMPTZ createdAt
    }

    users      ||--o{ appointments : "createdBy"
    patients   ||--o{ appointments : "patientId"
```

### Justification des relations

#### users vers appointments (1-N)

Un utilisateur (admin ou staff) peut créer plusieurs rendez-vous. Chaque rendez-vous est créé par exactement un utilisateur.

- **FK** : `appointments.createdBy` référence `users.id`
- **ON DELETE SET NULL** — si un compte staff est supprimé, l'historique des rendez-vous est conservé pour la traçabilité du dossier médical. `createdBy` devient null au lieu de provoquer une suppression en cascade.

#### patients vers appointments (1-N)

Un patient peut avoir plusieurs rendez-vous au fil du temps. Chaque rendez-vous appartient à exactement un patient.

- **FK** : `appointments.patientId` référence `patients.id`
- **ON DELETE CASCADE** — un rendez-vous sans patient n'a pas de sens. La suppression physique d'un patient (cas exceptionnel) supprime les rendez-vous associés.

#### Relations N-N

Aucune relation plusieurs-à-plusieurs n'existe dans ce schéma. La conception est intentionnellement simple pour une clinique à praticien unique. Une table `doctors` avec une table de jonction `doctor_appointment` pourrait être ajoutée pour gérer plusieurs praticiens.

### Contraintes et index

```mermaid
graph TD
    A[patients.cin UNIQUE]
    B[users.email UNIQUE]
    C[appointments.status ENUM\npending ou confirmed ou cancelled]
    D[patients.deletedAt NULLABLE\nSuppression douce]
    E[INDEX patients fullName]
    F[INDEX patients cin]
    G[INDEX appointments appointmentDate]
    H[appointments.patientId reference patients.id\nCASCADE DELETE]
    I[appointments.createdBy reference users.id\nSET NULL DELETE]
```

### Règle anti-conflit de 30 minutes

```mermaid
flowchart TD
    A[Nouvelle demande de rendez-vous\ndate T pour le patient P] --> B[Chercher les rendez-vous confirmes\npour le patient P]
    B --> C{Existe-t-il T prime tel que\nT moins 30min est inferieur a T prime\net T prime est inferieur a T plus 30min}
    C -->|OUI| D[HTTP 409 Conflit\nRetourner la date du rendez-vous conflictuel]
    C -->|NON| E[Transaction Serializable\nRe-verification dans le verrou DB]
    E --> F[Creation du rendez-vous\nstatut pending]
```

---

## Architecture du projet

### Structure des dossiers

```
clinicflow-pern/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── schemas/
│       ├── utils/
│       └── __tests__/
│           ├── unit/
│           ├── integration/
│           └── properties/
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── pages/
│       ├── components/
│       │   ├── layout/
│       │   ├── shared/
│       │   ├── patients/
│       │   └── appointments/
│       ├── context/
│       ├── api/
│       └── routes/
└── README.md
```

### Architecture en couches du backend

```mermaid
graph TD
    Client[React SPA]
    MW[Pile Middleware\nCORS - JSON - Auth - Role - Error]
    R[Routes]
    C[Controlleurs\nExtraction parametres - Formatage reponse]
    S[Services\nLogique metier]
    P[Client Prisma]
    DB[(PostgreSQL)]

    Client --> MW
    MW --> R
    R --> C
    C --> S
    S --> P
    P --> DB
```

### Flux d'authentification

```mermaid
sequenceDiagram
    participant FE as Frontend React
    participant BE as API Express
    participant DB as PostgreSQL

    FE->>BE: POST /api/auth/login email et mot de passe
    BE->>DB: SELECT user WHERE email
    DB-->>BE: id email passwordHash role
    BE->>BE: bcrypt.compare mot de passe hash
    BE->>BE: jwt.sign id email role secret 24h
    BE-->>FE: token et user id email role
    FE->>FE: localStorage.setItem token

    Note over FE,BE: Requetes suivantes

    FE->>BE: GET /api/patients\nAuthorization Bearer token
    BE->>BE: jwt.verify token
    BE->>DB: SELECT patients WHERE deletedAt IS NULL
    DB-->>BE: tableau de patients
    BE-->>FE: data total page totalPages
```

---

## Référence API

**URL de base** : `http://localhost:5000/api`

Toutes les routes protégées nécessitent l'en-tête :
```
Authorization: Bearer <token>
```

---

### Authentification

#### POST /api/auth/login

Authentifie un utilisateur et retourne un JWT valide pendant 24 heures.

**Corps de la requête**
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

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Champ email ou mot de passe manquant ou invalide |
| 401 | Identifiants incorrects |

---

#### GET /api/auth/me

Requiert JWT. Retourne l'utilisateur courant sans le hash du mot de passe.

**Réponse 200**
```json
{
  "id": "5ff2a4d1-0eb6-46f3-baf6-10d6d2ae4b8f",
  "email": "admin@clinicflow.com",
  "role": "admin"
}
```

| Code | Description |
|------|-------------|
| 200 | Succès |
| 401 | Token manquant ou invalide |

---

### Patients

#### POST /api/patients

Requiert JWT. Crée un nouveau patient.

**Corps de la requête**
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

| Code | Description |
|------|-------------|
| 201 | Créé |
| 400 | Champ requis manquant ou format invalide |
| 409 | CIN déjà enregistré |

---

#### GET /api/patients

Requiert JWT. Retourne une liste paginée des patients actifs (non supprimés).

**Paramètres de requête**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| page | number | 1 | Numéro de page |
| limit | number | 10 | Résultats par page |
| search | string | — | Recherche insensible à la casse sur fullName ou CIN |

**Exemple**
```
GET /api/patients?page=1&limit=10&search=alami
```

**Réponse 200**
```json
{
  "data": [{ "id": "...", "fullName": "Mohammed Alami", "cin": "BE123456" }],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

#### GET /api/patients/:id

Requiert JWT. Retourne un patient par son UUID.

| Code | Description |
|------|-------------|
| 200 | Objet patient |
| 404 | Introuvable ou supprimé de manière douce |

---

#### PUT /api/patients/:id

Requiert JWT. Met à jour les champs d'un patient. Tous les champs sont optionnels.

**Corps de la requête** (partiel)
```json
{
  "phone": "+212699999999",
  "address": "Nouvelle adresse"
}
```

| Code | Description |
|------|-------------|
| 200 | Objet patient mis à jour |
| 404 | Introuvable ou supprimé de manière douce |
| 409 | Le nouveau CIN appartient à un autre patient |

---

#### DELETE /api/patients/:id

Requiert JWT. Rôle admin uniquement. Effectue une suppression douce du patient en définissant `deletedAt = NOW()`. Les données ne sont pas physiquement supprimées.

**Réponse 200**
```json
{ "message": "Patient soft-deleted" }
```

| Code | Description |
|------|-------------|
| 200 | Succès |
| 403 | Rôle insuffisant (staff) |
| 404 | Patient introuvable |

---

### Rendez-vous

#### POST /api/appointments

Requiert JWT. Crée un nouveau rendez-vous avec `status: "pending"` par défaut.

**Corps de la requête**
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

| Code | Description |
|------|-------------|
| 201 | Créé |
| 400 | UUID invalide, date mal formatée |
| 404 | Patient introuvable ou supprimé de manière douce |
| 409 | Conflit : rendez-vous confirmé dans la fenêtre de +/- 30 minutes |

---

#### GET /api/appointments

Requiert JWT. Liste paginée des rendez-vous avec filtres optionnels.

**Paramètres de requête**

| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page (défaut : 1) |
| limit | number | Résultats par page (défaut : 10) |
| date | YYYY-MM-DD | Filtre par jour calendaire UTC |
| status | pending ou confirmed ou cancelled | Filtre par statut |

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

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Valeur de statut invalide |

---

#### PATCH /api/appointments/:id/status

Requiert JWT. Met à jour le statut d'un rendez-vous.

**Corps de la requête**
```json
{ "status": "confirmed" }
```

Valeurs acceptées : `pending` `confirmed` `cancelled`

**Réponse 200** — Objet rendez-vous mis à jour

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Valeur de statut invalide |
| 404 | Rendez-vous introuvable |
| 409 | Conflit : la confirmation créerait un chevauchement de 30 minutes avec un autre rendez-vous confirmé |

---

### Dashboard

#### GET /api/dashboard/stats

Requiert JWT. Retourne quatre métriques agrégées en une seule requête.

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
| totalPatients | COUNT patients WHERE deletedAt IS NULL |
| appointmentsToday | COUNT WHERE appointmentDate ENTRE 00:00:00 ET 23:59:59 UTC aujourd'hui |
| pendingCount | COUNT WHERE status = pending (toutes dates) |
| confirmedCount | COUNT WHERE status = confirmed (toutes dates) |

---

### Format des erreurs

Toutes les erreurs suivent un format JSON uniforme :

```json
{
  "error": "Message descriptif",
  "details": [
    { "field": "email", "message": "Invalid email" },
    { "field": "cin",   "message": "cin is required" }
  ]
}
```

`details` est présent uniquement pour les erreurs de validation (HTTP 400).

### Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Validation échouée |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource introuvable |
| 409 | Conflit (CIN dupliqué ou chevauchement de rendez-vous) |
| 500 | Erreur interne du serveur |

---

## Fonctionnalités

**Sécurité**
- Mots de passe hachés avec bcrypt (facteur de coût 10)
- JWT avec expiration 24h — payload : id, email, role
- Middleware d'authentification sur toutes les routes protégées
- Middleware de rôle pour les actions réservées aux admins
- Validation Zod sur tous les inputs (corps et paramètres de requête)
- Stack traces jamais exposées dans les réponses HTTP

**Gestion des patients**
- CRUD complet avec validation d'unicité du CIN
- Suppression douce — timestamp `deletedAt`, données préservées
- Recherche insensible à la casse sur fullName et CIN
- Pagination avec métadonnées (total, page, totalPages)

**Gestion des rendez-vous**
- Création avec `status: pending` par défaut
- Règle anti-conflit de 30 minutes (limites exclusives)
- Transaction Serializable pour la sécurité des requêtes concurrentes
- Filtres combinés : date UTC et statut
- Mise à jour du statut avec re-vérification du conflit

**Dashboard**
- Quatre métriques en une seule transaction Prisma parallèle
- `appointmentsToday` calculé en UTC

**Frontend**
- Authentification persistante via localStorage
- Expiration JWT détectée au chargement et sur réponse 401
- Routes protégées avec redirection vers la page de connexion
- Bouton de suppression visible uniquement pour les admins
- Erreurs de validation affichées au niveau du champ
- Indicateur de chargement sur toutes les requêtes

---

## Installation

**Prérequis** : Node.js v18+, npm v9+, compte PostgreSQL ou Neon

### 1. Cloner le dépôt

```bash
git clone https://github.com/Ayoub-glitsh/clinicflow-pern.git
cd clinicflow-pern
```

### 2. Installer les dépendances

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurer les variables d'environnement

```bash
cd backend && cp .env.example .env
```

Modifier `backend/.env` :

```env
DATABASE_URL="postgresql://user:pass@pooler-host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@direct-host/dbname?sslmode=require"
JWT_SECRET="votre-secret-jwt-fort"
JWT_EXPIRES_IN="24h"
PORT=5000
```

Pour Neon : `DATABASE_URL` utilise l'URL du pooler, `DIRECT_URL` utilise l'URL directe (sans `-pooler` dans le nom d'hôte). `DIRECT_URL` est requis pour les migrations.

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
# API disponible sur http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev
# Application disponible sur http://localhost:5173
```

---

## Tests

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

| Type | Fichier | Ce qui est testé |
|------|---------|-----------------|
| Unitaire | middleware.test.ts | authMiddleware, requireRole, validate, errorMiddleware |
| Unitaire | auth.service.test.ts | Connexion valide/invalide, getMe sans passwordHash |
| Unitaire | patients.service.test.ts | Conflit CIN, suppression douce, métadonnées de pagination |
| Unitaire | appointments.service.test.ts | Conflit à 29min, limite à 30min, 31min, auto-exclusion |
| Intégration | auth.test.ts | POST /login, GET /me |
| Intégration | patients.test.ts | CRUD complet avec vérifications de rôles |
| Intégration | appointments.test.ts | POST, GET, PATCH statut |
| Intégration | dashboard.test.ts | GET /stats, 401 sans token |
| Propriété P1 | conflict.test.ts | Rejet garanti pour offset dans 1-29 min — 100 exécutions |
| Propriété P2 | conflict.test.ts | Accepté exactement à 30 min — 100 exécutions |
| Propriété P3 | patients.test.ts | Patients supprimés de manière douce absents de toutes les listes — 100 exécutions |
| Propriété P4 | patients.test.ts | data.length ne dépasse jamais limit — 100 exécutions |
| Propriété P5 | auth.test.ts | Tout token invalide retourne 401 — 50 exécutions |
| Propriété P6 | auth.test.ts | Staff obtient toujours 403 sur DELETE patient — 50 exécutions |

---

## Identifiants de test

Après l'exécution du script de seed :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@clinicflow.com | Admin123! |
| Staff | staff1@clinicflow.com | Staff123! |
| Staff | staff2@clinicflow.com | Staff123! |

**Données seedées** : 5 patients, 10 rendez-vous (4 en attente, 3 confirmés, 3 annulés)
