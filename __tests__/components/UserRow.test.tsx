import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserRow } from "@/components/UserRow";
import { mockUser } from "../__mocks__/fixtures";
import * as adminLib from "@/lib/admin";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("UserRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user details correctly", () => {
    render(<UserRow user={mockUser} currentUserId="admin-uid" />);
    expect(screen.getByText(mockUser.displayName)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("disables select drop-down if user is self", () => {
    render(<UserRow user={mockUser} currentUserId={mockUser.uid} />);
    const select = screen.getByTestId(`role-select-${mockUser.uid}`);
    expect(select).toBeDisabled();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("calls updateUserRole and updates select state when role is changed", async () => {
    const updateSpy = vi.spyOn(adminLib, "updateUserRole").mockResolvedValue();

    render(<UserRow user={mockUser} currentUserId="admin-uid" />); // someone else
    
    const select = screen.getByTestId(`role-select-${mockUser.uid}`);
    expect(select).toHaveValue("member");

    await userEvent.selectOptions(select, "manager");

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(mockUser.uid, "manager");
      expect(select).toHaveValue("manager");
    });
  });
});
