import { vi, expect, it, describe, beforeEach } from "vitest";
import { createPost, deletePost, updatePost } from "@/lib/posts";
import * as firestore from "firebase/firestore";

describe("posts lib helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls addDoc with correct shape", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockAddDoc = vi.mocked(firestore.addDoc).mockResolvedValue({ id: "new-post-id" } as any);

    await createPost({
      authorUid: "uid1",
      authorName: "Priya",
      authorRole: "member",
      content: "## Hello",
    });

    expect(mockAddDoc).toHaveBeenCalledOnce();
    const callArgs = mockAddDoc.mock.calls[0][1];
    expect(callArgs.authorUid).toBe("uid1");
    expect(callArgs.content).toBe("## Hello");
    expect(callArgs.replyCount).toBe(0);
    expect(callArgs.edited).toBe(false);
  });

  it("updatePost updates doc correctly", async () => {
    const mockUpdateDoc = vi.mocked(firestore.updateDoc).mockResolvedValue();
    await updatePost("post-id", "new content");
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
  });

  it("deletePost deletes batch doc and replies correctly", async () => {
    const mockDelete = vi.fn();
    const mockCommit = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(firestore.writeBatch).mockReturnValue({ delete: mockDelete, commit: mockCommit } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(firestore.getDocs).mockResolvedValue({ forEach: vi.fn() } as any);

    await deletePost("post-id");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockCommit).toHaveBeenCalled();
  });
});
