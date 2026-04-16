import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { mockPost } from "../__mocks__/fixtures";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as postsLib from "@/lib/posts";

describe("DeleteConfirmDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deletePost on confirm", async () => {
    const deleteSpy = vi.spyOn(postsLib, "deletePost").mockResolvedValue();
    const setIsOpenMock = vi.fn();

    render(<DeleteConfirmDialog post={mockPost} isOpen={true} setIsOpen={setIsOpenMock} />);
    
    const confirmBtn = screen.getByTestId("confirm-delete-button");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(mockPost.postId);
      expect(setIsOpenMock).toHaveBeenCalledWith(false);
    });
  });
});
