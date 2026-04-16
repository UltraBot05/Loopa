"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { UserRow } from "@/components/UserRow";
import { useAuth } from "@/hooks/useAuth";
import { getAllUsers } from "@/lib/admin";
import type { User } from "@/lib/types";

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not load users. Ensure you have admin privileges.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Users</h2>
            
            {error && (
              <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md border border-red-100 flex items-center">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <UserRow key={u.uid} user={u} currentUserId={currentUser?.uid || ""} />
                ))}
                {users.length === 0 && !error && (
                  <p className="text-gray-500 text-center py-8">No users found.</p>
                )}
              </div>
            )}
            
            <div className="mt-12 border-t pt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Moderate Content</h2>
              <p className="text-sm text-gray-600 mb-4">
                As an Admin, you are automatically permitted to edit and delete any post or reply natively directly from the Homepage feed or Thread discussion.
              </p>
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none">
                Go to Feed to Moderate
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
