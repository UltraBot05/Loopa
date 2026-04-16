"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { updatePost } from "@/lib/posts";
import type { Post } from "@/lib/types";

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function EditPostModal({ post, isOpen, setIsOpen }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim() === post.content) {
      setIsOpen(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updatePost(post.postId, content.trim());
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to edit post:", err);
      setError("Failed to edit post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg z-50">
          <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">
            Edit Post
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Edit the content of your post.
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <textarea
              data-testid="edit-post-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[150px] border rounded-md p-3 text-gray-800 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="edit-post-submit"
                disabled={loading || !content.trim() || content.trim() === post.content}
                className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
          
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
