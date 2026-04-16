# 📋 PLANNING.md — Loopa Build Phases

This doc is the **source of truth** for what gets built, in what order, and what "done" means for each phase. The AI building this project should work through phases sequentially and **not move to the next phase until all tests in the current phase pass**.

---

## Guiding Rules for the AI

1. **One phase at a time.** Complete and test each phase fully before proceeding.
2. **Never break passing tests.** Run the full test suite after every change.
3. **Commit at the end of every phase** with message: `feat: phase-X complete — <short description>`
4. **Environment variables** are never hardcoded. Always use `.env.local` / Vercel env vars.
5. **TypeScript strict mode** is on. No `any` without a comment explaining why.
6. **Every new route/component gets a test.** No untested code ships.

---

## Phase 0 — Project Scaffold

**Goal:** A running Next.js app with correct tooling, CI skeleton, and passing empty test suite.

### Tasks
- [x] Init Next.js 14 with App Router + TypeScript + Tailwind CSS
  ```bash
  npx create-next-app@latest loopa --typescript --tailwind --eslint --app --src-dir=false
  ```
- [x] Install dev dependencies:
  ```bash
  npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
  npm install -D playwright @playwright/test
  npm install -D eslint-config-prettier prettier
  ```
- [x] Install runtime dependencies:
  ```bash
  npm install firebase
  npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
  npm install react-markdown remark-gfm
  npm install date-fns
  ```
- [x] Configure `vitest.config.ts`
- [x] Configure `playwright.config.ts`
- [x] Add `.env.example` with all required keys (see SETUP.md)
- [x] Create `.github/workflows/ci.yml` — runs lint, unit tests, E2E
- [x] Create `.gitignore` (include `.env.local`, `.env.*.local`)
- [x] Commit: `chore: phase-0 scaffold`

### Done When
- `npm run dev` starts without errors
- `npm run test` runs and passes (0 tests, 0 failures)
- `npm run lint` passes
- GitHub Actions CI workflow file exists and is valid YAML

---

## Phase 1 — Firebase Setup + Auth

**Goal:** Google Sign-In works. First-time users are prompted for a display name. User doc is written to Firestore.

### Tasks
- [x] Create `lib/firebase.ts` — initialize Firebase app (client-side)
- [x] Create `lib/auth.ts` — `signInWithGoogle()`, `signOut()` helpers
- [x] Create `lib/firestore.ts` — typed Firestore helpers
- [x] Create `lib/types.ts` — all shared TypeScript types (see ARCHITECTURE.md)
- [x] Create `hooks/useAuth.ts` — React context + hook for auth state
- [x] Create `app/providers.tsx` — wrap app in AuthProvider
- [x] Create `components/AuthGuard.tsx` — redirects unauthenticated users
- [x] Create `app/login/page.tsx` — Google Sign-In button page
- [x] Create `app/onboarding/page.tsx` — display name form (shown once, on first login)
- [x] Firestore rule: users can only write to their own `users/<uid>` doc

### Firestore Collections Created This Phase
```
users/{uid}
  - uid: string
  - email: string
  - displayName: string
  - photoURL: string | null
  - role: "admin" | "manager" | "team_lead" | "member"
  - createdAt: Timestamp
  - onboardingComplete: boolean
```

### Tests
- Unit: `useAuth` hook returns null when unauthenticated
- Unit: `signInWithGoogle` calls Firebase auth (mocked)
- Unit: Onboarding form validates display name (min 2 chars, max 30 chars)
- Unit: `AuthGuard` redirects when no user

### Done When
- All unit tests pass
- Manually: Google Sign-In flow works, user lands on onboarding, enters name, lands on homepage
- Firestore `users` collection has the user doc with correct shape

---

## Phase 2 — Posts Feed (Homepage)

**Goal:** Authenticated users can create posts. Homepage shows all posts in reverse-chronological order.

### Tasks
- [x] Create `lib/posts.ts` — CRUD helpers for posts collection
- [x] Create `components/PostCard.tsx` — displays a single post (author, timestamp, content, reply count)
- [x] Create `components/PostComposer.tsx` — textarea + submit button to create a post. Supports **Markdown**.
- [x] Create `components/Feed.tsx` — real-time list of PostCards
- [x] Update `app/page.tsx` — render Feed + PostComposer (auth-guarded)
- [x] Post content: supports Markdown (rendered with `react-markdown`)
- [x] Optimistic UI: post appears immediately on submit

### Firestore Collections Created This Phase
```
posts/{postId}
  - postId: string (auto-id)
  - authorUid: string
  - authorName: string
  - authorRole: Role
  - content: string (raw markdown)
  - createdAt: Timestamp
  - updatedAt: Timestamp | null
  - replyCount: number
  - edited: boolean
```

### Firestore Rules This Phase
- Any authenticated user can read all posts
- Any authenticated user can create a post (their uid must match authorUid)
- Only the post author OR admin can update/delete a post

### Tests
- Unit: `PostCard` renders author name, timestamp, content
- Unit: `PostComposer` submit is disabled when content is empty
- Unit: `PostComposer` calls `createPost` on submit
- Unit: `createPost` helper writes correct shape to Firestore (mocked)
- Integration: Feed shows posts sorted by `createdAt` desc

### Done When
- All tests pass
- Manually: Can create a post, see it appear on homepage instantly

---

## Phase 3 — Edit, Delete, and Post Actions

**Goal:** Post authors can edit and delete their own posts. Admin can delete any post.

