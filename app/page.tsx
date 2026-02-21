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
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Overview
          </h1>
          <p className="text-slate-500 font-medium">Here is what is happening with your notifications today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </span>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Decorative Background Gradient */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-transparent to-slate-50 opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stat.value}</h3>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Activity Chart (CSS Mockup) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5f2299] to-purple-300" />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Engagement Overview</h2>
              <p className="text-sm text-slate-500">Opens and clicks over the last 7 days</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#5f2299] focus:ring-1 focus:ring-[#5f2299]">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          {/* CSS-based Bar Chart Simulation */}
          <div className="h-64 flex items-end justify-between gap-2 mt-4">
            {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-[#5f2299] rounded-t-md transition-all duration-1000 group-hover:bg-[#762ec2] relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent to-white/20" />
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Campaigns</h2>
          <div className="space-y-6">
            
            {/* Activity Item 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#5f2299]/10 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-4 h-4 text-[#5f2299]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Eid Pre-Sale Alert</h4>
                <p className="text-xs text-slate-500 mt-0.5">Sent to 4,500 users • 45% Open Rate</p>
                <span className="text-[10px] text-slate-400 font-semibold mt-2 block">2 hours ago</span>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Abandoned Cart Automations</h4>
                <p className="text-xs text-slate-500 mt-0.5">142 triggered today • 12 Recovered</p>
                <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Ongoing</span>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">New App Update Available</h4>
                <p className="text-xs text-slate-500 mt-0.5">Sent to All Users • 89% Delivery</p>
                <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Yesterday</span>
              </div>
            </div>

          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-bold text-[#5f2299] bg-[#5f2299]/5 hover:bg-[#5f2299]/10 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>

      </div>
    </div>
  );
}