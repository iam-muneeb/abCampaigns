// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Megaphone, Users, Settings, Activity,
  LogOut, UserCircle, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import EditProfileModal, { EditableUser } from "./EditProfileModal";
import ViewProfileModal from "./ViewProfileModal";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Audiences", href: "/audiences", icon: Users },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Desktop: collapsed icon-only mode
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: drawer open/close
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Profile popover
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Profile modals
  const [profileUser, setProfileUser] = useState<EditableUser | null>(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const currentUserId = (session?.user as any)?.id as string | undefined;
  const username = session?.user?.name ?? "Admin";
  const email = session?.user?.email ?? "Workspace";
  const initials = username.substring(0, 2).toUpperCase();

  // Auto-collapse desktop sidebar on tablet
  useEffect(() => {
    const check = () => { if (window.innerWidth < 1024) setCollapsed(true); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close profile popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  if (pathname === "/login" || pathname === "/reset-password") return null;

  const openViewProfile = async () => {
    setMenuOpen(false);
    if (!currentUserId) return;
    const res = await fetch("/api/users");
    const users: EditableUser[] = await res.json();
    const me = users.find((u) => u._id === currentUserId);
    if (me) { setProfileUser(me); setShowView(true); }
  };

  const handleSaved = (updated: EditableUser) => {
    setProfileUser(updated);
    setShowEdit(false);
    setShowView(false);
    router.refresh();
  };

  // ── Shared nav link renderer ────────────────────────────────────────────────
  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    const Icon = item.icon;
    if (mobile) {
      // Bottom tab bar item
      return (
        <Link href={item.href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive ? "text-[#5f2299]" : "text-slate-400"}`}>
          <Icon className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide">{item.name}</span>
          {isActive && <div className="w-1 h-1 rounded-full bg-[#5f2299]" />}
        </Link>
      );
    }
    // Sidebar nav link
    return (
      <Link href={item.href} title={collapsed ? item.name : undefined}
        className={`flex items-center rounded-xl transition-all duration-200 group relative overflow-hidden ${collapsed ? "justify-center h-11 w-11 mx-auto" : "px-4 py-3"
          } ${isActive ? "bg-[#5f2299]/5 text-[#5f2299] font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-[#5f2299]"}`}>
        {isActive && !collapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f2299] rounded-r-full shadow-[0_0_8px_#5f2299]" />}
        {isActive && collapsed && <div className="absolute inset-0 bg-[#5f2299]/10 rounded-xl" />}
        <Icon className={`shrink-0 transition-colors ${collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"} ${isActive ? "text-[#5f2299]" : "text-slate-400 group-hover:text-[#5f2299]"}`} />
        {!collapsed && <span className="text-sm">{item.name}</span>}
      </Link>
    );
  };

  // ── Profile footer (reusable in both sidebar + drawer) ─────────────────────
  const ProfileFooter = () => (
    <div className={`border-t border-slate-100 bg-slate-50/50 relative ${collapsed ? "p-2" : "p-4"}`} ref={menuRef}>
      {menuOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40">
          <button onClick={openViewProfile}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#5f2299]/5 hover:text-[#5f2299] transition-colors">
            <UserCircle className="w-4 h-4 text-[#5f2299] shrink-0" /> View Profile
          </button>
          <div className="border-t border-slate-100" />
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" /> Logout
          </button>
        </div>
      )}
      <button onClick={() => setMenuOpen((o) => !o)}
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
  );

  return (
    <>
      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showView && profileUser && (
        <ViewProfileModal user={profileUser} onClose={() => setShowView(false)}
          onEdit={() => { setShowView(false); setShowEdit(true); }} />
      )}
      {showEdit && profileUser && (
        <EditProfileModal user={profileUser} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE: Top bar + Drawer + Bottom tab bar
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
            <Image src="/logo/logo.png" alt="AB Campaigns" fill className="object-cover" sizes="28px" />
          </div>
          <span className="font-bold text-slate-800 text-sm">AB Campaigns</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Drawer header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
              <Image src="/logo/logo.png" alt="AB Campaigns" fill className="object-cover" sizes="28px" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm leading-tight">AB Campaigns</div>
              <div className="text-[9px] text-[#5f2299] font-bold uppercase tracking-wider">Notification Manager</div>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden ${isActive ? "bg-[#5f2299]/5 text-[#5f2299]" : "text-slate-500 hover:bg-slate-50 hover:text-[#5f2299]"
                  }`}>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f2299] rounded-r-full" />}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#5f2299]" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Drawer profile footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button onClick={openViewProfile}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#5f2299]/5 hover:text-[#5f2299] transition-colors">
            <UserCircle className="w-5 h-5 text-[#5f2299]" /> View Profile
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#5f2299]/10 border border-[#5f2299]/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#5f2299]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{username}</div>
              <div className="text-xs text-slate-400 truncate">{email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-1 shadow-lg safe-b">
        {navItems.map(item => <NavLink key={item.name} item={item} mobile />)}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP: Classic sidebar
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex h-screen bg-white border-r border-slate-200 flex-col shadow-sm relative z-20 transition-all duration-300 ease-in-out ${collapsed ? "w-[72px]" : "w-64"}`}>
        {/* Brand */}
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
          <button onClick={() => setCollapsed(c => !c)} title={collapsed ? "Expand" : "Collapse"}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-[#5f2299] hover:border-[#5f2299]/40 transition-all z-30">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-5 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
          {navItems.map(item => <NavLink key={item.name} item={item} />)}
        </nav>

        {/* Profile footer */}
        <ProfileFooter />
      </aside>
    </>
  );
}