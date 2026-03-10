// app/page.tsx
import { ArrowUpRight, BellRing, MousePointerClick, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Total Sent (30d)", value: "124.5K", trend: "+12.5%", icon: BellRing, color: "text-[#5f2299]", bg: "bg-[#5f2299]/10" },
    { label: "Avg. Open Rate", value: "24.8%", trend: "+2.1%", icon: MousePointerClick, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Active Audiences", value: "8,204", trend: "+453", icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Conversion Rate", value: "3.2%", trend: "+0.4%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Here is what is happening with your notifications today.</p>
        </div>
        <span className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Online
        </span>
      </header>

      {/* Stats — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-transparent to-slate-50 opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                    {stat.trend} <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-0.5">{stat.value}</h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5f2299] to-purple-300" />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Engagement Overview</h2>
              <p className="text-xs sm:text-sm text-slate-500">Opens and clicks over the last 7 days</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#5f2299] w-full sm:w-auto">
              <option>Last 7 Days</option><option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-40 sm:h-64 flex items-end justify-between gap-1 sm:gap-2">
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-1 group">
                <div className="w-full relative bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                  <div className="w-full bg-[#5f2299] rounded-t-md group-hover:bg-[#762ec2] transition-all duration-700 relative" style={{ height: `${h}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                  </div>
                </div>
                <span className="text-[9px] sm:text-xs text-slate-400 font-medium">D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">Recent Campaigns</h2>
          <div className="space-y-4">
            {[
              { icon: BellRing, bg: "bg-[#5f2299]/10", color: "text-[#5f2299]", title: "Eid Pre-Sale Alert", sub: "Sent to 4,500 • 45% Open", time: "2 hours ago" },
              { icon: TrendingUp, bg: "bg-amber-50", color: "text-amber-600", title: "Abandoned Cart", sub: "142 triggered • 12 Recovered", time: "Ongoing" },
              { icon: Users, bg: "bg-blue-50", color: "text-blue-600", title: "App Update Available", sub: "All Users • 89% Delivery", time: "Yesterday" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 py-2.5 text-sm font-bold text-[#5f2299] bg-[#5f2299]/5 hover:bg-[#5f2299]/10 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}