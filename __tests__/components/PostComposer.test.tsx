import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostComposer } from "@/components/PostComposer";
import { mockUser } from "../__mocks__/fixtures";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsLib from "@/lib/posts";

describe("PostComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submit is disabled when content is empty", () => {
    render(<PostComposer user={mockUser} />);
    
    const submitBtn = screen.getByTestId("post-submit");
    expect(submitBtn).toBeDisabled();
  });

  it("calls createPost on submit and clears form", async () => {
    const createPostMock = vi.spyOn(postsLib, "createPost").mockResolvedValue("new-post-id");

    render(<PostComposer user={mockUser} />);
    
    const input = screen.getByTestId("post-composer");
    const submitBtn = screen.getByTestId("post-submit");

    await userEvent.type(input, "Here is an update");
    expect(submitBtn).toBeEnabled();

    // Submit form
    fireEvent.submit(submitBtn);

    await waitFor(() => {
      expect(createPostMock).toHaveBeenCalledWith({
        authorUid: mockUser.uid,
        authorName: mockUser.displayName,
        authorRole: mockUser.role,
        content: "Here is an update",
      });
      // clears form
      expect(input).toHaveValue("");
    });
  });
});
