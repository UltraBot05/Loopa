"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { updateReply, deleteReply } from "@/lib/replies";
import type { Reply } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReplyCardProps {
  postId: string;
  reply: Reply;
  currentUserId?: string;
  currentUserRole?: string;
}

export function ReplyCard({ postId, reply, currentUserId, currentUserRole }: ReplyCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [loading, setLoading] = useState(false);

  // Is OP or Is Admin
  const canEdit = currentUserId === reply.authorUid || currentUserRole === "admin";
  const canDelete = currentUserId === reply.authorUid || currentUserRole === "admin";

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || editContent.trim() === reply.content) return;
    try {
      setLoading(true);
      await updateReply(postId, reply.replyId, editContent.trim());
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteReply(postId, reply.replyId);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="reply-card" className="bg-white p-3 rounded-md shadow-sm border border-gray-100 mb-3 ml-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{reply.authorName}</span>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full" data-testid="role-badge">
            {reply.authorRole.replace("_", " ")}
          </span>
          <span className="text-[10px] text-gray-400">
            {reply.createdAt ? formatDistanceToNow(reply.createdAt, { addSuffix: true }) : "just now"}
          </span>
          {reply.edited && (
            <span className="text-[10px] text-gray-400 italic">(edited)</span>
          )}
        </div>

        {(canEdit || canDelete) && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Reply actions"
                data-testid="reply-actions-trigger"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[120px] bg-white rounded-md shadow border p-1 z-10" align="end">
                {canEdit && (
                  <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-xs outline-none hover:bg-gray-100 cursor-pointer" onSelect={() => setIsEditOpen(true)} data-testid="reply-action-edit">
                    Edit
                  </DropdownMenu.Item>
                )}
                {canDelete && (
                  <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-xs text-red-600 outline-none hover:bg-red-50 cursor-pointer" onSelect={() => setIsDeleteOpen(true)} data-testid="reply-action-delete">
                    Delete
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 text-sm break-words mt-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{reply.content}</ReactMarkdown>
      </div>

      {/* Edit Dialog */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-5 w-[90vw] max-w-md z-50">
            <Dialog.Title className="text-md font-semibold mb-3">Edit Reply</Dialog.Title>
            <Dialog.Description className="sr-only">Edit your reply here</Dialog.Description>
            <form onSubmit={handleEditSubmit}>
              <textarea
                data-testid="edit-reply-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[100px] border rounded-md p-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2"
                disabled={loading}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-3 py-1.5 bg-gray-100 text-sm rounded">Cancel</button>
                <button type="submit" disabled={loading || !editContent.trim()} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">Save</button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Dialog */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-5 w-[90vw] max-w-sm z-50">
            <Dialog.Title className="text-md font-semibold mb-2">Delete Reply?</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">This action cannot be undone.</Dialog.Description>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-3 py-1.5 bg-gray-100 text-sm rounded">Cancel</button>
              <button type="button" data-testid="confirm-delete-reply" onClick={handleDelete} disabled={loading} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50">Delete</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
