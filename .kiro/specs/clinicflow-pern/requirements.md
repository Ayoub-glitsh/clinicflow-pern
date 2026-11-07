# Requirements Document

## Introduction

ClinicFlow is a full-stack web application built on the PERN stack (PostgreSQL, Express, React, Node.js) with TypeScript. It is designed to help small clinics manage patients, appointments, and staff users through a role-based access control system. The application exposes a RESTful API consumed by a React frontend and enforces business rules such as appointment conflict prevention, paginated search, and a statistical dashboard.

---

## Glossary

- **System**: The ClinicFlow application (backend + frontend collectively).
- **API**: The Express/Node.js backend HTTP interface.
- **Frontend**: The React/TypeScript single-page application.
- **Admin**: A user with role `admin` who has full access to all resources, including destructive operations.
- **Staff**: A user with role `staff` who can manage patients and appointments but cannot delete patients or manage other users.
- **Patient**: A clinic patient record identified by a unique CIN.
- **CIN**: Carte d'Identité Nationale — a unique national identity number used as a business key for patients.
- **Appointment**: A scheduled visit linking a Patient to a date/time slot, with a status lifecycle.
- **Appointment_Status**: An enumerated value — one of `pending`, `confirmed`, or `cancelled`.
- **JWT**: JSON Web Token used for stateless authentication.
- **Auth_Middleware**: Server-side middleware that validates the JWT on protected routes.
- **Role_Middleware**: Server-side middleware that enforces role-based access control after authentication.
- **Prisma**: The ORM used to interact with the PostgreSQL database.
- **Zod**: The TypeScript-first schema validation library used to validate all API inputs.
- **Dashboard**: The statistics page showing aggregated clinic metrics.
- **Soft_Delete**: A deletion strategy that sets a `deleted_at` timestamp instead of physically removing the row.
- **Seed**: Pre-populated database records used for development and testing.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a clinic staff member or administrator, I want to log in with my email and password, so that I can access the application securely and have my identity verified on every request.

#### Acceptance Criteria

1. WHEN a user submits a valid email and password to `POST /api/auth/login`, THE API SHALL return a signed JWT containing the user's `id`, `email`, and `role`, with a JSON response body of the shape `{ "token": "<jwt>", "user": { "id", "email", "role" } }`.
2. WHEN a user submits an email that does not exist or a password that does not match, THE API SHALL return an HTTP 401 response with a JSON body `{ "error": "Invalid email or password" }` — the message SHALL NOT distinguish which field was incorrect.
3. WHEN a request is made to any protected route without a JWT in the `Authorization: Bearer <token>` header, THE Auth_Middleware SHALL reject the request with an HTTP 401 response.
4. WHEN a request is made to any protected route with a malformed or expired JWT, THE Auth_Middleware SHALL reject the request with an HTTP 401 response. JWTs SHALL have an expiry duration of 24 hours from the time of issue.
5. WHEN an authenticated user sends a request to `GET /api/auth/me`, THE API SHALL return the authenticated user's `id`, `email`, and `role` without exposing the password hash.
6. THE API SHALL hash all passwords using bcrypt with a minimum cost factor of 10 before storing them in the database, and SHALL NOT store plaintext passwords at any stage of the request lifecycle.

---

### Requirement 2: Role-Based Access Control

**User Story:** As a system administrator, I want certain destructive and sensitive operations to be restricted to admin users only, so that staff members cannot accidentally or maliciously alter critical data.

#### Acceptance Criteria

1. WHEN an authenticated user with any role other than `admin` attempts to access an admin-only endpoint, THE Role_Middleware SHALL reject the request with an HTTP 403 response.
2. IF a request to `DELETE /api/patients/:id` is made by a user whose role is not `admin`, THEN THE Role_Middleware SHALL reject the request with HTTP 403 before any patient lookup is performed.
3. IF a request to any user management endpoint (`GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`) is made by a user whose role is not `admin`, THEN THE Role_Middleware SHALL reject the request with HTTP 403.
4. WHEN an authenticated Admin user accesses any protected route, THE Role_Middleware SHALL permit the request to proceed to the next handler.

---

### Requirement 3: Patient Management

**User Story:** As a staff member or admin, I want to create, view, update, and search patient records, so that the clinic can maintain an accurate and accessible registry of patients.

#### Acceptance Criteria

