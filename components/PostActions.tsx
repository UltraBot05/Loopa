"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { EditPostModal } from "./EditPostModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { Post } from "@/lib/types";

interface PostActionsProps {
  post: Post;
  currentUserId?: string;
  currentUserRole?: string;
}

export function PostActions({ post, currentUserId, currentUserRole }: PostActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Is OP or Is Admin
  const canEdit = currentUserId === post.authorUid || currentUserRole === "admin";
  const canDelete = currentUserId === post.authorUid || currentUserRole === "admin";

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button 
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Post actions"
            data-testid="post-actions-trigger"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            className="min-w-[150px] bg-white rounded-md shadow-lg border p-1 z-10" 
            align="end"
            sideOffset={5}
          >
            {canEdit && (
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 cursor-pointer rounded-sm"
                onSelect={() => setIsEditOpen(true)}
                data-testid="post-action-edit"
              >
                Edit string
              </DropdownMenu.Item>
            )}
            
            {canEdit && canDelete && (
              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
            )}

            {canDelete && (
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 cursor-pointer rounded-sm"
                onSelect={() => setIsDeleteOpen(true)}
                data-testid="post-action-delete"
              >
                Delete
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <EditPostModal post={post} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
      <DeleteConfirmDialog post={post} isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} />
    </>
  );
}
