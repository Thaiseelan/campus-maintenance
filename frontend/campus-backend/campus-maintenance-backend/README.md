# Campus Maintenance Request Desk — Backend

Spring Boot backend for the BIT Campus Maintenance Request Desk project.
**All 8 phases are implemented** — auth, complaints, technician
auto-assignment, admin dashboard, and email notifications.

## Stack

- Java 17, Spring Boot 3.3.2
- Spring Web, Spring Data JPA, Spring Security (JWT), Spring Mail
- PostgreSQL
- Lombok

## Folder structure

```
src/main/java/com/bit/maintenance/
  model/               entities (User, Complaint, Technician, Assignment, ...)
  model/enums/          Role, ComplaintStatus, ComplaintCategory, ...
  repository/           Spring Data JPA repositories
  security/             JwtUtil, JwtAuthenticationFilter, CustomUserDetails(Service)
  config/               SecurityConfig, WebMvcConfig, DataSeeder, LocationSeeder
  dto/auth/             RegisterRequest, LoginRequest, AuthResponse, UserResponse
  dto/complaint/        ComplaintRequest/Response, StatusUpdateRequest, AssignTechnicianRequest
  dto/technician/       CreateTechnicianRequest, UpdateTechnicianRequest, TechnicianResponse
  dto/location/         LocationResponse
  dto/user/             UpdateProfileRequest
  dto/dashboard/        DashboardStatsResponse
  exception/            ApiException, GlobalExceptionHandler
  service/              AuthService, ComplaintService, AssignmentService,
                         TechnicianService, UserService, DashboardService,
                         NotificationService, FileStorageService
  controller/           AuthController, ComplaintController, TechnicianController,
                         LocationController, UserController, DashboardController
```

## Full API contract

This matches what the frontend actually calls (verified against the
frontend-side integration notes) — note the `phone` field name and the
`PATCH` verbs, which differ from earlier drafts of this contract.

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | Student/Staff only |
| POST | `/api/auth/login` | public | Returns `{token, user}` |
| GET | `/api/auth/me` | any | Current account |
| POST | `/api/auth/logout` | public | No-op (stateless JWT) — just returns 200 |
| POST | `/api/auth/admin/create-user` | admin | Provisions Technician/Staff/Admin accounts |
| GET | `/api/locations` | any | Flat list for the Building/Floor/Room picker |
| POST | `/api/complaints` | student/staff | `multipart/form-data`: title, description, category, priority?, locationId, image? |
| GET | `/api/complaints` | admin | All complaints, `?status=&category=` |
| GET | `/api/complaints/my` | any | Current user's own reported complaints |
| GET | `/api/complaints/my-tasks` | technician | Current technician's assigned complaints |
| GET | `/api/complaints/{id}` | scoped | Owner, assigned technician, or admin |
| GET | `/api/complaints/{id}/history` | scoped | Full status timeline |
| PATCH | `/api/complaints/{id}/status` | technician | `multipart/form-data`: status, remarks?, completionImage? |
| PATCH | `/api/complaints/{id}/assign` | admin | `{technicianId}` — manual fallback when auto-assign found nobody |
| PUT | `/api/complaints/{id}/close` | owner or admin | Only valid from RESOLVED |
| GET | `/api/technicians` | admin | With live `activeTaskCount` per technician |
| POST | `/api/technicians` | admin | `{userId, specialization}` — user must already exist with role TECHNICIAN |
| PATCH | `/api/technicians/{id}` | admin | `{specialization?, availabilityStatus?}` |
| GET | `/api/users/search` | admin | `?query=&role=` — e.g. finding accounts to promote to technician |
| PATCH | `/api/users/me` | any | `{name?, department?, phone?}` — not email/password/role |
| GET | `/api/dashboard/stats` | admin | Counts by status/category, unresolved total |

Enum values, sent exactly as-is: category
(`ELECTRICAL/PLUMBING/NETWORK/FURNITURE/CIVIL/CLEANING/OTHER`), priority
(`LOW/MEDIUM/HIGH`), status (`OPEN/ASSIGNED/IN_PROGRESS/RESOLVED/CLOSED`).

**On the `phone` field:** the `User` entity and DB column are still called
`phoneNumber` internally (no migration needed), but every DTO that touches it
(`UserResponse`, `RegisterRequest`, `UpdateProfileRequest`) is annotated
`@JsonProperty("phone")`, so the JSON your frontend sends/receives says
`"phone"` either way.

## How a complaint moves through its lifecycle

```
OPEN  →  ASSIGNED  →  IN_PROGRESS  →  RESOLVED  →  CLOSED
 │           │              │              │           │
submit   auto-assign    technician    technician    owner or
         (or admin      PATCH         PATCH         admin
          .../assign    .../status    .../status    PUT .../close
          if nobody     status=       status=
          was free)     IN_PROGRESS   RESOLVED
```

Auto-assignment (`AssignmentService`) runs right after submit: category maps
to a technician specialization (`FURNITURE→CARPENTRY_FURNITURE`,
`CLEANING→HOUSEKEEPING`, `CIVIL→CIVIL_MAINTENANCE`, `OTHER→GENERAL`, others
1:1), filters to `AVAILABLE` technicians, and picks whoever has the fewest
open assignments. If nobody matches, the complaint just stays `OPEN` until an
admin calls the manual `/assign` endpoint — this is expected, not a bug.

## Schema decisions worth knowing for viva

1. **Technician links to User instead of duplicating name/email** — a
   `Technician` row only holds `specialization`/`availabilityStatus` and
   points at a `User` (role=TECHNICIAN) via one-to-one.
2. **Added a `status_history` table** — gives the full timeline (submitted →
   assigned → in progress → resolved → closed) instead of only the current
   status.
3. **Geotagging** is the structured Building → Floor → Room picker
   (`Location.building/floor/room`) — we looked at using an existing BIT
   campus map site and decided against it (no public API, no open-source
   license, external dependency risk before a viva).

## Running it locally

1. PostgreSQL running locally (or `docker compose up -d` — see below),
   database `campus_maintenance` created.
2. `src/main/resources/application.properties` already has your local DB
   password filled in.
3. `mvn spring-boot:run` — Hibernate creates the tables, `DataSeeder` seeds
   the admin account, `LocationSeeder` seeds 16 placeholder locations.
4. Log in as admin (`app.admin.email` / `app.admin.password` in
   `application.properties`), then `POST /api/auth/admin/create-user` to
   create a Technician account, then `POST /api/technicians` to give it a
   specialization — do this before testing the complaint flow, or every
   complaint will just sit at OPEN with nobody to assign.

### docker-compose (optional, just for Postgres)

```bash
docker compose up -d
```

Starts Postgres on `localhost:5432` matching the properties file exactly, so
you don't need a local Postgres install.

## Known limitations / things to mention as scope decisions, not bugs

- **Placeholder locations** — `LocationSeeder` has example buildings, not
  BIT's confirmed layout. Easy to swap once you have the real list.
- **Local file storage** for photos, per the project doc's own call that
  this is fine unless your faculty requires cloud deployment.
- **Single admin, no self-service password reset** — deliberate per the
  project's own "Things We Are NOT Building" list.
- **I couldn't run `mvn` in the sandbox this was built in** (no Maven
  Central access there) — the patterns used are standard Spring Boot 3/JPA,
  but do a clean `mvn clean install` locally before your first real demo.

## Postman collection

`campus-maintenance.postman_collection.json` in this repo covers every
endpoint above, with a collection variable `{{token}}` you set after login
so the rest of the requests authenticate automatically.
