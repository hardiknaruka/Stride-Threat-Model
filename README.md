# STRIDE Threat Modeling Workspace

A full-featured web application designed for application security engineers, solution architects, and product engineering teams to conduct, prioritize, and track microservices threat modeling studies using the **STRIDE** methodology.

---

## Product Purpose & Key Principles

1. **System Scope & Context Modeling**: Document assessed microservices, external entities, databases, protocols, trust zones, technical assumptions, out-of-scope boundaries, and review stakeholders.
2. **STRIDE Threat Register**: Assess and catalog threats mapped to:
   - **S**poofing (Authenticity)
   - **T**ampering (Integrity)
   - **R**epudiation (Non-repudiation)
   - **I**nformation Disclosure (Confidentiality)
   - **D**enial of Service (Availability)
   - **E**levation of Privilege (Authorization)
3. **Traceability**: Link every identified threat directly to specific architecture components or directed communication flows.
4. **Transparent Qualitative Risk Scoring**: Derived through a transparent 3x3 Likelihood × Impact matrix (Low, Medium, High, Critical) with authorized reviewer overrides and mandatory rationale audit trails.
5. **Review & Handover Reports**: Instant export to CSV (RFC 4180 with UTF-8 BOM for Excel) and clean, paginated print/PDF-ready formal audit reports.
6. **OWASP Threat Dragon Path**: Clear documentation and export adapter targeting the verified OWASP Threat Dragon 2.x JSON model schema (`diagramType: "STRIDE"`).
7. **Zero-Secrets Policy**: Sensitive credentials, production tokens, and real PII are strictly excluded by design; always use abstract references.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: PostgreSQL / SQLite via Prisma ORM 6.4.1 (Zero-config local SQLite default with Docker Compose PostgreSQL support)
- **Validation**: Zod schema validation across both client inputs and API endpoints
- **Styling**: Tailwind CSS v4, custom SVG interactive graph canvas, and `@media print` audit stylesheet
- **Testing**: Vitest with unit tests covering risk scoring, export specifications, and input validations
- **Icons**: Lucide React

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js v20+ (tested on Node v24.11.0)
- npm v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Initialization (SQLite Default)
The application comes preconfigured with zero-config SQLite (`DATABASE_URL="file:./dev.db"`).
Push the Prisma schema to create the local database:
```bash
npm run db:push
```

### 4. Seed Fictional Demo Project
Populate the workspace with the fictional **"Commerce Microservices Threat Model"** (8 components, 6 data flows, and 7 STRIDE threat scenarios):
```bash
npm run db:seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Running Automated Tests

Run the Vitest test suite:
```bash
npm test
```
The test suite covers:
- **`src/lib/__tests__/risk-scoring.test.ts`**: All 9 combinations of the 3x3 Likelihood × Impact qualitative matrix, plus severity override validation.
- **`src/lib/__tests__/validations.test.ts`**: Zod boundary validations for projects, elements, flows, and threats.
- **`src/lib/__tests__/export.test.ts`**: Verification of required threat register export schema fields.

---

## Docker Compose for PostgreSQL Development

For development against PostgreSQL:

1. Start the PostgreSQL 16 container:
   ```bash
   docker compose up -d
   ```
2. Update `.env` to point to PostgreSQL:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/stride_threat_model?schema=public"
   ```
3. Update `provider = "postgresql"` in `prisma/schema.prisma` if switching dialects, then run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## User Roles & Permissions

The application provides a built-in role switcher in the header to simulate collaborative workflows:

| Role | Scope & Context | Architecture | Create Threats | Risk Override | Change Status | Delete Records |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Project Owner** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Security / Threat Lead** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Architect / Engineer** | ✓ | ✓ | ✓ | — | — | — |
| **Read-Only Reviewer** | — | — | — | — | — | — |

*Note: In local prototype mode, user identity is maintained via simulated role context for streamlined pair-review.*

---

## Qualitative Risk Scoring Model

| Likelihood \ Impact | LOW Impact | MEDIUM Impact | HIGH Impact |
|:---|:---:|:---:|:---:|
| **HIGH Likelihood** | MEDIUM | HIGH | **CRITICAL** |
| **MEDIUM Likelihood** | LOW | MEDIUM | HIGH |
| **LOW Likelihood** | LOW | LOW | MEDIUM |

- **Automatic Severity**: Automatically derived when Likelihood and Impact are selected.
- **Reviewer Override**: Authorized Security Leads / Project Owners may adjust priority if compensatory controls exist, provided a written rationale (minimum 8 characters) is recorded.

---

## OWASP Threat Dragon Integration

OWASP Threat Dragon is the dedicated open-source diagramming tool. This workspace:
- Manages study scope, technical assumptions, component registers, and traceability.
- Adapts components and threat scenarios into the verified **OWASP Threat Dragon 2.x JSON model schema** (`diagramType: "STRIDE"`, `cells: tm.Process, tm.Store, tm.Actor`).
- Provides an **Inspect / Copy Threat Dragon JSON** button under the **Review & Handover** tab.

---

## Security & Privacy Guidelines (Zero-Secrets Policy)

> [!IMPORTANT]
> **Never enter real production credentials, API access tokens, private keys, or real customer personal data (PII) into this workspace.**
> - Use descriptive abstract placeholders (e.g. `bearer token`, `tokenized card ID reference`).
> - The application operates in local/demo mode; all data is retained on the local disk.

---

## License

MIT License. Designed for security teams and software architects.
