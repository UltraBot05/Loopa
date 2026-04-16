"use client";

import { useAuth } from "@/hooks/useAuth";
import { completeOnboarding } from "@/lib/firestore";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    
    if (displayName.trim().length > 30) {
      setError("Display name must be less than 30 characters.");
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await completeOnboarding(user.uid, displayName.trim());
      await refreshUser();
      // AuthGuard will handle redirect
    } catch (err) {
      console.error("Error setting display name:", err);
      setError("Failed to save display name. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-gray-500 mt-2">What should we call you?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Priya"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !displayName.trim()}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
