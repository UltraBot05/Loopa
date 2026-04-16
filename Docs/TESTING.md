# 🧪 TESTING.md — Testing Strategy

---

## Philosophy

> **Never break what's working.** Every phase adds tests. No phase removes passing tests.

Three layers of testing:
1. **Unit tests (Vitest)** — fast, isolated, mocked Firebase
2. **E2E tests (Playwright)** — real browser, real Firebase (test project)
3. **CI checks** — lint + unit + E2E run on every push and PR

---

## Running Tests

```bash
# Unit tests (fast, ~5s)
npm run test

# Unit tests with coverage
npm run test:coverage

# Unit tests in watch mode (dev)
npm run test:watch

# E2E tests (slower, needs dev server running)
npm run test:e2e

# E2E tests in headed mode (see the browser)
npm run test:e2e:headed

# All tests (what CI runs)
npm run test:all
```

---

## Configuration Files

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'e2e/', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

### `vitest.setup.ts`
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase modules globally
vi.mock('./lib/firebase', () => ({
  auth: { currentUser: null, onAuthStateChanged: vi.fn() },
  db: {},
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
  increment: vi.fn((n) => n),
  runTransaction: vi.fn(),
  writeBatch: vi.fn(),
}))
```

### `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## `package.json` Test Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run lint && npm run test && npm run test:e2e"
  }
}
```

---

## Unit Test Patterns

### Testing a Component
```typescript
// __tests__/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/PostCard'
import { mockPost, mockUser } from '../__mocks__/fixtures'

describe('PostCard', () => {
  it('renders author name', () => {
    render(<PostCard post={mockPost} currentUser={mockUser} />)
    expect(screen.getByText(mockPost.authorName)).toBeInTheDocument()
  })

  it('shows edit/delete actions for post author', () => {
    render(<PostCard post={mockPost} currentUser={mockUser} />)
    expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument()
  })

  it('hides edit/delete for non-author', () => {
    const otherUser = { ...mockUser, uid: 'different-uid' }
    render(<PostCard post={mockPost} currentUser={otherUser} />)
    expect(screen.queryByRole('button', { name: /actions/i })).not.toBeInTheDocument()
  })
})
```

### Mocking Firebase Calls
```typescript
// __tests__/lib/posts.test.ts
import { vi, expect, it, describe, beforeEach } from 'vitest'
import { createPost } from '@/lib/posts'
import * as firestore from 'firebase/firestore'

describe('createPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls addDoc with correct shape', async () => {
    const mockAddDoc = vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'new-post-id' } as any)

    await createPost({
      authorUid: 'uid1',
      authorName: 'Priya',
      authorRole: 'member',
      content: '## Hello',
    })

    expect(mockAddDoc).toHaveBeenCalledOnce()
    const callArgs = mockAddDoc.mock.calls[0][1]
    expect(callArgs.authorUid).toBe('uid1')
    expect(callArgs.content).toBe('## Hello')
    expect(callArgs.replyCount).toBe(0)
    expect(callArgs.edited).toBe(false)
  })
})
```

### Test Fixtures
```typescript
// __tests__/__mocks__/fixtures.ts
import type { Post, User } from '@/lib/types'

export const mockUser: User = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: 'Priya',
  photoURL: null,
  role: 'member',
  createdAt: new Date(),
  onboardingComplete: true,
}

export const mockAdminUser: User = {
  ...mockUser,
  uid: 'admin-uid',
  role: 'admin',
}

export const mockPost: Post = {
  postId: 'post-abc',
  authorUid: 'user-123',
  authorName: 'Priya',
  authorRole: 'member',
  content: '## Sprint Update\nAll good!',
  createdAt: new Date('2024-01-15'),
  updatedAt: null,
  replyCount: 2,
  edited: false,
}
```

---

## E2E Test Patterns

### Auth Helper
```typescript
// e2e/helpers/auth.ts
import { Page } from '@playwright/test'

// For E2E, use Firebase Auth emulator or a real test account
export async function signInAsTestUser(page: Page) {
  await page.goto('/login')
  // If using emulator: call the emulator API to create a session
  // If using real Firebase: pre-set a cookie/session token
  // See: https://firebase.google.com/docs/emulator-suite/connect_auth
}
```

### Happy Path E2E
```typescript
// e2e/posts.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Post flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in (use auth emulator in CI)
    await signInAsTestUser(page)
  })

  test('creates a post and sees it on homepage', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="post-composer"]', '## Test post\nThis is a test')
    await page.click('[data-testid="post-submit"]')
    await expect(page.locator('text=Test post')).toBeVisible()
  })

  test('navigates to thread and posts a reply', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="reply-count-link"]')
    await expect(page).toHaveURL(/\/replies\//)
    await page.fill('[data-testid="reply-composer"]', 'Great update!')
    await page.click('[data-testid="reply-submit"]')
    await expect(page.locator('text=Great update!')).toBeVisible()
  })
})
```

---

## CI Pipeline

### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          NEXT_PUBLIC_ADMIN_UID: ${{ secrets.NEXT_PUBLIC_ADMIN_UID }}

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          NEXT_PUBLIC_ADMIN_UID: ${{ secrets.NEXT_PUBLIC_ADMIN_UID }}

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          # ... all other env vars
```

**Note:** For E2E in CI, consider using the Firebase Auth Emulator so you don't need real Google accounts. See [Firebase Emulator Suite docs](https://firebase.google.com/docs/emulator-suite).

---

## Test Coverage Targets

| Area | Target |
|---|---|
| `lib/` helpers | ≥ 90% |
| `components/` | ≥ 80% |
| `hooks/` | ≥ 85% |
| E2E happy paths | 100% of key user journeys |

Run `npm run test:coverage` to see current coverage report in `coverage/index.html`.
