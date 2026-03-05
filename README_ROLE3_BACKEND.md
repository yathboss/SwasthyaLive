# PHC Pulse (aka PHC Live / JanSwasthya Live)

A lightweight **real-time PHC operations + health‑literacy** system that reduces uncertainty for citizens and workload for staff by publishing live PHC status (TV board + public web link) and enabling Tele‑OPD suggestions.

> **Not a Hospital Management System (HMS).**  
> PHC Pulse does **not** store full patient records, billing, or complex hospital workflows. It stores **operational signals only** (doctor status, queue, essential medicines, service alerts) and provides **guidance, not diagnosis**.

---

## What problem are we solving?

In many Primary Health Centers (PHCs), the biggest pain isn’t only treatment — it’s **uncertainty**. Citizens often don’t know:

- which doctor is available right now  
- how long the wait is / which token is serving  
- whether essential medicines are available  
- whether any service is temporarily down (lab closed, emergency priority, etc.)

This causes overcrowding, repeated questions to staff, wasted trips, delayed care, and reduced trust.

---

## Our solution (MVP)

PHC staff update a **minimal dashboard** and the same live status is instantly published:

1) **TV Status Board (inside PHC)** — big, readable, auto-updating  
2) **Citizen Web Link** — check before traveling (QR from TV board)

From minimal updates, the system computes:

- **Predicted wait time** (queue × avg consult time)  
- **PHC Readiness Score (0–100)** combining staff availability, stock status, queue pressure, and service alerts

When readiness is low or wait is high, the system recommends:

- **Book Tele‑OPD slot**, or  
- **Redirect to nearest available center** *(multi‑PHC demo mode / simulated)*

---

## MVP Screens (Round‑1)

1. **Staff Dashboard** (doctor / queue / alerts / essential medicines)
2. **Public Status Board (TV Mode)**
3. **Citizen Web Page** (same status + QR)
4. **PHC Guide Bot** (preset buttons; demo-safe)
5. **Tele‑OPD Booking**
6. **Staff Learning tab** (SOP cards + completion tracking)

### PHC Guide Bot (preset buttons)
- Check doctor availability  
- Show wait time  
- Medicines available?  
- Book Tele‑OPD  
- Stress check‑in *(supportive guidance + routing; not diagnosis)*

---

## Privacy & Safety

- **No patient records / PHI.** Only operational signals are stored.
- The bot provides **guidance, not diagnosis** (no prescriptions).
- Demo mode may use seeded/mock data; real integrations are optional later.

---

## Tech Stack (edit to match your repo)

- Frontend: `Next.js` / `React` (TypeScript recommended)
- Backend/Data: `Firebase (Firestore + Auth + Functions)` *(or equivalent)*
- Deployment: `Vercel` / `Netlify` / `Firebase Hosting`

> If your project uses a different stack, update this section.

---

## Quick Start (local)

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

---

## Environment Variables

Create `.env.local` from your `.env.example`:

```bash
cp .env.example .env.local
```

Example keys (Firebase):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

> Never commit secrets. Commit `.env.example` only.

---

## Data Model (high level)

Recommended collections (Firestore-style):

- `phc_status/{phcId}`
  - `doctorStatus` (Available/Busy/Break/Off-duty)
  - `queueCount`, `nowServing`, `avgConsultMins`
  - `alerts[]`
  - `medicines{ itemName: Available|Low|Out }`
  - `readinessScore`, `predictedWaitMins`, `updatedAt`

- `teleopd_bookings/{id}`
  - `phcId`, `category`, `slot`, `status`, `createdAt`

- `staff_learning/{phcId}/completions/{roleOrUser}`
  - `sopId`, `completedAt`

---

## Readiness Score (explainable)

A simple, judge-friendly formula:

- **40% Queue pressure**
- **30% Staff availability**
- **20% Essential medicines**
- **10% Service alerts**

Predicted wait time:

- `predictedWaitMins = queueCount * avgConsultMins` *(with clamps if needed)*

---

## Demo Flow (2–3 minutes)

1) Open **Staff Dashboard** → update queue / doctor / medicine status  
2) Show **TV Status Board** instantly updating (readiness + wait time)  
3) Open **Citizen Page** via QR → show same live status  
4) Use **Guide Bot button** “Show wait time” → bot responds from live data  
5) Trigger **Tele‑OPD Booking** from recommendation → confirm booking ID  
6) Show **Staff Learning** SOP completion ticks

---

## Team Roles (suggested)

- Role 1: Product + Integration + Submission owner  
- Role 2: Frontend UI (Staff Dashboard + TV Board)  
- Role 3: Backend & Intelligence (DB + readiness + wait time + seed)  
- Role 4: Citizen Experience (Citizen page + bot + tele‑OPD + learning)

---

## Repository Links

- Deployed Prototype: *(add link)*
- Explanation Video: *(add link)*
- PPT Deck: *(add link)*

---

## License

MIT (recommended for hackathon projects).