1. WHEN a request body containing all required fields (`fullName`, `cin`, `birthDate`, `phone`) is submitted to `POST /api/patients`, THE API SHALL create a patient record and return the created patient with HTTP 201.
2. THE System SHALL assign a UUID as the primary key for every new patient record.
3. WHEN a `POST /api/patients` request is submitted with a `cin` that already exists in the database (including soft-deleted patients), THE API SHALL return an HTTP 409 response with a message indicating the CIN is already registered.
4. WHEN a valid update payload is submitted to `PUT /api/patients/:id` for a non-deleted patient, THE API SHALL update the specified patient record and return the updated patient with HTTP 200.
5. WHEN `PUT /api/patients/:id` is submitted for a patient that does not exist or has been soft-deleted, THE API SHALL return HTTP 404.
6. WHEN `PUT /api/patients/:id` is submitted with a `cin` value that belongs to a different existing patient, THE API SHALL return HTTP 409.
7. WHEN `DELETE /api/patients/:id` is called by an Admin user on a non-deleted patient, THE API SHALL soft-delete the patient by setting the `deleted_at` timestamp to the current UTC time and return HTTP 200.
8. WHEN `DELETE /api/patients/:id` is called by a Staff user, THE API SHALL return HTTP 403 without revealing whether the patient exists.
9. WHEN `GET /api/patients` is called, THE API SHALL return a paginated list of non-deleted patients, defaulting to page 1 with a page size of 10, including pagination metadata (`total`, `page`, `limit`, `totalPages`) in the response.
10. WHEN `GET /api/patients` is called with a `search` query parameter, THE API SHALL return only patients whose `fullName` or `cin` contains the search string (case-insensitive).
11. WHEN `GET /api/patients/:id` is called for a non-deleted patient, THE API SHALL return the full patient record.
12. WHEN `GET /api/patients/:id` is called for a patient that does not exist or has been soft-deleted, THE API SHALL return an HTTP 404 response.
13. THE System SHALL record the `createdAt` timestamp automatically on patient creation.
14. WHEN a patient payload fails Zod schema validation (missing required fields, invalid types), THE API SHALL return an HTTP 400 response with field-level validation error details.

---

### Requirement 4: Appointment Management

**User Story:** As a staff member or admin, I want to create, view, and update appointment records, so that the clinic can efficiently schedule and track patient visits.

#### Acceptance Criteria

1. WHEN a valid appointment payload is submitted to `POST /api/appointments`, THE API SHALL create an appointment record with `status` defaulting to `pending` and return it with HTTP 201.
2. THE System SHALL assign a UUID as the primary key for every new appointment record.
3. WHEN an appointment is created, THE System SHALL record the authenticated user's `id` as the `createdBy` field.
4. WHEN `POST /api/appointments` is submitted for a patient who already has a `confirmed` appointment within a 30-minute window of the requested `appointmentDate`, THE API SHALL return an HTTP 409 response with a message that identifies the conflicting appointment's date and time.
5. WHEN `PATCH /api/appointments/:id/status` is called with a valid `status` value (`pending`, `confirmed`, or `cancelled`) for an existing appointment, THE API SHALL update the appointment status and return the updated record with HTTP 200.
6. IF `PATCH /api/appointments/:id/status` is called for an appointment ID that does not exist, THEN THE API SHALL return HTTP 404.
7. WHEN `PATCH /api/appointments/:id/status` would transition the status to `confirmed` and that transition would create a scheduling conflict (another confirmed appointment for the same patient within 30 minutes, excluding the appointment being updated), THE API SHALL return an HTTP 409 response.
8. WHEN `GET /api/appointments` is called, THE API SHALL return a paginated list of appointments defaulting to page 1 with a page size of 10, including pagination metadata (`total`, `page`, `limit`, `totalPages`) in the response.
9. WHEN `GET /api/appointments` is called with a `date` filter in `YYYY-MM-DD` format, THE API SHALL return only appointments whose `appointmentDate` falls on that calendar day (UTC).
10. WHEN `GET /api/appointments` is called with a `status` filter, THE API SHALL return only appointments matching the specified `Appointment_Status`.
11. WHEN `GET /api/appointments` is called with both a `date` filter and a `status` filter, THE API SHALL apply both filters simultaneously using AND logic, returning only appointments that match both conditions.
12. WHEN an appointment payload fails Zod schema validation, THE API SHALL return an HTTP 400 response with field-level validation error details.
13. THE System SHALL enforce that `appointmentDate` is a valid ISO 8601 datetime string through Zod validation.
14. IF `GET /api/appointments` is called with a `status` query parameter whose value is not one of `pending`, `confirmed`, or `cancelled`, THEN THE API SHALL return HTTP 400.

