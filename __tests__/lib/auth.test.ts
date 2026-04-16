import { vi, expect, it, describe, beforeEach } from "vitest";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

describe("auth helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signInWithGoogle", () => {
    it("calls signInWithPopup with correct arguments", async () => {
      const mockResult = { user: { uid: "test-uid", email: "test@example.com" } };
      vi.mocked(signInWithPopup).mockResolvedValue(mockResult as unknown as ReturnType<typeof signInWithPopup>);

      const result = await signInWithGoogle();
      
      expect(signInWithPopup).toHaveBeenCalledOnce();
      expect(result).toEqual(mockResult.user);
    });

    it("throws error if signInWithPopup fails", async () => {
      const mockError = new Error("Auth failed");
      vi.mocked(signInWithPopup).mockRejectedValue(mockError);

      await expect(signInWithGoogle()).rejects.toThrow("Auth failed");
    });
  });

  describe("signOut", () => {
    it("calls firebaseSignOut", async () => {
      vi.mocked(firebaseSignOut).mockResolvedValue(undefined);

      await signOut();
      
      expect(firebaseSignOut).toHaveBeenCalledOnce();
    });
  });
});
