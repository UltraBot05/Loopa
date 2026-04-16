"use client";

import { useState } from "react";
import { createPost } from "@/lib/posts";
import type { User } from "@/lib/types";

interface PostComposerProps {
  user: User;
}

export function PostComposer({ user }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await createPost({
        authorUid: user.uid,
        authorName: user.displayName,
        authorRole: user.role,
        content: content.trim(),
      });
      setContent("");
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-lg shadow-sm border">
      <textarea
        data-testid="post-composer"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's the latest update?"
        className="w-full min-h-[100px] border-none focus:ring-0 resize-y rounded-md p-2 text-gray-800 placeholder-gray-400 bg-gray-50"
        disabled={loading}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500 hidden sm:inline">Markdown is supported</span>
        <button
          type="submit"
          data-testid="post-submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Post Update"}
        </button>
      </div>
    </form>
  );
}
