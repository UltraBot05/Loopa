import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditPostModal } from "@/components/EditPostModal";
import { mockPost } from "../__mocks__/fixtures";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsLib from "@/lib/posts";

describe("EditPostModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-fills with existing content and updates on submit", async () => {
    const updateSpy = vi.spyOn(postsLib, "updatePost").mockResolvedValue();
    const setIsOpenMock = vi.fn();

    render(<EditPostModal post={mockPost} isOpen={true} setIsOpen={setIsOpenMock} />);
    
    const textarea = screen.getByTestId("edit-post-textarea");
    expect(textarea).toHaveValue(mockPost.content);

    await userEvent.clear(textarea);
    await userEvent.type(textarea, "New Content");

    const submitBtn = screen.getByTestId("edit-post-submit");
    expect(submitBtn).toBeEnabled();

    fireEvent.submit(submitBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(mockPost.postId, "New Content");
      expect(setIsOpenMock).toHaveBeenCalledWith(false);
    });
  });
});
