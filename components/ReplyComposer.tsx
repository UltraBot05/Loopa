"use client";

import { useState } from "react";
import { createReply } from "@/lib/replies";
import type { User } from "@/lib/types";

interface ReplyComposerProps {
  user: User;
  postId: string;
}

export function ReplyComposer({ user, postId }: ReplyComposerProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await createReply(postId, {
        authorUid: user.uid,
        authorName: user.displayName,
        authorRole: user.role,
        content: content.trim(),
      });
      setContent("");
    } catch (err) {
      console.error("Failed to post reply:", err);
      setError("Failed to compose reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <textarea
        data-testid="reply-composer"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="w-full min-h-[80px] border-none focus:ring-0 resize-y rounded-md p-2 text-gray-800 placeholder-gray-400 bg-gray-50 text-sm"
        disabled={loading}
      />
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-400 hidden sm:inline">Markdown is supported</span>
        <button
          type="submit"
          data-testid="reply-submit"
          disabled={loading || !content.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white font-medium text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Replying..." : "Post Reply"}
        </button>
      </div>
    </form>
  );
}
