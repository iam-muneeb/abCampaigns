// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, Edit2, ShieldCheck, Loader2, AlertTriangle, X, Save } from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id as string | undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Add User state ──────────────────────────────────────────
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addError, setAddError] = useState("");

  // ── Delete modal state ──────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Edit modal state ────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Add user ────────────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, email: newEmail, password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setAddError(data.error || "Failed to add user.");
      return;
    }
    setIsAdding(false);
    setNewUsername(""); setNewEmail(""); setNewPassword("");
    fetchUsers();
  };

  // ── Delete user ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" });
    setIsDeleting(false);
    setDeleteTarget(null);
    fetchUsers();
  };

  // ── Edit user ───────────────────────────────────────────────
  const openEditModal = (user: User) => {
    setEditTarget(user);
    setEditEmail(user.email);
    setEditPassword("");
    setEditError("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError("");
    setIsSaving(true);
    const body: Record<string, string> = { email: editEmail };
    if (editPassword.trim()) body.password = editPassword;
    const res = await fetch(`/api/users/${editTarget._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setIsSaving(false);
    if (!res.ok) {
      setEditError(data.error || "Failed to save changes.");
      return;
    }
    setEditTarget(null);
    fetchUsers();
  };

  return (
    <>
      {/* ── Delete Warning Modal ─────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">Delete Your Account?</h3>
                <p className="text-sm text-red-600 mt-1">
                  This will permanently remove <span className="font-bold">@{deleteTarget.username}</span> from the system. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="px-6 py-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#5f2299]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#5f2299]">
                    {editTarget.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Edit My Account</h3>
                  <p className="text-xs text-slate-400">@{editTarget.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              {/* Username — disabled */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Username <span className="normal-case font-normal">(cannot be changed)</span>
                </label>
                <input
                  type="text"
                  value={editTarget.username}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none"
                  placeholder="your@email.com"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  New Password <span className="normal-case font-normal text-slate-400">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none"
                  placeholder="••••••••"
                />
              </div>

              {editError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{editError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#5f2299] hover:bg-[#762ec2] transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Main Page ─────────────────────────────────────────── */}
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Manage dashboard access and administrators.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#5f2299] text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md shadow-[#5f2299]/20 hover:bg-[#762ec2] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New User
          </button>
        </header>

        {/* Add User Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-[#5f2299]" /> Register Administrator
            </h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Username <span className="text-red-400 font-normal normal-case">(Cannot be changed later)</span>
                </label>
                <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none" placeholder="e.g. devshook_ali" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none" placeholder="admin@domain.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temporary Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none" placeholder="••••••••" />
              </div>
              <div className="md:col-span-3">
                {addError && <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{addError}</p>}
                <div className="flex justify-end">
                  <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800">Create Account</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : (
                users.map((user) => {
                  const isOwnRow = currentUserId === user._id;
                  return (
                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-800 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#5f2299]/10 text-[#5f2299] flex items-center justify-center mr-3 text-xs">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        {user.username}
                        {isOwnRow && (
                          <span className="ml-2 px-1.5 py-0.5 bg-[#5f2299]/10 text-[#5f2299] text-[10px] font-bold rounded">YOU</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">Admin</span></td>
                      <td className="p-4 pr-6 text-right">
                        {isOwnRow ? (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-slate-400 hover:text-[#5f2299] transition-colors"
                              title="Edit my account"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2"
                              title="Delete my account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-300 italic pr-2">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}