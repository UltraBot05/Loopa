import { render } from "@testing-library/react";
import { AuthGuard } from "@/components/AuthGuard";
import { describe, it, expect, vi } from "vitest";
import * as useAuthHook from "@/hooks/useAuth";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/protected-route",
}));

describe("AuthGuard", () => {
  it("redirects when no user", () => {
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      user: null,
      loading: false,
      refreshUser: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
