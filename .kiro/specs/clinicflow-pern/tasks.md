# Implementation Plan: ClinicFlow (PERN Stack)

## Overview

The implementation follows the layered backend architecture (routes → controllers → services → Prisma) and a React SPA frontend. Tasks are ordered by dependency: project scaffold and infrastructure first, then backend core utilities, middleware, feature modules, frontend, and finally testing. All code is TypeScript throughout.

---

## Tasks

- [x] 1. Scaffold project structure
  - [x] 1.1 Create monorepo root with `backend/` and `frontend/` directories
    - Initialize root `package.json` with workspaces
    - Create `backend/tsconfig.json` (target ES2020, module CommonJS, strict mode, `outDir: dist`, `rootDir: src`, `esModuleInterop: true`, `paths` aliases)
    - Create `backend/package.json` with dependencies: `express`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `zod`, `cors`, `dotenv`; devDependencies: `typescript`, `ts-node-dev`, `prisma`, `@types/*`, `jest`, `ts-jest`, `supertest`, `@types/supertest`, `fast-check`
    - Create `backend/.env.example` with `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`
    - Create `backend/src/` directory skeleton: `routes/`, `controllers/`, `services/`, `middleware/`, `schemas/`, `types/`, `utils/`, `prisma/`
    - _Requirements: 10.1, 14.1, 14.2, 14.4_

  - [x] 1.2 Create `backend/prisma/schema.prisma` with full data model
    - Define `UserRole` enum (`admin`, `staff`) and `AppointmentStatus` enum (`pending`, `confirmed`, `cancelled`)
    - Define `User` model with UUID PK, unique email, `passwordHash`, `role`, `createdAt`, and `appointments` relation
    - Define `Patient` model with UUID PK, `fullName`, unique `cin`, `birthDate` (Date), `phone`, `createdAt`, nullable `deletedAt`; indexes on `fullName` and `cin`
    - Define `Appointment` model with UUID PK, `patientId` FK (cascade delete), `createdBy` FK (set null), `appointmentDate` TIMESTAMPTZ, `status` (default pending), nullable `notes`, `createdAt`; index on `appointmentDate`
    - Run `npx prisma migrate dev --name init` to generate the initial migration
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.10_

  - [x] 1.3 Write Prisma seed script (`backend/prisma/seed.ts`)
    - Create 1 admin user and 2 staff users; hash all passwords with bcrypt cost factor 10
    - Create 5 patients with distinct CIN values
    - Create 10 appointments distributed 4 pending / 3 confirmed / 3 cancelled across the 5 patients (each patient at least 1 appointment)
    - Use idempotent upsert logic keyed on `email` (users), `cin` (patients), and `patientId + appointmentDate` (appointments) to prevent duplicates on re-run
    - Register seed script in `backend/package.json` under `"prisma": { "seed": "ts-node prisma/seed.ts" }`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [x] 2. Implement backend core utilities and middleware
  - [x] 2.1 Create `AppError` utility (`backend/src/utils/AppError.ts`)
    - Implement class extending `Error` with `statusCode: number`, overridden `message`, and optional `details?: { field: string; message: string }[]`
    - Export class for use by services and middleware
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 2.2 Create JWT helpers (`backend/src/utils/jwt.ts`)
    - Implement `signToken(payload: { id: string; email: string; role: UserRole }): string` using `process.env.JWT_SECRET` and `process.env.JWT_EXPIRES_IN`
    - Implement `verifyToken(token: string): JwtPayload` that throws on invalid or expired tokens
    - Export both helpers; augment `backend/src/types/express.d.ts` to add `user: { id: string; email: string; role: UserRole }` to `Express.Request`
    - _Requirements: 1.1, 1.4_

  - [x] 2.3 Create Prisma singleton client (`backend/src/prisma/client.ts`)
    - Export a single `PrismaClient` instance; handle `global` caching for ts-node-dev hot reload to avoid connection pool exhaustion
    - _Requirements: 10.4, 10.5_

  - [x] 2.4 Implement `auth.middleware.ts`
    - Extract `Authorization: Bearer <token>` header; return HTTP 401 `{ error: "No token provided" }` if missing
    - Call `verifyToken`; attach decoded payload to `req.user`; return HTTP 401 `{ error: "Invalid or expired token" }` on any error
    - _Requirements: 1.3, 1.4_

  - [x] 2.5 Implement `role.middleware.ts`
    - Export `requireRole(...roles: UserRole[])` factory that returns Express middleware
    - Return HTTP 403 `{ error: "Forbidden" }` if `req.user.role` is not in the allowed roles list
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.6 Implement `validate.middleware.ts`
    - Export `validate(schema: ZodSchema)` factory that calls `schema.safeParse(req.body)`
    - On failure, return HTTP 400 `{ error: "Validation failed", details: [{field, message}] }` mapping `e.path.join('.')` as field
    - On success, replace `req.body` with `result.data` and call `next()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.7 Implement `error.middleware.ts`
    - Export 4-parameter Express error handler that checks `instanceof AppError` → respond with `err.statusCode` and `{ error: err.message, ...(err.details && { details: err.details }) }`
    - For all other errors, log to console and respond with HTTP 500 `{ error: "Internal server error" }` without leaking stack traces
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 2.8 Write unit tests for middleware
    - Test `validate.middleware`: valid body passes through; invalid body returns 400 with correct `details` structure; `req.body` is replaced with parsed data
    - Test `error.middleware`: `AppError` instances map to correct status codes; unknown errors return 500; stack trace is absent from response body
    - Test `auth.middleware`: missing header returns 401; malformed token returns 401; valid token populates `req.user`
    - Test `role.middleware`: non-admin role on admin-only call returns 403; admin role passes through
    - _Requirements: 7.1, 8.1, 1.3, 2.1_

- [x] 3. Implement Zod schemas
  - [x] 3.1 Create `backend/src/schemas/auth.schemas.ts`
    - Export `loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })`
    - _Requirements: 7.1_

  - [x] 3.2 Create `backend/src/schemas/patient.schemas.ts`
    - Export `createPatientSchema` requiring `fullName`, `cin`, `birthDate` (regex `YYYY-MM-DD`), `phone`; all strings, trimmed
    - Export `updatePatientSchema` as partial version of `createPatientSchema` (all fields optional); reject `birthDate` values containing a time component
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 3.3 Create `backend/src/schemas/appointment.schemas.ts`
    - Export `createAppointmentSchema` requiring `patientId` (UUID), `appointmentDate` (ISO 8601 via `z.string().datetime()`), optional `notes`
    - Export `updateStatusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled']) })`
    - Export `appointmentQuerySchema` for `GET /api/appointments` query params: optional `page`, `limit`, `date` (YYYY-MM-DD), `status` (enum); return HTTP 400 if `status` is provided but invalid
    - _Requirements: 7.1, 7.4, 7.6, 4.13, 4.14_

