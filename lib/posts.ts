import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit, doc, updateDoc, writeBatch } from "firebase/firestore";
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

export const updatePost = async (postId: string, content: string) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    content,
    updatedAt: serverTimestamp(),
    edited: true,
  });
};

export const deletePost = async (postId: string) => {
  // To avoid leaving orphaned replies, we should delete all replies in the subcollection.
  // Note: Client-side batch deleting scale is limited (500 ops per batch).
  // For larger scale, a Cloud Function triggers on post deletion is recommended.
  const batch = writeBatch(db);
  
  const postRef = doc(db, "posts", postId);
  batch.delete(postRef);

  const repliesRef = collection(db, "posts", postId, "replies");
  const repliesSnap = await getDocs(repliesRef);
  repliesSnap.forEach((replyDoc) => {
    batch.delete(replyDoc.ref);
  });

  await batch.commit();
};

export const getRecentPosts = async (limitCount: number = 50) => {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(postsQuery);
  return snapshot.docs.map(doc => ({
    postId: doc.id,
    ...doc.data()
  }));
};
