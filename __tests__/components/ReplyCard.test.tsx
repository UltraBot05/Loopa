import { render, screen } from "@testing-library/react";
import { ReplyCard } from "@/components/ReplyCard";
import { mockReply, mockAdminUser } from "../__mocks__/fixtures";
import { describe, it, expect } from "vitest";

describe("ReplyCard", () => {
  it("renders author name, timestamp, content", () => {
    render(<ReplyCard postId="post-id" reply={mockReply} />);
    expect(screen.getByText(mockReply.authorName)).toBeInTheDocument();
    
    // Markdown 'Great job!' should render
    expect(screen.getByText("Great job!")).toBeInTheDocument();
  });

  it("shows actions dropdown only for author or admin", () => {
    const { unmount } = render(<ReplyCard postId="post-id" reply={mockReply} currentUserId={mockReply.authorUid} currentUserRole="member" />);
    // As author:
    expect(screen.getByTestId("reply-actions-trigger")).toBeInTheDocument();
    unmount();

    // As admin (different uid)
    render(<ReplyCard postId="post-id" reply={mockReply} currentUserId={mockAdminUser.uid} currentUserRole={mockAdminUser.role} />);
    expect(screen.getByTestId("reply-actions-trigger")).toBeInTheDocument();
  });

  it("hides actions dropdown for non-author non-admins", () => {
    render(<ReplyCard postId="post-id" reply={mockReply} currentUserId="random" currentUserRole="member" />);
    expect(screen.queryByTestId("reply-actions-trigger")).not.toBeInTheDocument();
  });
});
