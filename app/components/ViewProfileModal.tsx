// app/components/ViewProfileModal.tsx
"use client";

import { Pencil, X } from "lucide-react";
import { EditableUser } from "./EditProfileModal";

interface Props {
    user: EditableUser;
    onClose: () => void;
    onEdit: () => void;
}

export default function ViewProfileModal({ user, onClose, onEdit }: Props) {
    const initials = (user.name || user.username).substring(0, 2).toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

                {/* Gradient header — matches EditProfileModal */}
                <div className="bg-gradient-to-r from-[#5f2299] to-[#9c40e0] px-6 py-5 relative">
                    {/* Edit button — top-left */}
                    <button onClick={onEdit}
                        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit profile">
                        <Pencil className="w-4 h-4" />
                    </button>
                    {/* Close button — top-right */}
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    {/* Avatar */}
                    <div className="flex items-center gap-4 ml-6">
                        <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
                            <span className="text-base font-black text-white">{initials}</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">{user.name || user.username}</p>
                            <p className="text-white/60 text-sm">@{user.username}</p>
                        </div>
                    </div>
                </div>

                {/* Body — read-only fields */}
                <div className="px-6 py-5 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Display Name</p>
                        <p className="text-sm font-semibold text-slate-800">
                            {user.name || <span className="text-slate-400 italic">Not set</span>}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
                        <p className="text-sm font-semibold text-slate-500">@{user.username}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                        <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                    </div>

                    <button onClick={onEdit}
                        className="w-full py-2.5 bg-[#5f2299] hover:bg-[#762ec2] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
