"use client";
import { Bell, Search, Menu, Zap, LogOut, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGamificationEngine } from "@/lib/hooks/useGamificationEngine";
import { logout } from "@/actions/auth";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, profile } = useAuth();
  const { profile: gProfile } = useGamificationEngine();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  const xp = gProfile?.xp ?? 0;
  const level = gProfile?.level ?? 1;
  const streak = gProfile?.current_streak ?? 0;
  const txCoins = gProfile?.tx_coins ?? 0;
  const xpForNext = gProfile?.xpForNext ?? 100;
  const xpPct = xpForNext > 0 ? Math.min((xp / xpForNext) * 100, 100) : 0;

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-xl hover:bg-white/5 text-muted-light cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text" placeholder="Search courses, lessons..."
            className="w-[200px] lg:w-[320px] pl-10 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* TX Coins */}
        <Link href="/profile" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-sm hover:bg-yellow-500/20 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-semibold text-yellow-400 tabular-nums">{txCoins.toLocaleString()}</span>
        </Link>

        {/* Level + XP */}
        <Link href="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm hover:bg-primary/20 transition-colors group">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-primary-light bg-primary/20 px-1.5 py-0.5 rounded">{level}</span>
            <Zap className="w-3.5 h-3.5 text-primary-light" />
            <span className="font-semibold text-primary-light tabular-nums">{xp.toLocaleString()}</span>
          </div>
          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden hidden lg:block">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500" style={{ width: `${xpPct}%` }} />
          </div>
        </Link>

        {/* Streak */}
        {streak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-sm">
            <Flame className="w-3.5 h-3.5 text-accent-orange" />
            <span className="font-semibold text-accent-orange tabular-nums">{streak}</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-muted-light transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red" />
        </button>

        {/* Avatar */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow overflow-hidden"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border">
                <div className="text-sm font-semibold truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
                <div className="text-xs text-muted truncate">{user?.email}</div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light font-medium">Lvl {level}</span>
                  <span className="text-muted">{xp.toLocaleString()} XP</span>
                </div>
              </div>
              <div className="p-1">
                <Link href="/profile" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-lg transition-colors" onClick={() => setShowDropdown(false)}>
                  <Zap className="w-4 h-4 text-muted" />
                  Profile
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
