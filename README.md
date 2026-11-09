



<div align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="45" height="45" alt="Node.js" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="45" height="45" alt="Express" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="45" height="45" alt="TypeScript" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="45" height="45" alt="PostgreSQL" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="45" height="45" alt="Prisma" />
<img src="https://cdn.simpleicons.org/zod/3E67B1" width="45" height="45" alt="Zod" />
<img src="https://cdn.simpleicons.org/jsonwebtokens/000000" width="45" height="45" alt="JWT" />
<img src="https://cdn-icons-png.flaticon.com/512/3064/3064155.png" width="45" height="45" alt="bcryptjs" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="45" height="45" alt="React" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="45" height="45" alt="Vite" />
<img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="45" height="45" alt="Tailwind CSS" />
<img src="https://cdn.simpleicons.org/reactrouter/CA4245" width="45" height="45" alt="React Router" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" width="45" height="45" alt="Axios" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg" width="45" height="45" alt="Jest" />
<img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/clipboard-check.svg" width="45" height="45" alt="Supertest" />
<img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/brain-circuit.svg" width="45" height="45" alt="fast-check" />

</div>



<br/>


<div align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=35&pause=1000&color=2E8B57&center=true&vCenter=true&width=600&lines=ClinicFlow;Clinic+Management+System;PERN+Stack" alt="Typing SVG" />
  </a>
</div>




<div align="center">

# ClinicFlow

### Clinic Management System — PERN Stack

