import type { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { PostActions } from "./PostActions";

interface PostCardProps {
  post: Post;
  currentUserId?: string; // Optional, might be used to show edit/delete actions for owner later
  currentUserRole?: string;
}

export function PostCard({ post, currentUserId, currentUserRole }: PostCardProps) {
  return (
    <div data-testid="post-card" className="bg-white p-4 rounded-lg shadow-sm border mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{post.authorName}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full" data-testid="role-badge">
            {post.authorRole.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-400">
            {post.createdAt ? formatDistanceToNow(post.createdAt, { addSuffix: true }) : "just now"}
          </span>
          {post.edited && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
        </div>
        <PostActions post={post} currentUserId={currentUserId} currentUserRole={currentUserRole} />
      </div>

      <div className="prose prose-sm max-w-none text-gray-800 break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-4 pt-3 border-t">
        <button
          data-testid="reply-count-link"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
        </button>
      </div>
    </div>
  );
}
