"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Save, Calendar as CalendarIcon, Clock, Users, Database, Layers, CheckCircle2, AlertCircle, Package, Shirt, Tag, Palette, ShoppingBag, Filter, Globe, MousePointerClick } from "lucide-react";
import CustomSelect from "../../components/CustomSelect";

export default function AddCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const goToStep = (s: number) => {
    setStep(s);
    setTimeout(() => {
      if (s === 2) step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (s === 3) step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };


  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    title: "",
    body: "",
    audienceSource: "snapshot", // 'snapshot' or 'custom'
    snapshotId: "",
    appVersion: "",
    scheduleType: "now", // 'now' or 'schedule'
    scheduleDate: "",
    scheduleTime: "",
    customFilters: {
      order: "", itemtype: "", weartype: "",
      category: "", style: "", os: "", country: "", type: ""
    }
  });

  // Data State
  const [campaignTypes, setCampaignTypes] = useState<any[]>([]);
  const [appVersions, setAppVersions] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState<number | null>(null);

  // Lookup Data State
  const [itemTypes, setItemTypes] = useState<any>({});
  const [wearTypes, setWearTypes] = useState<any>({});
  const [categories, setCategories] = useState<any>({});
  const [styles, setStyles] = useState<any>({});
  const [types, setTypes] = useState<any>({});
  const [countries, setCountries] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetch("/api/campaign-types").then(res => res.json()).then(data => {
      setCampaignTypes(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, type: data[0].name }));
    }).catch(console.error);

    fetch("/api/app-versions").then(res => res.json()).then(data => setAppVersions(Array.isArray(data) ? data : [])).catch(console.error);
    fetch("/api/audience-snapshots").then(res => res.json()).then(data => setSnapshots(Array.isArray(data) ? data : [])).catch(console.error);

    // Fetch filters
    fetch("/api/filters-proxy?type=itemtypes").then(r => r.json()).then(setItemTypes).catch(() => ({}));
    fetch("/api/filters-proxy?type=weartypes").then(r => r.json()).then(setWearTypes).catch(() => ({}));
    fetch("/api/filters-proxy?type=categories").then(r => r.json()).then(setCategories).catch(() => ({}));
    fetch("/api/filters-proxy?type=styles").then(r => r.json()).then(setStyles).catch(() => ({}));
    fetch("/api/filters-proxy?type=types").then(r => r.json()).then(setTypes).catch(() => ({}));
    fetch("/api/filters-proxy?type=countries").then(r => r.json()).then(d => setCountries(Array.isArray(d) ? d : [])).catch(() => []);
  }, []);

  // Fetch count when filters change
  const fetchCount = useCallback(async () => {
    let query = "";
    if (formData.type === "App Update" && formData.appVersion) {
      // Assuming we just filter by appVersion to match the old behavior, or we get total app users and subtract?
      // For now, let's just query to see users on this version.
      query = `appVersion=${encodeURIComponent(formData.appVersion)}`;
    } else if (formData.audienceSource === "snapshot" && formData.snapshotId) {
      const snap = snapshots.find(s => s._id === formData.snapshotId);
      if (snap) {
        setUsersCount(snap.userCount);
        return;
      }
    } else if (formData.audienceSource === "custom") {
      const params = new URLSearchParams();
      Object.entries(formData.customFilters).forEach(([k, v]) => {
        if (v) params.set(k, v as string);
      });
      query = params.toString();
    }

    if (!query && formData.audienceSource !== "custom") return;

    try {
      const res = await fetch(`/api/audiences-proxy?${query}`);
      const data = await res.json();
      setUsersCount(data.length || 0);
    } catch (err) {
      console.error(err);
    }
  }, [formData, snapshots]);

  useEffect(() => {
    if (step === 2) {
      fetchCount();
    }
  }, [formData.appVersion, formData.audienceSource, formData.snapshotId, formData.customFilters, formData.type, step, fetchCount]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    // Build payload
    let scheduledAt = null;
    if (formData.scheduleType === "schedule" && formData.scheduleDate && formData.scheduleTime) {
      scheduledAt = new Date(`${formData.scheduleDate}T${formData.scheduleTime}`);
    }

    let filterParams: any = {};
    let audienceStr = "All";

    if (formData.type === "App Update") {
      filterParams = { appVersion: formData.appVersion };
      audienceStr = `App Version: ${formData.appVersion}`;
    } else if (formData.audienceSource === "snapshot") {
      const snap = snapshots.find(s => s._id === formData.snapshotId);
      if (snap) {
        filterParams = snap.filters;
        audienceStr = `Snapshot: ${snap.label}`;
      }
    } else {
      filterParams = { ...formData.customFilters };
      audienceStr = "Custom Filters";
    }

    let status = "Draft";
    if (formData.scheduleType === "schedule" && scheduledAt) {
      status = "Scheduled";
    } else if (formData.scheduleType === "now") {
      status = "Scheduled"; // Use valid enum, backend will process immediately if scheduledAt is null
    }

    const payload = {
      name: formData.name,
      title: formData.title,
      body: formData.body,
      type: formData.type,
      audience: audienceStr,
      filterParams,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
      status
    };

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
         throw new Error(data?.error || "Failed to save campaign");
      }
      if (data?.warning) {
          alert("Warning: " + data.warning);
      }
      router.push("/campaigns");
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#f4f6f8] min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto py-10 px-6 pb-32">
        <div className="mb-8 pl-2">
          <Link href="/campaigns" className="text-[#5f2299] text-sm font-bold flex items-center gap-1 hover:underline mb-4 w-max">
            <ChevronLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Campaign</h1>
          <p className="text-slate-500 text-sm mt-1">Follow the steps below to construct your new push notification campaign.</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl flex items-start gap-3 border border-rose-100 shadow-sm mx-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">

          {/* STEP 1 */}
          <div className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-sm transition-all duration-500 relative ${step >= 1 ? 'border-[#5f2299]/20 shadow-xl shadow-[#5f2299]/5' : 'border-slate-100 opacity-50'}`}>
            <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-[#5f2299] text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              Campaign Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Internal Name</label>
                <input required type="text" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Summer Sale 2026 Promo"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Type</label>
                <CustomSelect 
                  value={formData.type} 
                  onChange={(v: string) => setFormData({ ...formData, type: v })}
                  options={campaignTypes.length > 0 ? campaignTypes.map(t => ({ value: t.name, label: t.name })) : [{ value: "App Update", label: "App Update" }]}
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5" /> Directs app deep-linking behaviour.
                </p>
              </div>
            </div>

            {step === 1 && (
              <div className="mt-8 flex justify-end">
                <button type="button" onClick={() => goToStep(2)} disabled={!formData.name}
                   className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50 hover:-translate-y-0.5">
                   Continue to Audience <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {step > 1 && (
              <div className="absolute top-6 right-8 text-[#5f2299]">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* STEP 2 */}
          <div ref={step2Ref} className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-sm transition-all duration-500 relative ${step >= 2 ? 'border-[#5f2299]/20 shadow-xl shadow-[#5f2299]/5' : 'border-slate-100 opacity-60 pointer-events-none'}`}>
            <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-[#5f2299] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                Audience & Schedule
              </div>
              {usersCount !== null && step >= 2 && (
                <span className="text-xs sm:text-sm font-bold bg-[#5f2299]/10 text-[#5f2299] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {usersCount.toLocaleString()} Targeted
                </span>
              )}
            </h2>

            <div className="space-y-8">
              {/* Audience Section */}
              {formData.type === "App Update" ? (
                <div className="p-6 border border-amber-200 bg-amber-50 rounded-2xl">
                  <label className="flex text-sm font-bold text-amber-900 mb-3 items-center gap-1.5"><Layers className="w-4 h-4"/> Target App Version</label>
                  <CustomSelect 
                    value={formData.appVersion} 
                    onChange={(v: string) => setFormData({ ...formData, appVersion: v })}
                    placeholder="Select a version..."
                    options={appVersions.map(v => ({ value: v.name, label: `${v.name} (Code ${v.versionCode})` }))}
                  />
                  <p className="text-xs text-amber-700 mt-2 font-medium">Delivers to users currently logged into this exact app version build.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-max">
                    <button type="button" onClick={() => setFormData({ ...formData, audienceSource: "snapshot" })}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${formData.audienceSource === "snapshot" ? "bg-white text-[#5f2299] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                      Saved Snapshot
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, audienceSource: "custom" })}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${formData.audienceSource === "custom" ? "bg-white text-[#5f2299] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                      Custom Filters
                    </button>
                  </div>

                  {formData.audienceSource === "snapshot" ? (
                    <div className="w-full sm:w-1/2">
                      <CustomSelect 
                        value={formData.snapshotId} 
                        onChange={(v: string) => setFormData({ ...formData, snapshotId: v })}
                        placeholder="Select a saved snapshot..."
                        options={snapshots.map(s => ({ value: s._id, label: `${s.label} (${s.userCount.toLocaleString()} users)` }))}
                      />
                    </div>
                  ) : (
                    <div className="p-6 border border-slate-100 bg-slate-50/50 rounded-2xl">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Package className="w-3 h-3" /> Item</label>
                          <CustomSelect value={formData.customFilters.itemtype} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, itemtype: v}}))} placeholder="All Items" options={Object.entries(itemTypes).map(([id, it]: any) => ({value: id, label: it.title}))} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Shirt className="w-3 h-3" /> Wear</label>
                          <CustomSelect value={formData.customFilters.weartype} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, weartype: v}}))} placeholder="All Wears" options={Object.entries(wearTypes).map(([id, wt]: any) => ({value: id, label: wt.title}))} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</label>
                          <CustomSelect value={formData.customFilters.category} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, category: v}}))} placeholder="All Cats" options={Object.entries(categories).map(([id, c]: any) => ({value: id, label: c.title}))} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Palette className="w-3 h-3" /> Style</label>
                          <CustomSelect value={formData.customFilters.style} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, style: v}}))} placeholder="All Styles" options={Object.entries(styles).map(([id, s]: any) => ({value: id, label: s.title}))} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Layers className="w-3 h-3" /> Type</label>
                          <CustomSelect value={formData.customFilters.type} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, type: v}}))} placeholder="All Types" options={Object.entries(types).map(([id, t]: any) => ({value: id, label: t.title}))} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Orders</label>
                          <CustomSelect value={formData.customFilters.order} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, order: v}}))} placeholder="Any" options={[{value:"1", label:"Yes"}, {value:"0", label:"No"}]} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Filter className="w-3 h-3" /> OS</label>
                          <CustomSelect value={formData.customFilters.os} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, os: v}}))} placeholder="All OS" options={[{value:"android", label:"Android"}, {value:"iOS", label:"iOS"}]} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5f2299] mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" /> Country</label>
                          <CustomSelect value={formData.customFilters.country} onChange={(v: string) => setFormData(f => ({...f, customFilters: {...f.customFilters, country: v}}))} placeholder="All Regions" options={countries.map((c: any) => ({value: c.name, label: c.name}))} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <hr className="border-slate-100" />

              {/* Schedule Section */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-3">Schedule Push Delivery</label>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-max mb-5">
                  <button type="button" onClick={() => setFormData({ ...formData, scheduleType: "now" })}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${formData.scheduleType === "now" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    <MousePointerClick className="w-4 h-4"/> Send Right Now
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, scheduleType: "schedule" })}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${formData.scheduleType === "schedule" ? "bg-white text-[#5f2299] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    <Clock className="w-4 h-4"/> Schedule For Later
                  </button>
                </div>

                {formData.scheduleType === "schedule" && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex-1 max-w-xs relative bg-white">
                      <CalendarIcon className="w-4 h-4 text-[#5f2299] absolute left-3.5 top-3.5 pointer-events-none" />
                      <input type="date" value={formData.scheduleDate} onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })}
                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all text-sm font-bold text-slate-700" />
                    </div>
                    <div className="flex-1 max-w-xs relative bg-white">
                      <Clock className="w-4 h-4 text-[#5f2299] absolute left-3.5 top-3.5 pointer-events-none" />
                      <input type="time" value={formData.scheduleTime} onChange={e => setFormData({ ...formData, scheduleTime: e.target.value })}
                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all text-sm font-bold text-slate-700" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {step === 2 && (
              <div className="mt-8 flex justify-between items-center bg-slate-50 border border-slate-100 p-2 pl-4 rounded-xl">
                <button type="button" onClick={() => goToStep(1)}
                   className="font-bold text-slate-500 hover:text-slate-800 transition-colors text-sm">
                   Edit Details
                </button>
                <button type="button" onClick={() => goToStep(3)} disabled={!usersCount}
                   className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50 hover:-translate-y-0.5">
                   Continue to Message <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {step > 2 && (
              <div className="absolute top-6 right-8 text-[#5f2299]">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div ref={step3Ref} className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-sm transition-all duration-500 ${step >= 3 ? 'border-[#5f2299]/20 shadow-xl shadow-[#5f2299]/5' : 'border-slate-100 opacity-60 pointer-events-none'}`}>
            <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-[#5f2299] text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
              Notification Message
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notification Title</label>
                <input required maxLength={65} type="text" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Flash Sale: 50% Off Everything!"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all text-sm font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notification Body</label>
                <textarea required maxLength={240} rows={4} value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Tap to shop our latest collection before it's gone."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] transition-all resize-none text-sm font-medium" />
              </div>
            </div>

            {step === 3 && (
              <div className="mt-8 flex justify-between items-center bg-slate-50 border border-slate-100 p-2 pl-4 rounded-xl">
                <button type="button" onClick={() => goToStep(2)}
                   className="font-bold text-slate-500 hover:text-slate-800 transition-colors text-sm">
                   Back to Audience
                </button>
                <button type="button" onClick={handleSubmit} disabled={submitting || !formData.title || !formData.body || !formData.name}
                   className="px-8 py-3 bg-[#5f2299] hover:bg-[#762ec2] text-white font-extrabold rounded-xl shadow-xl shadow-[#5f2299]/30 transition-all flex items-center gap-2 text-sm disabled:opacity-50 hover:-translate-y-0.5">
                   {submitting ? "Saving..." : <><CheckCircle2 className="w-4 h-4" /> Save & {formData.scheduleType === "now" ? "Submit" : "Schedule"} Campaign</>}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
