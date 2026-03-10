// app/settings/filters/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft, Users, Layers, Grid3x3, Sparkles,
    CheckCircle2, Circle, RefreshCw, Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ItemTypeEntry { title: string; image: string }
interface TypeEntry { title: string; subtypes: Record<string, string>[] }
interface WearType { type: string; subtype: string; itemtype: string; title: string; image: string }
interface Category { type: string; subtype: string; itemtype: string; weartype: string; title: string; image: string }
interface StyleEntry { type: string; subtype: string; itemtype: string; weartype: string; title: string; image: string }

type ItemTypesMap = Record<string, ItemTypeEntry>
type TypesMap = Record<string, TypeEntry>
type WearTypesMap = Record<string, WearType>
type CatsMap = Record<string, Category>
type StylesMap = Record<string, StyleEntry>

const ITEM_TYPE_LABELS: Record<string, string> = {
    "1": "Clothing", "2": "Footwear", "3": "Accessories", "4": "Others",
};
const TYPE_ACCENT_BORDER: Record<string, string> = {
    "10": "bg-rose-500",
    "24": "bg-sky-500",
    "25": "bg-slate-500",
};
const TYPE_BG: Record<string, string> = {
    "10": "bg-rose-50",
    "24": "bg-sky-50",
    "25": "bg-slate-100",
};
const TYPE_TEXT: Record<string, string> = {
    "10": "text-rose-600",
    "24": "text-sky-600",
    "25": "text-slate-600",
};

// Item-type palette — stable per id
const ITEM_PALETTES: { bar: string; bg: string; text: string; imgBg: string }[] = [
    { bar: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700", imgBg: "bg-violet-100" },
    { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", imgBg: "bg-amber-100" },
    { bar: "bg-teal-500", bg: "bg-teal-50", text: "text-teal-700", imgBg: "bg-teal-100" },
    { bar: "bg-sky-500", bg: "bg-sky-50", text: "text-sky-700", imgBg: "bg-sky-100" },
];

const IMAGE_BASE = "https://attirebulk.com/products/";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTypeName(types: TypesMap, typeId: string) { return types[typeId]?.title ?? typeId; }
function getSubtypeName(types: TypesMap, typeId: string, subtypeId: string) {
    if (subtypeId === "0") return null;
    const sub = types[typeId]?.subtypes?.find((s) => s[subtypeId]);
    return sub ? sub[subtypeId] : null;
}
function getWearTypeName(wt: WearTypesMap, id: string) { return wt[id]?.title ?? id; }

// ─── Tag pill ─────────────────────────────────────────────────────────────────
function Tag({ label, color = "slate" }: { label: string; color?: string }) {
    const colors: Record<string, string> = {
        violet: "bg-violet-100 text-violet-700",
        sky: "bg-sky-100 text-sky-700",
        amber: "bg-amber-100 text-amber-700",
        teal: "bg-teal-100 text-teal-700",
        slate: "bg-slate-100 text-slate-600",
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[color] ?? colors.slate}`}>
            {label}
        </span>
    );
}

// ─── Avatar image with fallback ────────────────────────────────────────────────
function CardImage({ src, alt }: { src: string; alt: string }) {
    const [err, setErr] = useState(false);
    return err ? (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-slate-300" />
        </div>
    ) : (
        <img src={src} alt={alt} onError={() => setErr(true)}
            className="w-full h-full object-cover" />
    );
}

// ─── Shimmer primitives ───────────────────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded ${className}`}
            style={{ animation: "shimmer 1.4s ease-in-out infinite", backgroundSize: "200% 100%" }} />
    );
}

// Row shimmer — matches compact avatar-row card
function RowShimmer() {
    return (
        <div className="bg-white rounded-xl border border-slate-100 flex items-center gap-4 p-3">
            <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
                <Shimmer className="h-3.5 w-3/5" />
                <div className="flex gap-1.5">
                    <Shimmer className="h-3 w-14 rounded-full" />
                    <Shimmer className="h-3 w-10 rounded-full" />
                    <Shimmer className="h-3 w-16 rounded-full" />
                </div>
                <Shimmer className="h-2.5 w-2/5" />
            </div>
        </div>
    );
}

