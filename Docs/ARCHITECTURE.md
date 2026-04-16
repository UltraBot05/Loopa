# 🏗️ ARCHITECTURE.md — Loopa System Design

---

## System Overview

```
Browser (Next.js Client)
    │
    ├─── Firebase Auth (Google OAuth)
    │         └── issues JWT token
    │
    ├─── Firestore (real-time DB)
    │         ├── users/
    │         ├── posts/
    │         └── posts/{id}/replies/
    │
    └─── Next.js App Router (Vercel)
              ├── /                  → Feed (SSR + real-time)
              ├── /login             → Auth page
              ├── /onboarding        → First-time name setup
              ├── /replies/[postId]  → Thread view
              └── /admin             → Admin panel
```

All data lives in Firestore. No separate backend. Next.js API routes are used only for server-side operations that shouldn't run client-side (e.g., admin role validation via Firebase Admin SDK if needed in future).

---

## TypeScript Types

Define all types in `lib/types.ts`. Every Firestore document maps to one of these.

```typescript
// lib/types.ts

export type Role = "admin" | "manager" | "team_lead" | "member";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: Role;
  createdAt: FirebaseFirestore.Timestamp;
  onboardingComplete: boolean;
}

export interface PostDoc {
  postId: string;
  authorUid: string;
  authorName: string;
  authorRole: Role;
  content: string;          // raw Markdown
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp | null;
  replyCount: number;
  edited: boolean;
}

export interface ReplyDoc {
  replyId: string;
  authorUid: string;
  authorName: string;
  authorRole: Role;
  content: string;          // raw Markdown
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp | null;
  edited: boolean;
}

// Used client-side after Timestamp → Date conversion
export interface Post extends Omit<PostDoc, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Reply extends Omit<ReplyDoc, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date | null;
}

export interface User extends Omit<UserDoc, "createdAt"> {
  createdAt: Date;
}
```

---

## Firestore Data Model

### `users/{uid}`
Created on first sign-in. Role defaults to `"member"`. Only admin can change roles.

```
users/
  {uid}/
    uid: "abc123"
    email: "user@gmail.com"
    displayName: "Priya"
    photoURL: "https://..."
    role: "member"
    createdAt: Timestamp
    onboardingComplete: true
```

### `posts/{postId}`
Auto-ID from Firestore. `replyCount` is kept in sync via client-side transactions (increment/decrement when replies are added/removed).

```
posts/
  {autoId}/
    postId: "XYz123"
    authorUid: "abc123"
    authorName: "Priya"
    authorRole: "team_lead"
    content: "## Sprint 4 Update\nAll tickets closed!"
    createdAt: Timestamp
    updatedAt: null
    replyCount: 3
    edited: false
```

### `posts/{postId}/replies/{replyId}`
Subcollection. Same shape as posts minus `replyCount`.

```
posts/{postId}/replies/
  {autoId}/
    replyId: "abc456"
    authorUid: "xyz789"
    authorName: "Rohan"
    authorRole: "member"
    content: "Great work!"
    createdAt: Timestamp
    updatedAt: null
    edited: false
```

---

## Firestore Security Rules

