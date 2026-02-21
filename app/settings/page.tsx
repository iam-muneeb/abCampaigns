// app/settings/page.tsx  — Card dashboard
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Users, Tag, ChevronRight, Crown, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === "super_admin";

  const cards = [
    // ── Super Admin only ──────────────────────────────────
    {
      href: "/settings/app-versions",
      icon: Smartphone,
      title: "App Versions",
      description: "Track published app versions for campaign targeting and version-specific notifications.",
      accent: "from-sky-500 to-blue-600",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      badge: "Super Admin",
      show: isSuperAdmin,
    },
    {
      href: "/settings/campaign-types",
      icon: Tag,
      title: "Campaign Types",
      description: "Define and manage campaign type handles used across Firebase campaign flows.",
      accent: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      badge: "Super Admin",
      show: isSuperAdmin,
    },
    // ── All admins ────────────────────────────────────────
    {
      href: "/settings/users",
      icon: Users,
      title: "User Management",
      description: "View, edit, and manage all admin accounts and their access levels.",
      accent: "from-[#5f2299] to-[#9c40e0]",
      iconBg: "bg-[#5f2299]/10",
      iconColor: "text-[#5f2299]",
      show: true,
    },
  ].filter((c) => c.show);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your workspace configuration.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              {/* Accent bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${card.accent}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {card.badge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black rounded-md">
                        <Crown className="w-2.5 h-2.5" /> {card.badge}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{card.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}