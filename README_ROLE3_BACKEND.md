# PHC Pulse — Role 3 Backend & Intelligence Bundle (Round-1 MVP)

This folder contains **ONLY Role-3** deliverables for Graph-E-Thon 3.0:
- Firestore data model (operational signals only; **no patient records / PHI**)
- Readiness Score (0–100) + Predicted Wait Time logic
- Demo-stable seed initializer for `PHC_001`
- Minimal API endpoints (Express server) + optional **Next.js App Router API templates**
- Basic STAFF vs PUBLIC separation (server-side verification + suggested Firestore rules)

> Integration note: This bundle is designed to be **dropped into any repo**. If your main repo is Next.js, copy the files under `templates/next-app-router/...` into your repo root. If your main repo is not using Next API routes, use the included Express API server.

---

## Data Model (Firestore)

### `phc_status/{phcId}` (Doc)
Operational visibility only:
- `doctorStatus`: `"Available" | "Busy" | "Break" | "OffDuty"`
- `queueCount`: number
- `nowServing`: string (token like `"T-07"`)
- `avgConsultMins`: number (e.g., 6)
- `alerts`: array of `{ message: string, severity: "info"|"warning"|"critical", until?: string }`
- `medicines`: map of `{ [itemName: string]: "Available" | "Low" | "Out" }` (top essentials only)
- `readinessScore`: number (0–100)
- `predictedWaitMins`: number | null
- `updatedAt`: timestamp

### `teleopd_bookings/{id}` (Doc)
Minimal fields (no PII):
- `phcId`: string
- `category`: `"General" | "Fever" | "Maternal" | "Child" | "Other"`
- `slot`: ISO string
- `status`: `"requested" | "confirmed" | "done" | "cancelled"`
- `createdAt`: timestamp

### `staff_learning/{phcId}/completions/{roleOrUser}` (Doc)
- `roleOrUser`: string (e.g., `nurse`, `pharmacist`, `staff_uid_123`)
- `items`: array of `{ sopId: string, completedAt: timestamp }`

---

## Readiness Formula (simple & explainable)

Weights:
- **40%** queue pressure
- **30%** staff availability
- **20%** medicines
- **10%** alerts

Queue pressure score:
- `queueScore = clamp(100 - (queueCount / QUEUE_MAX)*100)`
- default `QUEUE_MAX = 30`

Staff availability score:
- Available=100, Busy=60, Break=40, OffDuty=0

Medicines score:
- Available=100, Low=50, Out=0 (average across listed items)

Alerts score:
- no alerts => 100
- info reduces a little, warning reduces more, critical reduces most

Final:
`readinessScore = round(0.4*queue + 0.3*staff + 0.2*meds + 0.1*alerts)`

### Predicted Wait Time
`predictedWaitMins = clamp(queueCount * avgConsultMins, 0, 180)`
- if `doctorStatus === OffDuty`, returns `null`

---

## Demo Seed (one-click)

Seeds `PHC_001` with realistic operational values and computed fields.

Options:
1) Express API endpoint: `POST /api/role3/seed`
2) Script: `npm run seed`

---

## Auth / Roles

**PUBLIC:** read-only (no auth required for public read endpoints).  
**STAFF:** write requires a Firebase ID token with `role="staff"` (recommended).  
Fallback (demo): allowlist emails via `STAFF_EMAILS` env.

---

## Quick Start (Role-3 module testing)

### 1) Install
```bash
cd role3
npm i
```

### 2) Env
Copy:
```bash
cp .env.example .env
```

Provide:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT` (stringified JSON of service account OR use ADC)
- optional `STAFF_EMAILS` (comma-separated)

### 3) Run Express API
```bash
npm run dev
# server on http://localhost:8787
```

### 4) Seed
```bash
npm run seed
# or POST http://localhost:8787/api/role3/seed
```

---

## Firestore Security Rules (suggestion)

See: `firestore.rules`

---

## Next.js App Router API templates

If your main repo is Next.js (app router), copy the folder:
`templates/next-app-router/app/api/role3/*`
into your repo root under `app/api/role3/*`.

They call the same shared services under `src/*`.

