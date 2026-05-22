"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BookOpen, Trophy, User, MessageSquare, Users, Shield,
  GraduationCap, Zap, ChevronLeft, ChevronRight, Sparkles, X, LogOut, Tags,
  Swords,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { logout } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/skills", label: "Skill Tree", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/tournaments", label: "Tournaments", icon: GraduationCap },
  { href: "/ai-chat", label: "AI Assistant", icon: Sparkles },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

const adminNavItems = [
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/admin/courses", label: "Admin Courses", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-surface/80 backdrop-blur-xl border-r border-border",
      collapsed ? "w-[72px]" : "w-[240px]",
      "transition-all duration-300"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-lg tracking-tight">
            TWO<span className="text-primary">KAX</span>
          </motion.span>
        )}
        <button onClick={onMobileClose} className="ml-auto md:hidden text-muted-light hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} prefetch={true} onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-white bg-primary/15 border border-primary/25"
                  : "text-muted-light hover:text-foreground hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0 relative z-10", isActive && "text-primary-light")} />
              {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow z-10" />
              )}
            </Link>
          );
        })}

        {/* Admin section - only shown for admins */}
        {profile?.role === "admin" && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-1 px-3">
                <div className="text-[10px] uppercase tracking-widest text-muted font-semibold">Admin</div>
              </div>
            )}
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} prefetch={true} onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "text-white bg-primary/15 border border-primary/25"
                      : "text-muted-light hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="sidebar-active-admin"
                      className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 relative z-10", isActive && "text-primary-light")} />
                  {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow z-10" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block px-3 py-4 border-t border-border">
        <button onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-xl text-muted-light hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User card */}
      {!collapsed && user && (
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profile?.full_name || user.email?.split('@')[0]}</div>
              <div className="text-xs text-muted flex items-center gap-1 truncate">
                {profile?.username ? `@${profile.username}` : user.email}
              </div>
            </div>
            <button onClick={() => logout()} className="p-1.5 text-muted-light hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors cursor-pointer" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 z-40 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