- [x] 4. Implement Auth module
  - [x] 4.1 Implement `backend/src/services/auth.service.ts`
    - `login(email, password)`: find user by email; `bcrypt.compare` against `passwordHash`; throw `AppError(401, "Invalid email or password")` on any mismatch (do not distinguish which field); sign and return JWT + `{ id, email, role }`
    - `getMe(userId)`: find user by id, return `{ id, email, role }` (no passwordHash)
    - _Requirements: 1.1, 1.2, 1.5, 1.6_

  - [x] 4.2 Implement `backend/src/controllers/auth.controller.ts`
    - `login`: extract body (already validated), call `authService.login`, return 200 `{ token, user }`
    - `getMe`: call `authService.getMe(req.user.id)`, return 200
    - _Requirements: 1.1, 1.5, 10.3, 10.4_

  - [x] 4.3 Implement `backend/src/routes/auth.routes.ts`
    - Register `POST /login` with `validate(loginSchema)` + `authController.login`
    - Register `GET /me` with `authMiddleware` + `authController.getMe`
    - _Requirements: 1.1, 1.5, 10.2_

  - [ ]* 4.4 Write unit tests for auth service
    - Test login with valid credentials returns token and user object
    - Test login with wrong password returns 401 without revealing which field was wrong
    - Test login with non-existent email returns 401
    - Test `getMe` returns user without `passwordHash`
    - _Requirements: 1.1, 1.2, 1.5, 1.6_

