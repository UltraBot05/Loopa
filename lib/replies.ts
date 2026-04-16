import { db } from "./firebase";
import { collection, serverTimestamp, doc, updateDoc, increment, runTransaction } from "firebase/firestore";
import type { ReplyDoc } from "./types";

export const createReply = async (postId: string, replyData: Omit<ReplyDoc, "replyId" | "createdAt" | "updatedAt" | "edited">) => {
  const repliesRef = collection(db, "posts", postId, "replies");
  const postRef = doc(db, "posts", postId);
  
  const newReply = {
    ...replyData,
    createdAt: serverTimestamp(),
    updatedAt: null,
    edited: false,
  };

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post does not exist!");
    }

    const newReplyRef = doc(repliesRef);
    transaction.set(newReplyRef, newReply);

    transaction.update(postRef, {
      replyCount: increment(1)
    });
  });
};

export const updateReply = async (postId: string, replyId: string, content: string) => {
  const replyRef = doc(db, "posts", postId, "replies", replyId);
  await updateDoc(replyRef, {
    content,
    updatedAt: serverTimestamp(),
    edited: true,
  });
};

export const deleteReply = async (postId: string, replyId: string) => {
  const postRef = doc(db, "posts", postId);
  const replyRef = doc(db, "posts", postId, "replies", replyId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists()) {
      transaction.delete(replyRef);
      return;
    }

    const currentCount = postDoc.data().replyCount || 0;
    if (currentCount > 0) {
      transaction.update(postRef, { replyCount: increment(-1) });
    }
    
    transaction.delete(replyRef);
  });
};
