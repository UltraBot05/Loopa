import { vi, expect, it, describe, beforeEach } from "vitest";
import { createReply, deleteReply, updateReply } from "@/lib/replies";
import * as firestore from "firebase/firestore";

describe("replies lib helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createReply creates doc and increments replyCount in transaction", async () => {
    const mockSet = vi.fn();
    const mockUpdate = vi.fn();
    const mockGet = vi.fn().mockResolvedValue({ exists: () => true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(firestore.runTransaction).mockImplementation(async (db, cb: any) => {
      await cb({ get: mockGet, set: mockSet, update: mockUpdate });
    });

    await createReply("post-id", {
      authorUid: "uid",
      authorName: "John",
      authorRole: "member",
      content: "Reply test",
    });

    expect(mockGet).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
    expect(mockUpdate.mock.calls[0][1]).toEqual({
      replyCount: firestore.increment(1),
    });
  });

  it("updateReply updates doc correctly", async () => {
    const mockUpdateDoc = vi.mocked(firestore.updateDoc).mockResolvedValue();
    await updateReply("post-id", "reply-id", "new content");
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
  });

  it("deleteReply deletes doc and decrements replyCount in transaction", async () => {
    const mockDelete = vi.fn();
    const mockUpdate = vi.fn();
    const mockGet = vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ replyCount: 2 }) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(firestore.runTransaction).mockImplementation(async (db, cb: any) => {
      await cb({ get: mockGet, delete: mockDelete, update: mockUpdate });
    });

    await deleteReply("post-id", "reply-id");

    expect(mockGet).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalled();
    expect(mockUpdate.mock.calls[0][1]).toEqual({
      replyCount: firestore.increment(-1),
    });
  });
});
