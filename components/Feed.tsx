"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PostCard } from "./PostCard";
import type { Post, PostDoc } from "@/lib/types";

export function Feed() {
  const [actualPosts, setActualPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newPosts: Post[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as PostDoc;
          return {
            ...data,
            postId: docSnap.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as any).toDate() : new Date(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' ? (data.updatedAt as any).toDate() : null,
          };
        });
        setActualPosts(newPosts);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded">Error loading feed.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (actualPosts.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 border rounded-lg bg-gray-50">
        No updates yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actualPosts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}
