"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  ManagedUser,
} from "@/lib/api";

const roleStyles: Record<string, string> = {
  researcher: "bg-[#EFEBE0] text-muted",
  reviewer: "bg-teal-tint text-teal-dark",
  officer: "bg-gold-tint text-gold-dark",
};

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    const token = getToken();
    if (!currentUser || !token) {
      router.replace("/login");
      return;
    }
    if (currentUser.role !== "officer") {
      router.replace("/");
      return;
    }

    getAllUsers(token)
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleRoleChange(userId: string, role: string) {
    const token = getToken();
    if (!token) return;

    setUpdatingId(userId);
    try {
      await updateUserRole(userId, role, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role } : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleStatusToggle(userId: string, currentActive: boolean) {
    const token = getToken();
    if (!token) return;

    setUpdatingId(userId);
    try {
      await updateUserStatus(userId, !currentActive, token);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, active: !currentActive } : u
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-4xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          User &amp; Account Management
        </h1>
        <p className="text-sm text-body mb-6">
          View all accounts, assign roles, and enable or disable access.
        </p>

        {loading && <p className="text-sm text-muted">Loading users...</p>}
        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-4 py-2.5 text-[11.5px] text-muted font-bold bg-[#F0EEE6]">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span></span>
          </div>
          {users.map((u) => (
            <div
              key={u._id}
              className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-4 py-3.5 text-sm items-center border-t border-border"
            >
              <span className="font-medium text-ink">{u.name}</span>
              <span className="text-body text-xs">{u.email}</span>
              <select
                value={u.role}
                disabled={updatingId === u._id}
                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-[1.5px] border-[#C9C2AE] ${
                  roleStyles[u.role] || ""
                }`}
              >
                <option value="researcher">Researcher</option>
                <option value="reviewer">Reviewer</option>
                <option value="officer">Officer</option>
              </select>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                  u.active
                    ? "bg-teal-tint text-teal-dark"
                    : "bg-danger-tint text-danger"
                }`}
              >
                {u.active ? "Active" : "Disabled"}
              </span>
              <button
                onClick={() => handleStatusToggle(u._id, u.active)}
                disabled={updatingId === u._id}
                className="text-xs font-semibold text-teal-dark hover:underline text-left"
              >
                {u.active ? "Disable" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}