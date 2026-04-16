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