- [x] 5. Implement Patients module
  - [x] 5.1 Implement `backend/src/services/patients.service.ts`
    - `createPatient(data)`: check CIN uniqueness (including soft-deleted rows); throw `AppError(409, ...)` on duplicate; create and return patient with `createdAt`
    - `getPatients({ page, limit, search })`: query non-deleted patients with optional case-insensitive `fullName` or `cin` contains filter; return `{ data, total, page, limit, totalPages }`
    - `getPatientById(id)`: find non-deleted patient; throw `AppError(404, ...)` if not found or soft-deleted
    - `updatePatient(id, data)`: find non-deleted patient (404 if missing); check CIN uniqueness excluding self (409 if taken); update and return
    - `softDeletePatient(id)`: find non-deleted patient (404 if not found); set `deletedAt = new Date()`; return updated record
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 3.10, 3.11, 3.12, 3.13, 9.9_

  - [x] 5.2 Implement `backend/src/controllers/patients.controller.ts`
    - `create`: call `patientsService.createPatient(req.body)`, return 201
    - `list`: parse page/limit/search from query, call `patientsService.getPatients(...)`, return 200
    - `getById`: call `patientsService.getPatientById(req.params.id)`, return 200
    - `update`: call `patientsService.updatePatient(req.params.id, req.body)`, return 200
    - `softDelete`: call `patientsService.softDeletePatient(req.params.id)`, return 200 `{ message: "Patient soft-deleted" }`
    - _Requirements: 3.1, 3.4, 3.7, 3.9, 10.3, 10.4_

  - [x] 5.3 Implement `backend/src/routes/patients.routes.ts`
    - `POST /` — `validate(createPatientSchema)` + `patientsController.create`
    - `GET /` — `patientsController.list`
    - `GET /:id` — `patientsController.getById`
    - `PUT /:id` — `validate(updatePatientSchema)` + `patientsController.update`
    - `DELETE /:id` — `requireRole('admin')` + `patientsController.softDelete`
    - _Requirements: 2.2, 3.8, 10.2_

  - [ ]* 5.4 Write unit tests for patients service
    - Test CIN conflict on creation (including soft-deleted patient with same CIN returns 409)
    - Test soft-delete: `deletedAt` is set; subsequent `getPatientById` returns 404
    - Test paginated list: correct `totalPages` math; `search` filters by `fullName` and `cin` case-insensitively
    - Test `updatePatient` with CIN belonging to another patient returns 409
    - _Requirements: 3.3, 3.5, 3.6, 3.9, 3.10, 3.12_

- [x] 6. Implement Appointments module
  - [x] 6.1 Implement `backend/src/services/appointments.service.ts`
    - Implement `findConflict(patientId, appointmentDate, excludeId?)` using strict `gt`/`lt` bounds for the 30-minute window against `confirmed` appointments
    - `createAppointment(data, userId)`: run inside a `Serializable` Prisma transaction; check conflict; throw `AppError(409, ...)` on conflict or P2034 serialization error (→ also 409); create with `status: 'pending'` and `createdBy: userId`
    - `getAppointments({ page, limit, date, status })`: build where clause with UTC day range for `date` filter and exact match for `status`; paginate; return metadata
    - `updateAppointmentStatus(id, newStatus)`: find appointment (404 if missing); if `newStatus === 'confirmed'`, call `findConflict` with self-exclusion; throw 409 on conflict; update and return
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.2 Implement `backend/src/controllers/appointments.controller.ts`
    - `create`: call `appointmentsService.createAppointment(req.body, req.user.id)`, return 201
    - `list`: parse and validate query params, call `appointmentsService.getAppointments(...)`, return 200
    - `updateStatus`: call `appointmentsService.updateAppointmentStatus(req.params.id, req.body.status)`, return 200
    - _Requirements: 4.3, 4.5, 10.3, 10.4_

  - [x] 6.3 Implement `backend/src/routes/appointments.routes.ts`
    - `POST /` — `validate(createAppointmentSchema)` + `appointmentsController.create`
    - `GET /` — `appointmentsController.list`
    - `PATCH /:id/status` — `validate(updateStatusSchema)` + `appointmentsController.updateStatus`
    - _Requirements: 4.1, 4.5, 4.8, 10.2_

  - [ ]* 6.4 Write unit tests for appointments service
    - Test conflict at 29 min offset → 409; no conflict at 30 min offset → success; no conflict at 31 min offset → success
    - Test status update to `confirmed` with self-exclusion: same appointment not treated as its own conflict
    - Test `GET /appointments` with date filter returns only appointments on that UTC calendar day
    - Test `GET /appointments` with both `date` and `status` filters applies AND logic
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 4.9, 4.10, 4.11_

