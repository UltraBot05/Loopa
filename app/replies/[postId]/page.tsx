"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { PostCard } from "@/components/PostCard";
import { ReplyCard } from "@/components/ReplyCard";
import { ReplyComposer } from "@/components/ReplyComposer";
import type { Post, Reply, PostDoc, ReplyDoc } from "@/lib/types";

export default function ThreadPage() {
  const { postId } = useParams() as { postId: string };
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) return;

    // Listen to parent post
    const postRef = doc(db, "posts", postId);
    const unsubPost = onSnapshot(postRef, (docSnap) => {
      if (!docSnap.exists()) {
        setPost(null);
      } else {
        const data = docSnap.data() as PostDoc;
        setPost({
          ...data,
          postId: docSnap.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as any).toDate() : new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' ? (data.updatedAt as any).toDate() : null,
        });
      }
    }, (err) => {
      console.error(err);
      setError(err);
    });

    // Listen to replies
    const repliesRef = collection(db, "posts", postId, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));
    const unsubReplies = onSnapshot(q, (snapshot) => {
      const fetchedReplies: Reply[] = snapshot.docs.map((replySnap) => {
        const data = replySnap.data() as ReplyDoc;
        return {
          ...data,
          replyId: replySnap.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as any).toDate() : new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' ? (data.updatedAt as any).toDate() : null,
        };
      });
      setReplies(fetchedReplies);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setLoading(false);
    });

    return () => {
      unsubPost();
      unsubReplies();
    };
  }, [postId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-8 items-center text-red-600">
        <p>Error loading thread.</p>
        <button onClick={() => router.push("/")} className="mt-4 text-blue-600 hover:underline">Go back to feed</button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50/50">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
          <button 
            onClick={() => router.push("/")}
            className="text-sm flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium"
          >
            &larr; Back to Feed
          </button>

          {loading ? (
             <div className="flex justify-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          ) : !post ? (
            <div className="text-center p-8 text-gray-500 border rounded-lg bg-gray-50">
              <p>This post has been deleted or does not exist.</p>
            </div>
          ) : (
            <>
              {/* Parent Post */}
              <PostCard post={post} currentUserId={user?.uid} currentUserRole={user?.role} hideReplyLink />
              
              {/* Replies Section */}
              <div className="pl-4 mt-6 border-l-2 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h3>
                
                {replies.map(reply => (
                  <ReplyCard 
                    key={reply.replyId} 
                    postId={post.postId} 
                    reply={reply} 
                    currentUserId={user?.uid} 
                    currentUserRole={user?.role} 
                  />
                ))}

                {user && <ReplyComposer user={user} postId={post.postId} />}
              </div>
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
