"use client";

import { Activity, MousePointerClick, Send, Users } from "lucide-react";

export default function CampaignStats() {
  const stats = [
    { label: "Total Sent (30d)", value: "124.5K", icon: Send, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Avg. Open Rate", value: "24.8%", icon: MousePointerClick, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Active Audiences", value: "8,204", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Queue Status", value: "Idle", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-700/80 transition-all duration-300 group"
          >
            {/* Soft Glow Effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${stat.bg.replace('/10', '')}`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-100 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border border-white/5`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}