- [x] 7. Implement Dashboard module
  - [x] 7.1 Implement `backend/src/services/dashboard.service.ts`
    - Use a single Prisma `$transaction([...])` to run all four counts in parallel:
      - `totalPatients`: `count` where `deletedAt IS NULL`
      - `appointmentsToday`: `count` where `appointmentDate >= start of UTC day` AND `< start of next UTC day`
      - `pendingCount`: `count` where `status = pending`
      - `confirmedCount`: `count` where `status = confirmed`
    - Return `{ totalPatients, appointmentsToday, pendingCount, confirmedCount }`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 Implement `backend/src/controllers/dashboard.controller.ts`
    - `getStats`: call `dashboardService.getStats()`, return 200 with the stats object
    - _Requirements: 6.5, 10.3_

  - [x] 7.3 Implement `backend/src/routes/dashboard.routes.ts`
    - `GET /stats` — `dashboardController.getStats`
    - _Requirements: 6.1, 10.2_

- [x] 8. Wire up Express app and server entry point
  - [x] 8.1 Implement `backend/src/app.ts`
    - Create Express instance; apply `cors()` and `express.json()` first
    - Mount `authRouter` at `/api/auth` **before** `authMiddleware`
    - Apply `authMiddleware` globally after auth routes
    - Mount `patientRouter` at `/api/patients`, `appointmentRouter` at `/api/appointments`, `dashboardRouter` at `/api/dashboard`
    - Register `errorMiddleware` as the last middleware (4-param signature)
    - Export the `app` instance without calling `listen()`
    - _Requirements: 10.6, 10.1_

  - [x] 8.2 Implement `backend/src/server.ts`
    - Import `app` from `app.ts`; call `app.listen(process.env.PORT ?? 5000, ...)` and log the port
    - This file is the process entry point; `app.ts` is the testable unit
    - _Requirements: 10.6_

