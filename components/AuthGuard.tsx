"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (pathname !== "/login") {
        router.push("/login");
      }
      return;
    }

    if (!user.onboardingComplete && pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }

    if (user.onboardingComplete && (pathname === "/login" || pathname === "/onboarding")) {
      router.push("/");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if (!user && pathname !== "/login") return null;
  if (user && !user.onboardingComplete && pathname !== "/onboarding") return null;

  return <>{children}</>;
}
