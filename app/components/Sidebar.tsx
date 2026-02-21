// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Settings,
  Activity
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/login" || pathname === "/reset-password") return null;

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Audiences", href: "/audiences", icon: Users },
    { name: "Analytics", href: "/analytics", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const username = session?.user?.name ?? "Admin";
  const email = session?.user?.email ?? "Workspace";
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm relative z-20">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="relative w-10 h-10 mr-3 shadow-sm rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
          <Image
            src="/logo/logo.png"
            alt="AB Campaigns Logo"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-slate-800 font-bold tracking-tight leading-tight">AB Campaigns</span>
          <span className="text-[10px] text-[#5f2299] font-bold uppercase tracking-wider">Notification Manager</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                ? "bg-[#5f2299]/5 text-[#5f2299] font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#5f2299]"
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f2299] rounded-r-full shadow-[0_0_8px_#5f2299]" />
              )}
              <Icon
                className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-[#5f2299]" : "text-slate-400 group-hover:text-[#5f2299]"
                  }`}
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#5f2299]/10 border border-[#5f2299]/20 flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-xs font-bold text-[#5f2299]">{initials}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-800 truncate">{username}</span>
            <span className="text-xs text-slate-500 truncate">{email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}