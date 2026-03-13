"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BellRing, MousePointerClick, TrendingUp, Users, RefreshCw } from "lucide-react";

export default function Home() {
  const [statsData, setStatsData] = useState({
    totalSent: 0,
    openRate: 0,
    totalUsers: 0,
    conversionRate: 0,
    recentActivity: [] as any[],
    chartData: [0, 0, 0, 0, 0, 0, 0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, qRes, aRes] = await Promise.all([
          fetch("/api/campaigns").catch(() => ({ ok: false, json: async () => [] as any[] })),
          fetch("/api/quick-push").catch(() => ({ ok: false, json: async () => [] as any[] })),
          fetch("/api/audiences-proxy").catch(() => ({ ok: false, json: async () => [] as any[] }))
        ]);
        
        const campaigns = cRes.ok ? await cRes.json() : [];
        const quickPushes = qRes.ok ? await qRes.json() : [];
        const audiences = aRes.ok ? await aRes.json() : [];

        let totalSent = 0;
        let totalOpened = 0;
        let totalClicks = 0;

        const campaignArr = Array.isArray(campaigns) ? campaigns : [];
        const qpArr = Array.isArray(quickPushes) ? quickPushes : [];
        const userCount = Array.isArray(audiences) ? audiences.length : 0;

        campaignArr.forEach(c => {
          totalSent += c.metrics?.delivered || 0;
          totalOpened += c.metrics?.opened || 0;
          totalClicks += c.metrics?.clicks || 0;
        });

        qpArr.forEach(q => {
          totalSent += q.successCount || 0;
          totalOpened += q.metrics?.opened || 0;
          totalClicks += q.metrics?.clicks || 0;
        });

        const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
        const conversionRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

        const activity = [
          ...campaignArr.map(c => ({ title: c.title, sub: `Campaign • ${c.type}`, time: new Date(c.createdAt), isQuick: false, metric: `${c.metrics?.delivered || 0} Delivered` })),
          ...qpArr.map(q => ({ title: q.title, sub: `Quick Push • ${q.successCount} users`, time: new Date(q.createdAt), isQuick: true, metric: `${q.successCount} Delivered` }))
        ].sort((a,b) => b.time.getTime() - a.time.getTime()).slice(0, 4);

        const past7Days = Array.from({length: 7}, (_, i) => {
           const d = new Date();
           d.setDate(d.getDate() - (6 - i));
           return d.toLocaleDateString();
        });

        const chartAgg = past7Days.map(dStr => {
           let count = 0;
           campaignArr.forEach(c => {
              if (new Date(c.createdAt).toLocaleDateString() === dStr) count += c.metrics?.delivered || 0;
           });
           qpArr.forEach(q => {
              if (new Date(q.createdAt).toLocaleDateString() === dStr) count += q.successCount || 0;
           });
           return count;
        });
        
        const maxChart = Math.max(...chartAgg, 1);
        const chartData = chartAgg.map(v => Math.round((v / maxChart) * 100));

        setStatsData({
          totalSent,
          openRate: Number(openRate.toFixed(1)),
          totalUsers: userCount,
          conversionRate: Number(conversionRate.toFixed(1)),
          recentActivity: activity,
          chartData: chartData
        });
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: "Total Sent Messages", value: statsData.totalSent.toLocaleString(), icon: BellRing, color: "text-[#5f2299]", bg: "bg-[#5f2299]/10" },
    { label: "Avg. Open Rate", value: `${statsData.openRate}%`, icon: MousePointerClick, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Total Users", value: statsData.totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Conversion Rate", value: `${statsData.conversionRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Here is what is happening with your notifications today.</p>
        </div>
        <span className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Online
        </span>
      </header>

      {/* Loading Overlay */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 text-[#5f2299] animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats — 2 cols mobile, 4 desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 sm:p-6 shadow-sm hover:border-[#5f2299]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-transparent to-slate-50 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight mb-0.5">{stat.value}</h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-tight">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-5 sm:p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5f2299] to-purple-300" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">Engagement Overview</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Messages Delivered over the last 7 days</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl px-4 py-2 outline-none focus:border-[#5f2299] w-full sm:w-auto shadow-sm">
                  <option>Last 7 Days</option>
                </select>
              </div>
              
              <div className="h-44 sm:h-64 flex items-end justify-between gap-2 sm:gap-3 mt-8">
                {statsData.chartData.map((h, i) => (
                  <div key={i} className="w-full flex flex-col items-center gap-2 group/bar">
                    <div className="w-full relative bg-slate-50 rounded-t-xl h-full flex items-end overflow-hidden border border-slate-100/50">
                      <div className="w-full bg-[#5f2299] rounded-t-xl group-hover/bar:bg-[#762ec2] transition-all duration-700 relative shadow-sm" style={{ height: `${Math.max(h, 4)}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">D{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-6 sm:mb-8">Recent Activity</h2>
              <div className="space-y-5">
                {statsData.recentActivity.length > 0 ? (
                  statsData.recentActivity.map((item, i) => {
                    const Icon = item.isQuick ? TrendingUp : BellRing;
                    const bg = item.isQuick ? "bg-amber-50" : "bg-[#5f2299]/10";
                    const color = item.isQuick ? "text-amber-600" : "text-[#5f2299]";
                    return (
                      <div key={i} className="flex items-start gap-3 group">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 border border-transparent group-hover:border-[#5f2299]/20 transition-colors`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-[#5f2299] transition-colors">{item.title}</h4>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.sub}</p>
                          <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded">{item.metric}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{timeAgo(item.time)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No recent activity found.</p>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000);
  if (day >= 1) return `${day}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return "just now";
}