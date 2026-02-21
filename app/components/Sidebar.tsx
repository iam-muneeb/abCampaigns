// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Megaphone, Users, Settings, Activity,
  LogOut, UserCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import EditProfileModal, { EditableUser } from "./EditProfileModal";
import ViewProfileModal from "./ViewProfileModal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<EditableUser | null>(null);
  const [showView, setShowView] = useState(false);  // View Profile modal
  const [showEdit, setShowEdit] = useState(false);  // Edit Profile modal
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUserId = (session?.user as any)?.id as string | undefined;

  // Auto-collapse on tablet/mobile
  useEffect(() => {
    const check = () => { if (window.innerWidth < 1024) setCollapsed(true); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close popover on outside click — must be before any early return
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const openViewProfile = async () => {
    setMenuOpen(false);
    if (!currentUserId) return;
    const res = await fetch("/api/users");
    const users: EditableUser[] = await res.json();
    const me = users.find((u) => u._id === currentUserId);
    if (me) {
      setProfileUser(me);
      setShowView(true);
    }
  };

  const handleSaved = (updated: EditableUser) => {
    setProfileUser(updated);
    setShowEdit(false);
    setShowView(false);
    router.refresh();
  };

  return (
    <>
      {/* ── View Profile Modal (read-only) ──────────────────────── */}
      {showView && profileUser && (
        <ViewProfileModal
          user={profileUser}
          onClose={() => setShowView(false)}
          onEdit={() => { setShowView(false); setShowEdit(true); }}
        />
      )}

      {/* ── Edit Profile Modal (shared with settings) ───────────── */}
      {showEdit && profileUser && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm relative z-20 transition-all duration-300 ease-in-out ${collapsed ? "w-[72px]" : "w-64"}`}>

        {/* Brand Header */}
        <div className={`h-20 flex items-center border-b border-slate-100 relative ${collapsed ? "justify-center" : "px-5"}`}>
          <div className="relative w-9 h-9 shadow-sm rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
            <Image src="/logo/logo.png" alt="AB Campaigns" fill className="object-cover" sizes="36px" />
          </div>
          {!collapsed && (
            <div className="flex flex-col justify-center ml-3 overflow-hidden">
              <span className="text-slate-800 font-bold tracking-tight leading-tight whitespace-nowrap">AB Campaigns</span>
              <span className="text-[10px] text-[#5f2299] font-bold uppercase tracking-wider">Notification Manager</span>
            </div>
          )}
          {/* Toggle button */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-[#5f2299] hover:border-[#5f2299]/40 transition-all z-30"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-5 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} title={collapsed ? item.name : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 group relative overflow-hidden ${collapsed ? "justify-center h-11 w-11 mx-auto" : "px-4 py-3"
                  } ${isActive ? "bg-[#5f2299]/5 text-[#5f2299] font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-[#5f2299]"}`}>
                {isActive && !collapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f2299] rounded-r-full shadow-[0_0_8px_#5f2299]" />}
                {isActive && collapsed && <div className="absolute inset-0 bg-[#5f2299]/10 rounded-xl" />}
                <Icon className={`shrink-0 transition-colors ${collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"} ${isActive ? "text-[#5f2299]" : "text-slate-400 group-hover:text-[#5f2299]"}`} />
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <div className={`border-t border-slate-100 bg-slate-50/50 relative ${collapsed ? "p-2" : "p-4"}`} ref={menuRef}>
          {/* Popover menu */}
          {menuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40">
              <button onClick={openViewProfile}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#5f2299]/5 hover:text-[#5f2299] transition-colors">
                <UserCircle className="w-4 h-4 text-[#5f2299] shrink-0" />
                {!collapsed && "View Profile"}
              </button>
              <div className="border-t border-slate-100" />
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && "Logout"}
              </button>
            </div>
          )}

          {/* Profile card */}
          <button onClick={() => setMenuOpen((o) => !o)}
            title={collapsed ? `${username} — options` : undefined}
            className={`flex items-center bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${collapsed ? "w-11 h-11 justify-center mx-auto" : "w-full px-4 py-3"
              } ${menuOpen ? "border-[#5f2299]/40" : "border-slate-200"}`}>
            <div className={`rounded-full bg-[#5f2299]/10 border border-[#5f2299]/20 flex items-center justify-center shrink-0 ${collapsed ? "w-8 h-8" : "w-9 h-9 mr-3"}`}>
              <span className="text-xs font-bold text-[#5f2299]">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm font-semibold text-slate-800 truncate">{username}</span>
                <span className="text-xs text-slate-500 truncate">{email}</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}