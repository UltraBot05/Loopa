# 🤖 AI_AGENT_PROMPT.md — Instructions for Antigravity IDE AI

> **Read this file first. This is your operating manual.**

---

## Who You Are

You are building **Loopa** — a project update board for small teams. You will follow the build plan in `docs/PLANNING.md` and implement the architecture in `docs/ARCHITECTURE.md`.

---

## Prime Directives

1. **Work phase by phase.** Read `docs/PLANNING.md`. Complete Phase 0, then Phase 1, etc. Do not skip ahead.
2. **Tests are not optional.** Every phase lists required tests. Write them. Run them. All must pass before you commit and move on.
3. **Never break passing tests.** Run `npm run test` after every meaningful change. If a test was passing and now fails, fix it before continuing.
4. **Build must always pass.** Run `npm run build` at the end of each phase. Fix errors before committing.
5. **Commit at the end of each phase** with the exact message specified in PLANNING.md.

---

## How to Start

```bash
# Step 1: Read the docs
# Read docs/PLANNING.md fully before writing any code

# Step 2: Scaffold (Phase 0)
npx create-next-app@latest loopa --typescript --tailwind --eslint --app --src-dir=false
cd loopa

# Step 3: Install all dependencies listed in Phase 0 of PLANNING.md

# Step 4: Copy all doc files into the project
mkdir docs
# Copy PLANNING.md, ARCHITECTURE.md, SETUP.md, TESTING.md, CONTRIBUTING.md into docs/
# Copy this file (AI_AGENT_PROMPT.md) into the project root
# Copy README.md into the project root

# Step 5: Create config files (vitest.config.ts, playwright.config.ts, vitest.setup.ts)
# See TESTING.md for the exact content of these files

# Step 6: Add test scripts to package.json
# See TESTING.md for the exact scripts

# Step 7: Create .env.example
# See ARCHITECTURE.md for the list of env vars

# Step 8: Create .github/workflows/ci.yml
# See TESTING.md for the exact content

# Step 9: Verify Phase 0 is done
npm run dev          # Must start without errors
npm run test         # Must run (0 tests, 0 failures)
npm run lint         # Must pass
npm run build        # Must succeed

# Step 10: Commit
git init
git add .
git commit -m "chore: phase-0 scaffold"
```

---

## Phase Execution Loop

For each phase (1 through 6):

```
1. Read the phase spec in PLANNING.md carefully
2. Implement all tasks in the phase
3. Write all tests listed in the phase
4. Run: npm run test
   → If any tests fail: fix the code, not the tests
5. Run: npm run build
   → If build fails: fix errors
6. Run: npm run lint
   → Fix any lint errors
7. (For phases 4+) Run: npm run test:e2e
8. Commit: git add . && git commit -m "feat: phase-X complete — description"
```

---

## Key Files to Create (and Where)

| File | Location | Reference |
|---|---|---|
| Firebase init | `lib/firebase.ts` | ARCHITECTURE.md |
| All types | `lib/types.ts` | ARCHITECTURE.md → TypeScript Types |
| Auth helpers | `lib/auth.ts` | PLANNING.md Phase 1 |
| Posts CRUD | `lib/posts.ts` | PLANNING.md Phase 2 |
| Replies CRUD | `lib/replies.ts` | PLANNING.md Phase 4 |
| Admin ops | `lib/admin.ts` | PLANNING.md Phase 5 |
| Auth hook | `hooks/useAuth.ts` | PLANNING.md Phase 1 |
| Firestore rules | `firestore.rules` | ARCHITECTURE.md → Security Rules |
| CI pipeline | `.github/workflows/ci.yml` | TESTING.md → CI Pipeline |
| Vitest config | `vitest.config.ts` | TESTING.md → Configuration |
| Playwright config | `playwright.config.ts` | TESTING.md → Configuration |
| Test setup | `vitest.setup.ts` | TESTING.md → Configuration |
| Test fixtures | `__tests__/__mocks__/fixtures.ts` | TESTING.md → Test Fixtures |

---

## Firebase Setup Note

The AI cannot create a Firebase project. The human must do this first (see `docs/SETUP.md`). The AI should:
1. Create `lib/firebase.ts` that reads from `process.env.NEXT_PUBLIC_FIREBASE_*`
2. Create `.env.example` listing all required vars
3. Add a comment at the top of `lib/firebase.ts` directing to SETUP.md

```typescript
// lib/firebase.ts
// Before running: follow docs/SETUP.md to create a Firebase project
// and fill in .env.local with your config values
```

---

## Component `data-testid` Requirements

Every interactive element that E2E tests reference must have a `data-testid`. Maintain this list:

| data-testid | Component | Used In |
|---|---|---|
| `post-composer` | `PostComposer` | textarea for new post |
| `post-submit` | `PostComposer` | submit button |
| `post-card` | `PostCard` | wrapping div |
| `post-actions-trigger` | `PostActions` | dropdown trigger |
| `edit-post-btn` | `PostActions` | edit option |
| `delete-post-btn` | `PostActions` | delete option |
| `reply-count-link` | `PostCard` | link to thread |
| `reply-composer` | `ReplyComposer` | textarea for reply |
| `reply-submit` | `ReplyComposer` | submit button |
| `reply-card` | `ReplyCard` | wrapping div |
| `role-badge` | `RoleBadge` | role label |
| `admin-user-row` | `UserRow` | admin panel row |
| `role-select` | `UserRow` | role dropdown |

---

## Error Handling Rules

1. All Firestore calls are wrapped in `try/catch`
2. Errors are shown to the user via toast (not `console.error` only)
3. Loading states are shown while async operations are in flight
4. Never let an unhandled promise rejection escape a component

---

## What "Done" Means

The project is done when:
- [ ] All 6 phases are complete
- [ ] `npm run test` → 0 failures
- [ ] `npm run test:e2e` → 0 failures
- [ ] `npm run build` → no errors or warnings
- [ ] `npm run lint` → no errors
- [ ] `git log --oneline` shows 7 commits (phase 0–6)
- [ ] `.github/workflows/ci.yml` exists and is valid
- [ ] `README.md` is at the project root
- [ ] All doc files are in `docs/`
- [ ] `.env.example` exists (`.env.local` is gitignored)
- [ ] `firestore.rules` exists

When done, tell the human:
> "All phases complete. Run `git push` to push to GitHub. Then import the repo in Vercel (see docs/SETUP.md step 3). CI should go green immediately."
