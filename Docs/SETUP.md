# ⚙️ SETUP.md — Firebase + Vercel Setup Guide

Follow this guide exactly, in order, before running the app.

---

## 1. Firebase Project

### 1a. Create the project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `Loopa`
3. Disable Google Analytics (not needed)
4. Click **Create project**

### 1b. Enable Google Auth
1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **Google** → Enable → set support email → **Save**

### 1c. Create Firestore Database
1. **Firestore Database** → **Create database**
2. Choose **Start in production mode** (we'll add rules manually)
3. Choose a region close to you (e.g., `asia-south1` for India)

### 1d. Get your Firebase config
1. **Project Settings** (gear icon) → **General** → scroll to **Your apps**
2. Click **</>** (web app) → Register app → name it `loopa-app`
3. Copy the `firebaseConfig` object values into your `.env.local`

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=loopa-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=loopa-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=loopa-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
```

### 1e. Get your Admin UID
1. Sign in to the app once (so your user doc is created)
2. Firebase Console → **Authentication** → **Users** → copy your UID
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_ADMIN_UID=your-uid-here
   ```
4. Also manually set your role in Firestore:
   - **Firestore** → `users` collection → your doc → Edit → set `role` to `"admin"`

### 1f. Deploy Firestore Security Rules
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore only, use existing project)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 2. Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/loopa.git
cd loopa

# Install deps
npm install

# Set up env
cp .env.example .env.local
# → Edit .env.local with your Firebase values

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## 3. Vercel Deployment

### 3a. Push to GitHub first
```bash
git init  # if not already done
git add .
git commit -m "chore: initial setup"
git remote add origin https://github.com/YOUR_USERNAME/loopa.git
git push -u origin main
```

### 3b. Import to Vercel
1. Go to [https://vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. **Environment Variables** — add all variables from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_UID`
5. Click **Deploy**

### 3c. Add your Vercel domain to Firebase Auth
After deploy, you'll get a URL like `loopa.vercel.app`.
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain** → enter `loopa.vercel.app`

---

## 4. GitHub Actions — Secrets

For CI to run tests, add these in GitHub → **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | your sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | your app ID |
| `NEXT_PUBLIC_ADMIN_UID` | your Firebase UID |

Unit tests mock Firebase so they don't need real credentials. E2E tests need them.

---

## 5. Firebase Free Tier Limits

You're on the **Spark plan** (free). Relevant limits:

| Resource | Free Limit |
|---|---|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Firestore deletes | 20,000/day |
| Firestore storage | 1 GiB |
| Auth users | Unlimited |

For a small team (< 20 people), you'll never hit these. If you do, upgrade to Blaze (pay-as-you-go) — it's still essentially free at small scale.

---

## Troubleshooting

**"Firebase: Error (auth/unauthorized-domain)"**
→ Add your domain to Firebase Auth → Authorized domains (see step 3c)

**"Missing or insufficient permissions"**
→ Your Firestore rules aren't deployed. Run `firebase deploy --only firestore:rules`

**"Cannot read properties of null"**
→ Check `.env.local` — all `NEXT_PUBLIC_FIREBASE_*` values must be set

**Vercel build failing**
→ Make sure all env vars are set in Vercel Dashboard → Project → Settings → Environment Variables
