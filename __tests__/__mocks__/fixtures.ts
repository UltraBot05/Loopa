import type { Post, User } from "@/lib/types";

export const mockUser: User = {
  uid: "user-123",
  email: "test@example.com",
  displayName: "Priya",
  photoURL: null,
  role: "member",
  createdAt: new Date(),
  onboardingComplete: true,
};

export const mockAdminUser: User = {
  ...mockUser,
  uid: "admin-uid",
  role: "admin",
};

export const mockPost: Post = {
  postId: "post-abc",
  authorUid: "user-123",
  authorName: "Priya",
  authorRole: "member",
  content: "## Sprint Update\nAll good!",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: null,
  replyCount: 2,
  edited: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockReply: any = {
  replyId: "reply-def",
  authorUid: "user-456",
  authorName: "Amit",
  authorRole: "admin",
  content: "Great job!",
  createdAt: new Date("2024-01-15T11:00:00Z"),
  updatedAt: null,
  edited: false,
};
