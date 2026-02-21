// app/settings/app-versions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus, Trash2, Edit2, Loader2, AlertTriangle, X,
    ArrowLeft, Smartphone, Check, Calendar,
} from "lucide-react";

interface AppVersion {
    _id: string;
    name: string;
    versionCode: string;
    publishDate: string;
}

/** Returns a human-readable "X ago" string */
function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years >= 1) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months >= 1) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (weeks >= 1) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (mins >= 1) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    return "just now";
}

/** Format a Date to yyyy-MM-dd for input[type=date] */
function toDateValue(dateStr: string) {
    return new Date(dateStr).toISOString().split("T")[0];
}

export default function AppVersionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isSuperAdmin = (session?.user as any)?.role === "super_admin";

    const [versions, setVersions] = useState<AppVersion[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Add popup ──────────────────────────────────────────────
    const [showAdd, setShowAdd] = useState(false);
    const [addName, setAddName] = useState("");
    const [addCode, setAddCode] = useState("");
    const [addDate, setAddDate] = useState("");
    const [addError, setAddError] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    // ── Edit popup ─────────────────────────────────────────────
    const [editTarget, setEditTarget] = useState<AppVersion | null>(null);
    const [editName, setEditName] = useState("");
    const [editCode, setEditCode] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    // ── Delete confirm ─────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<AppVersion | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Redirect non-super-admins
    useEffect(() => {
        if (status === "authenticated" && !isSuperAdmin) router.replace("/settings");
    }, [status, isSuperAdmin, router]);

    const fetchVersions = async () => {
        const res = await fetch("/api/app-versions", { cache: "no-store" });
        if (res.ok) setVersions(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchVersions(); }, []);

    // ── Add ────────────────────────────────────────────────────
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(""); setAddLoading(true);
        const res = await fetch("/api/app-versions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: addName, versionCode: addCode, publishDate: addDate }),
        });
        const data = await res.json();
        setAddLoading(false);
        if (!res.ok) { setAddError(data.error || "Failed to create."); return; }
        setShowAdd(false);
        setAddName(""); setAddCode(""); setAddDate(""); setAddError("");
        fetchVersions();
    };

    // ── Edit ───────────────────────────────────────────────────
    const openEdit = (v: AppVersion) => {
        setEditTarget(v);
        setEditName(v.name);
        setEditCode(v.versionCode);
        setEditDate(toDateValue(v.publishDate));
        setEditError("");
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setEditError(""); setEditLoading(true);
        const res = await fetch(`/api/app-versions/${editTarget._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editName, versionCode: editCode, publishDate: editDate }),
        });
        const data = await res.json();
        setEditLoading(false);
        if (!res.ok) { setEditError(data.error || "Failed to update."); return; }
        setEditTarget(null);
        fetchVersions();
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        await fetch(`/api/app-versions/${deleteTarget._id}`, { method: "DELETE" });
        setIsDeleting(false);
        setDeleteTarget(null);
        fetchVersions();
    };

    if (status === "loading") return null;
    if (!isSuperAdmin) return null;

    return (
        <>
            {/* ── Add Popup ────────────────────────────────────────── */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 relative">
                            <button onClick={() => setShowAdd(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Smartphone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">New App Version</p>
                                    <p className="text-white/60 text-sm">Register a published version</p>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Version Name</label>
                                <input type="text" required value={addName} onChange={(e) => setAddName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-400 outline-none text-sm"
                                    placeholder="e.g. Summer Update" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Version Code</label>
                                <input type="text" required value={addCode} onChange={(e) => setAddCode(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-400 outline-none text-sm font-mono"
                                    placeholder="e.g. 2.4.1 or 241" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Publish Date</span>
                                </label>
                                <input type="date" required value={addDate} onChange={(e) => setAddDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-400 outline-none text-sm" />
                            </div>
                            {addError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{addError}</p>}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowAdd(false)}
                                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={addLoading}
                                    className="px-5 py-2 rounded-xl font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {addLoading ? "Creating…" : "Create Version"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Popup ───────────────────────────────────────── */}
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
                                    <p className="text-white font-bold text-base">Edit App Version</p>
                                    <p className="text-white/60 text-sm font-mono">{editTarget.versionCode}</p>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Version Name</label>
                                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Version Code</label>
                                <input type="text" required value={editCode} onChange={(e) => setEditCode(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Publish Date</span>
                                </label>
                                <input type="date" required value={editDate} onChange={(e) => setEditDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#5f2299] outline-none text-sm" />
                            </div>
                            {editError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{editError}</p>}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setEditTarget(null)}
                                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
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

            {/* ── Delete Confirm ───────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-800">Delete App Version?</h3>
                                <p className="text-sm text-red-600 mt-1">
                                    <span className="font-bold">{deleteTarget.name}</span> (<code className="font-mono">{deleteTarget.versionCode}</code>) will be permanently removed.
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

            {/* ── Main Page ─────────────────────────────────────────── */}
            <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/settings"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#5f2299] transition-colors mb-3">
                            <ArrowLeft className="w-4 h-4" /> Back to Settings
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">App Versions</h1>
                        <p className="text-slate-500 font-medium mt-1">Track published app versions for campaign targeting.</p>
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md shadow-sky-500/20 hover:bg-sky-600 transition-colors mt-6">
                        <Plus className="w-4 h-4 mr-2" /> Add Version
                    </button>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6 w-12">#</th>
                                <th className="p-4">Version Name</th>
                                <th className="p-4">Version Code</th>
                                <th className="p-4">Published</th>
                                <th className="p-4">ID</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></td></tr>
                            ) : versions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <Smartphone className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No app versions yet.</p>
                                        <p className="text-slate-300 text-sm mt-1">Click "Add Version" to register your first one.</p>
                                    </td>
                                </tr>
                            ) : (
                                versions.map((v, idx) => (
                                    <tr key={v._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 text-slate-400 text-sm font-medium">{idx + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                                                    <Smartphone className="w-4 h-4 text-sky-500" />
                                                </div>
                                                <span className="font-semibold text-slate-800">{v.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <code className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded-lg font-bold">{v.versionCode}</code>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                Live: {timeAgo(v.publishDate)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <code className="text-xs text-slate-400 font-mono">{v._id}</code>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(v)}
                                                    className="p-2 text-slate-400 hover:text-[#5f2299] hover:bg-[#5f2299]/5 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(v)}
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
