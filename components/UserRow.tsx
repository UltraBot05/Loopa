"use client";

import { useState } from "react";
import { updateUserRole } from "@/lib/admin";
import type { User, Role } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface UserRowProps {
  user: User;
  currentUserId: string;
}

export function UserRow({ user, currentUserId }: UserRowProps) {
  const [role, setRole] = useState<Role>(user.role);
  const [loading, setLoading] = useState(false);

  // Users can't elegantly demote themselves from admin inside this basic UI to prevent locking themselves out
  const isSelf = user.uid === currentUserId;

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    if (newRole === role) return;

    try {
      setLoading(true);
      await updateUserRole(user.uid, newRole);
      setRole(newRole);
    } catch (err) {
      console.error("Failed to update user role:", err);
      // Revert select on error
      e.target.value = role;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="user-row" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">{user.displayName || "Unknown User"}</span>
        <span className="text-sm text-gray-500">{user.email}</span>
        <span className="text-xs text-gray-400 mt-1">
          Joined {user.createdAt ? formatDistanceToNow(user.createdAt, { addSuffix: true }) : "recently"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isSelf && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">You</span>}
        <select
          value={role}
          onChange={handleRoleChange}
          disabled={loading || isSelf}
          data-testid={`role-select-${user.uid}`}
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:opacity-50 disabled:bg-gray-100"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="team_lead">Team Lead</option>
          <option value="member">Member</option>
        </select>
        {loading && <div className="w-4 h-4 rounded-full border-2 border-b-transparent border-blue-600 animate-spin"></div>}
      </div>
    </div>
  );
}
