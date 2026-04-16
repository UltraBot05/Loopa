"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Feed } from "@/components/Feed";
import { PostComposer } from "@/components/PostComposer";

export default function Home() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50/50">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Loopa Feed</h1>
          {user && <PostComposer user={user} />}
          <Feed />
        </div>
      </main>
    </AuthGuard>
  );
}