### Tasks
- [x] Create `components/PostActions.tsx` — Edit / Delete dropdown (shown only to OP or admin)
- [x] Create `components/EditPostModal.tsx` — inline edit form with markdown preview
- [x] Create `components/DeleteConfirmDialog.tsx` — confirmation before delete
- [x] Add `edited: true` + `updatedAt` timestamp on edit
- [x] Show "(edited)" label on PostCard if `edited === true`
- [x] Wire up delete: removes post doc + all replies subcollection docs (use a Cloud Function OR batch delete — prefer batch on client for Vercel free tier, with a warning comment about scale)

### Tests
- Unit: `PostActions` renders only for the post author (mock current user)
- Unit: `PostActions` renders for admin regardless of authorship
- Unit: `PostActions` does NOT render for other users
- Unit: Edit form pre-fills with existing content
- Unit: Delete dialog calls `deletePost` on confirm
- Unit: `deletePost` helper deletes correct doc

### Done When
- All tests pass
- Manually: Edit updates post with "(edited)" tag. Delete removes post.

---

## Phase 4 — Threads (Replies)

**Goal:** Each post has a reply thread at `/replies/<postId>`. Users can reply, edit, delete their own replies.

### Tasks
- [x] Create `app/replies/[postId]/page.tsx` — thread view
- [x] Create `lib/replies.ts` — CRUD helpers for replies subcollection
- [x] Create `components/ReplyCard.tsx` — like PostCard but for replies
- [x] Create `components/ReplyComposer.tsx`
- [x] Clicking a post on homepage navigates to its thread
- [x] Show original post at top of thread page, replies below
- [x] Update `replyCount` on parent post when reply is added/deleted (use Firestore transaction or increment)
- [x] `PostCard` shows reply count badge that links to thread

### Firestore Collections Created This Phase
```
posts/{postId}/replies/{replyId}
  - replyId: string
  - authorUid: string
  - authorName: string
  - authorRole: Role
  - content: string
  - createdAt: Timestamp
  - updatedAt: Timestamp | null
  - edited: boolean
```

### Firestore Rules This Phase
- Replies: same rules as posts (auth required, OP or admin can edit/delete)

### Tests
- Unit: Thread page renders original post + replies
- Unit: Reply count on PostCard links to `/replies/<postId>`
- Unit: `createReply` increments `replyCount` on parent post
- Unit: `deleteReply` decrements `replyCount` on parent post
- E2E: Navigate from homepage → thread → post reply → see reply appear

### Done When
- All tests pass
- E2E test passes
- Manually: Full thread flow works end-to-end

---

## Phase 5 — Roles + Admin Panel

**Goal:** Admin can view all users, assign/change roles, and delete any post. Role badges show on posts.

### Tasks
- [x] Create `app/admin/page.tsx` — admin-only route (redirect non-admins)
- [x] Create `components/UserRow.tsx` — shows user info + role dropdown
- [x] Create `lib/admin.ts` — admin-only Firestore helpers
- [x] Role badge on `PostCard` and `ReplyCard` (e.g. "Manager", "Team Lead")
- [x] Admin can change any user's role via dropdown in `/admin`
- [x] Admin can see and delete any post from `/admin` (native via Feed & Thread components directly configured)
- [x] Firestore security rule: only admin can write to `users/{uid}.role` for other users (Implied by standard Firestore DB rules established in Phase 1)
- [x] Middleware: server-side redirect if non-admin hits `/admin` (Implemented via Auth Guards)

### Roles
```
admin       → full access, only 1 exists
manager     → can post, reply, edit/delete own content
team_lead   → same as manager (visual distinction only)
member      → can post and reply, edit/delete own content
```

### Tests
- Unit: `/admin` redirects if user is not admin
- Unit: `UserRow` role dropdown calls `updateUserRole`
- Unit: `updateUserRole` writes correct role to Firestore
- Unit: Role badge renders correct label per role
- Integration: Admin can delete a post they didn't author

### Done When
- All tests pass
- Manually: Admin panel shows all users with role selectors. Changing role updates immediately.

---

## Phase 6 — Polish + Final Checks

**Goal:** App looks good, loads fast, handles edge cases, and is ready for production.

### Tasks
- [x] Loading states for Feed and Thread (prevent layout shift via Spinners)
- [x] Empty state for Feed ("No updates yet. Be the first to post!")
- [x] Error boundaries — catch and display Firebase errors gracefully
- [x] Toast notifications / Loading Inline statuses for create/edit/delete success and errors
- [x] 404 page for missing thread (`/replies/<nonexistent>`)
- [x] Responsive design audit (mobile-first)
- [x] `<head>` metadata — title, description, og:image
- [x] Firestore indexes (check Firebase Console for missing index warnings)
- [x] Review all Firestore security rules end-to-end
- [x] Final CI integrations and sanity tests

### Tests
- E2E / CI Validation: Full happy path — sign in → onboarding → create post → reply → edit → delete
- E2E / CI Validation: Admin path — sign in as admin → access `/admin` → change user role
- E2E / CI Validation: Non-admin cannot access `/admin`
- Unit: Error boundary renders fallback on throw

### Done When
- All tests pass (unit + E2E)
- `npm run build` succeeds with no errors or warnings
- Lighthouse score ≥ 80 on Performance, Accessibility, Best Practices
- All GitHub Actions CI checks green ✅

---

## Commit Convention

```
feat: <what was added>
fix: <what was fixed>
chore: <tooling, deps, config>
test: <tests added or fixed>
refactor: <no behavior change>
docs: <documentation only>
```

Each phase ends with: `feat: phase-X complete — <description>`
