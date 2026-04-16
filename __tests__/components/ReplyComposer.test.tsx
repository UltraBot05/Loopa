import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReplyComposer } from "@/components/ReplyComposer";
import { mockUser, mockPost } from "../__mocks__/fixtures";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repliesLib from "@/lib/replies";

describe("ReplyComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submit is disabled when content is empty", () => {
    render(<ReplyComposer user={mockUser} postId={mockPost.postId} />);
    const submitBtn = screen.getByTestId("reply-submit");
    expect(submitBtn).toBeDisabled();
  });

  it("calls createReply on submit and clears form", async () => {
    const createReplySpy = vi.spyOn(repliesLib, "createReply").mockResolvedValue();

    render(<ReplyComposer user={mockUser} postId={mockPost.postId} />);
    
    const input = screen.getByTestId("reply-composer");
    const submitBtn = screen.getByTestId("reply-submit");

    await userEvent.type(input, "Awesome update!");
    expect(submitBtn).toBeEnabled();

    fireEvent.submit(submitBtn);

    await waitFor(() => {
      expect(createReplySpy).toHaveBeenCalledWith(mockPost.postId, {
        authorUid: mockUser.uid,
        authorName: mockUser.displayName,
        authorRole: mockUser.role,
        content: "Awesome update!",
      });
      expect(input).toHaveValue("");
    });
  });
});