- [x] 9. Checkpoint — backend integration tests
  - [x] 9.1 Configure Jest + Supertest for integration tests
    - Create `backend/jest.config.ts` with `ts-jest` preset, `testEnvironment: 'node'`
    - Create test helpers: `testApp` import from `app.ts`, DB reset/teardown utilities using `prisma.$transaction` to clean tables between tests
    - _Requirements: 10.6_

  - [ ]* 9.2 Write integration tests for Auth endpoints
    - `POST /api/auth/login` — valid credentials return 200 with `{ token, user }`; wrong password returns 401; unknown email returns 401; response does not distinguish which field failed
    - `GET /api/auth/me` — valid token returns user without `passwordHash`; no token returns 401; expired token returns 401
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 9.3 Write integration tests for Patients endpoints
    - `POST /api/patients` — success returns 201; duplicate CIN returns 409; missing field returns 400 with `details`
    - `GET /api/patients` — pagination metadata correct; `search` filters correctly; soft-deleted patients excluded
    - `PUT /api/patients/:id` — success returns 200; soft-deleted target returns 404; CIN of another patient returns 409
    - `DELETE /api/patients/:id` — admin succeeds with 200; staff returns 403
    - `GET /api/patients/:id` — soft-deleted returns 404
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.12_

  - [ ]* 9.4 Write integration tests for Appointments endpoints
    - `POST /api/appointments` — success returns 201 with `status: "pending"`; conflict within 30 min returns 409; no conflict at exactly 30 min
    - `GET /api/appointments` — date and status filters; pagination; invalid status query param returns 400
    - `PATCH /api/appointments/:id/status` — valid transition returns 200; missing id returns 404; confirm with conflict returns 409; self-exclusion works
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.14, 5.1, 5.3_

  - [ ]* 9.5 Write integration tests for Dashboard endpoint
    - `GET /api/dashboard/stats` — returns all four counts; `appointmentsToday` only counts today's appointments; `totalPatients` excludes soft-deleted; valid JWT required
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Property-based tests (fast-check)
  - [x] 10.1 Configure fast-check
    - Install `fast-check` as devDependency in `backend/`
    - Create `backend/src/__tests__/properties/` directory; configure Jest to pick up test files there
    - _Requirements: (test infrastructure)_

  - [ ]* 10.2 Write property test for P1 — Appointment Conflict Rejection
    - **Property 1: Appointment Conflict Rejection**
    - For any `baseDate` and offset in [1, 29] minutes, creating a second confirmed appointment within the window always returns HTTP 409, and only one confirmed appointment exists in the window afterward
    - Use `fc.date()` and `fc.integer({ min: 1, max: 29 })` generators; run 100 iterations
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ]* 10.3 Write property test for P2 — Appointment Conflict Boundary Acceptance
    - **Property 2: Appointment Conflict Boundary Acceptance**
    - For any `baseDate`, an appointment at exactly `baseDate + 30 minutes` is always accepted (not a conflict)
    - Use `fc.date()` generator; run 100 iterations
    - **Validates: Requirements 5.1**

  - [ ]* 10.4 Write property test for P3 — Soft-Delete Visibility Exclusion
    - **Property 3: Soft-Delete Visibility Exclusion**
    - For any patient record that has been soft-deleted, it is absent from `GET /api/patients`, `GET /api/patients?search=...`, and `GET /api/patients/:id`
    - Use `fc.record({ fullName: fc.string(), cin: fc.string(), ... })` generators; run 100 iterations
    - **Validates: Requirements 3.5, 3.12, 9.9**

  - [ ]* 10.5 Write property test for P4 — Pagination Result Bound
    - **Property 4: Pagination Result Bound**
    - For any `limit` L (1–100) and `page` N (≥1), `data.length <= L` always holds on `GET /api/patients` and `GET /api/appointments`
    - Use `fc.integer({ min: 1, max: 100 })` and `fc.integer({ min: 1 })` generators; run 100 iterations
    - **Validates: Requirements 3.9, 4.8**

  - [ ]* 10.6 Write property test for P5 — Invalid JWT Rejection
    - **Property 5: Invalid JWT Rejection**
    - For any random string token and any expired-date-based token, all protected endpoints return HTTP 401 and the request does not reach any route handler
    - Use `fc.string()` and `fc.date({ max: new Date(Date.now() - 1) })` generators; run 100 iterations
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 10.7 Write property test for P6 — Role Guard Enforcement
    - **Property 6: Role Guard Enforcement**
    - For any request to `DELETE /api/patients/:id` (or any `/api/users` endpoint) by an authenticated `staff` user, the response is always HTTP 403
    - Use `fc.constantFrom('staff')` generator; run 100 iterations
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 11. Scaffold React + Vite frontend
  - [x] 11.1 Initialize Vite + React + TypeScript frontend
    - Run `npm create vite@latest frontend -- --template react-ts` inside the project root
    - Install Tailwind CSS v3: `npm install -D tailwindcss postcss autoprefixer` + `npx tailwindcss init -p`
    - Configure `tailwind.config.ts` content paths to `./src/**/*.{ts,tsx}`
    - Add Tailwind directives to `src/index.css`; import in `main.tsx`
    - Install `axios`, `react-router-dom`, `jwt-decode`
    - Create `frontend/tsconfig.json` with `strict: true`, `jsx: react-jsx`
    - _Requirements: 12.1_

  - [x] 11.2 Create shared TypeScript types (`frontend/src/types/api.ts`)
    - Define interfaces: `User`, `Patient`, `Appointment`, `PaginatedResponse<T>`, `DashboardStats`, `ApiError`, `ValidationErrorDetail`
    - _Requirements: 11.1, 11.4, 11.5, 11.8_

- [x] 12. Implement frontend auth layer
  - [x] 12.1 Create Axios instance with interceptors (`frontend/src/api/axios.ts`)
    - Set `baseURL` to `/api`
    - Request interceptor: read `localStorage.getItem('token')` and attach as `Authorization: Bearer <token>`
    - Response interceptor: on HTTP 401, remove token from localStorage and redirect to `/login` via `window.location.href`
    - _Requirements: 11.11, 11.12_

  - [x] 12.2 Implement `AuthContext` and `AuthProvider` (`frontend/src/context/AuthContext.tsx`)
    - On mount: read token from localStorage; decode with `jwt-decode`; check `exp` claim; if expired, clear token
    - `login(token)`: store in localStorage, decode, populate `user` state
    - `logout()`: clear localStorage, reset state, redirect to `/login`
    - Export `useAuth` hook for consuming context
    - _Requirements: 11.2, 11.12, 11.13_

  - [x] 12.3 Implement `ProtectedRoute` (`frontend/src/routes/ProtectedRoute.tsx`)
    - Read token/user from `AuthContext`; if null, `<Navigate to="/login" />`; otherwise render `<Outlet />`
    - _Requirements: 11.11_

  - [x] 12.4 Implement `AppLayout` with Sidebar (`frontend/src/components/layout/AppLayout.tsx` and `Sidebar.tsx`)
    - Sidebar renders nav links: Dashboard, Patients, Appointments; uses `NavLink` for active styling
    - User management link visible only when `user.role === 'admin'`
    - Render `<Outlet />` in main content area
    - Login page does NOT use `AppLayout`
    - _Requirements: 11.13, 12.4_

