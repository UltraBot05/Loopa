import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingPage from "@/app/onboarding/page";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as useAuthHook from "@/hooks/useAuth";
import * as firestoreHooks from "@/lib/firestore";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/onboarding",
}));

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates display name (min 2 chars, max 30 chars)", async () => {
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      user: { uid: "123", email: "test@example.com", onboardingComplete: false } as unknown as typeof useAuthHook.useAuth extends () => { user: infer U } ? U : never,
      loading: false,
      refreshUser: vi.fn(),
    });
    vi.spyOn(firestoreHooks, "completeOnboarding").mockResolvedValue();

    render(<OnboardingPage />);
    
    const input = screen.getByLabelText(/display name/i);
    const submitBtn = screen.getByRole("button", { name: /continue|saving/i });

    // Test too short
    await userEvent.type(input, "a");
    // blur the input to possibly trigger validation, or just click submit
    fireEvent.submit(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Display name must be at least 2 characters./i)).toBeInTheDocument();
    });

    // Test too long
    await userEvent.clear(input);
    await userEvent.type(input, "a".repeat(31));
    fireEvent.submit(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Display name must be less than 30 characters./i)).toBeInTheDocument();
    });

    // Test valid
    await userEvent.clear(input);
    await userEvent.type(input, "Valid Name");
    fireEvent.submit(submitBtn);
    
    await waitFor(() => {
      expect(firestoreHooks.completeOnboarding).toHaveBeenCalledWith("123", "Valid Name");
    });
  });
});