---

### Requirement 5: Appointment Conflict Rule

**User Story:** As a clinic administrator, I want the system to prevent double-booking a patient in overlapping time slots, so that confirmed appointments are never scheduled within 30 minutes of each other for the same patient.

#### Acceptance Criteria

1. WHEN a new appointment with `appointmentDate` T is submitted for patient P, THE System SHALL check all `confirmed` appointments for patient P and reject the request IF any existing confirmed appointment T′ satisfies `|T − T′| < 30 minutes` (boundary case: exactly 30 minutes apart is NOT a conflict).
2. IF a conflict is detected on creation, THEN THE API SHALL return HTTP 409 with a message identifying the conflicting appointment's date and time, and the submitted appointment SHALL NOT be persisted.
3. WHEN `PATCH /api/appointments/:id/status` transitions an appointment to `confirmed`, THE System SHALL perform the same conflict check, excluding the appointment being updated from its own conflict evaluation.
4. IF a conflict is detected on a status transition to `confirmed`, THEN THE API SHALL return HTTP 409 and the appointment status SHALL remain unchanged.
5. WHEN two concurrent `POST /api/appointments` requests are submitted for the same patient with overlapping time windows, THE System SHALL use a database-level transaction or advisory lock such that at most one request succeeds with `confirmed` status; the other SHALL receive HTTP 409.

---

### Requirement 6: Dashboard Statistics

**User Story:** As an admin or staff member, I want to see aggregated clinic statistics at a glance, so that I can quickly understand the current state of the clinic's activity.

#### Acceptance Criteria

1. WHEN an authenticated user sends `GET /api/dashboard/stats`, THE API SHALL return a JSON object containing `totalPatients` — the count of patients where `deleted_at IS NULL`.
2. WHEN an authenticated user sends `GET /api/dashboard/stats`, THE API SHALL return `appointmentsToday` — the count of appointments whose `appointmentDate` falls within the current calendar day in UTC (from `00:00:00 UTC` to `23:59:59 UTC`).
3. WHEN an authenticated user sends `GET /api/dashboard/stats`, THE API SHALL return `pendingCount` — the count of all appointments with `status = pending` (not scoped to today).
4. WHEN an authenticated user sends `GET /api/dashboard/stats`, THE API SHALL return `confirmedCount` — the count of all appointments with `status = confirmed` (not scoped to today).
5. THE API SHALL return all four statistics (`totalPatients`, `appointmentsToday`, `pendingCount`, `confirmedCount`) in a single JSON response from `GET /api/dashboard/stats` with HTTP 200.

---

### Requirement 7: Input Validation

**User Story:** As a developer, I want all API inputs to be validated with Zod schemas before reaching business logic, so that invalid data never enters the system and error messages are consistent and descriptive.

#### Acceptance Criteria

1. WHEN a request body fails Zod schema validation, THE API SHALL return HTTP 400 with a structured error response in the shape `{ "error": "Validation failed", "details": [{ "field": "<name>", "message": "<reason>" }] }` before executing any business logic.
2. WHEN a request body contains fields with incorrect types, THE API SHALL return HTTP 400 with a `details` array listing each invalid field name and a human-readable message.
3. WHEN a required field is missing from a request body, THE API SHALL return HTTP 400 with a `details` entry identifying the missing field.
4. IF the `status` field in an appointment creation or update request body contains a value not in `['pending', 'confirmed', 'cancelled']`, THEN THE API SHALL return HTTP 400 with a `details` entry describing the set of accepted values.
5. THE API SHALL validate that `birthDate` is a valid ISO 8601 date-only string (`YYYY-MM-DD`) for patient creation and update; values containing a time component SHALL be rejected with HTTP 400.
6. IF the `status` query parameter on any appointments endpoint contains a value not in `['pending', 'confirmed', 'cancelled']`, THEN THE API SHALL return HTTP 400 with an error describing the accepted values.

---

### Requirement 8: Error Handling

**User Story:** As a frontend developer, I want the API to return consistent, structured error responses for all failure cases, so that the frontend can reliably display meaningful error messages to users.

#### Acceptance Criteria