- [x] 13. Implement shared UI components
  - [x] 13.1 Create `Spinner`, `ErrorBanner`, `FieldError`, and `Pagination` components
    - `Spinner.tsx`: centered loading indicator shown while any API request is in progress; remove once settled
    - `ErrorBanner.tsx`: dismissible banner for non-2xx errors; include operation description and "please retry" instruction; accepts optional `details[]` for orphaned field errors; persists until dismissed or replaced
    - `FieldError.tsx`: render field-level error message adjacent to its input
    - `Pagination.tsx`: accepts `page`, `totalPages`, `onPageChange`; renders prev/next controls
    - _Requirements: 12.2, 12.3, 12.5, 12.6, 12.7_

- [x] 14. Implement App router and page shell
  - [x] 14.1 Wire up `App.tsx` with React Router
    - Wrap entire app in `<AuthProvider>` and `<BrowserRouter>`
    - Public route: `/login` → `<LoginPage />`
    - Protected routes nested under `<ProtectedRoute>` and `<AppLayout>`: `/dashboard`, `/patients`, `/patients/:id`, `/appointments`
    - Catch-all `*` → `<Navigate to="/dashboard" />`
    - _Requirements: 11.1, 11.4, 11.5, 11.7, 11.8_

- [x] 15. Implement Login page
  - [x] 15.1 Implement `frontend/src/pages/LoginPage.tsx`
    - Controlled email + password inputs; submit calls `POST /api/auth/login` via Axios instance
    - On success: call `auth.login(token)` and `navigate('/dashboard')`
    - On 401/400: display `<ErrorBanner>` with API error message
    - Show `<Spinner>` during request; no `AppLayout` sidebar on this page
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 16. Implement Dashboard page
  - [x] 16.1 Implement `frontend/src/pages/DashboardPage.tsx`
    - On mount, call `GET /api/dashboard/stats`
    - Render 4 stat cards: Total Patients, Appointments Today, Pending, Confirmed — styled with Tailwind
    - Show `<Spinner>` during fetch; show `<ErrorBanner>` on error
    - _Requirements: 11.4, 12.2, 12.3_

- [ ] 17. Implement Patients pages and components
  - [x] 17.1 Implement `PatientsListPage.tsx` with `PatientTable.tsx`
    - Fetch `GET /api/patients?page=N&limit=10&search=...` on mount and on search/page change
    - Debounce search input (300 ms) before triggering API call
    - Render `<PatientTable>` with columns: name, CIN, phone, birth date, actions
    - "Add Patient" button opens `<PatientForm>` in create mode
    - "Edit" button per row opens `<PatientForm>` in edit mode pre-populated with patient data
    - "Delete" button rendered only when `user.role === 'admin'`; calls `DELETE /api/patients/:id` and refreshes list
    - `<Pagination>` component for page navigation
    - _Requirements: 11.5, 11.6, 11.13, 12.2, 12.3_

  - [x] 17.2 Implement `PatientForm.tsx` (create/edit modal or page)
    - Controlled inputs for `fullName`, `cin`, `birthDate`, `phone`
    - On submit: `POST /api/patients` (create) or `PUT /api/patients/:id` (edit)
    - On HTTP 400: map `details` array to field errors; render `<FieldError>` next to each field; render `<ErrorBanner>` with count/summary at top; orphaned field errors shown only in banner
    - On success: close form and refresh list
    - _Requirements: 11.6, 12.5, 12.6, 12.7_

  - [x] 17.3 Implement `PatientDetailPage.tsx`
    - Fetch `GET /api/patients/:id` and `GET /api/appointments?patientId=...` (or filter client-side from loaded appointments)
    - Display full patient info; list associated appointments with status badges
    - Show `<Spinner>` during fetch; `<ErrorBanner>` on 404 or other error
    - _Requirements: 11.7, 12.2, 12.3_

