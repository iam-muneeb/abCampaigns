// app/settings/campaign-types/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus, Trash2, Edit2, Loader2, AlertTriangle, X, Tag,
    ArrowLeft, Check, Hash,
} from "lucide-react";

interface CampaignType {
    _id: string;
    name: string;
    handle: string;
    createdAt: string;
}

// Auto-generate a handle from a name
function toHandle(name: string) {
    return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export default function CampaignTypesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isSuperAdmin = (session?.user as any)?.role === "super_admin";

    const [types, setTypes] = useState<CampaignType[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Add popup ──────────────────────────────────────────────
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newHandle, setNewHandle] = useState("");
    const [handleAuto, setHandleAuto] = useState(true); // auto-fill handle from name
    const [addError, setAddError] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    // ── Edit popup ─────────────────────────────────────────────
    const [editTarget, setEditTarget] = useState<CampaignType | null>(null);
    const [editName, setEditName] = useState("");
    const [editHandle, setEditHandle] = useState("");
    const [editHandleAuto, setEditHandleAuto] = useState(false);
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    // ── Delete confirm ─────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<CampaignType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Redirect non-super-admins
    useEffect(() => {
        if (status === "authenticated" && !isSuperAdmin) router.replace("/settings");
    }, [status, isSuperAdmin, router]);

    const fetchTypes = async () => {
        const res = await fetch("/api/campaign-types", { cache: "no-store" });
        if (res.ok) setTypes(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchTypes(); }, []);

    // Handle name → handle auto-fill
    const handleNameChange = (v: string) => {
        setNewName(v);
        if (handleAuto) setNewHandle(toHandle(v));
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError("");
        setAddLoading(true);
        const res = await fetch("/api/campaign-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, handle: newHandle }),
        });
        const data = await res.json();
        setAddLoading(false);
        if (!res.ok) { setAddError(data.error || "Failed to create."); return; }
        setShowAdd(false);
        setNewName(""); setNewHandle(""); setHandleAuto(true); setAddError("");
        fetchTypes();
    };

    const openEdit = (ct: CampaignType) => {
        setEditTarget(ct);
        setEditName(ct.name);
        setEditHandle(ct.handle);
        setEditHandleAuto(false); // start with manual mode; user can type name to auto-fill
        setEditError("");
    };

    const handleEditNameChange = (v: string) => {
        setEditName(v);
        if (editHandleAuto) setEditHandle(toHandle(v));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setEditError("");
        setEditLoading(true);
        const res = await fetch(`/api/campaign-types/${editTarget._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editName, handle: editHandle }),
        });
        const data = await res.json();
        setEditLoading(false);
        if (!res.ok) { setEditError(data.error || "Failed to update."); return; }
        setEditTarget(null);
        fetchTypes();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        await fetch(`/api/campaign-types/${deleteTarget._id}`, { method: "DELETE" });
        setIsDeleting(false);
        setDeleteTarget(null);
        fetchTypes();
    };

    if (status === "loading") return null;
    if (!isSuperAdmin) return null;

    return (
        <>
            {/* ── Add Popup ───────────────────────────────────────────── */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 relative">
                            <button onClick={() => setShowAdd(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">New Campaign Type</p>
                                    <p className="text-white/60 text-sm">Add a type for Firebase campaigns</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type Name</label>
                                <input type="text" required value={newName} onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-400 outline-none text-sm"
                                    placeholder="e.g. Promotional" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Hash className="w-3 h-3" /> Handle
                                    <span className="normal-case font-normal text-slate-400">(unique identifier)</span>
                                </label>
                                <div className="relative">
                                    <input type="text" required value={newHandle}
                                        onChange={(e) => { setHandleAuto(false); setNewHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); }}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-400 outline-none text-sm font-mono"
                                        placeholder="e.g. promotional" />
                                    {handleAuto && newHandle && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 rounded">AUTO</span>
                                    )}
                                </div>
                            </div>

                            {addError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{addError}</p>}

                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowAdd(false)}
                                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={addLoading}
                                    className="px-5 py-2 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {addLoading ? "Creating…" : "Create Type"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Popup ──────────────────────────────────────────── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#5f2299] to-[#9c40e0] px-6 py-5 relative">
                            <button onClick={() => setEditTarget(null)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Edit2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">Edit Campaign Type</p>
                                    <p className="text-white/60 text-sm font-mono">{editTarget.handle}</p>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type Name</label>
                                <input type="text" required value={editName} onChange={(e) => handleEditNameChange(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Hash className="w-3 h-3" /> Handle
                                    <span className="normal-case font-normal text-slate-400">(click to override)</span>
                                </label>
                                <div className="relative">
                                    <input type="text" required value={editHandle}
                                        onChange={(e) => { setEditHandleAuto(false); setEditHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); }}
                                        onFocus={() => setEditHandleAuto(true)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm font-mono" />
                                    {editHandleAuto && editHandle && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#5f2299] bg-[#5f2299]/10 px-1.5 rounded">AUTO</span>
                                    )}
                                </div>
                            </div>
                            {editError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{editError}</p>}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setEditTarget(null)}
                                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editLoading}
                                    className="px-5 py-2 rounded-xl font-bold text-white bg-[#5f2299] hover:bg-[#762ec2] transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editLoading ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ──────────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-800">Delete Campaign Type?</h3>
                                <p className="text-sm text-red-600 mt-1">
                                    <span className="font-bold">{deleteTarget.name}</span> (<code className="font-mono">{deleteTarget.handle}</code>) will be permanently removed.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-5 flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={isDeleting}
                                className="px-5 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 disabled:opacity-60 transition-colors">
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Page ───────────────────────────────────────────── */}
            <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/settings"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#5f2299] transition-colors mb-3">
                            <ArrowLeft className="w-4 h-4" /> Back to Settings
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campaign Types</h1>
                        <p className="text-slate-500 font-medium mt-1">Define type handles for Firebase campaign flows.</p>
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors mt-6">
                        <Plus className="w-4 h-4 mr-2" /> Add Type
                    </button>
                </header>

                {/* Types Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6 w-12">#</th>
                                <th className="p-4">Type Name</th>
                                <th className="p-4">Handle</th>
                                <th className="p-4">ID</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                            ) : types.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <Tag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No campaign types yet.</p>
                                        <p className="text-slate-300 text-sm mt-1">Click "Add Type" to create your first one.</p>
                                    </td>
                                </tr>
                            ) : (
                                types.map((ct, idx) => (
                                    <tr key={ct._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 text-slate-400 text-sm font-medium">{idx + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                                    <Tag className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <span className="font-semibold text-slate-800">{ct.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <code className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded-lg">{ct.handle}</code>
                                        </td>
                                        <td className="p-4">
                                            <code className="text-xs text-slate-400 font-mono">{ct._id}</code>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(ct)}
                                                    className="p-2 text-slate-400 hover:text-[#5f2299] hover:bg-[#5f2299]/5 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(ct)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
