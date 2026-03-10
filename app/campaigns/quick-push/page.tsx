// app/campaigns/quick-push/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft, Flame, Search, SlidersHorizontal, X, ChevronRight,
    ChevronLeft, Users, Package, Shirt, Tag, Palette, Layers,
    ShoppingBag, Globe, Smartphone, Filter as FilterIcon,
    BellRing, Check, Loader2, CheckCircle2, AlertCircle,
    Send, Hash, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AppUser { id: string; name: string; firebaseToken: string }
interface ItemType { title: string; image: string }
interface WearType { title: string }
interface Category { title: string }
interface Style { title: string }
interface TypeEntry { title: string }
interface Country { name: string; code: string }
interface AppVersion { versionCode: string; name: string }

interface ApiFilters {
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
const DEFAULT_F: ApiFilters = {
    order: "", appVersion: "", itemtype: "", weartype: "",
    category: "", style: "", type: "", os: "", country: "",
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTES = [
    { bar: "bg-violet-500", ring: "ring-violet-100", badge: "bg-violet-50 text-violet-600 border-violet-100" },
    { bar: "bg-sky-500", ring: "ring-sky-100", badge: "bg-sky-50 text-sky-600 border-sky-100" },
    { bar: "bg-emerald-500", ring: "ring-emerald-100", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { bar: "bg-amber-500", ring: "ring-amber-100", badge: "bg-amber-50 text-amber-700 border-amber-100" },
    { bar: "bg-rose-500", ring: "ring-rose-100", badge: "bg-rose-50 text-rose-600 border-rose-100" },
    { bar: "bg-indigo-500", ring: "ring-indigo-100", badge: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];

// ─── User row (compact, selectable) ──────────────────────────────────────────
function UserRow({ user, selected, onToggle, index }: {
    user: AppUser; selected: boolean; onToggle: () => void; index: number;
}) {
    const p = PALETTES[parseInt(user.id, 10) % PALETTES.length];
    const initials = user.name.trim().split(/\s+/).map(w => w[0] ?? "").join("").substring(0, 2).toUpperCase() || "?";
    return (
        <button
            onClick={onToggle}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 group ${selected
                ? "bg-[#5f2299]/5 border border-[#5f2299]/20 shadow-sm"
                : "bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm"}`}
            style={{ animationDelay: `${Math.min(index * 15, 200)}ms`, animation: "fadeUp .25s ease both" }}
        >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full ${p.bar} flex items-center justify-center shrink-0 ring-2 ${p.ring}`}>
                <span className="text-white font-black text-[10px]">{initials}</span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${p.badge}`}>
                    <Hash className="w-2 h-2" />{user.id}
                </span>
            </div>

            {/* Checkbox */}
            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${selected
                ? "bg-[#5f2299] border-[#5f2299]"
                : "border-slate-200 group-hover:border-[#5f2299]/40"}`}>
                {selected && <Check className="w-3 h-3 text-white" />}
            </div>
        </button>
    );
}

// ─── Shimmer ──────────────────────────────────────────────────────────────────
function RowShimmer() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-2/5" />
                <div className="h-2.5 bg-slate-100 rounded w-1/4" />
            </div>
            <div className="w-5 h-5 rounded-md bg-slate-100" />
        </div>
    );
}

