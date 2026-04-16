# 🚀 Loopa — Project Update Board

A lightweight team collaboration app where members post project updates, reply in threads, and stay in sync. Built with Next.js, Firebase, and deployed on Vercel — free tier all the way.

---

## What It Does

- **Google Sign-In** — team members authenticate with their Google accounts
- **Display Names** — on first login, users pick a name or nickname
- **Roles** — Admin assigns roles: `admin`, `manager`, `team_lead`, `member`
- **Updates Feed** — homepage shows all project update posts, newest first
- **Threads** — each post can have replies at `/replies/<postId>`
- **Edit / Delete** — original poster (OP) can edit or delete their own posts
- **Admin Panel** — `/admin` for role management, user overview, and post moderation

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Vercel-native, SSR + API routes |
| Auth | Firebase Auth (Google) | Free, easy Google OAuth |
| Database | Firestore | Free tier generous, real-time |
| Styling | Tailwind CSS | Fast, consistent |
| Hosting | Vercel | Free, auto-deploy from GitHub |
| Testing | Vitest + Playwright | Unit + E2E |

---

## Project Structure

```
loopa/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage — posts feed
│   ├── replies/[postId]/   # Thread view
│   ├── admin/              # Admin panel
│   └── api/                # API route handlers
├── components/             # Reusable UI components
├── lib/                    # Firebase config, helpers, types
├── hooks/                  # Custom React hooks
├── __tests__/              # Unit tests (Vitest)
├── e2e/                    # End-to-end tests (Playwright)
├── docs/                   # Project documentation (this folder)
└── .github/workflows/      # CI/CD pipelines
```

---

## Quick Start (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/UltraBot05/Loopa.git
cd loopa

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Firebase config

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Deployment

Every push to `main` auto-deploys to Vercel/GitHub CI. PRs get preview deployments.
CI must pass (lint + unit tests + E2E) before merge.

---

## Admin Access

Only one admin account exists. To make yourself admin:
1. Sign in once (creates your Firestore user doc)
2. In Firebase Console → Firestore → `users` collection → find your doc → set `role: "admin"`

After that, the `/admin` route is accessible only to you.
