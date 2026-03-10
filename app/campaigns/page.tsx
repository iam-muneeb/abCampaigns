"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Send, X, AlertCircle, RefreshCw, BarChart, CheckCircle2,
  Navigation, MousePointerClick, Trash2, BellRing, Flame,
  Users, Crown, BadgeCheck, Hash, Calendar, Clock,
  ChevronRight, Zap, TrendingUp, AlertOctagon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campaign {
  _id: string;
  title: string;
  body: string;
  image_url?: string;
  type: string;
  audience: string;
  targetScreen: string;
  status: string;
  metrics: { delivered: number; opened: number; clicks: number };
  createdAt: string;
}

interface QuickPushRecord {
  _id: string;
  title: string;
  body: string;
  recipientIds: string[];
  totalTokens: number;
  successCount: number;
  failureCount: number;
  sentBy: { id: string; name: string; role: string };
  metrics: { opened: number; clicks: number };
  createdAt: string;
}

const CAMPAIGN_TYPES = [
  'App Update', 'Coupon Code', 'Deals', 'Events',
  'New Articles', 'New Brand', 'Material', 'Category', 'New Features'
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000);
  if (day >= 1) return `${day}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return "just now";
}
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }); }

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-600",
    Sending: "bg-amber-100 text-amber-700",
    Sent: "bg-emerald-100 text-emerald-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Failed: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// ─── Metric cell ──────────────────────────────────────────────────────────────
function Metric({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-0.5 mb-0.5 ${color}`}>
        <Icon className="w-2.5 h-2.5" />{label}
      </span>
      <span className="text-xl font-black text-slate-800">{value.toLocaleString()}</span>
    </div>
  );
}

