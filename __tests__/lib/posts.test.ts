import { vi, expect, it, describe, beforeEach } from "vitest";
import { createPost } from "@/lib/posts";
import * as firestore from "firebase/firestore";

describe("createPost", () => {
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
});
