# ClinicFlow — Clinic Management System

A production-quality full-stack web application for managing patients, appointments, and staff at a small clinic. Built with the PERN stack (PostgreSQL, Express, React, Node.js) and TypeScript.

## Features

- JWT-based authentication with admin/staff roles
- Patient management with soft delete, paginated search
- Appointment management with 30-minute conflict prevention
- Administrative dashboard with live statistics
- Full Zod input validation and consistent error handling

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v15 or higher
- **npm** v9 or higher

## Project Structure

```
clinicflow-pern/
├── backend/       # Express + Node.js + Prisma API
├── frontend/      # React + Vite + Tailwind CSS SPA
├── package.json   # Root workspace config
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd clinicflow-pern
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env` with your values:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/clinicflow` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-super-secret-key-change-in-production` |
| `JWT_EXPIRES_IN` | JWT token lifetime | `24h` |
| `PORT` | Backend listening port | `5000` |

### 5. Run database migrations

```bash
cd backend
PRISMA_GENERATE_SKIP_AUTOINSTALL=true npx prisma migrate dev --name init
```

### 6. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- 1 admin user: `admin@clinicflow.com` / `Admin123!`
- 2 staff users: `staff1@clinicflow.com` / `Staff123!`, `staff2@clinicflow.com` / `Staff123!`
- 5 patients
- 10 appointments (4 pending, 3 confirmed, 3 cancelled)

### 7. Start the development servers

**Backend** (in one terminal):
```bash
cd backend
npm run dev
```
API available at `http://localhost:5000`

**Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```
App available at `http://localhost:5173`

## Running Tests

```bash
cd backend
npm test
```

This runs 45 tests across 11 test suites including:
- Unit tests (middleware, auth, patients, appointments)
- Integration tests (all API endpoints)
- Property-based tests with fast-check (P1–P6 correctness properties)

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with email + password |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/patients` | JWT | Create patient |
| GET | `/api/patients` | JWT | List patients (paginated + search) |
| GET | `/api/patients/:id` | JWT | Get patient by ID |
| PUT | `/api/patients/:id` | JWT | Update patient |
| DELETE | `/api/patients/:id` | Admin | Soft-delete patient |
| POST | `/api/appointments` | JWT | Create appointment |
| GET | `/api/appointments` | JWT | List appointments (filtered) |
| PATCH | `/api/appointments/:id/status` | JWT | Update appointment status |
| GET | `/api/dashboard/stats` | JWT | Get dashboard statistics |

## Technology Stack

**Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcrypt

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios

**Testing**: Jest, Supertest, fast-check (property-based testing)
