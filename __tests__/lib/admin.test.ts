import { vi, expect, it, describe, beforeEach } from "vitest";
import { getAllUsers, updateUserRole } from "@/lib/admin";
import * as firestore from "firebase/firestore";

describe("admin lib helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllUsers fetches users from firestore correctly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockDocs = [{ id: "u1", data: () => ({ email: "a@a.com" }) }] as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(firestore.getDocs).mockResolvedValue({ docs: mockDocs } as any);

    const users = await getAllUsers();
    
    expect(firestore.getDocs).toHaveBeenCalled();
    expect(users).toHaveLength(1);
    expect(users[0].uid).toBe("u1");
  });

  it("updateUserRole writes correct role to firestore", async () => {
    const mockUpdateDoc = vi.mocked(firestore.updateDoc).mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(firestore.doc).mockReturnValue("doc-ref" as any);

    await updateUserRole("u1", "admin");

    expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), "users", "u1");
    expect(mockUpdateDoc).toHaveBeenCalledWith("doc-ref", { role: "admin" });
  });
});
