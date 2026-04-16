import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit } from "firebase/firestore";
import type { PostDoc } from "./types";

export const createPost = async (postData: Omit<PostDoc, "postId" | "createdAt" | "updatedAt" | "replyCount" | "edited">) => {
  const postsRef = collection(db, "posts");
  const newPost = {
    ...postData,
    createdAt: serverTimestamp(),
    updatedAt: null,
    replyCount: 0,
    edited: false,
  };
  const docRef = await addDoc(postsRef, newPost);
  return docRef.id;
};

// We will use onSnapshot directly in the Feed component for real-time updates.
export const getRecentPosts = async (limitCount: number = 50) => {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(postsQuery);
  return snapshot.docs.map(doc => ({
    postId: doc.id,
    ...doc.data()
  }));
};
