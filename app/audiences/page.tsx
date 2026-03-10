// app/audiences/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
    Users, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
    Hash, ShoppingBag, Package, Shirt, Palette, Tag, Globe,
    Smartphone, Layers, Filter, Copy, Check, Camera,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AppUser { id: string; name: string; firebaseToken: string }
interface ItemType { title: string; image: string }
interface WearType { title: string; type: string; subtype: string; itemtype: string; image: string }
interface Category { title: string; type: string; subtype: string; itemtype: string; weartype: string; image: string }
interface Style { title: string; type: string; subtype: string; itemtype: string; weartype: string; image: string }
interface TypeEntry { title: string; subtypes: Record<string, string>[] }
interface Country { name: string; code: string }

interface Filters {
    search: string;
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

const DEFAULT: Filters = {
    search: "", order: "", appVersion: "", itemtype: "", weartype: "",
    category: "", style: "", type: "", os: "", country: "",
};

const PAGE_SIZE = 25;

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTES = [
    { bar: "bg-violet-500", dot: "bg-violet-400", badge: "bg-violet-50 text-violet-600 border-violet-100", ring: "ring-violet-100" },
    { bar: "bg-sky-500", dot: "bg-sky-400", badge: "bg-sky-50 text-sky-600 border-sky-100", ring: "ring-sky-100" },
    { bar: "bg-emerald-500", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-600 border-emerald-100", ring: "ring-emerald-100" },
    { bar: "bg-amber-500", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-100", ring: "ring-amber-100" },
    { bar: "bg-rose-500", dot: "bg-rose-400", badge: "bg-rose-50 text-rose-600 border-rose-100", ring: "ring-rose-100" },
    { bar: "bg-indigo-500", dot: "bg-indigo-400", badge: "bg-indigo-50 text-indigo-600 border-indigo-100", ring: "ring-indigo-100" },
];

// ─── Shimmer ──────────────────────────────────────────────────────────────────
function CardShimmer() {
    return (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex h-[72px]">
            <div className="w-1 bg-slate-100 shrink-0" />
            <div className="flex items-center gap-3 px-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 animate-pulse rounded-lg w-2/5" />
                    <div className="h-2.5 bg-slate-100 animate-pulse rounded-lg w-3/5" />
                </div>
            </div>
        </div>
    );
}

// ─── Copy token button ────────────────────────────────────────────────────────
function CopyTokenBtn({ token }: { token: string }) {
    const [copied, setCopied] = useState(false);
    function copy(e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(token).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    }
    return (
        <button
            onClick={copy}
            title="Copy token"
            className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-slate-200 active:scale-90"
        >
            {copied
                ? <Check className="w-3 h-3 text-emerald-500" />
                : <Copy className="w-3 h-3 text-slate-400" />
            }
        </button>
    );
}

// ─── User Card ────────────────────────────────────────────────────────────────
function UserCard({ user, index }: { user: AppUser; index: number }) {
    const p = PALETTES[parseInt(user.id, 10) % PALETTES.length];
    const initials = user.name.trim().split(/\s+/).map(w => w[0] ?? "").join("").substring(0, 2).toUpperCase() || "?";
    const tokenShort = user.firebaseToken.substring(0, 38) + "…";

    return (
        <div
            className="group bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col"
            style={{ animationDelay: `${Math.min(index * 20, 240)}ms`, animation: "fadeUp .3s ease both" }}
        >
            {/* Top row */}
            <div className="flex items-center gap-3 px-3 pt-3 pb-2">
                {/* Tiny avatar */}
                <div className={`w-8 h-8 rounded-full ${p.bar} flex items-center justify-center shrink-0 ring-2 ${p.ring}`}>
                    <span className="text-white font-black text-[10px] tracking-wide leading-none">{initials}</span>
                </div>

                {/* Name + ID */}
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{user.name}</p>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 mt-0.5 rounded-md border ${p.badge}`}>
                        <Hash className="w-2 h-2" />{user.id}
                    </span>
                </div>
            </div>

            {/* Token row */}
            <div className="flex items-center gap-1.5 mx-3 mb-3 bg-slate-50 rounded-lg px-2.5 py-1.5">
                <div className={`w-1 h-3.5 rounded-full ${p.dot} shrink-0 opacity-60`} />
                <p className="font-mono text-[10px] text-slate-400 truncate flex-1 leading-none">{tokenShort}</p>
                <CopyTokenBtn token={user.firebaseToken} />
            </div>
        </div>
    );
}

// ─── OS button ────────────────────────────────────────────────────────────────
function OsBtn({ active, label, svgPath, activeClass, onClick }: {
    active: boolean; label: string; svgPath: string; activeClass: string; onClick: () => void;
}) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border flex-1 justify-center transition-all ${active ? activeClass : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
        >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden><path d={svgPath} /></svg>
            {label}
        </button>
    );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Sel({ label, icon: Icon, value, onChange, opts, placeholder = "All" }: {
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
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 pr-7 text-sm text-slate-700 font-medium focus:border-[#5f2299] focus:ring-1 focus:ring-[#5f2299]/10 outline-none cursor-pointer hover:border-slate-300 transition-colors">
                    <option value="">{placeholder}</option>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 rotate-90 pointer-events-none" />
            </div>
        </div>
    );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-[#5f2299]/8 text-[#5f2299] text-xs font-semibold rounded-full border border-[#5f2299]/15">
            {label}
            <button onClick={onRemove} className="w-4 h-4 rounded-full hover:bg-[#5f2299]/15 flex items-center justify-center ml-0.5 transition-colors">
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AudiencesPage() {
    const [allUsers, setAllUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>(DEFAULT);
    const [showFilters, setShowFilters] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Lookup data
    const [itemTypes, setItemTypes] = useState<Record<string, ItemType>>({});
    const [wearTypes, setWearTypes] = useState<Record<string, WearType>>({});
    const [categories, setCategories] = useState<Record<string, Category>>({});
    const [styles, setStyles] = useState<Record<string, Style>>({});
    const [types, setTypes] = useState<Record<string, TypeEntry>>({});
    const [countries, setCountries] = useState<Country[]>([]);
    const [appVersions, setAppVersions] = useState<{ versionCode: string; name: string }[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Load lookups once ────────────────────────────────────────────────────
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

    // Focus search input when it appears
    useEffect(() => {
        if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
        if (!showSearch) setF("search", "");
    }, [showSearch]);

    // ── Fetch users ──────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async (f: Filters) => {
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
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(1); fetchUsers(filters); }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [filters.order, filters.appVersion, filters.itemtype, filters.weartype,
    filters.category, filters.style, filters.type, filters.os, filters.country, fetchUsers]);

    function setF<K extends keyof Filters>(key: K, val: Filters[K]) {
        setFilters(prev => ({ ...prev, [key]: val }));
    }
    function clearAll() { setFilters(DEFAULT); setPage(1); setShowSearch(false); }

    const hasApiFilters = !!(filters.order || filters.appVersion || filters.itemtype ||
        filters.weartype || filters.category || filters.style || filters.type || filters.os || filters.country);

    // Client-side search
    const searched = filters.search.trim()
        ? allUsers.filter(u =>
            u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            u.id.includes(filters.search.trim()))
        : allUsers;

    const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
    const paginated = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const chips: { label: string; clear: () => void }[] = [];
    if (filters.order) chips.push({ label: filters.order === "1" ? "Has Orders" : "No Orders", clear: () => setF("order", "") });
    if (filters.appVersion) chips.push({ label: `v${filters.appVersion}`, clear: () => setF("appVersion", "") });
    if (filters.itemtype) chips.push({ label: itemTypes[filters.itemtype]?.title || `Item #${filters.itemtype}`, clear: () => setF("itemtype", "") });
    if (filters.weartype) chips.push({ label: wearTypes[filters.weartype]?.title || `Wear #${filters.weartype}`, clear: () => setF("weartype", "") });
    if (filters.category) chips.push({ label: categories[filters.category]?.title || `Cat #${filters.category}`, clear: () => setF("category", "") });
    if (filters.style) chips.push({ label: styles[filters.style]?.title || `Style #${filters.style}`, clear: () => setF("style", "") });
    if (filters.type) chips.push({ label: types[filters.type]?.title || `Type #${filters.type}`, clear: () => setF("type", "") });
    if (filters.os) chips.push({ label: filters.os === "android" ? "Android" : "iOS", clear: () => setF("os", "") });
    if (filters.country) chips.push({ label: filters.country, clear: () => setF("country", "") });
    const activeCount = chips.length + (filters.search ? 1 : 0);

    const ANDROID_PATH = "M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C14.15 1.23 13.1 1 12 1c-1.1 0-2.15.23-3.12.63L7.39.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z";
    const APPLE_PATH = "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z";

    return (
        <div className="flex flex-col h-full">
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; width:0; } to { opacity:1; width:100%; } }
      `}</style>

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-8 pt-6 pb-4">
                <div className="flex items-center gap-2">
                    {/* Title — shrinks when search is open */}
                    <div className={`transition-all duration-300 overflow-hidden ${showSearch ? "w-0 opacity-0" : "flex-1 opacity-100"}`}>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">Audiences</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5 whitespace-nowrap">Browse and segment your app users.</p>
                    </div>

                    {/* Search expanded input */}
                    {showSearch && (
                        <div className="flex-1 flex items-center gap-2" style={{ animation: "slideIn .2s ease both" }}>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f2299]" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={filters.search}
                                    onChange={e => { setF("search", e.target.value); setPage(1); }}
                                    placeholder="Search by name or user ID…"
                                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-[#5f2299]/20 rounded-xl text-sm text-slate-800 font-medium placeholder:text-slate-300 focus:bg-white focus:border-[#5f2299]/40 focus:ring-1 focus:ring-[#5f2299]/10 outline-none transition-all"
                                />
                                {filters.search && (
                                    <button onClick={() => setF("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Search icon toggle */}
                        <button
                            onClick={() => setShowSearch(s => !s)}
                            title={showSearch ? "Close search" : "Search users"}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${showSearch
                                ? "bg-[#5f2299] text-white border-[#5f2299] shadow-md shadow-[#5f2299]/20"
                                : "bg-white text-slate-500 border-slate-200 hover:border-[#5f2299]/30 hover:text-[#5f2299]"}`}
                        >
                            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>

                        {/* Snapshot button */}
                        <Link
                            href="/audiences/snapshots"
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border bg-white text-slate-600 border-slate-200 hover:border-[#5f2299]/30 hover:text-[#5f2299] transition-all"
                        >
                            <Camera className="w-4 h-4" />
                            <span className="hidden sm:inline">Snapshot</span>
                        </Link>

                        {/* Filters toggle */}
                        <button
                            onClick={() => setShowFilters(s => !s)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all ${showFilters
                                ? "bg-[#5f2299] text-white border-[#5f2299] shadow-lg shadow-[#5f2299]/20"
                                : "bg-white text-slate-600 border-slate-200 hover:border-[#5f2299]/30 hover:text-[#5f2299]"}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filters</span>
                            {activeCount > 0 && (
                                <span className={`text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full ${showFilters ? "bg-white/25 text-white" : "bg-[#5f2299] text-white"}`}>
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Active chips */}
                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center mt-3">
                        {chips.map((c, i) => <Chip key={i} label={c.label} onRemove={c.clear} />)}
                        <button onClick={clearAll} className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold transition-colors ml-1">
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* ── Filter Panel ─────────────────────────────────────── */}
            {showFilters && (
                <div className="bg-slate-50/80 border-b border-slate-100 px-8 py-5" style={{ animation: "fadeUp .2s ease both" }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

                        {/* Order */}
                        <div>
                            <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                <ShoppingBag className="w-3 h-3" /> Has Orders
                            </p>
                            <div className="flex gap-1.5">
                                {(["1", "0"] as const).map(v => (
                                    <button key={v}
                                        onClick={() => setF("order", filters.order === v ? "" : v)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${filters.order === v
                                            ? v === "1" ? "bg-emerald-500 text-white border-emerald-500" : "bg-rose-500 text-white border-rose-500"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                                    >{v === "1" ? "Yes" : "No"}</button>
                                ))}
                            </div>
                        </div>

                        <Sel label="App Version" icon={Smartphone} value={filters.appVersion}
                            onChange={v => setF("appVersion", v)}
                            opts={appVersions.map(av => ({ value: av.versionCode, label: `${av.name} (${av.versionCode})` }))}
                            placeholder="Any Version" />

                        {/* OS */}
                        <div>
                            <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                <Filter className="w-3 h-3" /> OS
                            </p>
                            <div className="flex gap-1.5">
                                <OsBtn active={filters.os === "android"} label="Android" svgPath={ANDROID_PATH}
                                    activeClass="bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                    onClick={() => setF("os", filters.os === "android" ? "" : "android")} />
                                <OsBtn active={filters.os === "iOS"} label="iOS" svgPath={APPLE_PATH}
                                    activeClass="bg-slate-800 text-white border-slate-800 shadow-sm"
                                    onClick={() => setF("os", filters.os === "iOS" ? "" : "iOS")} />
                            </div>
                        </div>

                        <Sel label="Country" icon={Globe} value={filters.country}
                            onChange={v => setF("country", v)}
                            opts={countries.map(c => ({ value: c.name, label: c.name }))}
                            placeholder="Any Country" />
                    </div>
                </div>
            )}

            {/* ── Scrollable Content ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

                {/* Stats bar */}
                <div className="flex items-center justify-between mb-5">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#5f2299]/20 border-t-[#5f2299] rounded-full animate-spin" />
                            <span className="text-sm text-slate-400 font-medium">Loading users…</span>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{searched.length.toLocaleString()}</span>
                            {hasApiFilters && <span className="text-sm text-slate-400">of {allUsers.length.toLocaleString()} total</span>}
                            <span className="text-sm text-slate-400">{hasApiFilters || filters.search ? "matched" : "users"}</span>
                        </div>
                    )}
                    {!loading && totalPages > 1 && (
                        <p className="text-xs text-slate-400 font-medium">Page {page} / {totalPages}</p>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {Array.from({ length: 16 }).map((_, i) => <CardShimmer key={i} />)}
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-slate-300" />
                        </div>
                        <h3 className="text-base font-bold text-slate-600 mb-1">No users found</h3>
                        <p className="text-sm text-slate-400 max-w-xs">Try adjusting your filters or search.</p>
                        {activeCount > 0 && (
                            <button onClick={clearAll} className="mt-4 px-5 py-2 bg-[#5f2299] text-white text-sm font-bold rounded-xl hover:bg-[#762ec2] transition-colors">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {paginated.map((u, i) => <UserCard key={u.id} user={u} index={i} />)}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-5 border-t border-slate-100">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <span className="text-sm font-semibold text-slate-500 min-w-[60px] text-center">{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
