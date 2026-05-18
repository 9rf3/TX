"use client";
import { Bell, Search, Menu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
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
            className="w-[280px] lg:w-[360px] pl-10 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* XP indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-primary-light">23,450</span>
          <span className="text-muted text-xs">XP</span>
        </div>

        {/* Streak */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-sm">
          <span>🔥</span>
          <span className="font-semibold text-accent-orange">14</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-muted-light transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow">
          AM
        </div>
      </div>
    </header>
  );
}
