"use client";

import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Send, Users, Bell, MousePointerClick } from "lucide-react";

// ─── Dummy data ───────────────────────────────────────────────────────────────
const notificationTrend = [
    { month: "Sep", sent: 12400, opened: 8200, clicked: 3100 },
    { month: "Oct", sent: 18600, opened: 11400, clicked: 4700 },
    { month: "Nov", sent: 15200, opened: 9800, clicked: 3900 },
    { month: "Dec", sent: 22800, opened: 15600, clicked: 6400 },
    { month: "Jan", sent: 19400, opened: 13200, clicked: 5100 },
    { month: "Feb", sent: 31200, opened: 21800, clicked: 8900 },
];

const campaignPerformance = [
    { name: "Winter Sale", sent: 8400, opened: 6100, clicked: 2400 },
    { name: "New Arrivals", sent: 6200, opened: 4300, clicked: 1800 },
    { name: "Fancy Week", sent: 9800, opened: 7200, clicked: 3100 },
    { name: "Kids Special", sent: 4100, opened: 2900, clicked: 1200 },
    { name: "Men's Eid", sent: 3700, opened: 2400, clicked: 980 },
];

const audienceBreakdown = [
    { name: "Women", value: 58, color: "#ec4899" },
    { name: "Kids", value: 27, color: "#38bdf8" },
    { name: "Men", value: 15, color: "#64748b" },
];

const topCampaignTypes = [
    { type: "Eastern Wear", campaigns: 14, rate: 72 },
    { type: "Catalogues", campaigns: 9, rate: 65 },
    { type: "Modest Wear", campaigns: 7, rate: 61 },
    { type: "Western", campaigns: 5, rate: 58 },
    { type: "Active Wear", campaigns: 3, rate: 54 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
    label, value, delta, deltaLabel, icon: Icon, accent,
}: { label: string; value: string; delta: number; deltaLabel: string; icon: any; accent: string }) {
    const up = delta >= 0;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-bold ${up ? "text-emerald-600" : "text-red-500"}`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {up ? "+" : ""}{delta}% {deltaLabel}
                </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    );
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-slate-700 mb-1.5">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-500">{p.name}:</span>
                    <span className="font-bold text-slate-800">{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
                <p className="text-slate-500 font-medium mt-1">Campaign performance overview · Last 6 months</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Notifications Sent" value="119.6K" delta={24} deltaLabel="vs last period" icon={Send} accent="bg-violet-500" />
                <KpiCard label="Total Opened" value="80.0K" delta={18} deltaLabel="vs last period" icon={Bell} accent="bg-sky-500" />
                <KpiCard label="Clicked" value="28.1K" delta={31} deltaLabel="vs last period" icon={MousePointerClick} accent="bg-emerald-500" />
                <KpiCard label="Avg. Open Rate" value="66.9%" delta={-3} deltaLabel="vs last period" icon={Users} accent="bg-amber-500" />
            </div>

            {/* Main chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Notification Trends</h2>
                        <p className="text-sm text-slate-400">Sent · Opened · Clicked over time</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={notificationTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradOpened" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradClicked" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<ChartTip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                        <Area type="monotone" dataKey="sent" name="Sent" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradSent)" />
                        <Area type="monotone" dataKey="opened" name="Opened" stroke="#38bdf8" strokeWidth={2} fill="url(#gradOpened)" />
                        <Area type="monotone" dataKey="clicked" name="Clicked" stroke="#10b981" strokeWidth={2} fill="url(#gradClicked)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Campaign bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-0.5">Campaign Breakdown</h2>
                    <p className="text-sm text-slate-400 mb-5">Top campaigns this period</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={campaignPerformance} barCategoryGap="28%" margin={{ top: 0, right: 4, left: -14, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<ChartTip />} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Bar dataKey="sent" name="Sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="opened" name="Opened" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="clicked" name="Clicked" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Audience donut */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-0.5">Audience Split</h2>
                    <p className="text-sm text-slate-400 mb-4">By product type</p>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={audienceBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                                    paddingAngle={3} dataKey="value">
                                    {audienceBreakdown.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: any) => `${v}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-2">
                        {audienceBreakdown.map(a => (
                            <div key={a.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                                    <span className="text-slate-600 font-medium">{a.name}</span>
                                </div>
                                <span className="font-bold text-slate-800">{a.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top campaign types table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Top Wear Types by Open Rate</h2>
                    <p className="text-sm text-slate-400">Ranked by average notification open rate</p>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 font-bold">
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Wear Type</th>
                            <th className="px-6 py-3">Campaigns</th>
                            <th className="px-6 py-3">Open Rate</th>
                            <th className="px-6 py-3">Bar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topCampaignTypes.map((row, i) => (
                            <tr key={row.type} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-400 font-medium text-sm">{i + 1}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{row.type}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{row.campaigns}</td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-slate-800">{row.rate}%</span>
                                </td>
                                <td className="px-6 py-4 w-40">
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${row.rate}%` }} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