// ─── Filter select ────────────────────────────────────────────────────────────
function Sel({ label, icon: Icon, value, onChange, opts, placeholder = "Any" }: {
    label: string; icon: any; value: string; onChange: (v: string) => void;
    opts: { value: string; label: string }[]; placeholder?: string;
}) {
    return (
        <div>
            <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                <Icon className="w-2.5 h-2.5" />{label}
            </p>
            <div className="relative">
                <select value={value} onChange={e => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-2 pr-6 text-xs text-slate-700 font-medium focus:border-[#5f2299] outline-none cursor-pointer hover:border-slate-300 transition-colors">
                    <option value="">{placeholder}</option>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 rotate-90 pointer-events-none" />
            </div>
        </div>
    );
}

// ─── Notification preview ─────────────────────────────────────────────────────
function NotifPreview({ title, body }: { title: string; body: string }) {
    return (
        <div className="bg-slate-800/90 rounded-2xl p-4 shadow-xl w-full">
            <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 rounded bg-[#5f2299] flex items-center justify-center">
                    <BellRing className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">AttireBulk</span>
                <span className="text-white/30 text-xs ml-auto">now</span>
            </div>
            <p className="text-white text-sm font-bold leading-snug mb-0.5">
                {title || <span className="text-white/25 italic">Notification title…</span>}
            </p>
            <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                {body || <span className="italic">Notification body…</span>}
            </p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ANDROID_PATH = "M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C14.15 1.23 13.1 1 12 1c-1.1 0-2.15.23-3.12.63L7.39.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z";
const APPLE_PATH = "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z";
const PAGE_SIZE = 30;

export default function QuickPushPage() {
    // Step: 1 = user picker, 2 = notification composer, 3 = result
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // User data
    const [allUsers, setAllUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Record<string, AppUser>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<ApiFilters>(DEFAULT_F);

    // Lookup data
    const [itemTypes, setItemTypes] = useState<Record<string, ItemType>>({});
    const [wearTypes, setWearTypes] = useState<Record<string, WearType>>({});
    const [categories, setCategories] = useState<Record<string, Category>>({});
    const [styles, setStyles] = useState<Record<string, Style>>({});
    const [types, setTypes] = useState<Record<string, TypeEntry>>({});
    const [countries, setCountries] = useState<Country[]>([]);
    const [appVersions, setAppVersions] = useState<AppVersion[]>([]);

    // Step 2 state
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [result, setResult] = useState<{ successCount: number; failureCount: number; total: number } | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const filtersRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

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
        ]).then(([it, wt, c, s, ty, co, av]) => {
            setItemTypes(it); setWearTypes(wt); setCategories(c);
            setStyles(s); setTypes(ty);
            setCountries(Array.isArray(co) ? co : []);
            setAppVersions(Array.isArray(av) ? av : []);
        });
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async (f: ApiFilters) => {
        setLoading(true);
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
            setAllUsers(Array.isArray(data) ? data : []);
        } catch { setAllUsers([]); }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(1); fetchUsers(filters); }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [filters, fetchUsers]);

    function setF<K extends keyof ApiFilters>(key: K, val: ApiFilters[K]) {
        setFilters(prev => ({ ...prev, [key]: val }));
    }
    function clearFilters() { setFilters(DEFAULT_F); }

    // Filtered by search
    const searched = search.trim()
        ? allUsers.filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.id.includes(search.trim()))
        : allUsers;
    const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
    const paginated = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const selectedArr = Object.values(selected);
    const hasFilters = Object.values(filters).some(v => v !== "");

    function toggleUser(u: AppUser) {
        setSelected(prev => {
            if (prev[u.id]) {
                const next = { ...prev };
                delete next[u.id];
                return next;
            }
            return { ...prev, [u.id]: u };
        });
    }
    function selectAll() {
        const next = { ...selected };
        paginated.forEach(u => { next[u.id] = u; });
        setSelected(next);
    }
    function deselectAll() {
        const next = { ...selected };
        paginated.forEach(u => { delete next[u.id]; });
        setSelected(next);
    }

    async function handleSend() {
        if (!title.trim() || !body.trim()) { setSendError("Title and body are required."); return; }
        setSending(true); setSendError("");
        const tokens = selectedArr.map(u => u.firebaseToken);
        const res = await fetch("/api/quick-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body, tokens }),
        });
        const data = await res.json();
        if (!res.ok) { setSendError(data.error || "Failed to send."); setSending(false); return; }
        setResult(data);
        setStep(3);
        setSending(false);
    }

    const scrollFilters = (dir: 1 | -1) => {
        filtersRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col h-full">
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideRight { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
      `}</style>

            {/* ── Sticky header ─────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="px-8 pt-5 pb-4">
                    <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#5f2299] transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4" /> Campaigns
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                            <Flame className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quick Push</h1>
                            <p className="text-sm text-slate-400 font-medium">Send an instant notification to specific users.</p>
                        </div>

                        {/* Step indicator */}
                        <div className="flex items-center gap-1.5">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? "bg-[#5f2299] text-white shadow-md shadow-[#5f2299]/25" : "bg-slate-100 text-slate-400"}`}>
                                        {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                                    </div>
                                    {s < 2 && <div className={`w-6 h-0.5 rounded-full transition-colors ${step > s ? "bg-[#5f2299]" : "bg-slate-100"}`} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Sticky search + filter row */}
                    {step === 1 && (
                        <div className="mt-4 flex items-center gap-2">
                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search users by name or ID…"
                                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#5f2299]/30 focus:ring-1 focus:ring-[#5f2299]/10 outline-none transition-all"
                                />
                                {search && (
                                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <X className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Filter scroll left */}
                            <button onClick={() => scrollFilters(-1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-[#5f2299] flex items-center justify-center shrink-0 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Scrollable filter row */}
                            <div ref={filtersRef} className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 scroll-smooth">
                                {/* OS toggles */}
                                {(["android", "iOS"] as const).map(os => (
                                    <button key={os} onClick={() => setF("os", filters.os === os ? "" : os)}
                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${filters.os === os
                                            ? os === "android" ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-800 text-white border-slate-800"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                        <svg viewBox="0 0 256 256" className="w-3.5 h-3.5 fill-current" aria-hidden>
                                            <path d={os === "android" ? ANDROID_PATH : APPLE_PATH} />
                                        </svg>
                                        {os === "android" ? "Android" : "iOS"}
                                    </button>
                                ))}

                                {/* Order Yes/No */}
                                {(["1", "0"] as const).map(v => (
                                    <button key={v} onClick={() => setF("order", filters.order === v ? "" : v)}
                                        className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${filters.order === v
                                            ? v === "1" ? "bg-emerald-500 text-white border-emerald-500" : "bg-rose-500 text-white border-rose-500"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                        <ShoppingBag className="w-3 h-3" />
                                        {v === "1" ? "Has Orders" : "No Orders"}
                                    </button>
                                ))}

                                {/* Country */}
                                {countries.slice(0, 10).map(c => (
                                    <button key={c.name} onClick={() => setF("country", filters.country === c.name ? "" : c.name)}
                                        className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${filters.country === c.name
                                            ? "bg-[#5f2299] text-white border-[#5f2299]"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                        {c.name}
                                    </button>
                                ))}

                                {/* More Filters button */}
                                <button onClick={() => setShowFilters(s => !s)}
                                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${showFilters
                                        ? "bg-[#5f2299] text-white border-[#5f2299]"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                    <FilterIcon className="w-3 h-3" />
                                    More
                                    {hasFilters && <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black ${showFilters ? "bg-white/20 text-white" : "bg-[#5f2299] text-white"}`}>
                                        {Object.values(filters).filter(Boolean).length}
                                    </span>}
                                </button>
                            </div>

                            {/* Filter scroll right */}
                            <button onClick={() => scrollFilters(1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-[#5f2299] flex items-center justify-center shrink-0 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Expanded filter panel */}
                {step === 1 && showFilters && (
                    <div className="px-8 pb-4 pt-0 bg-slate-50/70 border-t border-slate-100" style={{ animation: "fadeUp .18s ease both" }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3">
                            <Sel label="Item Type" icon={Package} value={filters.itemtype} onChange={v => setF("itemtype", v)}
                                opts={Object.entries(itemTypes).map(([id, it]) => ({ value: id, label: it.title }))} />
                            <Sel label="Wear Type" icon={Shirt} value={filters.weartype} onChange={v => setF("weartype", v)}
                                opts={Object.entries(wearTypes).map(([id, wt]) => ({ value: id, label: wt.title }))} />
                            <Sel label="Category" icon={Tag} value={filters.category} onChange={v => setF("category", v)}
                                opts={Object.entries(categories).map(([id, c]) => ({ value: id, label: c.title }))} />
                            <Sel label="Style" icon={Palette} value={filters.style} onChange={v => setF("style", v)}
                                opts={Object.entries(styles).map(([id, s]) => ({ value: id, label: s.title }))} />
                            <Sel label="Type" icon={Layers} value={filters.type} onChange={v => setF("type", v)}
                                opts={Object.entries(types).map(([id, t]) => ({ value: id, label: t.title }))} />
                            <Sel label="App Version" icon={Smartphone} value={filters.appVersion} onChange={v => setF("appVersion", v)}
                                opts={appVersions.map(av => ({ value: av.versionCode, label: av.name }))} placeholder="Any Version" />
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                            {hasFilters && (
                                <button onClick={clearFilters} className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                                    <X className="w-3 h-3" /> Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Step 1: User Picker ───────────────────────────── */}
            {step === 1 && (
                <div className="flex-1 overflow-y-auto px-8 py-5">
                    {/* Stats + batch actions */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#5f2299]/20 border-t-[#5f2299] rounded-full animate-spin" />
                                    <span className="text-sm text-slate-400">Loading users…</span>
                                </div>
                            ) : (
                                <span className="text-sm text-slate-400 font-medium">
                                    <span className="font-black text-slate-800 text-lg">{searched.length}</span> users
                                    {selectedArr.length > 0 && <span className="ml-2 text-[#5f2299] font-bold">· {selectedArr.length} selected</span>}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {paginated.length > 0 && (
                                <>
                                    <button onClick={selectAll} className="text-xs font-bold text-[#5f2299] hover:bg-[#5f2299]/5 px-2.5 py-1.5 rounded-lg transition-colors">
                                        Select page
                                    </button>
                                    <button onClick={deselectAll} className="text-xs font-bold text-slate-400 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors">
                                        Deselect page
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Selected user ID chips */}
                    {selectedArr.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 bg-[#5f2299]/4 border border-[#5f2299]/10 rounded-xl p-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] self-center mr-1">Selected:</span>
                            {selectedArr.map(u => (
                                <span key={u.id}
                                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-white text-[#5f2299] text-xs font-bold rounded-full border border-[#5f2299]/20 shadow-sm">
                                    #{u.id}
                                    <button onClick={() => toggleUser(u)}
                                        className="w-4 h-4 rounded-full hover:bg-[#5f2299]/10 flex items-center justify-center">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </span>
                            ))}
                            <button onClick={() => setSelected({})} className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold ml-auto">Clear all</button>
                        </div>
                    )}

                    {/* User list */}
                    {loading ? (
                        <div className="space-y-2">{Array.from({ length: 12 }).map((_, i) => <RowShimmer key={i} />)}</div>
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <Users className="w-7 h-7 text-slate-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-500">No users found</h3>
                            <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {paginated.map((u, i) => (
                                <UserRow key={u.id} user={u} index={i} selected={!!selected[u.id]} onToggle={() => toggleUser(u)} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center gap-2 justify-center mt-6 pt-4 border-t border-slate-100">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 transition-all">
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <span className="text-sm text-slate-500 font-semibold min-w-[60px] text-center">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 transition-all">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 2: Composer ──────────────────────────────── */}
            {step === 2 && (
                <div className="flex-1 overflow-y-auto px-8 py-6" style={{ animation: "slideRight .25s ease both" }}>
                    <div className="max-w-2xl mx-auto">
                        {/* Recipients summary */}
                        <div className="bg-[#5f2299]/5 border border-[#5f2299]/10 rounded-2xl px-5 py-4 mb-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#5f2299]/10 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-[#5f2299]" />
                            </div>
                            <div>
                                <p className="text-base font-black text-[#5f2299]">{selectedArr.length} recipient{selectedArr.length !== 1 ? "s" : ""}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedArr.slice(0, 8).map(u => (
                                        <span key={u.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#5f2299]/10 text-[#5f2299]">#{u.id}</span>
                                    ))}
                                    {selectedArr.length > 8 && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#5f2299]/10 text-[#5f2299]">+{selectedArr.length - 8} more</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-1.5">Notification Title</label>
                                    <input
                                        type="text" maxLength={65} value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Flash Sale Alert!"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#5f2299]/40 focus:ring-1 focus:ring-[#5f2299]/10 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 text-right">{title.length}/65</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-1.5">Notification Body</label>
                                    <textarea
                                        rows={4} maxLength={240} value={body}
                                        onChange={e => setBody(e.target.value)}
                                        placeholder="Tap to see what's waiting for you…"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium resize-none focus:bg-white focus:border-[#5f2299]/40 focus:ring-1 focus:ring-[#5f2299]/10 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 text-right">{body.length}/240</p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <p className="text-sm font-black text-slate-700 mb-1.5">Preview</p>
                                <div className="bg-slate-900 rounded-2xl p-4 shadow-xl">
                                    <div className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Live preview
                                    </div>
                                    <NotifPreview title={title} body={body} />
                                </div>
                            </div>
                        </div>

                        {sendError && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {sendError}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Step 3: Result ────────────────────────────────── */}
            {step === 3 && result && (
                <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ animation: "fadeUp .4s ease both" }}>
                    <div className="text-center max-w-md">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl ${result.failureCount === 0 ? "bg-emerald-500 shadow-emerald-200" : "bg-amber-500 shadow-amber-200"}`}>
                            {result.failureCount === 0
                                ? <CheckCircle2 className="w-10 h-10 text-white" />
                                : <Flame className="w-10 h-10 text-white" />
                            }
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Push Sent!</h2>
                        <p className="text-slate-500 mb-8">Your quick push notification was dispatched instantly.</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[
                                { label: "Total", value: result.total, color: "text-slate-800" },
                                { label: "Delivered", value: result.successCount, color: "text-emerald-600" },
                                { label: "Failed", value: result.failureCount, color: "text-rose-500" },
                            ].map(s => (
                                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 py-4 px-3 shadow-sm">
                                    <div className={`text-3xl font-black ${s.color} leading-none mb-1`}>{s.value}</div>
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button onClick={() => { setStep(1); setSelected({}); setTitle(""); setBody(""); setResult(null); }}
                                className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                New Push
                            </button>
                            <Link href="/campaigns"
                                className="px-6 py-3 rounded-xl bg-[#5f2299] text-white text-sm font-bold hover:bg-[#762ec2] transition-colors shadow-md shadow-[#5f2299]/20">
                                Back to Campaigns
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bottom action bar ─────────────────────────────── */}
            {step !== 3 && (
                <div className="border-t border-slate-100 bg-white/95 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
                    {step === 2 ? (
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 1 && (
                        <button
                            onClick={() => { if (selectedArr.length > 0) setStep(2); }}
                            disabled={selectedArr.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#5f2299] hover:bg-[#762ec2] shadow-md shadow-[#5f2299]/20 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next: Compose
                            <ArrowRight className="w-4 h-4" />
                            {selectedArr.length > 0 && (
                                <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{selectedArr.length}</span>
                            )}
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={handleSend}
                            disabled={sending || !title.trim() || !body.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#5f2299] to-amber-500 shadow-md active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                            {sending ? "Sending…" : `Send to ${selectedArr.length} user${selectedArr.length !== 1 ? "s" : ""}`}
                            <Send className="w-3.5 h-3.5 opacity-70" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
