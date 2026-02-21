// app/campaigns/page.tsx
import { Plus } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
            Campaigns
          </h1>
          <p className="text-slate-500">Manage and schedule your manual push notifications.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#5f2299] hover:bg-[#762ec2] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-[#5f2299]/20 hover:shadow-lg hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </header>

      {/* Placeholder for the creative campaign list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#5f2299]/10 rounded-xl flex items-center justify-center mb-4">
              <span className="text-[#5f2299] font-bold">0{item}</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Eid Special Sale</h3>
            <p className="text-sm text-slate-500 mb-4">Scheduled for tomorrow at 8:00 PM.</p>
            <div className="inline-block px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-100">
              Scheduled
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}