1. WHEN any unhandled exception occurs during request processing, THE API SHALL return HTTP 500 with a JSON body `{ "error": "Internal server error" }` and SHALL NOT expose internal stack traces or raw exception messages to the client.
2. WHEN a request targets a resource by ID that does not exist, THE API SHALL return HTTP 404 with a JSON body `{ "error": "<ResourceType> with id <id> not found" }`.
3. WHEN a request fails authentication, THE API SHALL return HTTP 401 with a JSON body `{ "error": "<reason>" }`.
4. WHEN a request fails authorization, THE API SHALL return HTTP 403 with a JSON body `{ "error": "Forbidden" }`.
5. WHEN a request body fails validation, THE API SHALL return HTTP 400 with a JSON body `{ "error": "Validation failed", "details": [{ "field": "<name>", "message": "<reason>" }] }`.
6. THE API SHALL return all error responses in a consistent JSON structure: `{ "error": "<message>", "details": <array of field errors, present only on validation failures, otherwise omitted or null> }`.

---

### Requirement 9: Database Design

**User Story:** As a developer, I want the database schema to enforce data integrity through constraints, indexes, and relationships, so that the application data remains consistent and queries perform efficiently.

#### Acceptance Criteria

1. THE System SHALL use UUID primary keys on all tables (`users`, `patients`, `appointments`).
2. THE System SHALL define `patients.cin` as a UNIQUE constraint at the database level.
3. THE System SHALL define `appointments.patientId` as a foreign key referencing `patients.id` with `ON DELETE CASCADE`.
4. THE System SHALL define `appointments.createdBy` as a foreign key referencing `users.id` with `ON DELETE SET NULL`.
5. THE System SHALL define an index on `patients.fullName` and a separate index on `patients.cin` to support search queries.
6. THE System SHALL define an index on `appointments.appointmentDate` to support date-based filtering.
7. THE System SHALL use a PostgreSQL ENUM type or CHECK constraint to enforce that `appointments.status` only accepts the values `pending`, `confirmed`, or `cancelled`.
8. THE System SHALL implement soft delete on the `patients` table via a `deleted_at` nullable timestamp column defaulting to `NULL`.
9. THE System SHALL exclude soft-deleted patients (where `deleted_at IS NOT NULL`) by default from all queries — including paginated lists, search, `GET /api/patients/:id`, and appointment joins — unless an explicit `includeDeleted` flag is passed internally by admin-only operations.
10. THE System SHALL provide Prisma migration files that reproduce the full schema starting from an empty database with no prior migrations.
11. THE System SHALL provide a seed script that inserts: 1 admin user, 2 staff users, 5 patients, and 10 appointments distributed as 4 `pending`, 3 `confirmed`, and 3 `cancelled`.

---

### Requirement 10: API Code Structure

**User Story:** As a developer, I want the backend codebase to follow a layered architecture (routes → controllers → services), so that each layer has a single responsibility and the code is maintainable and testable.

#### Acceptance Criteria

1. THE System SHALL organize code into three distinct top-level directories — `routes/`, `controllers/`, and `services/` — with the import direction enforced as routes → controllers → services (no reverse imports).
2. THE API SHALL define all route registrations in files under `routes/`, with one file per resource domain (`auth`, `patients`, `appointments`, `dashboard`).
3. WHEN a controller receives a request with invalid or missing parameters, THE controller SHALL return an appropriate HTTP error response without invoking any service function.
4. THE API SHALL define controller functions that extract and validate request parameters, call service methods, and format HTTP responses — controllers SHALL NOT import or use Prisma directly.
5. THE API SHALL define service functions that contain business logic and interact with Prisma — service functions SHALL NOT import or reference Express `Request` or `Response` objects.
6. THE API SHALL export a single Express app instance (with all middleware and routers registered) from a dedicated `app.ts` module, separate from the `server.ts` entry point that calls `app.listen()`.

---

### Requirement 11: Frontend Pages and Navigation

**User Story:** As a clinic user, I want a functional React frontend with clearly defined pages, so that I can navigate the application and perform all clinic management tasks through a browser interface.

#### Acceptance Criteria

