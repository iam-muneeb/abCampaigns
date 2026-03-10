// app/audiences/snapshots/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    ArrowLeft, Camera, Save, Trash2, X, ChevronRight,
    Users, Package, Shirt, Tag, Palette, Layers, ShoppingBag,
    Globe, Smartphone, Filter, Loader2, AlertTriangle,
    Calendar, Clock, BadgeCheck, Crown, CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SnapFilters {
    order: "" | "1" | "0";
    appVersion: string;
    itemtype: string;
    weartype: string;
    category: string;
    style: string;
    type: string;
    os: "" | "android" | "iOS";
    country: string;
}

const DEFAULT_F: SnapFilters = {
    order: "", appVersion: "", itemtype: "", weartype: "",
    category: "", style: "", type: "", os: "", country: "",
};

interface Snapshot {
    _id: string;
    label: string;
    filters: SnapFilters;
    filterLabels: { key: string; value: string }[];
    apiQuery: string;
    userCount: number;
    createdBy: { id: string; name: string; role: string };
    createdAt: string;
}

interface ItemType { title: string }
interface WearType { title: string }
interface Category { title: string }
interface Style { title: string }
interface TypeEntry { title: string }
interface Country { name: string; code: string }
interface AppVersion { versionCode: string; name: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000);
    if (day >= 1) return `${day}d ago`;
    if (h >= 1) return `${h}h ago`;
    if (m >= 1) return `${m}m ago`;
    return "just now";
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(d: string) {
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Sel({ label, icon: Icon, value, onChange, opts, placeholder = "Any" }: {
    label: string; icon: any; value: string;
    onChange: (v: string) => void;
    opts: { value: string; label: string }[];
    placeholder?: string;
}) {
    return (
        <div>
            <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                <Icon className="w-3 h-3" /> {label}
            </p>
            <div className="relative">
                <select value={value} onChange={e => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-700 font-medium focus:border-[#5f2299] focus:ring-1 focus:ring-[#5f2299]/10 outline-none cursor-pointer hover:border-slate-300 transition-colors">
                    <option value="">{placeholder}</option>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 rotate-90 pointer-events-none" />
            </div>
        </div>
    );
}

// ─── OS toggle ────────────────────────────────────────────────────────────────
const ANDROID_PATH = "M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C14.15 1.23 13.1 1 12 1c-1.1 0-2.15.23-3.12.63L7.39.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z";
const APPLE_PATH = "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z";

function OsBtn({ label, svgPath, active, activeClass, onClick }: {
    label: string; svgPath: string; active: boolean; activeClass: string; onClick: () => void;
}) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border flex-1 justify-center transition-all ${active ? activeClass : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden><path d={svgPath} /></svg>
            {label}
        </button>
    );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-[#5f2299]/8 text-[#5f2299] text-xs font-semibold rounded-full border border-[#5f2299]/15">
            {label}
            <button onClick={onRemove} className="w-4 h-4 rounded-full hover:bg-[#5f2299]/15 flex items-center justify-center transition-colors">
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ─── Snapshot card ────────────────────────────────────────────────────────────
function SnapshotCard({ snap, onDelete }: { snap: Snapshot; onDelete: (id: string) => void }) {
    const isSuper = snap.createdBy.role === "super_admin";
    return (
        <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 overflow-hidden group"
            style={{ animation: "fadeUp .3s ease both" }}>
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#5f2299] to-[#9c40e0]" />

            <div className="p-5">
                {/* Label + count */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{snap.label}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            {isSuper
                                ? <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full"><Crown className="w-2.5 h-2.5" />{snap.createdBy.name}</span>
                                : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full"><BadgeCheck className="w-2.5 h-2.5" />{snap.createdBy.name}</span>
                            }
                        </div>
                    </div>
                    {/* Big user count */}
                    <div className="shrink-0 text-right">
                        <div className="text-2xl font-black text-[#5f2299] leading-none">{snap.userCount.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">users</div>
                    </div>
                </div>

                {/* Filter tags */}
                {snap.filterLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {snap.filterLabels.map((fl, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">{fl.key}:</span> {fl.value}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3 bg-slate-50 rounded-lg px-3 py-1.5">
                        <Users className="w-3 h-3" />
                        All users · no filters applied
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(snap.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(snap.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-300 font-medium">{timeAgo(snap.createdAt)}</span>
                        <button
                            onClick={() => onDelete(snap._id)}
                            className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all"
                            title="Delete snapshot"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SnapshotPage() {
    const { data: session } = useSession();

    // Meta / lookup data
    const [itemTypes, setItemTypes] = useState<Record<string, ItemType>>({});
    const [wearTypes, setWearTypes] = useState<Record<string, WearType>>({});
    const [categories, setCategories] = useState<Record<string, Category>>({});
    const [styles, setStyles] = useState<Record<string, Style>>({});
    const [types, setTypes] = useState<Record<string, TypeEntry>>({});
    const [countries, setCountries] = useState<Country[]>([]);
    const [appVersions, setAppVersions] = useState<AppVersion[]>([]);

    // Builder state
    const [filters, setFilters] = useState<SnapFilters>(DEFAULT_F);
    const [liveCount, setLiveCount] = useState<number | null>(null);
    const [counting, setCounting] = useState(false);

    // Save
    const [label, setLabel] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [justSaved, setJustSaved] = useState(false);

    // Saved snapshots
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loadingSnaps, setLoadingSnaps] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load lookups
    useEffect(() => {
        Promise.all([
            fetch("/api/filters-proxy?type=itemtypes").then(r => r.json()).catch(() => ({})),
            fetch("/api/filters-proxy?type=weartypes").then(r => r.json()).catch(() => ({})),
            fetch("/api/filters-proxy?type=categories").then(r => r.json()).catch(() => ({})),
            fetch("/api/filters-proxy?type=styles").then(r => r.json()).catch(() => ({})),
            fetch("/api/filters-proxy?type=types").then(r => r.json()).catch(() => ({})),
            fetch("/api/filters-proxy?type=countries").then(r => r.json()).catch(() => []),
            fetch("/api/app-versions").then(r => r.json()).catch(() => []),
        ]).then(([it, wt, cats, sty, ty, co, av]) => {
            setItemTypes(it); setWearTypes(wt); setCategories(cats);
            setStyles(sty); setTypes(ty);
            setCountries(Array.isArray(co) ? co : []);
            setAppVersions(Array.isArray(av) ? av : []);
        });
    }, []);

    // Load saved snapshots
    const loadSnapshots = useCallback(async () => {
        setLoadingSnaps(true);
        const res = await fetch("/api/audience-snapshots").catch(() => null);
        if (res?.ok) setSnapshots(await res.json());
        setLoadingSnaps(false);
    }, []);
    useEffect(() => { loadSnapshots(); }, [loadSnapshots]);

    // Live count — debounced on filter changes
    const fetchCount = useCallback(async (f: SnapFilters) => {
        setCounting(true);
        const p = new URLSearchParams();
        if (f.order) p.set("order", f.order);
        if (f.appVersion) p.set("appVersion", f.appVersion);
        if (f.itemtype) p.set("itemtype", f.itemtype);
        if (f.weartype) p.set("weartype", f.weartype);
        if (f.category) p.set("category", f.category);
        if (f.style) p.set("style", f.style);
        if (f.type) p.set("type", f.type);
        if (f.os) p.set("os", f.os);
        if (f.country) p.set("country", f.country);
        try {
            const res = await fetch(`/api/audiences-proxy?${p}`);
            const data = await res.json();
            setLiveCount(Array.isArray(data) ? data.length : 0);
        } catch { setLiveCount(0); }
        setCounting(false);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchCount(filters), 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [filters, fetchCount]);

    function setF<K extends keyof SnapFilters>(key: K, val: SnapFilters[K]) {
        setFilters(prev => ({ ...prev, [key]: val }));
    }
    function clearFilters() { setFilters(DEFAULT_F); }

    // Build filter labels for display / storage
    function buildFilterLabels(f: SnapFilters): { key: string; value: string }[] {
        const out: { key: string; value: string }[] = [];
        if (f.order) out.push({ key: "Orders", value: f.order === "1" ? "Has orders" : "No orders" });
        if (f.appVersion) out.push({ key: "App version", value: f.appVersion });
        if (f.itemtype) out.push({ key: "Item type", value: itemTypes[f.itemtype]?.title || f.itemtype });
        if (f.weartype) out.push({ key: "Wear type", value: wearTypes[f.weartype]?.title || f.weartype });
        if (f.category) out.push({ key: "Category", value: categories[f.category]?.title || f.category });
        if (f.style) out.push({ key: "Style", value: styles[f.style]?.title || f.style });
        if (f.type) out.push({ key: "Type", value: types[f.type]?.title || f.type });
        if (f.os) out.push({ key: "OS", value: f.os });
        if (f.country) out.push({ key: "Country", value: f.country });
        return out;
    }

    function buildApiQuery(f: SnapFilters): string {
        const p = new URLSearchParams();
        if (f.order) p.set("order", f.order);
        if (f.appVersion) p.set("appVersion", f.appVersion);
        if (f.itemtype) p.set("itemtype", f.itemtype);
        if (f.weartype) p.set("weartype", f.weartype);
        if (f.category) p.set("category", f.category);
        if (f.style) p.set("style", f.style);
        if (f.type) p.set("type", f.type);
        if (f.os) p.set("os", f.os);
        if (f.country) p.set("country", f.country);
        return p.toString();
    }

    async function handleSave() {
        if (!label.trim()) { setSaveError("Please enter a snapshot name."); return; }
        if (liveCount === null) { setSaveError("Wait for the user count to load."); return; }
        setSaving(true); setSaveError("");
        const res = await fetch("/api/audience-snapshots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                label,
                filters,
                filterLabels: buildFilterLabels(filters),
                apiQuery: buildApiQuery(filters),
                userCount: liveCount,
            }),
        });
        if (res.ok) {
            setLabel(""); setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2500);
            loadSnapshots();
        } else {
            const d = await res.json();
            setSaveError(d.error || "Failed to save.");
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        setIsDeleting(true);
        await fetch(`/api/audience-snapshots/${id}`, { method: "DELETE" });
        setIsDeleting(false);
        setDeleteTarget(null);
        loadSnapshots();
    }

    const chips = buildFilterLabels(filters);
    const hasFilters = chips.length > 0;

    return (
        <div className="flex flex-col h-full">
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse-ring { 0%,100% { transform:scale(1); opacity:1 } 50% { transform:scale(1.15); opacity:.7 } }
      `}</style>

            {/* ── Delete confirm modal ───────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ animation: "fadeUp .2s ease both" }}>
                        <div className="bg-rose-50 border-b border-rose-100 px-6 py-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-rose-800">Delete Snapshot?</h3>
                                <p className="text-sm text-rose-600 mt-0.5">This snapshot will be permanently removed. This cannot be undone.</p>
                            </div>
                        </div>
                        <div className="px-6 py-5 flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deleteTarget)} disabled={isDeleting}
                                className="px-5 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-2 disabled:opacity-60 transition-colors">
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sticky header ─────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-8 pt-6 pb-4">
                <Link href="/audiences" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#5f2299] transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Audiences
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5f2299]/10 flex items-center justify-center shrink-0">
                        <Camera className="w-5 h-5 text-[#5f2299]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audience Snapshot</h1>
                        <p className="text-sm text-slate-400 font-medium">Capture and save a filtered audience at a point in time.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-8 py-7 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

                    {/* ── Left: Builder + saved list ─────────────────── */}
                    <div className="space-y-6">

                        {/* Filter builder */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-slate-800 text-base">Build Your Audience</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Set filters to define which users belong to this snapshot.</p>
                                </div>
                                {hasFilters && (
                                    <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors flex items-center gap-1">
                                        <X className="w-3 h-3" /> Clear all
                                    </button>
                                )}
                            </div>

                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Sel label="Item Type" icon={Package} value={filters.itemtype}
                                    onChange={v => setF("itemtype", v)}
                                    opts={Object.entries(itemTypes).map(([id, it]) => ({ value: id, label: it.title }))} />

                                <Sel label="Wear Type" icon={Shirt} value={filters.weartype}
                                    onChange={v => setF("weartype", v)}
                                    opts={Object.entries(wearTypes).map(([id, wt]) => ({ value: id, label: wt.title }))} />

                                <Sel label="Category" icon={Tag} value={filters.category}
                                    onChange={v => setF("category", v)}
                                    opts={Object.entries(categories).map(([id, c]) => ({ value: id, label: c.title }))} />

                                <Sel label="Style" icon={Palette} value={filters.style}
                                    onChange={v => setF("style", v)}
                                    opts={Object.entries(styles).map(([id, s]) => ({ value: id, label: s.title }))} />

                                <Sel label="Type" icon={Layers} value={filters.type}
                                    onChange={v => setF("type", v)}
                                    opts={Object.entries(types).map(([id, t]) => ({ value: id, label: t.title }))} />

                                <Sel label="Country" icon={Globe} value={filters.country}
                                    onChange={v => setF("country", v)}
                                    opts={countries.map(c => ({ value: c.name, label: c.name }))}
                                    placeholder="Any Country" />

                                <Sel label="App Version" icon={Smartphone} value={filters.appVersion}
                                    onChange={v => setF("appVersion", v)}
                                    opts={appVersions.map(av => ({ value: av.versionCode, label: `${av.name} (${av.versionCode})` }))}
                                    placeholder="Any Version" />

                                {/* Order */}
                                <div>
                                    <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                        <ShoppingBag className="w-3 h-3" /> Has Orders
                                    </p>
                                    <div className="flex gap-2">
                                        {(["1", "0"] as const).map(v => (
                                            <button key={v} onClick={() => setF("order", filters.order === v ? "" : v)}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${filters.order === v
                                                    ? v === "1" ? "bg-emerald-500 text-white border-emerald-500" : "bg-rose-500 text-white border-rose-500"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                                {v === "1" ? "Yes" : "No"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* OS */}
                                <div>
                                    <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                        <Filter className="w-3 h-3" /> OS
                                    </p>
                                    <div className="flex gap-2">
                                        <OsBtn label="Android" svgPath={ANDROID_PATH} active={filters.os === "android"}
                                            activeClass="bg-emerald-500 text-white border-emerald-500"
                                            onClick={() => setF("os", filters.os === "android" ? "" : "android")} />
                                        <OsBtn label="iOS" svgPath={APPLE_PATH} active={filters.os === "iOS"}
                                            activeClass="bg-slate-800 text-white border-slate-800"
                                            onClick={() => setF("os", filters.os === "iOS" ? "" : "iOS")} />
                                    </div>
                                </div>
                            </div>

                            {/* Active filter chips */}
                            {chips.length > 0 && (
                                <div className="px-6 pb-4 flex flex-wrap gap-1.5">
                                    {chips.map((c, i) => (
                                        <Chip key={i} label={`${c.key}: ${c.value}`}
                                            onRemove={() => {
                                                const keyMap: Record<string, keyof SnapFilters> = {
                                                    "Orders": "order", "App version": "appVersion", "Item type": "itemtype",
                                                    "Wear type": "weartype", "Category": "category", "Style": "style",
                                                    "Type": "type", "OS": "os", "Country": "country",
                                                };
                                                const k = keyMap[c.key];
                                                if (k) setF(k, "" as any);
                                            }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Saved snapshots list */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800 text-base">
                                    Saved Snapshots
                                    {!loadingSnaps && (
                                        <span className="ml-2 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{snapshots.length}</span>
                                    )}
                                </h2>
                            </div>

                            {loadingSnaps ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 animate-pulse">
                                            <div className="flex justify-between">
                                                <div className="h-4 bg-slate-100 rounded-lg w-2/5" />
                                                <div className="h-6 bg-slate-100 rounded-lg w-10" />
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
                                            <div className="h-3 bg-slate-100 rounded-lg w-4/5" />
                                        </div>
                                    ))}
                                </div>
                            ) : snapshots.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                        <Camera className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-500 mb-1">No snapshots yet</h3>
                                    <p className="text-sm text-slate-400">Use the builder to create your first audience snapshot.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {snapshots.map(s => (
                                        <SnapshotCard key={s._id} snap={s} onDelete={id => setDeleteTarget(id)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Live count + save ────────────────────── */}
                    <div className="lg:sticky lg:top-[100px] space-y-4">

                        {/* Live audience counter */}
                        <div className="bg-gradient-to-br from-[#5f2299] via-[#7e35cc] to-[#9c40e0] rounded-2xl p-6 shadow-xl shadow-[#5f2299]/25 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/8" />

                            <div className="relative">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                                    </span>
                                    Live Audience Count
                                </p>

                                <div className="flex items-end gap-3 mb-1">
                                    {counting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
                                            <span className="text-white/50 font-black text-4xl">…</span>
                                        </div>
                                    ) : (
                                        <span className="text-white font-black text-5xl leading-none tracking-tight">
                                            {liveCount !== null ? liveCount.toLocaleString() : "—"}
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/50 text-sm font-medium">
                                    {hasFilters ? "users matching your filters" : "total users in system"}
                                </p>

                                {hasFilters && !counting && liveCount !== null && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="flex flex-wrap gap-1.5">
                                            {chips.map((c, i) => (
                                                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 bg-white/15 text-white rounded-full">
                                                    {c.value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save form */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                <Save className="w-4 h-4 text-[#5f2299]" /> Save this Snapshot
                            </h3>

                            <input
                                type="text"
                                value={label}
                                onChange={e => { setLabel(e.target.value); setSaveError(""); }}
                                placeholder='e.g. "UK Fashion Buyers"'
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#5f2299]/40 focus:ring-1 focus:ring-[#5f2299]/10 outline-none transition-all mb-3"
                                onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                            />

                            {saveError && (
                                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mb-3">{saveError}</p>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving || counting || liveCount === null}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${justSaved
                                    ? "bg-emerald-500 text-white"
                                    : "bg-[#5f2299] text-white hover:bg-[#762ec2] shadow-lg shadow-[#5f2299]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"}`}
                            >
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                    : justSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                                        : <><Camera className="w-4 h-4" /> Save Snapshot</>}
                            </button>

                            <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-relaxed">
                                Saves current filters + live count with your account and timestamp.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