// ─── Compact Campaign card ────────────────────────────────────────────────────
function CampaignCard({ c, onClick }: { c: Campaign; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 hover:border-[#5f2299]/20 hover:shadow-md transition-all duration-200 overflow-hidden group"
      style={{ animation: "fadeUp .25s ease both" }}>
      <div className="h-0.5 w-full bg-linear-to-r from-[#5f2299] to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Icon / image */}
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
          {c.image_url
            ? <img src={c.image_url} alt="" className="w-full h-full object-cover" />
            : <BellRing className="w-4 h-4 text-slate-300" />}
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={c.status} />
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">{c.type}</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">{c.title}</p>
          <p className="text-xs text-slate-400 truncate leading-tight mt-0.5">{c.body}</p>
        </div>
        {/* Mini metrics */}
        <div className="shrink-0 text-right hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-xs font-black text-slate-700">{c.metrics.delivered.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">delivered</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-[#5f2299]/50 transition-colors shrink-0" />
      </div>
    </button>
  );
}

// ─── Compact Quick Push card ──────────────────────────────────────────────────
function QPCard({ q, onClick, onDelete }: { q: QuickPushRecord; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const isSuper = q.sentBy?.role === "super_admin";
  const deliveryPct = q.totalTokens > 0 ? Math.round((q.successCount / q.totalTokens) * 100) : 0;
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
      style={{ animation: "fadeUp .25s ease both" }}>
      <div className="h-0.5 w-full bg-linear-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4 text-amber-500" />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">Quick Push</span>
            {isSuper
              ? <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600"><Crown className="w-2.5 h-2.5" />{q.sentBy?.name}</span>
              : <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500"><BadgeCheck className="w-2.5 h-2.5" />{q.sentBy?.name}</span>
            }
          </div>
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">{q.title}</p>
          <p className="text-xs text-slate-400 truncate leading-tight mt-0.5">{q.body}</p>
        </div>
        {/* Mini metrics */}
        <div className="shrink-0 text-right hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-xs font-black text-emerald-600">{q.successCount.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">{deliveryPct}% delivered</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-amber-400 transition-colors shrink-0" />
      </div>
    </button>
  );
}

// ─── Detail panel — Campaign ──────────────────────────────────────────────────
function CampaignDetail({ c, onClose, onDelete, onSend }: {
  c: Campaign; onClose: () => void;
  onDelete: (id: string, title: string) => void;
  onSend: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
          {c.image_url ? <img src={c.image_url} alt="" className="w-full h-full object-cover" /> : <BellRing className="w-5 h-5 text-slate-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={c.status} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">{c.type}</span>
          </div>
          <h2 className="font-extrabold text-slate-900 text-base leading-tight">{c.title}</h2>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Body */}
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Message</p>
          <p className="text-sm text-slate-700 leading-relaxed">{c.body}</p>
        </div>

        {/* Metrics grid */}
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Metrics</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Navigation, label: "Delivered", value: c.metrics.delivered, color: "text-slate-500" },
              { icon: CheckCircle2, label: "Opened", value: c.metrics.opened, color: "text-emerald-600" },
              { icon: MousePointerClick, label: "Clicks", value: c.metrics.clicks, color: "text-blue-600" },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-slate-100 py-4 px-3 text-center">
                <Metric icon={m.icon} label={m.label} value={m.value} color={m.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {[
            { label: "Audience", value: c.audience },
            { label: "Target Screen", value: c.targetScreen },
            { label: "Date", value: fmtDate(c.createdAt) },
            { label: "Time", value: fmtTime(c.createdAt) },
          ].map(d => (
            <div key={d.label} className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
              <span className="font-semibold text-slate-400">{d.label}</span>
              <span className="font-bold text-slate-700">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2">
        <button onClick={() => onDelete(c._id, c.title)}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
        {c.status === "Draft" && (
          <button onClick={() => onSend(c._id)}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-black flex items-center justify-center gap-1.5 transition-colors">
            <Send className="w-4 h-4" /> Send Now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Detail panel — Quick Push ────────────────────────────────────────────────
function QPDetail({ q, onClose, onDelete }: {
  q: QuickPushRecord; onClose: () => void; onDelete: (id: string) => void;
}) {
  const deliveryPct = q.totalTokens > 0 ? Math.round((q.successCount / q.totalTokens) * 100) : 0;
  const failPct = q.totalTokens > 0 ? Math.round((q.failureCount / q.totalTokens) * 100) : 0;
  const isSuper = q.sentBy?.role === "super_admin";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-700">Quick Push</span>
            {isSuper
              ? <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" />{q.sentBy?.name}</span>
              : <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5"><BadgeCheck className="w-2.5 h-2.5" />{q.sentBy?.name}</span>
            }
          </div>
          <h2 className="font-extrabold text-slate-900 text-base leading-tight">{q.title}</h2>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Body */}
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Message</p>
          <p className="text-sm text-slate-700 leading-relaxed">{q.body}</p>
        </div>

        {/* Delivery metrics */}
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Delivery</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sent", value: q.totalTokens, color: "text-slate-700", bg: "bg-slate-50" },
              { label: "Delivered", value: q.successCount, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Failed", value: q.failureCount, color: "text-rose-600", bg: "bg-rose-50" },
            ].map(m => (
              <div key={m.label} className={`${m.bg} rounded-xl border border-slate-100 py-4 px-3 text-center`}>
                <div className={`text-2xl font-black ${m.color} leading-none`}>{m.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Delivery bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
              <span>{deliveryPct}% delivered</span>
              <span>{failPct}% failed</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${deliveryPct}%` }} />
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Engagement</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: TrendingUp, label: "Opened", value: q.metrics?.opened ?? 0, color: "text-emerald-600" },
              { icon: MousePointerClick, label: "Clicks", value: q.metrics?.clicks ?? 0, color: "text-blue-600" },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-slate-100 py-4 px-3 text-center">
                <Metric icon={m.icon} label={m.label} value={m.value} color={m.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Recipients */}
        {q.recipientIds?.length > 0 && (
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Recipients ({q.recipientIds.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {q.recipientIds.slice(0, 20).map(id => (
                <span key={id} className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                  <Hash className="w-2 h-2" />{id}
                </span>
              ))}
              {q.recipientIds.length > 20 && (
                <span className="text-[10px] text-slate-400 font-semibold self-center">+{q.recipientIds.length - 20} more</span>
              )}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="space-y-2">
          {[
            { label: "Date", value: fmtDate(q.createdAt) },
            { label: "Time", value: fmtTime(q.createdAt) },
            { label: "Sent by", value: q.sentBy?.name || "Unknown" },
            { label: "Role", value: q.sentBy?.role || "—" },
          ].map(d => (
            <div key={d.label} className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
              <span className="font-semibold text-slate-400">{d.label}</span>
              <span className="font-bold text-slate-700">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100">
        <button onClick={() => onDelete(q._id)}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors">
          <Trash2 className="w-4 h-4" /> Delete Record
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "campaigns" | "quickpush";

export default function CampaignsPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [qpRecords, setQpRecords] = useState<QuickPushRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail panel
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedQP, setSelectedQP] = useState<QuickPushRecord | null>(null);

  // Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "", image_url: "", type: "Events", audience: "All", targetScreen: "Home" });
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const [campRes, qpRes] = await Promise.all([
      fetch("/api/campaigns").catch(() => null),
      fetch("/api/quick-push").catch(() => null),
    ]);
    if (campRes?.ok) setCampaigns(await campRes.json());
    if (qpRes?.ok) setQpRecords(await qpRes.json());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(() => fetchAll(true), 12000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    const res = await fetch("/api/campaigns", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) { setError("Failed to create campaign"); setSubmitting(false); return; }
    setIsModalOpen(false);
    setFormData({ title: "", body: "", image_url: "", type: "Events", audience: "All", targetScreen: "Home" });
    fetchAll();
    setSubmitting(false);
  };

  const handleSend = async (id: string) => {
    if (!confirm("Send this campaign to all users?")) return;
    setCampaigns(prev => prev.map(c => c._id === id ? { ...c, status: "Sending" } : c));
    setSelectedCampaign(prev => prev && prev._id === id ? { ...prev, status: "Sending" } : prev);
    await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    fetchAll(true);
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setCampaigns(prev => prev.filter(c => c._id !== id));
    if (selectedCampaign?._id === id) setSelectedCampaign(null);
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
  };

  const handleDeleteQP = async (id: string) => {
    if (!confirm("Delete this Quick Push record?")) return;
    setQpRecords(prev => prev.filter(q => q._id !== id));
    if (selectedQP?._id === id) setSelectedQP(null);
    await fetch(`/api/quick-push/${id}`, { method: "DELETE" });
  };

  const detailOpen = !!selectedCampaign || !!selectedQP;

  return (
    <div className="flex h-full overflow-hidden">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }`}</style>

      {/* ── Main column ─────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${detailOpen ? "lg:mr-[380px]" : ""}`}>

        {/* Header */}
        <div className="px-4 sm:px-8 pt-4 sm:pt-7 pb-3 sm:pb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Campaigns</h1>
            <p className="text-slate-400 font-medium text-sm">Send and track push notifications.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchAll()} disabled={refreshing}
              className="w-9 h-9 bg-white border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:text-[#5f2299] hover:border-[#5f2299]/30 transition-all shadow-sm active:scale-95">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <Link href="/campaigns/quick-push"
              className="flex items-center gap-2 bg-white border border-amber-300 text-amber-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:bg-amber-50 hover:shadow-md active:scale-95">
              <Flame className="w-4 h-4" /> Quick Push
            </Link>
            <button onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-linear-to-r from-[#5f2299] to-[#762ec2] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#5f2299]/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Create Campaign</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-8 mb-3 sm:mb-4 flex items-center gap-1 shrink-0">
          {([
            { key: "campaigns" as Tab, label: "Campaigns", count: campaigns.length, color: "text-[#5f2299]", activeBg: "bg-[#5f2299]" },
            { key: "quickpush" as Tab, label: "Quick Push", count: qpRecords.length, color: "text-amber-600", activeBg: "bg-amber-500" },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.key
                ? `${t.activeBg} text-white shadow-md`
                : "text-slate-500 hover:bg-slate-100"}`}>
              {t.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-6 sm:pb-8">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
            </div>
          ) : tab === "campaigns" ? (
            campaigns.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <BarChart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-500">No campaigns yet</h3>
                <p className="text-sm text-slate-400">Click Create Campaign to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.map(c => (
                  <CampaignCard key={c._id} c={c} onClick={() => { setSelectedQP(null); setSelectedCampaign(c); }} />
                ))}
              </div>
            )
          ) : (
            qpRecords.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <Flame className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-500">No quick pushes yet</h3>
                <p className="text-sm text-slate-400">Use the Quick Push button to send instant notifications.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {qpRecords.map((q, i) => (
                  <QPCard key={q._id} q={q}
                    onClick={() => { setSelectedCampaign(null); setSelectedQP(q); }}
                    onDelete={e => { e.stopPropagation(); handleDeleteQP(q._id); }} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────── */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-slate-100 shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-in-out pt-14 sm:pt-0 ${detailOpen ? "translate-x-0" : "translate-x-full"}`}>
        {selectedCampaign && (
          <CampaignDetail c={selectedCampaign} onClose={() => setSelectedCampaign(null)}
            onDelete={handleDeleteCampaign} onSend={handleSend} />
        )}
        {selectedQP && (
          <QPDetail q={selectedQP} onClose={() => setSelectedQP(null)} onDelete={handleDeleteQP} />
        )}
      </div>

      {detailOpen && (
        <div onClick={() => { setSelectedCampaign(null); setSelectedQP(null); }}
          className="fixed inset-0 bg-slate-900/30 z-30 sm:z-10" />
      )}

      {/* ── Create Campaign Modal ─────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-slate-800">Create Push Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8">
              {error && (
                <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl flex items-start gap-3 border border-rose-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm font-medium">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notification Title</label>
                  <input required maxLength={65} type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Flash Sale: 50% Off Everything!"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notification Body</label>
                  <textarea required maxLength={240} rows={3} value={formData.body}
                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Tap to shop our latest collection before it's gone."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all">
                    {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Target Screen</label>
                  <input required type="text" value={formData.targetScreen}
                    onChange={e => setFormData({ ...formData, targetScreen: e.target.value })}
                    placeholder="e.g. Home, Cart, Category/123"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Image URL (Optional)</label>
                  <input type="url" value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Audience Topic</label>
                  <input required type="text" value={formData.audience}
                    onChange={e => setFormData({ ...formData, audience: e.target.value })}
                    placeholder="e.g. All, PremiumUsers"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-3 bg-[#5f2299] hover:bg-[#762ec2] text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all">
                  {submitting ? "Saving..." : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}