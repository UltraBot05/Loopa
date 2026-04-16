import { renderHook, waitFor } from "@testing-library/react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onAuthStateChanged } from "firebase/auth";

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    onAuthStateChanged: vi.fn(),
  };
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when unauthenticated", async () => {
    // Simulate no user
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn(); // unsubscribe function
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
  });
});
