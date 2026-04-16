import type { Timestamp } from "firebase/firestore";

export type Role = "admin" | "manager" | "team_lead" | "member";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: Role;
  createdAt: Timestamp | Date; // FirebaseFirestore.Timestamp
  onboardingComplete: boolean;
}

export interface PostDoc {
  postId: string;
  authorUid: string;
  authorName: string;
  authorRole: Role;
  content: string;          // raw Markdown
  createdAt: Timestamp | Date; // FirebaseFirestore.Timestamp
  updatedAt: Timestamp | Date | null; // FirebaseFirestore.Timestamp
  replyCount: number;
  edited: boolean;
}

export interface ReplyDoc {
  replyId: string;
  authorUid: string;
  authorName: string;
  authorRole: Role;
  content: string;          // raw Markdown
  createdAt: Timestamp | Date; // FirebaseFirestore.Timestamp
  updatedAt: Timestamp | Date | null; // FirebaseFirestore.Timestamp
  edited: boolean;
}

// Used client-side after Timestamp → Date conversion
export interface Post extends Omit<PostDoc, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Reply extends Omit<ReplyDoc, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date | null;
}

export interface User extends Omit<UserDoc, "createdAt"> {
  createdAt: Date;
}
