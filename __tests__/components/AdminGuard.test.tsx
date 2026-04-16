import { render, screen } from "@testing-library/react";
import { AdminGuard } from "@/components/AdminGuard";
import * as useAuthHook from "@/hooks/useAuth";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
}));

describe("AdminGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loader when loading is true", () => {
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({ user: null, loading: true });
    const { container } = render(
      <AdminGuard>
        <div data-testid="protected-content">Admin Stuff</div>
      </AdminGuard>
    );
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirects if user is not admin", () => {
    // Member user
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({ 
      user: { uid: "1", role: "member", displayName: "A", email: "@", onboardingComplete: true, photoURL: null, createdAt: new Date() }, 
      loading: false 
    });
    
    render(
      <AdminGuard>
        <div data-testid="protected-content">Admin Stuff</div>
      </AdminGuard>
    );
    
    expect(mockRouterReplace).toHaveBeenCalledWith("/");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children if user is admin", () => {
    // Admin user
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({ 
      user: { uid: "1", role: "admin", displayName: "A", email: "@", onboardingComplete: true, photoURL: null, createdAt: new Date() }, 
      loading: false 
    });
    
    render(
      <AdminGuard>
        <div data-testid="protected-content">Admin Stuff</div>
      </AdminGuard>
    );
    
    expect(mockRouterReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});