// Type card shimmer — matches horizontal accent-bar card
function TypeShimmer() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex">
            {/* Left accent bar */}
            <div className="w-1 shrink-0 bg-slate-200 animate-pulse" />
            <div className="flex-1 p-4">
                {/* Title row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                        <Shimmer className="h-4 w-28" />
                    </div>
                    <Shimmer className="h-4 w-16 rounded-full" />
                </div>
                {/* Subtype pills */}
                <div className="flex flex-wrap gap-1.5">
                    <Shimmer className="h-6 w-16 rounded-lg" />
                    <Shimmer className="h-6 w-20 rounded-lg" />
                    <Shimmer className="h-6 w-14 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FiltersPage() {
    const [itemTypes, setItemTypes] = useState<ItemTypesMap>({});
    const [types, setTypes] = useState<TypesMap>({});
    const [wearTypes, setWearTypes] = useState<WearTypesMap>({});
    const [categories, setCategories] = useState<CatsMap>({});
    const [styles, setStyles] = useState<StylesMap>({});
    const [loading, setLoading] = useState(true);
    const [reloading, setReloading] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const [mainTab, setMainTab] = useState<"itemtypes" | "types" | "weartypes" | "categories" | "styles">("itemtypes");
    const [wtTab, setWtTab] = useState<"all" | "active">("all");

    useEffect(() => {
        async function load() {
            setLoading(true);
            const f = reloadKey > 0 ? "&force=true" : "";
            const [it, t, w, c, s] = await Promise.all([
                fetch(`/api/filters-proxy?type=itemtypes${f}`).then(r => r.json()),
                fetch(`/api/filters-proxy?type=types${f}`).then(r => r.json()),
                fetch(`/api/filters-proxy?type=weartypes${f}`).then(r => r.json()),
                fetch(`/api/filters-proxy?type=categories${f}`).then(r => r.json()),
                fetch(`/api/filters-proxy?type=styles${f}`).then(r => r.json()),
            ]);
            setItemTypes(it); setTypes(t); setWearTypes(w); setCategories(c); setStyles(s);
            setLoading(false);
            setReloading(false);
        }
        load();
    }, [reloadKey]);

    function handleReload() {
        setReloading(true);
        setItemTypes({}); setTypes({}); setWearTypes({}); setCategories({}); setStyles({});
        setReloadKey(k => k + 1);
    }

    const activeWtIds = new Set([
        ...Object.values(categories).map(c => c.weartype),
        ...Object.values(styles).map(s => s.weartype),
    ]);

    const mainTabs = [
        { id: "itemtypes", label: "Item Types", icon: Package, count: Object.keys(itemTypes).length },
        { id: "types", label: "Types", icon: Users, count: Object.keys(types).length },
        { id: "weartypes", label: "Wear Types", icon: Layers, count: Object.keys(wearTypes).length },
        { id: "categories", label: "Categories", icon: Grid3x3, count: Object.keys(categories).length },
        { id: "styles", label: "Styles", icon: Sparkles, count: Object.keys(styles).length },
    ] as const;

    return (
        /* Full-height flex column so we can pin header/tabs and scroll cards */
        <div className="flex flex-col h-full">

            {/* ── Sticky headier + tabs ───────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-8 pt-8 pb-0">
                <Link href="/settings"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-600 transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Settings
                </Link>
                <div className="flex items-start justify-between mb-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Filters</h1>
                        <p className="text-slate-500 font-medium mt-0.5 mb-4">Browse API data used to build campaign audience filters.</p>
                    </div>
                    <button
                        onClick={handleReload}
                        disabled={loading || reloading}
                        title="Reload all filters"
                        className={`mt-1 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all ${loading || reloading
                            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 hover:shadow-sm active:scale-95"
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">{reloading ? "Reloading…" : "Reload"}</span>
                    </button>
                </div>

                {/* Main tabs */}
                <div className="flex gap-1">
                    {mainTabs.map(tab => {
                        const Icon = tab.icon;
                        const active = mainTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setMainTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${active
                                    ? "text-teal-600 border-teal-500"
                                    : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                                    }`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                                    {loading ? "…" : tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scrollable card area ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

                {/* ── ITEM TYPES ──────────────────────────────────────────── */}
                {mainTab === "itemtypes" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => <TypeShimmer key={i} />)
                            : Object.entries(itemTypes).map(([id, it], idx) => {
                                const pal = ITEM_PALETTES[idx % ITEM_PALETTES.length];
                                const imgSrc = `https://attirebulk.com/products/${it.image}`;
                                return (
                                    <div key={id}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-150 overflow-hidden flex">
                                        {/* Left accent bar */}
                                        <div className={`w-1 shrink-0 ${pal.bar}`} />
                                        <div className="flex-1 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2.5">
                                                    {/* Image or icon fallback */}
                                                    <div className={`w-10 h-10 rounded-lg ${pal.imgBg} flex items-center justify-center shrink-0 overflow-hidden`}>
                                                        <CardImage src={imgSrc} alt={it.title} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-slate-800 leading-tight">{it.title}</h3>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${pal.bg} ${pal.text}`}>ID #{id}</span>
                                                    </div>
                                                </div>
                                                <Package className={`w-5 h-5 ${pal.text} opacity-40`} />
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium">
                                                Item type · used across wear types, categories & styles
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* ── TYPES ───────────────────────────────────────────────── */}
                {mainTab === "types" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => <TypeShimmer key={i} />)
                            : Object.entries(types).map(([id, t]) => {
                                const accentBar = TYPE_ACCENT_BORDER[id] ?? "bg-slate-400";
                                const accentBg = TYPE_BG[id] ?? "bg-slate-50";
                                const accentText = TYPE_TEXT[id] ?? "text-slate-600";
                                const totalSubtypes = t.subtypes.length;
                                return (
                                    <div key={id}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-150 overflow-hidden flex">
                                        {/* Left accent bar */}
                                        <div className={`w-1 shrink-0 ${accentBar}`} />
                                        <div className="flex-1 p-4">
                                            {/* Title row */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center shrink-0`}>
                                                        <Users className={`w-4 h-4 ${accentText}`} />
                                                    </div>
                                                    <h3 className="text-base font-extrabold text-slate-800">{t.title}</h3>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {totalSubtypes} subtype{totalSubtypes !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                            {/* Subtypes or empty state */}
                                            {totalSubtypes > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {t.subtypes.map((sub) =>
                                                        Object.entries(sub).map(([subId, subTitle]) => (
                                                            <span key={subId}
                                                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${accentBg} ${accentText}`}>
                                                                {subTitle}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${accentBg} ${accentText}`}>Top-level only</span>
                                                    <span className="text-xs text-slate-400">No sub-categories</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* ── WEARTYPES ───────────────────────────────────────────── */}
                {mainTab === "weartypes" && (
                    <>
                        {/* Sub-tabs */}
                        <div className="flex gap-3 mb-5">
                            {(["all", "active"] as const).map(t => (
                                <button key={t} onClick={() => setWtTab(t)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${wtTab === t
                                        ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                                        : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300"
                                        }`}>
                                    {t === "active" ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    {loading ? t : t === "all"
                                        ? `All (${Object.keys(wearTypes).length})`
                                        : `Active (${[...activeWtIds].filter(id => wearTypes[id]).length})`}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {loading
                                ? Array.from({ length: 9 }).map((_, i) => <RowShimmer key={i} />)
                                : Object.entries(wearTypes)
                                    .filter(([id]) => wtTab === "all" || activeWtIds.has(id))
                                    .map(([id, wt]) => {
                                        const typeName = getTypeName(types, wt.type);
                                        const subtypeName = getSubtypeName(types, wt.type, wt.subtype);
                                        const itemLabel = ITEM_TYPE_LABELS[wt.itemtype] ?? "Other";
                                        const isActive = activeWtIds.has(id);
                                        const catCount = Object.values(categories).filter(c => c.weartype === id).length;
                                        const styleCount = Object.values(styles).filter(s => s.weartype === id).length;
                                        return (
                                            <div key={id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-150 flex items-center gap-4 p-3">
                                                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow">
                                                    <CardImage src={`${IMAGE_BASE}${wt.image}`} alt={wt.title} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-slate-800 text-sm truncate">{wt.title}</p>
                                                        {isActive && (
                                                            <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                                                <CheckCircle2 className="w-2 h-2" /> Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mb-1.5">
                                                        <Tag label={typeName} color="violet" />
                                                        {subtypeName && <Tag label={subtypeName} color="sky" />}
                                                        <Tag label={itemLabel} color="amber" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-400">{catCount} categories · {styleCount} styles</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                        </div>
                    </>
                )}

                {/* ── CATEGORIES ──────────────────────────────────────────── */}
                {mainTab === "categories" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {loading
                            ? Array.from({ length: 9 }).map((_, i) => <RowShimmer key={i} />)
                            : Object.entries(categories).map(([id, cat]) => {
                                const typeName = getTypeName(types, cat.type);
                                const subtypeName = getSubtypeName(types, cat.type, cat.subtype);
                                const wearTypeName = getWearTypeName(wearTypes, cat.weartype);
                                const itemLabel = ITEM_TYPE_LABELS[cat.itemtype] ?? "Other";
                                return (
                                    <div key={id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-150 flex items-center gap-4 p-3">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow">
                                            <CardImage src={`${IMAGE_BASE}${cat.image}`} alt={cat.title} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate mb-1">{cat.title}</p>
                                            <div className="flex flex-wrap gap-1 mb-1.5">
                                                <Tag label={typeName} color="violet" />
                                                {subtypeName && <Tag label={subtypeName} color="sky" />}
                                                <Tag label={itemLabel} color="amber" />
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{wearTypeName}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* ── STYLES ──────────────────────────────────────────────── */}
                {mainTab === "styles" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {loading
                            ? Array.from({ length: 9 }).map((_, i) => <RowShimmer key={i} />)
                            : Object.entries(styles).map(([id, style]) => {
                                const typeName = getTypeName(types, style.type);
                                const subtypeName = getSubtypeName(types, style.type, style.subtype);
                                const wearTypeName = getWearTypeName(wearTypes, style.weartype);
                                const itemLabel = ITEM_TYPE_LABELS[style.itemtype] ?? "Other";
                                return (
                                    <div key={id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-150 flex items-center gap-4 p-3">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow">
                                            <CardImage src={`${IMAGE_BASE}${style.image}`} alt={style.title} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate mb-1">{style.title}</p>
                                            <div className="flex flex-wrap gap-1 mb-1.5">
                                                <Tag label={typeName} color="violet" />
                                                {subtypeName && <Tag label={subtypeName} color="sky" />}
                                                <Tag label={itemLabel} color="amber" />
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{wearTypeName}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Shimmer keyframe */}
            <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </div>
    );
}