- [x] 18. Implement Appointments page and components
  - [x] 18.1 Implement `AppointmentsPage.tsx` with `AppointmentTable.tsx` and `StatusBadge.tsx`
    - Fetch `GET /api/appointments` with optional `date` and `status` filter params; paginated
    - Render `<AppointmentTable>` with columns: patient name, date/time, status, notes, actions
    - `StatusBadge.tsx`: color-coded badge for `pending` / `confirmed` / `cancelled`
    - Date filter input (date picker or text) and status filter dropdown; applying either triggers re-fetch
    - Status update control: dropdown or button per row calling `PATCH /api/appointments/:id/status`
    - "Create Appointment" button opens `<AppointmentForm>`
    - `<Pagination>` for page navigation
    - _Requirements: 11.8, 11.9, 11.10, 12.2, 12.3_

  - [x] 18.2 Implement `AppointmentForm.tsx`
    - Controlled inputs for `patientId` (dropdown of patients), `appointmentDate` (datetime-local), optional `notes`
    - On submit: `POST /api/appointments`
    - On HTTP 400: field-level `<FieldError>` + `<ErrorBanner>` summary; orphaned details in banner
    - On HTTP 409: show conflict error in `<ErrorBanner>` with the conflicting appointment's date/time
    - On success: close form and refresh list
    - _Requirements: 11.8, 12.5, 12.6, 12.7_

- [x] 19. Final checkpoint
  - Ensure all backend and frontend tests pass. Confirm the seed script runs idempotently (`npx prisma db seed` twice should not create duplicates). Start both dev servers (`npm run dev` in `backend/` and `frontend/`), navigate through all pages, and verify role-based UI restrictions work as specified. Ask the user if any questions arise.

- [x] 20. Documentation
  - [x] 20.1 Write `README.md` at project root
    - Prerequisites section: Node.js ≥ 18, PostgreSQL 15
    - Step-by-step installation: clone → `cd backend && npm install` → `cd ../frontend && npm install`
    - Environment variable setup: copy `.env.example` to `.env`, fill in values
    - Database commands: `npx prisma migrate dev`, `npx prisma db seed`
    - Start commands: `npm run dev` (backend), `npm run dev` (frontend)
    - Test command: `npm test` (in `backend/`)
    - Document all 4 required env vars with descriptions and example values
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 20.2 Verify `.env.example` completeness
    - Confirm `backend/.env.example` contains exactly `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT` — no extras, no missing entries
    - _Requirements: 14.4_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery, but are strongly recommended for a production-quality application.
- Property tests (10.2–10.7) require a running test database; configure `DATABASE_URL` in the test environment to point to a separate test DB.
- The Prisma serializable transaction in `appointments.service.ts` (Task 6.1) is the primary concurrency safety mechanism for P1/P6.
- Frontend forms must show orphaned field errors (details with no matching form field) in the `<ErrorBanner>` rather than silently dropping them (Requirement 12.7).
- `app.ts` is exported without calling `listen()` to allow Supertest to bind the app in tests without port conflicts.
- All property tests run a minimum of 100 iterations (`numRuns: 100` in `fc.assert`).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.2", "2.3", "11.1"] },
    { "id": 2, "tasks": ["2.4", "2.5", "2.6", "2.7", "3.1", "3.2", "3.3", "11.2"] },
    { "id": 3, "tasks": ["2.8", "4.1", "5.1", "6.1", "7.1", "12.1", "12.2"] },
    { "id": 4, "tasks": ["4.2", "5.2", "6.2", "7.2", "4.4", "5.4", "6.4", "12.3", "12.4", "13.1"] },
    { "id": 5, "tasks": ["4.3", "5.3", "6.3", "7.3", "14.1"] },
    { "id": 6, "tasks": ["8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1", "10.1", "15.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "9.4", "9.5", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "16.1", "17.1", "17.2", "17.3", "18.1", "18.2"] },
    { "id": 9, "tasks": ["20.1", "20.2"] }
  ]
}
```
