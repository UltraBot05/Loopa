# 🤝 CONTRIBUTING.md — Conventions & Git Workflow

---

## Git Workflow

### Branching
```
main          → production (auto-deploys to Vercel)
└── feat/phase-X-description   → feature branches per phase
└── fix/short-description      → bug fix branches
```

Always branch off `main`. PRs merge back into `main`.

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add reply threading
fix: fix replyCount not updating on delete
chore: upgrade firebase to v10
test: add PostCard unit tests
refactor: extract useFirestore hook
docs: update SETUP.md with emulator steps
```

Phase-end commits:
```
feat: phase-1 complete — auth + onboarding
feat: phase-2 complete — posts feed
feat: phase-3 complete — edit and delete
feat: phase-4 complete — threads and replies
feat: phase-5 complete — roles and admin panel
feat: phase-6 complete — polish and production ready
```

### Pull Request Checklist
Before merging a PR, verify:
- [ ] All unit tests pass (`npm run test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] No `console.log` left in code
- [ ] No hardcoded secrets or API keys
- [ ] TypeScript has no errors (`npx tsc --noEmit`)

---

## Code Style

### TypeScript
- Strict mode is on (`"strict": true` in `tsconfig.json`)
- Prefer `interface` for object shapes, `type` for unions/primitives
- No `any` without a comment explaining why
- Async functions always use `async/await`, not `.then()`

### React
- Functional components only
- `'use client'` directive only where needed (minimize client components)
- Props interfaces named `ComponentNameProps`
- Event handlers prefixed with `handle` (e.g., `handleSubmit`, `handleDelete`)

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` prefixed with `use`
- Lib helpers: `camelCase.ts`
- Tests: `ComponentName.test.tsx` or `helperName.test.ts`

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal `@/lib/*`, `@/hooks/*`
4. Internal `@/components/*`
5. Types

```typescript
// Good
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/hooks/useAuth'
import { createPost } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import type { Post } from '@/lib/types'
```

---

## Firestore Rules Changes

Any change to `firestore.rules` **must**:
1. Be reviewed carefully (wrong rules = data exposed or app broken)
2. Include a comment explaining the rule
3. Be tested manually in the Firebase Console **Rules Playground**
4. Be deployed: `firebase deploy --only firestore:rules`

---

## Environment Variables

- **Never commit `.env.local`** — it's in `.gitignore`
- Add new vars to `.env.example` with empty values and a comment
- Add new vars to SETUP.md, Vercel dashboard, and GitHub Secrets

---

## Initial Git Setup (for the AI / first-time setup)

```bash
cd teampulse

git init
git add .
git commit -m "chore: phase-0 scaffold"

# Create repo on GitHub (do this manually or via GitHub CLI)
gh repo create teampulse --public --source=. --remote=origin --push

# Or manually:
git remote add origin https://github.com/YOUR_USERNAME/teampulse.git
git branch -M main
git push -u origin main
```

After each phase:
```bash
git add .
git commit -m "feat: phase-X complete — description"
git push
```

---

## Dependency Management

- Pin major versions in `package.json`
- Run `npm audit` before shipping phase 6
- Don't add a dependency if it can be done in ~20 lines of vanilla code
