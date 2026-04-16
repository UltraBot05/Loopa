import { render, screen } from "@testing-library/react";
import { PostActions } from "@/components/PostActions";
import { mockPost, mockUser, mockAdminUser } from "../__mocks__/fixtures";
import { describe, it, expect } from "vitest";

describe("PostActions", () => {
  it("renders only for the post author", () => {
    // Current user is the author
    render(<PostActions post={mockPost} currentUserId={mockUser.uid} currentUserRole={mockUser.role} />);
    expect(screen.getByTestId("post-actions-trigger")).toBeInTheDocument();
  });

  it("renders for admin regardless of authorship", () => {
    // Current user is an admin, not author
    render(<PostActions post={mockPost} currentUserId={mockAdminUser.uid} currentUserRole={mockAdminUser.role} />);
    expect(screen.getByTestId("post-actions-trigger")).toBeInTheDocument();
  });

  it("does NOT render for other users", () => {
    // Current user is a regular member, not author
    render(<PostActions post={mockPost} currentUserId="random-uid" currentUserRole="member" />);
    expect(screen.queryByTestId("post-actions-trigger")).not.toBeInTheDocument();
  });
});