1. THE Frontend SHALL provide a Login page where users can enter email and password to authenticate.
2. WHEN login is successful, THE Frontend SHALL store the JWT in localStorage and redirect the user to the Dashboard page.
3. WHEN login fails, THE Frontend SHALL display the error message returned by the API.
4. THE Frontend SHALL provide a Dashboard page that displays the four statistics from `GET /api/dashboard/stats`.
5. THE Frontend SHALL provide a Patients List page that displays paginated patient records with search by name or CIN.
6. THE Frontend SHALL provide controls on the Patients List page to add a new patient and edit an existing patient.
7. THE Frontend SHALL provide a Patient Detail page that displays full patient information and a list of their associated appointments.
8. THE Frontend SHALL provide an Appointments page where users can create new appointments using a form.
9. THE Frontend SHALL provide filter controls on the Appointments page to filter appointments by date and by status independently.
10. THE Frontend SHALL provide a control on the Appointments page to update an appointment's status.
11. WHEN a user is not authenticated (no valid JWT in localStorage), THE Frontend SHALL redirect all protected page routes to the Login page.
12. WHEN a JWT stored in localStorage is expired OR when any API request returns HTTP 401, THE Frontend SHALL clear the stored JWT from localStorage and redirect the user to the Login page.
13. THE Frontend SHALL apply role-based UI restrictions: the delete patient button SHALL be visible and enabled only for users with the `admin` role; user management controls SHALL be visible only to `admin` users.

---

### Requirement 12: Frontend Styling and UX

**User Story:** As a clinic user, I want the frontend to be visually consistent and easy to use, so that I can work efficiently without needing technical knowledge.

#### Acceptance Criteria

1. THE Frontend SHALL use Tailwind CSS for all styling with no additional CSS-in-JS or external component libraries that conflict with Tailwind.
2. THE Frontend SHALL display a loading indicator (spinner or skeleton) WHEN any API request is in progress, and remove it once the request settles.
3. WHEN any API request returns a non-2xx response, THE Frontend SHALL display a user-facing error message that includes a brief description of the failed operation and an instruction to retry; the message SHALL persist until dismissed by the user or replaced by a subsequent request.
4. THE Frontend SHALL render the same navigation element (sidebar or top navigation bar) on every authenticated page, with that element absent on the Login page.
5. WHEN a form submission returns HTTP 400 with field-level validation errors, THE Frontend SHALL display each error message adjacent to its corresponding form field.
6. WHEN a form submission returns HTTP 400 with field-level validation errors, THE Frontend SHALL also display a summary error banner at the top of the form listing the count or summary of errors.
7. WHEN a form submission returns an API error whose `details` array references a field that does not exist in the form, THE Frontend SHALL display that error message in the summary banner rather than dropping it silently.

---

### Requirement 13: Seed Data

**User Story:** As a developer or evaluator, I want a reproducible seed script, so that I can populate a fresh database with realistic data to test and demonstrate all features.

#### Acceptance Criteria

1. THE Seed script SHALL create exactly 1 user with role `admin`.
2. THE Seed script SHALL create exactly 2 users with role `staff`.
3. THE Seed script SHALL create exactly 5 patients with distinct CIN values.
4. THE Seed script SHALL create exactly 10 appointments distributed among the 5 patients, with each patient having at least 1 appointment.
5. THE Seed script SHALL ensure the 10 appointments include exactly 4 `pending`, 3 `confirmed`, and 3 `cancelled` appointments.
6. IF the seed script is run on a database that already contains seeded records identified by their stable keys (email for users, CIN for patients, patientId + appointmentDate for appointments), THEN the script SHALL skip or upsert those records, preserving original IDs and timestamps without creating duplicates.
7. THE Seed script SHALL hash all seed user passwords using bcrypt with a cost factor of at least 10 before inserting them.

---

### Requirement 14: Documentation and Setup

**User Story:** As a developer or evaluator, I want a complete README with installation, configuration, and run instructions, so that I can set up and run the application from scratch without additional guidance.

#### Acceptance Criteria

1. THE System SHALL include a `README.md` at the project root with step-by-step installation instructions covering: prerequisites (Node.js version, PostgreSQL version), repository clone, backend dependency installation, frontend dependency installation, environment variable configuration, database migration, database seeding, and starting both the development server and the frontend.
2. THE README SHALL document each of the following required environment variables with a description and an example value: `DATABASE_URL` (PostgreSQL connection string), `JWT_SECRET` (signing key for JWTs), `JWT_EXPIRES_IN` (token lifetime, e.g. `24h`), and `PORT` (backend listening port).
3. THE README SHALL document the exact commands to: install backend dependencies, install frontend dependencies, run Prisma migrations, seed the database, start the backend development server, start the frontend development server, and run the test suite.
4. THE System SHALL include a `.env.example` file at the project root listing every environment variable documented in criterion 2 with placeholder values, with no extra or missing variables relative to that list.
