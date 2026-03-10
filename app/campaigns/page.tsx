"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Send, X, AlertCircle, RefreshCw, BarChart, CheckCircle2, Navigation, MousePointerClick, Trash2, BellRing, Flame } from "lucide-react";

interface Campaign {
  _id: string;
  title: string;
  body: string;
  image_url?: string;
  type: string;
  audience: string;
  targetScreen: string;
  status: string;
  metrics: {
    delivered: number;
    opened: number;
    clicks: number;
  };
  createdAt: string;
}

const CAMPAIGN_TYPES = [
  'App Update', 'Coupon Code', 'Deals', 'Events',
  'New Articles', 'New Brand', 'Material', 'Category', 'New Features'
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image_url: "",
    type: "Events",
    audience: "All",
    targetScreen: "Home",
  });
  const [error, setError] = useState<string | null>(null);


  const fetchCampaigns = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // Poll every 10 seconds for metrics updates
    const interval = setInterval(() => {
      fetchCampaigns(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create campaign");

      setIsModalOpen(false);
      setFormData({ title: "", body: "", image_url: "", type: "Events", audience: "All", targetScreen: "Home" });
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Are you sure you want to send this push notification to users?")) return;

    try {
      setCampaigns(prev => prev.map(c => c._id === id ? { ...c, status: "Sending" } : c));
      const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(`Error sending: ${data.error || 'Unknown error'}`);
      }
      fetchCampaigns();
    } catch (err) {
      alert("Failed to send campaign");
      fetchCampaigns();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to completely delete the campaign "${title}"? This cannot be undone.`)) return;

    try {
      setCampaigns(prev => prev.filter(c => c._id !== id));
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete from server");
      }
    } catch (err) {
      alert("Failed to delete campaign");
      fetchCampaigns();
    }
  };


  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
            Campaigns
          </h1>
          <p className="text-slate-500 font-medium">Create and track push notification campaigns via Firebase.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchCampaigns()}
            disabled={refreshing}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-[#5f2299] hover:border-[#5f2299]/30 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/campaigns/quick-push"
            className="flex items-center gap-2 bg-white border border-black-300 text-black-600 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:bg-black-50 hover:border-black-400 hover:shadow-md active:scale-95"
          >
            <Flame className="w-4 h-4" />
            Quick Push
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 bg-linear-to-r from-[#5f2299] to-[#762ec2] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#5f2299]/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Create Campaign</span>
          </button>
        </div>
      </header>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border text-center py-20 rounded-2xl border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No campaigns yet</h3>
          <p className="text-slate-500 mt-1">Click top right to create your first notification campaign.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden">

              {/* Header Section */}
              <div className="p-5 pb-4">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
                        ${campaign.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                        campaign.status === 'Sending' ? 'bg-amber-100 text-amber-700' :
                          campaign.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-rose-100 text-rose-700'}
                    `}>
                      {campaign.status}
                    </span>
                    {/* Type Badge */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-widest">
                      {campaign.type}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  {campaign.image_url ? (
                    <img src={campaign.image_url} alt="Cover" className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-xs shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <BellRing className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1.5 line-clamp-1 group-hover:text-[#5f2299] transition-colors">{campaign.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{campaign.body}</p>
              </div>

              {/* Metrics Section */}
              <div className="px-5 py-3 border-y border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  <span>Metrics</span>
                  <span className="normal-case font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {campaign.audience} • {campaign.targetScreen}
                  </span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5 uppercase tracking-wide"><Navigation className="w-3 h-3 text-slate-400" /> Delivered</span>
                    <span className="text-xl font-bold text-slate-800">{campaign.metrics.delivered.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mb-0.5 uppercase tracking-wide"><CheckCircle2 className="w-3 h-3" /> Opened</span>
                    <span className="text-xl font-bold text-emerald-700">{campaign.metrics.opened.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mb-0.5 uppercase tracking-wide"><MousePointerClick className="w-3 h-3" /> Clicks</span>
                    <span className="text-xl font-bold text-blue-700">{campaign.metrics.clicks.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 mt-auto bg-white flex items-center justify-end gap-2 text-sm z-10">
                {campaign.status === 'Draft' ? (
                  <>
                    <button
                      onClick={() => handleDelete(campaign._id, campaign.title)}
                      className="p-2 mr-auto rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSend(campaign._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white bg-slate-900 border border-slate-800 hover:bg-black transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" /> Send Now
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-400 font-medium mr-auto uppercase tracking-wider">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(campaign._id, campaign.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      title="Delete Sent Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
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
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notification Title</label>
                  <input
                    required
                    maxLength={65}
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Flash Sale: 50% Off Everything!"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notification Body</label>
                  <textarea
                    required
                    maxLength={240}
                    rows={3}
                    value={formData.body}
                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Tap to shop our latest collection before it's gone."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all"
                  >
                    {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Target App Screen</label>
                  <input
                    required
                    type="text"
                    value={formData.targetScreen}
                    onChange={e => setFormData({ ...formData, targetScreen: e.target.value })}
                    placeholder="e.g. Home, Cart, Category/123"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Audience Topic</label>
                  <input
                    required
                    type="text"
                    value={formData.audience}
                    onChange={e => setFormData({ ...formData, audience: e.target.value })}
                    placeholder="e.g. All, PremiumUsers"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-[#5f2299] hover:bg-[#762ec2] text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
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