*Full-stack web application for managing patients, appointments, and users in a small clinic.*

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

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Design (ERD)](#database-design-erd)
- [Project Architecture](#project-architecture)
- [API Reference](#api-reference)
- [Features](#features)
- [Installation](#installation)
- [Tests](#tests)
- [Seed Credentials](#seed-credentials)

---

## Overview

ClinicFlow is a full-stack web application designed to help small clinics manage:

- **Patients** — Create, update, soft-delete, paginated search
- **Appointments** — Scheduling with a 30-minute anti-conflict rule
- **Users** — JWT authentication with admin/staff roles
- **Dashboard** — Real-time aggregated statistics

---

## Tech Stack

### Backend

| | Technology | Role |
|---|---|---|
| <img src="https://nodejs.org/static/logos/nodejsLight.svg" alt="Node.js" width="55"> | **Node.js v22** | Server-side JavaScript runtime |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="30"/> | **Express.js 4** | HTTP framework — routing and middleware |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="30"/> | **TypeScript 5** | Static typing, compile-time safety |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="30"/> | **PostgreSQL 15** | Relational database |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="30"/> | **Prisma ORM** | Typed DB client, migrations, schema-as-code |
| <img src="https://cdn.simpleicons.org/zod/3E67B1" alt="Zod" width="35" height="35" /> | **Zod** | Input validation with TypeScript schemas |
| <img src="https://jwt.io/img/favicon/favicon-16x16.png" width="30"/> | **JWT** | Stateless authentication — 24h tokens |
| <img src="https://cdn-icons-png.flaticon.com/512/3064/3064155.png" alt="bcryptjs" width="40" height="30" /> | **bcryptjs** | Password hashing (cost factor 10) |

### Frontend

| | Technology | Role |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="30"/> | **React 18** | UI with hooks, context, functional components |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="30"/> | **TypeScript 5** | Typed props, API calls, state |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="30"/> | **Vite 8** | Fast build tool with HMR |
| <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="Tailwind CSS" width="40" height="40" /> | **Tailwind CSS 3** | Utility-first styling |
| <img src="https://cdn.simpleicons.org/reactrouter/CA4245" alt="React Router" width="40" height="35" /> | **React Router v6** | SPA navigation with protected routes |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" width="30"/> | **Axios** | HTTP client with JWT/401 interceptors |

### Testing

| | Technology | Role |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg" width="30"/> | **Jest 29** | Test runner with ts-jest |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/clipboard-check.svg" alt="Supertest" width="40" height="40" /> | **Supertest** | HTTP integration testing without a live server |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/brain-circuit.svg" alt="fast-check" width="40" height="40" /> | **fast-check** | Property-based testing — 100 runs per property |

---

## Database Design (ERD)

### Entity-Relationship Diagram

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

### Relationship Justification

#### users to appointments (1-N)

A user (admin or staff) can create many appointments. Each appointment is created by exactly one user.

- **FK**: `appointments.createdBy` references `users.id`
- **ON DELETE SET NULL** — if a staff account is deleted, appointment history is preserved for medical record traceability. `createdBy` becomes null rather than cascading a delete.

#### patients to appointments (1-N)

A patient can have many appointments over time. Each appointment belongs to exactly one patient.

- **FK**: `appointments.patientId` references `patients.id`
- **ON DELETE CASCADE** — appointments without a patient have no meaning. Physical deletion of a patient (exceptional case) removes associated appointments.

#### N-N relationships

No many-to-many relationships exist in this schema. The design is intentionally simple for a single-clinic application. A `doctors` table with a `doctor_appointment` junction table could be added to support multiple practitioners.

### Constraints and Indexes

```mermaid
graph TD
    A[patients.cin UNIQUE]
    B[users.email UNIQUE]
    C[appointments.status ENUM\npending or confirmed or cancelled]
    D[patients.deletedAt NULLABLE\nSoft Delete]
    E[INDEX patients fullName]
    F[INDEX patients cin]
    G[INDEX appointments appointmentDate]
    H[appointments.patientId references patients.id\nCASCADE DELETE]
    I[appointments.createdBy references users.id\nSET NULL DELETE]
```

### 30-Minute Anti-Conflict Rule

```mermaid
flowchart TD
    A[New appointment request\ndate T for patient P] --> B[Query confirmed appointments\nfor patient P]
    B --> C{Does T prime exist\nwhere T-30min is less than T prime\nand T prime is less than T+30min}
    C -->|YES| D[HTTP 409 Conflict\nReturn conflicting appointment datetime]
    C -->|NO| E[Serializable transaction\nRe-check inside DB lock]
    E --> F[Create appointment\nstatus pending]
```

---

## Project Architecture

### Directory Structure

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

### Layered Backend Architecture

```mermaid
graph TD
    Client[React SPA]
    MW[Middleware Stack\nCORS - JSON - Auth - Role - Error]
    R[Routes]
    C[Controllers\nExtract params - Format response]
    S[Services\nBusiness logic]
    P[Prisma Client]
    DB[(PostgreSQL)]

    Client --> MW
    MW --> R
    R --> C
    C --> S
    S --> P
    P --> DB
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant FE as React Frontend
    participant BE as Express API
    participant DB as PostgreSQL

    FE->>BE: POST /api/auth/login email and password
    BE->>DB: SELECT user WHERE email
    DB-->>BE: id email passwordHash role
    BE->>BE: bcrypt.compare password hash
    BE->>BE: jwt.sign id email role secret 24h
    BE-->>FE: token and user id email role
    FE->>FE: localStorage.setItem token

    Note over FE,BE: Subsequent requests

    FE->>BE: GET /api/patients\nAuthorization Bearer token
    BE->>BE: jwt.verify token
    BE->>DB: SELECT patients WHERE deletedAt IS NULL
    DB-->>BE: patients array
    BE-->>FE: data total page totalPages
```

---

## API Reference

**Base URL**: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### POST /api/auth/login

Authenticates a user and returns a JWT valid for 24 hours.

**Request body**
```json
{
  "email": "admin@clinicflow.com",
  "password": "Admin123!"
}
```

**Response 200**
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
| 200 | Success |
| 400 | Missing or invalid email/password field |
| 401 | Invalid credentials |

---

#### GET /api/auth/me

Requires JWT. Returns the current authenticated user without the password hash.

**Response 200**
```json
{
  "id": "5ff2a4d1-0eb6-46f3-baf6-10d6d2ae4b8f",
  "email": "admin@clinicflow.com",
  "role": "admin"
}
```

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Missing or invalid token |

---

### Patients

#### POST /api/patients

Requires JWT. Creates a new patient.

**Request body**
```json
{
  "fullName": "Mohammed Alami",
  "cin": "BE123456",
  "birthDate": "1990-04-15",
  "phone": "+212661234567",
  "address": "12 Rue Hassan II, Casablanca"
}
```

**Response 201**
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
| 201 | Created |
| 400 | Missing required field or invalid format |
| 409 | CIN already registered |

---

#### GET /api/patients

Requires JWT. Returns a paginated list of active (non-deleted) patients.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Results per page |
| search | string | — | Case-insensitive search on fullName or CIN |

**Example**
```
GET /api/patients?page=1&limit=10&search=alami
```

**Response 200**
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

Requires JWT. Returns a single patient by UUID.

| Code | Description |
|------|-------------|
| 200 | Patient object |
| 404 | Not found or soft-deleted |

---

#### PUT /api/patients/:id

Requires JWT. Updates patient fields. All fields are optional.

**Request body** (partial)
```json
{
  "phone": "+212699999999",
  "address": "New address"
}
```

| Code | Description |
|------|-------------|
| 200 | Updated patient object |
| 404 | Not found or soft-deleted |
| 409 | New CIN belongs to another patient |

---

#### DELETE /api/patients/:id

Requires JWT. Admin role only. Soft-deletes the patient by setting `deletedAt = NOW()`. Data is not physically removed.

**Response 200**
```json
{ "message": "Patient soft-deleted" }
```

| Code | Description |
|------|-------------|
| 200 | Success |
| 403 | Insufficient role (staff) |
| 404 | Patient not found |

---

### Appointments

#### POST /api/appointments

Requires JWT. Creates a new appointment with `status: "pending"` by default.

**Request body**
```json
{
  "patientId": "a1b2c3d4-...",
  "appointmentDate": "2024-07-15T09:00:00.000Z",
  "notes": "Post-operative follow-up consultation"
}
```

**Response 201**
```json
{
  "id": "...",
  "patientId": "a1b2c3d4-...",
  "createdBy": "5ff2a4d1-...",
  "appointmentDate": "2024-07-15T09:00:00.000Z",
  "status": "pending",
  "notes": "Post-operative follow-up consultation",
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

| Code | Description |
|------|-------------|
| 201 | Created |
| 400 | Invalid UUID, malformed date |
| 404 | Patient not found or soft-deleted |
| 409 | Conflict: confirmed appointment within +/- 30 minutes |

---

#### GET /api/appointments

Requires JWT. Paginated list of appointments with optional filters.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |
| date | YYYY-MM-DD | Filter by UTC calendar day |
| status | pending or confirmed or cancelled | Filter by status |

**Example**
```
GET /api/appointments?date=2024-07-15&status=confirmed
```

**Response 200**
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
| 200 | Success |
| 400 | Invalid status value |

---

#### PATCH /api/appointments/:id/status

Requires JWT. Updates the status of an appointment.

**Request body**
```json
{ "status": "confirmed" }
```

Accepted values: `pending` `confirmed` `cancelled`

**Response 200** — Updated appointment object

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid status value |
| 404 | Appointment not found |
| 409 | Conflict: confirming would create a 30-minute overlap with another confirmed appointment |

---

### Dashboard

#### GET /api/dashboard/stats

Requires JWT. Returns four aggregated metrics in a single request.

**Response 200**
```json
{
  "totalPatients": 42,
  "appointmentsToday": 7,
  "pendingCount": 12,
  "confirmedCount": 8
}
```

| Field | Calculation |
|-------|-------------|
| totalPatients | COUNT patients WHERE deletedAt IS NULL |
| appointmentsToday | COUNT WHERE appointmentDate BETWEEN 00:00:00 AND 23:59:59 UTC today |
| pendingCount | COUNT WHERE status = pending (all dates) |
| confirmedCount | COUNT WHERE status = confirmed (all dates) |

---

### Error Format

All errors follow a consistent JSON shape:

```json
{
  "error": "Descriptive message",
  "details": [
    { "field": "email", "message": "Invalid email" },
    { "field": "cin",   "message": "cin is required" }
  ]
}
```

`details` is only present on validation failures (HTTP 400).

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation failed |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate CIN or appointment overlap) |
| 500 | Internal server error |

---

## Features

**Security**
- Passwords hashed with bcrypt (cost factor 10)
- JWT with 24h expiration — payload: id, email, role
- Auth middleware on all protected routes
- Role middleware for admin-only actions
- Zod validation on all inputs (body and query params)
- Stack traces never exposed in HTTP responses

**Patient management**
- Full CRUD with unique CIN validation
- Soft delete — `deletedAt` timestamp, data preserved
- Case-insensitive search on fullName and CIN
- Pagination with metadata (total, page, totalPages)

**Appointment management**
- Creation with `status: pending` by default
- 30-minute anti-conflict rule (exclusive boundaries)
- Serializable transaction for concurrent request safety
- Combined filters: UTC date and status
- Status update with conflict re-check

**Dashboard**
- Four metrics in a single parallel Prisma transaction
- `appointmentsToday` calculated in UTC

**Frontend**
- Persistent authentication via localStorage
- JWT expiry detected on load and on 401 response
- Protected routes with redirect to login
- Delete button visible only for admin users
- Field-level validation errors displayed inline
- Loading indicator on all requests

---

## Installation

**Prerequisites**: Node.js v18+, npm v9+, PostgreSQL or Neon account

### 1. Clone the repository

```bash
git clone https://github.com/Ayoub-glitsh/clinicflow-pern.git
cd clinicflow-pern
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

```bash
cd backend && cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:pass@pooler-host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@direct-host/dbname?sslmode=require"
JWT_SECRET="your-strong-jwt-secret"
JWT_EXPIRES_IN="24h"
PORT=5000
```

For Neon: `DATABASE_URL` uses the pooler URL, `DIRECT_URL` uses the direct URL (without `-pooler` in the hostname). `DIRECT_URL` is required for migrations.

### 4. Run migrations and seed

```bash
cd backend

# Generate Prisma client
PRISMA_GENERATE_SKIP_AUTOINSTALL=true npx prisma generate

# Apply migrations
npx prisma migrate dev --name init

# Seed the database
npx ts-node prisma/seed.ts
```

### 5. Start the servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# API available at http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev
# App available at http://localhost:5173
```

---

## Tests

```bash
cd backend
npm test
```

### Results

```
Test Suites: 11 passed, 11 total
Tests:       45 passed, 45 total
Time:        ~12s
```

### Test coverage

| Type | File | What is tested |
|------|------|----------------|
| Unit | middleware.test.ts | authMiddleware, requireRole, validate, errorMiddleware |
| Unit | auth.service.test.ts | Login valid/invalid, getMe without passwordHash |
| Unit | patients.service.test.ts | CIN conflict, soft-delete, pagination metadata |
| Unit | appointments.service.test.ts | Conflict at 29min, boundary at 30min, 31min, self-exclusion |
| Integration | auth.test.ts | POST /login, GET /me |
| Integration | patients.test.ts | Full CRUD with role checks |
| Integration | appointments.test.ts | POST, GET, PATCH status |
| Integration | dashboard.test.ts | GET /stats, 401 without token |
| Property P1 | conflict.test.ts | Rejection guaranteed for offset in 1-29 min — 100 runs |
| Property P2 | conflict.test.ts | Accepted at exactly 30 min offset — 100 runs |
| Property P3 | patients.test.ts | Soft-deleted patients absent from all lists — 100 runs |
| Property P4 | patients.test.ts | data.length never exceeds limit — 100 runs |
| Property P5 | auth.test.ts | Any invalid token returns 401 — 50 runs |
| Property P6 | auth.test.ts | Staff always gets 403 on DELETE patient — 50 runs |

---

## Seed Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinicflow.com | Admin123! |
| Staff | staff1@clinicflow.com | Staff123! |
| Staff | staff2@clinicflow.com | Staff123! |

**Seeded data**: 5 patients, 10 appointments (4 pending, 3 confirmed, 3 cancelled)