Full rules go in `firestore.rules`. This is the source of truth — deploy with `firebase deploy --only firestore:rules`.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: is the requesting user authenticated?
    function isAuth() {
      return request.auth != null;
    }

    // Helper: get the requesting user's role from Firestore
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuth() && userRole() == 'admin';
    }

    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }

    // ── Users ──────────────────────────────────────────────
    match /users/{uid} {
      // Any authenticated user can read any user doc (for display names, roles)
      allow read: if isAuth();

      // User can create their own doc (on first sign-in)
      allow create: if isOwner(uid);

      // User can update their own doc, EXCEPT role field
      // Admin can update any doc including role
      allow update: if isAdmin()
        || (isOwner(uid) && !('role' in request.resource.data.diff(resource.data).affectedKeys()));

      allow delete: if isAdmin();
    }

    // ── Posts ──────────────────────────────────────────────
    match /posts/{postId} {
      allow read: if isAuth();

      allow create: if isAuth()
        && request.resource.data.authorUid == request.auth.uid;

      allow update: if isAdmin()
        || (isAuth() && resource.data.authorUid == request.auth.uid);

      allow delete: if isAdmin()
        || (isAuth() && resource.data.authorUid == request.auth.uid);

      // ── Replies ──────────────────────────────────────────
      match /replies/{replyId} {
        allow read: if isAuth();

        allow create: if isAuth()
          && request.resource.data.authorUid == request.auth.uid;

        allow update: if isAdmin()
          || (isAuth() && resource.data.authorUid == request.auth.uid);

        allow delete: if isAdmin()
          || (isAuth() && resource.data.authorUid == request.auth.uid);
      }
    }
  }
}
```

---

## Authentication Flow

```
User hits any page
      │
      ▼
AuthGuard checks useAuth()
      │
   ┌──┴──┐
   │     │
Not     Authenticated
Authed       │
   │         ▼
   │   onboardingComplete?
   │      │         │
   │     No        Yes
   │      │         │
   ↓      ▼         ▼
/login  /onboarding  /  (homepage)
```

The `useAuth` hook listens to `onAuthStateChanged`. On sign-in:
1. Check if `users/{uid}` doc exists in Firestore
2. If not → create it with `role: "member"`, `onboardingComplete: false`
3. Redirect to `/onboarding` if `!onboardingComplete`
4. After onboarding form submit → set `onboardingComplete: true`, redirect to `/`

---

## File Structure

```
loopa/
├── app/
│   ├── layout.tsx              # Root layout, wraps with providers
│   ├── page.tsx                # Homepage — posts feed
│   ├── login/
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── replies/
│   │   └── [postId]/
│   │       └── page.tsx
│   └── admin/
│       └── page.tsx
│
├── components/
│   ├── AuthGuard.tsx
│   ├── PostCard.tsx
│   ├── PostComposer.tsx
│   ├── PostActions.tsx
│   ├── EditPostModal.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── Feed.tsx
│   ├── ReplyCard.tsx
│   ├── ReplyComposer.tsx
│   ├── RoleBadge.tsx
│   ├── UserRow.tsx             # Admin panel user row
│   ├── Toast.tsx
│   └── LoadingSkeleton.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   └── useReplies.ts
│
├── lib/
│   ├── firebase.ts             # Firebase app init (client)
│   ├── auth.ts                 # Auth helpers
│   ├── firestore.ts            # Generic Firestore helpers
│   ├── posts.ts                # Posts CRUD
│   ├── replies.ts              # Replies CRUD
│   ├── admin.ts                # Admin-only operations
│   └── types.ts                # All TypeScript types
│
├── __tests__/                  # Vitest unit tests
│   ├── components/
│   └── lib/
│
├── e2e/                        # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── posts.spec.ts
│   └── admin.spec.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── firestore.rules
├── .env.example
├── vitest.config.ts
├── playwright.config.ts
└── docs/
    ├── PLANNING.md
    ├── ARCHITECTURE.md
    ├── SETUP.md
    ├── TESTING.md
    └── CONTRIBUTING.md
```

---

## Environment Variables

```bash
# .env.example — copy to .env.local and fill in values

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin UID — your Firebase UID, used as a safety check
NEXT_PUBLIC_ADMIN_UID=
```

All `NEXT_PUBLIC_` vars are safe to expose client-side (Firebase keys are not secrets; they're locked down by Firestore security rules).

---

## Performance Notes

- **Real-time listeners** (`onSnapshot`) are used for Feed and Thread — unsubscribed in `useEffect` cleanup
- **Pagination**: Phase 1 loads last 50 posts. Can extend with Firestore `startAfter` cursor pagination if needed
- **Images**: User avatars are loaded from Google CDN (photoURL) — no storage cost
- **No Cloud Functions**: Everything is client-side or Next.js API routes to stay on free tier
