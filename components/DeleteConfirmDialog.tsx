"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { deletePost } from "@/lib/posts";
import type { Post } from "@/lib/types";

interface DeleteConfirmDialogProps {
  post: Post;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function DeleteConfirmDialog({ post, isOpen, setIsOpen }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deletePost(post.postId);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-sm z-50">
          <Dialog.Title className="text-lg font-semibold mb-2 text-gray-900">
            Delete Post?
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6 text-sm">
            Are you sure you want to delete this post? This action cannot be undone and will also delete all replies.
          </Dialog.Description>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="confirm-delete-button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
          
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
