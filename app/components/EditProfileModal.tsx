// app/components/EditProfileModal.tsx
"use client";

import { useState } from "react";
import { X, Pencil, Check, Loader2, Save } from "lucide-react";

export interface EditableUser {
    _id: string;
    username: string;
    name: string;
    email: string;
}

interface Props {
    user: EditableUser;
    onClose: () => void;
    onSaved: (updated: EditableUser) => void;
}

export default function EditProfileModal({ user, onClose, onSaved }: Props) {
    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        const body: Record<string, string> = { name, email };
        if (password.trim()) body.password = password;
        const res = await fetch(`/api/users/${user._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { setError(data.error || "Failed to save."); return; }
        onSaved(data);
        onClose();
    };

    const initials = (user.name || user.username).substring(0, 2).toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#5f2299] to-[#9c40e0] px-6 py-5 relative">
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
                            <span className="text-base font-black text-white">{initials}</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">{user.name || user.username}</p>
                            <p className="text-white/60 text-sm">@{user.username}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                    {/* Display Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Display Name
                        </label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm"
                            placeholder="Your full name" />
                    </div>

                    {/* Username — disabled */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Username <span className="normal-case font-normal">(cannot be changed)</span>
                        </label>
                        <input type="text" value={user.username} disabled
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed text-sm" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm"
                            placeholder="admin@domain.com" />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            New Password <span className="normal-case font-normal text-slate-400">(leave blank to keep current)</span>
                        </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm"
                            placeholder="••••••••" />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 rounded-xl font-bold text-white bg-[#5f2299] hover:bg-[#762ec2] transition-colors flex items-center gap-2 disabled:opacity-60">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
