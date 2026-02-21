// app/settings/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Trash2, Edit2, ShieldCheck, Loader2, AlertTriangle, Crown, ArrowLeft } from "lucide-react";
import EditProfileModal, { EditableUser } from "@/app/components/EditProfileModal";

interface User {
    _id: string;
    username: string;
    name: string;
    email: string;
    role: string;
}

function RoleBadge({ role }: { role: string }) {
    if (role === "super_admin") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black rounded-md shadow-sm">
                <Crown className="w-2.5 h-2.5" /> SUPER ADMIN
            </span>
        );
    }
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">ADMIN</span>;
}

export default function UsersSettingsPage() {
    const { data: session } = useSession();
    const currentUserId = (session?.user as any)?.id as string | undefined;
    const currentUserRole = (session?.user as any)?.role as string | undefined;
    const isSuperAdmin = currentUserRole === "super_admin";

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("admin");
    const [addError, setAddError] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editTarget, setEditTarget] = useState<EditableUser | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch");
            setUsers(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(""); setAddLoading(true);
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: newUsername, name: newName, email: newEmail, password: newPassword, role: newRole }),
        });
        const data = await res.json();
        setAddLoading(false);
        if (!res.ok) { setAddError(data.error || "Failed to add user."); return; }
        setIsAdding(false);
        setNewUsername(""); setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("admin");
        fetchUsers();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" });
        setIsDeleting(false);
        setDeleteTarget(null);
        fetchUsers();
    };

    const canEdit = (user: User) => isSuperAdmin || currentUserId === user._id;
    const canDelete = (_user: User) => isSuperAdmin;

    return (
        <>
            {editTarget && (
                <EditProfileModal
                    user={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={(updated) => setUsers((prev) => prev.map((u) => u._id === updated._id ? { ...u, ...updated } : u))}
                />
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-800">Delete Account?</h3>
                                <p className="text-sm text-red-600 mt-1">
                                    This will permanently remove <span className="font-bold">@{deleteTarget.username}</span>. This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-5 flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={isDeleting}
                                className="px-5 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 disabled:opacity-60 transition-colors">
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isDeleting ? "Deleting…" : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/settings"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#5f2299] transition-colors mb-3">
                            <ArrowLeft className="w-4 h-4" /> Back to Settings
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage dashboard access and administrators.</p>
                    </div>
                    {isSuperAdmin && (
                        <button onClick={() => setIsAdding(!isAdding)}
                            className="bg-[#5f2299] text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md shadow-[#5f2299]/20 hover:bg-[#762ec2] transition-colors mt-6">
                            <Plus className="w-4 h-4 mr-2" /> Add New User
                        </button>
                    )}
                </header>

                {isAdding && isSuperAdmin && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-[#5f2299]" /> Register Administrator
                        </h3>
                        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Username <span className="text-red-400 font-normal normal-case">(Cannot be changed later)</span>
                                </label>
                                <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" placeholder="e.g. devshook_ali" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" placeholder="e.g. Ali Raza" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" placeholder="admin@domain.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temporary Password</label>
                                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm">
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                {addError && <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{addError}</p>}
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAdding(false)}
                                        className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={addLoading}
                                        className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60">
                                        {addLoading && <Loader2 className="w-4 h-4 animate-spin" />} Create Account
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {!isSuperAdmin && (
                        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-sm text-amber-700">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            You have <span className="font-bold mx-1">admin</span> access — you can only edit your own profile.
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6 w-12">#</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                            ) : users.map((user, idx) => {
                                const isOwnRow = currentUserId === user._id;
                                const displayName = user.name || user.username;
                                const initials = displayName.substring(0, 2).toUpperCase();
                                return (
                                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 text-slate-400 text-sm font-medium">{idx + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 text-xs font-bold shrink-0 ${user.role === "super_admin"
                                                    ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md"
                                                    : "bg-[#5f2299]/10 text-[#5f2299]"
                                                    }`}>{initials}</div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-semibold text-slate-800 text-sm">{displayName}</span>
                                                        {isOwnRow && <span className="px-1.5 py-0.5 bg-[#5f2299]/10 text-[#5f2299] text-[10px] font-bold rounded">YOU</span>}
                                                    </div>
                                                    <span className="text-xs text-slate-400">@{user.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                                        <td className="p-4"><RoleBadge role={user.role} /></td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {canEdit(user) && (
                                                    <button onClick={() => setEditTarget(user)}
                                                        className="p-2 text-slate-400 hover:text-[#5f2299] hover:bg-[#5f2299]/5 rounded-lg transition-colors" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDelete(user) && (
                                                    <button onClick={() => setDeleteTarget(user)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {!canEdit(user) && !canDelete(user) && (
                                                    <span className="text-xs text-slate-300 italic pr-2">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
